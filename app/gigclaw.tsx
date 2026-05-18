import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { GigDetector, GigConfig, DEFAULT_CONFIG } from '../src/gig';

export default function GigClawScreen() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Stopped');
  const [activeBatch, setActiveBatch] = useState<any>(null);
  const [config, setConfig] = useState<GigConfig>(DEFAULT_CONFIG);
  const gigDetectorRef = useRef<GigDetector | null>(null);

  useEffect(() => {
    loadConfig();
    return () => {
      // Cleanup on unmount
      if (gigDetectorRef.current) {
        gigDetectorRef.current.stop();
      }
    };
  }, []);

  const loadConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem('@gigclaw_config');
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
  };

  const startGigClaw = async () => {
    try {
      const token = await AsyncStorage.getItem('@gigclaw_telegram_token');
      const chatId = await AsyncStorage.getItem('@gigclaw_telegram_chat_id');
      const geoKey = await AsyncStorage.getItem('@gigclaw_geocoding_key');

      if (!token || !chatId) {
        Alert.alert(
          'Configuration Required',
          'Please configure Telegram settings first.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => router.push('/gig-settings') },
          ]
        );
        return;
      }

      const fullConfig = { ...config, geocodingApiKey: geoKey || undefined };
      
      gigDetectorRef.current = new GigDetector(fullConfig);
      gigDetectorRef.current.setTelegramCredentials(token, chatId);
      gigDetectorRef.current.start();
      
      setIsRunning(true);
      setStatus('Monitoring for orders...');
    } catch (e) {
      Alert.alert('Error', 'Failed to start GigClaw');
      console.error(e);
    }
  };

  const stopGigClaw = () => {
    if (gigDetectorRef.current) {
      gigDetectorRef.current.stop();
      gigDetectorRef.current = null;
    }
    setIsRunning(false);
    setStatus('Stopped');
    setActiveBatch(null);
  };

  const getEnabledAppsCount = () => {
    return Object.values(config.apps).filter(app => app.enabled).length;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚚 GigClaw</Text>
        <Text style={styles.subtitle}>Auto-Accept Gig Orders</Text>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Status</Text>
        <Text style={[styles.statusValue, isRunning ? styles.running : styles.stopped]}>
          {isRunning ? '🟢 Running' : '🔴 Stopped'}
        </Text>
        <Text style={styles.statusDetail}>{status}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Apps Enabled:</Text>
          <Text style={styles.statValue}>{getEnabledAppsCount()} / 7</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Geofence:</Text>
          <Text style={styles.statValue}>{config.defaultRadiusMiles} mi</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Max Batch:</Text>
          <Text style={styles.statValue}>{config.maxBatchSize} orders</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Destination Mode:</Text>
          <Text style={styles.statValue}>
            {config.destinationMode.enabled ? '✅ On' : '❌ Off'}
          </Text>
        </View>
      </View>

      {/* Active Batch */}
      {activeBatch && (
        <View style={styles.batchCard}>
          <Text style={styles.batchTitle}>📦 Active Batch</Text>
          <Text style={styles.batchInfo}>
            Orders: {activeBatch.orders.length} / {config.maxBatchSize}
          </Text>
          <Text style={styles.batchInfo}>
            Time Remaining: {Math.max(0, Math.floor((activeBatch.startTime + config.batchWindowMinutes * 60000 - Date.now()) / 60000))} min
          </Text>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={startGigClaw}>
            <Text style={styles.buttonText}>▶️ Start GigClaw</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopGigClaw}>
            <Text style={styles.buttonText}>⏹ Stop GigClaw</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => router.push('/gig-settings')}
        >
          <Text style={styles.buttonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Supported Apps */}
      <View style={styles.appsCard}>
        <Text style={styles.appsTitle}>Supported Apps</Text>
        <View style={styles.appList}>
          {Object.entries(config.apps).map(([name, app]) => (
            <View key={name} style={styles.appItem}>
              <Text style={styles.appDot}>{app.enabled ? '🟢' : '⚪'}</Text>
              <Text style={styles.appName}>{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
              <Text style={styles.appMinPay}>${app.minPay}+</Text>
            </View>
          ))}
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <Text style={styles.infoText}>
          1. GigClaw monitors your gig apps for new orders{'\n'}
          2. Checks if order is within your geofence{'\n'}
          3. Verifies minimum pay requirement{'\n'}
          4. Auto-accepts if criteria met{'\n'}
          5. Batches orders heading same direction (max 3){'\n'}
          6. Sends Telegram notifications
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  running: {
    color: '#34C759',
  },
  stopped: {
    color: '#FF3B30',
  },
  statusDetail: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  batchCard: {
    backgroundColor: '#FFF9E6',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFCC00',
  },
  batchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  batchInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    margin: 16,
    marginTop: 0,
  },
  startButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  appList: {
    gap: 8,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appDot: {
    marginRight: 8,
  },
  appName: {
    flex: 1,
    fontSize: 14,
  },
  appMinPay: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  spacer: {
    height: 40,
  },
});
