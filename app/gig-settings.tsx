import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GigConfig } from '../src/gig';

const DEFAULT_CONFIG: GigConfig = {
  defaultRadiusMiles: 5,
  maxBatchSize: 3,
  batchWindowMinutes: 5,
  directionToleranceDegrees: 45,
  destinationMode: {
    enabled: false,
  },
  apps: {
    senpex: { enabled: true, minPay: 10 },
    curri: { enabled: true, minPay: 10 },
    airspace: { enabled: true, minPay: 10 },
    frayt: { enabled: true, minPay: 10 },
    roadie: { enabled: true, minPay: 10 },
    courial: { enabled: true, minPay: 10 },
    goshare: { enabled: true, minPay: 10 },
  },
};

const STORAGE_KEY = '@gigclaw_config';

export default function GigSettingsScreen() {
  const [config, setConfig] = useState<GigConfig>(DEFAULT_CONFIG);
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [geocodingKey, setGeocodingKey] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setConfig(JSON.parse(saved));
      }
      const token = await AsyncStorage.getItem('@gigclaw_telegram_token');
      const chatId = await AsyncStorage.getItem('@gigclaw_telegram_chat_id');
      const geoKey = await AsyncStorage.getItem('@gigclaw_geocoding_key');
      if (token) setTelegramToken(token);
      if (chatId) setTelegramChatId(chatId);
      if (geoKey) setGeocodingKey(geoKey);
    } catch (e) {
      console.error('Failed to load config:', e);
    }
  };

  const saveConfig = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      await AsyncStorage.setItem('@gigclaw_telegram_token', telegramToken);
      await AsyncStorage.setItem('@gigclaw_telegram_chat_id', telegramChatId);
      await AsyncStorage.setItem('@gigclaw_geocoding_key', geocodingKey);
      Alert.alert('Success', 'Configuration saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save configuration');
    }
  };

  const updateAppConfig = (appName: string, updates: Partial<GigConfig['apps'][string]>) => {
    setConfig(prev => ({
      ...prev,
      apps: {
        ...prev.apps,
        [appName]: { ...prev.apps[appName], ...updates },
      },
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ GigClaw Settings</Text>

      {/* Global Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Global Settings</Text>

        <View style={styles.row}>
          <Text>Default Radius (miles)</Text>
          <TextInput
            style={styles.input}
            value={String(config.defaultRadiusMiles)}
            onChangeText={(v) => setConfig(prev => ({ ...prev, defaultRadiusMiles: Number(v) || 5 }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <Text>Max Batch Size</Text>
          <TextInput
            style={styles.input}
            value={String(config.maxBatchSize)}
            onChangeText={(v) => setConfig(prev => ({ ...prev, maxBatchSize: Number(v) || 3 }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <Text>Batch Window (minutes)</Text>
          <TextInput
            style={styles.input}
            value={String(config.batchWindowMinutes)}
            onChangeText={(v) => setConfig(prev => ({ ...prev, batchWindowMinutes: Number(v) || 5 }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <Text>Direction Tolerance (degrees)</Text>
          <TextInput
            style={styles.input}
            value={String(config.directionToleranceDegrees)}
            onChangeText={(v) => setConfig(prev => ({ ...prev, directionToleranceDegrees: Number(v) || 45 }))}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Destination Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Destination Mode</Text>
        <View style={styles.row}>
          <Text>Enable Destination Mode</Text>
          <Switch
            value={config.destinationMode.enabled}
            onValueChange={(v) => setConfig(prev => ({
              ...prev,
              destinationMode: { ...prev.destinationMode, enabled: v },
            }))}
          />
        </View>
        {config.destinationMode.enabled && (
          <TextInput
            style={styles.textArea}
            placeholder="Enter destination address"
            value={config.destinationMode.address || ''}
            onChangeText={(v) => setConfig(prev => ({
              ...prev,
              destinationMode: { ...prev.destinationMode, address: v },
            }))}
          />
        )}
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        {Object.entries(config.apps).map(([appName, appConfig]) => (
          <View key={appName} style={styles.appCard}>
            <View style={styles.row}>
              <Text style={styles.appName}>{appName.toUpperCase()}</Text>
              <Switch
                value={appConfig.enabled}
                onValueChange={(v) => updateAppConfig(appName, { enabled: v })}
              />
            </View>
            <View style={styles.row}>
              <Text>Min Pay ($)</Text>
              <TextInput
                style={styles.input}
                value={String(appConfig.minPay)}
                onChangeText={(v) => updateAppConfig(appName, { minPay: Number(v) || 0 })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.row}>
              <Text>Radius (miles, optional)</Text>
              <TextInput
                style={styles.input}
                value={appConfig.radiusMiles ? String(appConfig.radiusMiles) : ''}
                onChangeText={(v) => updateAppConfig(appName, { radiusMiles: v ? Number(v) : undefined })}
                keyboardType="numeric"
                placeholder="Use default"
              />
            </View>
          </View>
        ))}
      </View>

      {/* API Keys */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        <Text style={styles.label}>Telegram Bot Token</Text>
        <TextInput
          style={styles.textArea}
          value={telegramToken}
          onChangeText={setTelegramToken}
          placeholder="Enter Telegram bot token"
          secureTextEntry
        />
        <Text style={styles.label}>Telegram Chat ID</Text>
        <TextInput
          style={styles.input}
          value={telegramChatId}
          onChangeText={setTelegramChatId}
          placeholder="Enter your Telegram chat ID"
        />
        <Text style={styles.label}>Google Geocoding API Key</Text>
        <TextInput
          style={styles.textArea}
          value={geocodingKey}
          onChangeText={setGeocodingKey}
          placeholder="Enter Google Maps API key"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
        <Text style={styles.saveButtonText}>💾 Save Configuration</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 100,
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
    minHeight: 60,
  },
  appCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  appName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});
