# 🚚 GigClaw - Gig App Auto-Accept System

Custom PhoneClaw build for automating gig economy app order acceptance.

## Features

### Supported Apps
- Senpex
- Curri
- Airspace
- Frayt
- Roadie
- Courial
- GoShare
- + Easy to add more

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **Geofence** | Only accept orders within X miles of current location |
| **Destination Mode** | Set a destination, only accept orders heading that way |
| **Smart Batching** | Auto-accept up to 3 orders heading same direction |
| **Batch Window** | 5-minute window to batch additional orders |
| **Min Pay Filter** | Per-app minimum pay requirements |
| **Telegram Alerts** | Real-time notifications on accepts |
| **Direction Check** | 45° tolerance for "same direction" detection |

## Setup

### 1. Configure Telegram (Required for Notifications)

1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
2. Get your chat ID (message @userinfobot)
3. Enter both in GigClaw Settings

### 2. Configure Google Geocoding API (Required for Address Parsing)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Geocoding API
3. Create API key
4. Enter in GigClaw Settings

### 3. Configure Apps

Go to **Settings → Gig Settings**:
- Enable/disable apps
- Set minimum pay per app
- Override default radius per app
- Set destination mode

### 4. Start GigClaw

Tap **Start GigClaw** on the main screen.

Keep the app running in foreground with screen on.

## How It Works

```
Order Appears
    ↓
Screen Detection (every 2 seconds)
    ↓
Parse Order Details (pay, distance, address)
    ↓
Check Filters:
  - App enabled?
  - Pay ≥ minimum?
  - Within geofence/destination?
    ↓
Check Batching:
  - Batch window open?
  - Same direction?
  - < 3 orders?
    ↓
Auto-Accept + Telegram Notification
```

## File Structure

```
src/gig/
├── GigDetector.ts    # Main detection & auto-accept logic
├── types.ts          # TypeScript definitions
├── geo.ts            # Geolocation utilities
└── index.ts          # Exports

app/
├── gigclaw.tsx       # Main control screen
└── gig-settings.tsx  # Configuration UI
```

## Customization

### Adding a New App

Edit `src/gig/GigDetector.ts`:

```typescript
const GIG_APPS = {
  yourapp: {
    packageName: 'com.yourapp.driver',
    orderPatterns: ['New Order', 'Order Available'],
    acceptButtonTexts: ['Accept', 'ACCEPT'],
    declineButtonTexts: ['Decline'],
    payPatterns: [/\$[\d,]+\.?\d*/],
    distancePatterns: [/\d+\.?\d*\s*mi/],
    addressPatterns: [/Pickup:\s*([^\n]+)/],
  },
  // ...
};
```

### Adjusting Detection Speed

In `GigDetector.ts`, change the interval:

```typescript
this.checkInterval = setInterval(() => {
  this.checkForOrders();
}, 2000); // Change 2000 to desired milliseconds
```

### Changing Direction Tolerance

In settings: **Direction Tolerance (degrees)** — default is 45°

Lower = stricter direction matching
Higher = more lenient

## Limitations

- **Android only** — iOS doesn't allow accessibility automation
- **Screen must be on** — Can't detect orders with screen off
- **App in foreground** — PhoneClaw needs to be running
- **Accessibility permission required**
- **Terms of Service** — Some gig apps prohibit automation

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Not detecting orders | Check app package name in GIG_APPS config |
| Wrong pay parsed | Adjust payPatterns regex |
| Telegram not working | Verify bot token and chat ID |
| Location not working | Check location permissions |
| Accept button not found | Add button text variants to acceptButtonTexts |

## Safety & Compliance

⚠️ **Use at your own risk.** Some gig platforms prohibit automation.

- Start with manual monitoring
- Test thoroughly before relying on automation
- Keep acceptance rate reasonable
- Be prepared to intervene manually

## Credits

Built on [PhoneClaw](https://github.com/8dazo/phoneclaw) by 8dazo.

Customized for David Giraudy / GGC Holdings LLC.
