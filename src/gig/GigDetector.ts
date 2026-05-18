/**
 * GigClaw - Gig App Order Detection & Auto-Accept
 * 
 * Detects orders from multiple gig apps, applies geofence/destination logic,
 * and auto-accepts based on configurable rules with smart batching.
 */

import ClawAccessibilityModule from '../native/ClawAccessibilityModule';
import { captureScreen, getScreenText } from '../tools/screen';
import { clickByText, tap } from '../tools/touch';
import { GigConfig, OrderInfo, ActiveBatch, DirectionVector } from './types';
import { calculateDistance, calculateDirection, isSameDirection } from './geo';

// Supported gig apps with their detection patterns
const GIG_APPS: Record<string, {
  packageName: string;
  orderPatterns: string[];
  acceptButtonTexts: string[];
  declineButtonTexts: string[];
  payPatterns: RegExp[];
  distancePatterns: RegExp[];
  addressPatterns: RegExp[];
}> = {
  senpex: {
    packageName: 'com.senpex.driver',
    orderPatterns: ['New Delivery', 'Delivery Request', 'Order Available'],
    acceptButtonTexts: ['Accept', 'ACCEPT', 'Accept Order'],
    declineButtonTexts: ['Decline', 'DECLINE', 'Pass'],
    payPatterns: [/\$[\d,]+\.?\d*/, /\$[\d,]+\.\d{2}/, /Pay:\s*\$[\d.]+/],
    distancePatterns: [/\d+\.?\d*\s*mi/, /\d+\.?\d*\s*miles/, /Distance:\s*\d+\.?\d*/],
    addressPatterns: [/Pick\s*up:\s*([^\n]+)/, /Pickup:\s*([^\n]+)/, /From:\s*([^\n]+)/],
  },
  curri: {
    packageName: 'com.curri.driver',
    orderPatterns: ['New Order', 'Delivery Available', 'Order Request'],
    acceptButtonTexts: ['Accept', 'ACCEPT', 'Take Order'],
    declineButtonTexts: ['Decline', 'Pass', 'Skip'],
    payPatterns: [/\$[\d,]+\.?\d*/, /Earnings:\s*\$[\d.]+/],
    distancePatterns: [/\d+\.?\d*\s*mi/, /\d+\.?\d*\s*miles/],
    addressPatterns: [/Pickup:\s*([^\n]+)/, /From:\s*([^\n]+)/],
  },
  airspace: {
    packageName: 'com.airspace.driver',
    orderPatterns: ['New Delivery', 'Order Available'],
    acceptButtonTexts: ['Accept', 'ACCEPT'],
    declineButtonTexts: ['Decline', 'Pass'],
    payPatterns: [/\$[\d,]+\.?\d*/],
    distancePatterns: [/\d+\.?\d*\s*mi/],
    addressPatterns: [/Pickup:\s*([^\n]+)/],
  },
  frayt: {
    packageName: 'com.frayt.driver',
    orderPatterns: ['New Request', 'Delivery Request'],
    acceptButtonTexts: ['Accept', 'ACCEPT'],
    declineButtonTexts: ['Decline'],
    payPatterns: [/\$[\d,]+\.?\d*/],
    distancePatterns: [/\d+\.?\d*\s*mi/],
    addressPatterns: [/Pickup:\s*([^\n]+)/],
  },
  roadie: {
    packageName: 'com.roadie.driver',
    orderPatterns: ['New Gig', 'Gig Available', 'Delivery Available'],
    acceptButtonTexts: ['Claim', 'CLAIM', 'Accept Gig'],
    declineButtonTexts: ['Pass', 'Skip'],
    payPatterns: [/\$[\d,]+\.?\d*/, /\$[\d,]+\.\d{2}/],
    distancePatterns: [/\d+\.?\d*\s*mi/, /\d+\.?\d*\s*miles/],
    addressPatterns: [/Pick\s*up:\s*([^\n]+)/, /From:\s*([^\n]+)/],
  },
  courial: {
    packageName: 'com.courial.driver',
    orderPatterns: ['New Order', 'Order Available'],
    acceptButtonTexts: ['Accept', 'ACCEPT'],
    declineButtonTexts: ['Decline'],
    payPatterns: [/\$[\d,]+\.?\d*/],
    distancePatterns: [/\d+\.?\d*\s*mi/],
    addressPatterns: [/Pickup:\s*([^\n]+)/],
  },
  goshare: {
    packageName: 'com.goshare.driver',
    orderPatterns: ['New Project', 'Project Available'],
    acceptButtonTexts: ['Accept', 'ACCEPT'],
    declineButtonTexts: ['Decline', 'Pass'],
    payPatterns: [/\$[\d,]+\.?\d*/],
    distancePatterns: [/\d+\.?\d*\s*mi/],
    addressPatterns: [/Pickup:\s*([^\n]+)/],
  },
};

export class GigDetector {
  private config: GigConfig;
  private activeBatch: ActiveBatch | null = null;
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private telegramBotToken: string | null = null;
  private telegramChatId: string | null = null;

  constructor(config: GigConfig) {
    this.config = config;
  }

  /**
   * Set Telegram credentials for notifications
   */
  setTelegramCredentials(botToken: string, chatId: string) {
    this.telegramBotToken = botToken;
    this.telegramChatId = chatId;
  }

  /**
   * Start monitoring for orders
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Check every 2 seconds for new orders
    this.checkInterval = setInterval(() => {
      this.checkForOrders();
    }, 2000);

    console.log('[GigClaw] Started monitoring for orders');
    this.sendTelegramNotification('🚀 GigClaw started monitoring');
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('[GigClaw] Stopped monitoring');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GigConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log('[GigClaw] Configuration updated:', this.config);
  }

  /**
   * Check current screen for order opportunities
   */
  private async checkForOrders() {
    try {
      // Get current app package name
      const currentApp = await ClawAccessibilityModule.getCurrentPackage();
      
      // Check if we're in a supported gig app
      const appKey = Object.keys(GIG_APPS).find(key => 
        GIG_APPS[key].packageName === currentApp
      );

      if (!appKey) return; // Not in a gig app

      // Get screen text
      const screenText = await getScreenText();
      if (!screenText) return;

      // Check if this looks like an order screen
      const appConfig = GIG_APPS[appKey];
      const isOrderScreen = appConfig.orderPatterns.some(pattern => 
        screenText.includes(pattern)
      );

      if (!isOrderScreen) return;

      // Parse order details
      const orderInfo = this.parseOrderInfo(screenText, appConfig);
      if (!orderInfo) return;

      orderInfo.appName = appKey;

      console.log('[GigClaw] Order detected:', orderInfo);

      // Evaluate order
      const shouldAccept = await this.evaluateOrder(orderInfo);
      
      if (shouldAccept) {
        await this.acceptOrder(orderInfo, appConfig);
      }

    } catch (error) {
      console.error('[GigClaw] Error checking orders:', error);
    }
  }

  /**
   * Parse order information from screen text
   */
  private parseOrderInfo(screenText: string, appConfig: any): OrderInfo | null {
    // Extract pay
    let pay = 0;
    for (const pattern of appConfig.payPatterns) {
      const match = screenText.match(pattern);
      if (match) {
        pay = parseFloat(match[0].replace(/[$,]/g, ''));
        break;
      }
    }

    // Extract distance (if shown)
    let distance: number | undefined;
    for (const pattern of appConfig.distancePatterns) {
      const match = screenText.match(pattern);
      if (match) {
        distance = parseFloat(match[0].replace(/[^\d.]/g, ''));
        break;
      }
    }

    // Extract pickup address
    let pickupAddress: string | undefined;
    for (const pattern of appConfig.addressPatterns) {
      const match = screenText.match(pattern);
      if (match && match[1]) {
        pickupAddress = match[1].trim();
        break;
      }
    }

    // Must have at least pay or pickup address
    if (!pay && !pickupAddress) return null;

    return {
      pay,
      distance,
      pickupAddress,
      timestamp: Date.now(),
    };
  }

  /**
   * Evaluate if order should be accepted
   */
  private async evaluateOrder(order: OrderInfo): Promise<boolean> {
    const appConfig = this.config.apps[order.appName!];
    if (!appConfig || !appConfig.enabled) return false;

    // Check minimum pay
    if (order.pay < appConfig.minPay) {
      console.log(`[GigClaw] Order rejected: pay $${order.pay} < min $${appConfig.minPay}`);
      return false;
    }

    // Get current location
    const currentLocation = await this.getCurrentLocation();
    if (!currentLocation) {
      console.log('[GigClaw] Cannot get current location');
      return false;
    }

    // Calculate distance to pickup
    let distanceToPickup: number;
    
    if (order.distance !== undefined) {
      // Use displayed distance
      distanceToPickup = order.distance;
    } else if (order.pickupAddress) {
      // Geocode address and calculate
      const pickupCoords = await this.geocodeAddress(order.pickupAddress);
      if (!pickupCoords) return false;
      distanceToPickup = calculateDistance(currentLocation, pickupCoords);
    } else {
      return false;
    }

    // Check geofence
    const radius = appConfig.radiusMiles || this.config.defaultRadiusMiles;
    
    if (this.config.destinationMode.enabled && this.config.destinationMode.coordinates) {
      // Destination mode: check if heading toward destination
      const dest = this.config.destinationMode.coordinates;
      const isHeadingToDest = this.isHeadingTowardDestination(
        currentLocation,
        { lat: dest.lat, lng: dest.lng },
        order.pickupAddress ? await this.geocodeAddress(order.pickupAddress) : null
      );
      
      if (!isHeadingToDest) {
        console.log('[GigClaw] Order rejected: not heading toward destination');
        return false;
      }
    } else {
      // Standard geofence mode
      if (distanceToPickup > radius) {
        console.log(`[GigClaw] Order rejected: distance ${distanceToPickup}mi > radius ${radius}mi`);
        return false;
      }
    }

    // Check batching logic
    if (this.activeBatch) {
      // Check if batch window is still open
      const windowMs = this.config.batchWindowMinutes * 60 * 1000;
      if (Date.now() - this.activeBatch.startTime > windowMs) {
        console.log('[GigClaw] Batch window closed');
        return false;
      }

      // Check max batch size
      if (this.activeBatch.orders.length >= this.config.maxBatchSize) {
        console.log('[GigClaw] Max batch size reached');
        return false;
      }

      // Check if same direction
      if (order.pickupAddress) {
        const newPickup = await this.geocodeAddress(order.pickupAddress);
        if (newPickup) {
          const isSameDir = isSameDirection(
            currentLocation,
            this.activeBatch.primaryDirection,
            newPickup,
            this.config.directionToleranceDegrees
          );
          
          if (!isSameDir) {
            console.log('[GigClaw] Order rejected: not same direction');
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Accept the order
   */
  private async acceptOrder(order: OrderInfo, appConfig: any) {
    console.log('[GigClaw] Accepting order:', order);

    // Try to click accept button
    let accepted = false;
    for (const buttonText of appConfig.acceptButtonTexts) {
      try {
        await clickByText(buttonText);
        accepted = true;
        break;
      } catch (e) {
        // Try next button text
      }
    }

    if (!accepted) {
      console.error('[GigClaw] Could not find accept button');
      return;
    }

    // Update batch
    if (!this.activeBatch) {
      // Start new batch
      const currentLocation = await this.getCurrentLocation();
      const pickupCoords = order.pickupAddress ? 
        await this.geocodeAddress(order.pickupAddress) : null;
      
      this.activeBatch = {
        orders: [order],
        startTime: Date.now(),
        primaryDirection: pickupCoords && currentLocation ? 
          calculateDirection(currentLocation, pickupCoords) : undefined,
      };
    } else {
      // Add to existing batch
      this.activeBatch.orders.push(order);
    }

    // Send notification
    const batchInfo = this.activeBatch.orders.length > 1 ? 
      ` (Batch: ${this.activeBatch.orders.length}/${this.config.maxBatchSize})` : '';
    
    await this.sendTelegramNotification(
      `✅ Order Accepted!\n` +
      `App: ${order.appName}\n` +
      `Pay: $${order.pay}\n` +
      `Distance: ${order.distance || 'Unknown'} mi\n` +
      `${batchInfo}`
    );

    console.log('[GigClaw] Order accepted successfully');
  }

  /**
   * Get current GPS location
   */
  private async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
      const location = await ClawAccessibilityModule.getCurrentLocation();
      if (location && location.latitude && location.longitude) {
        return { lat: location.latitude, lng: location.longitude };
      }
    } catch (e) {
      console.error('[GigClaw] Failed to get location:', e);
    }
    return null;
  }

  /**
   * Geocode address to coordinates
   */
  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // Use Google Geocoding API or similar
      const apiKey = this.config.geocodingApiKey;
      if (!apiKey) return null;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const loc = data.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
    } catch (e) {
      console.error('[GigClaw] Geocoding failed:', e);
    }
    return null;
  }

  /**
   * Check if pickup is heading toward destination
   */
  private isHeadingTowardDestination(
    current: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    pickup: { lat: number; lng: number } | null
  ): boolean {
    if (!pickup) return false;

    const toDest = calculateDistance(current, destination);
    const toPickup = calculateDistance(current, pickup);
    const pickupToDest = calculateDistance(pickup, destination);

    // If going to pickup then to destination is roughly same as direct to destination
    // or pickup is between current and destination
    return pickupToDest < toDest * 1.5 || toPickup < toDest;
  }

  /**
   * Send Telegram notification
   */
  private async sendTelegramNotification(message: string) {
    if (!this.telegramBotToken || !this.telegramChatId) return;

    try {
      await fetch(
        `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: this.telegramChatId,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      );
    } catch (e) {
      console.error('[GigClaw] Failed to send Telegram notification:', e);
    }
  }
}
