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
import { useRouter } from 'expo-router';
import { GigConfig, GuardrailConfig } from '../src/gig';

const STORAGE_KEY = '@gigclaw_config';

export default function GigGuardrailsScreen() {
  const router = useRouter();
  const [config, setConfig] = useState<GigConfig | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      Alert.alert('Success', 'Guardrail settings saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save');
    }
  };

  const updateGuardrails = (updates: Partial<GuardrailConfig>) => {
    if (!config) return;
    setConfig(prev => ({
      ...prev!,
      guardrails: { ...prev!.guardrails, ...updates },
    }));
  };

  if (!config) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const gr = config.guardrails;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛡️ Anti-Detection Guardrails</Text>
      <Text style={styles.subtitle}>Stay safe on gig platforms</Text>

      {/* Master Switch */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Enable Guardrails</Text>
          <Switch
            value={gr.enabled}
            onValueChange={(v) => updateGuardrails({ enabled: v })}
          />
        </View>
        <Text style={styles.description}>
          Guardrails help prevent detection by mimicking human behavior and limiting activity
        </Text>
      </View>

      {/* Rate Limits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏱️ Rate Limits</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.label}>Max Accepts Per Hour</Text>
          <TextInput
            style={styles.input}
            value={String(gr.maxAcceptsPerHour)}
            onChangeText={(v) => updateGuardrails({ maxAcceptsPerHour: parseInt(v) || 8 })}
            keyboardType="numeric"
            editable={gr.enabled}
          />
        </View>
        <Text style={styles.hint}>Recommended: 6-10 per hour</Text>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Max Accepts Per Day</Text>
          <TextInput
            style={styles.input}
            value={String(gr.maxAcceptsPerDay)}
            onChangeText={(v) => updateGuardrails({ maxAcceptsPerDay: parseInt(v) || 30 })}
            keyboardType="numeric"
            editable={gr.enabled}
          />
        </View>
        <Text style={styles.hint}>Recommended: 20-40 per day</Text>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Min Time Between Accepts (seconds)</Text>
          <TextInput
            style={styles.input}
            value={String(Math.floor(gr.minTimeBetweenAcceptsMs / 1000))}
            onChangeText={(v) => updateGuardrails({ minTimeBetweenAcceptsMs: (parseInt(v) || 5) * 1000 })}
            keyboardType="numeric"
            editable={gr.enabled}
          />
        </View>
        <Text style={styles.hint}>Recommended: 3-10 seconds</Text>
      </View>

      {/* Break Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>☕ Break Settings</Text>
        
        <View style={styles.inputRow}>
          <Text style={styles.label}>Max Consecutive Accepts</Text>
          <TextInput
            style={styles.input}
            value={String(gr.maxConsecutiveAccepts)}
            onChangeText={(v) => updateGuardrails({ maxConsecutiveAccepts: parseInt(v) || 3 })}
            keyboardType="numeric"
            editable={gr.enabled}
          />
        </View>
        <Text style={styles.hint}>Force break after this many accepts</Text>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Break Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={String(Math.floor(gr.breakDurationMs / 60000))}
            onChangeText={(v) => updateGuardrails({ breakDurationMs: (parseInt(v) || 5) * 60000 })}
            keyboardType="numeric"
            editable={gr.enabled}
          />
        </View>
        <Text style={styles.hint}>How long to pause after consecutive accepts</Text>
      </View>

      {/* Human Behavior */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎭 Human Behavior</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Randomize Tap Delay</Text>
          <Switch
            value={gr.randomizeTapDelay}
            onValueChange={(v) => updateGuardrails({ randomizeTapDelay: v })}
            disabled={!gr.enabled}
          />
        </View>
        <Text style={styles.hint}>Add 0.5-2 second random delay before tapping</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Human-Like Scrolls</Text>
          <Switch
            value={gr.humanLikeScrolls}
            onValueChange={(v) => updateGuardrails({ humanLikeScrolls: v })}
            disabled={!gr.enabled}
          />
        </View>
        <Text style={styles.hint}>Occasionally scroll before accepting</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Activity Variance</Text>
          <Switch
            value={gr.activityVariance}
            onValueChange={(v) => updateGuardrails({ activityVariance: v })}
            disabled={!gr.enabled}
          />
        </View>
        <Text style={styles.hint}>Vary check interval slightly (±25%)</Text>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Decline Borderline Orders (%)</Text>
          <TextInput
            style={styles.input}
            value={String(Math.floor(gr.declineRatio * 100))}
            onChangeText={(v) => updateGuardrails({ declineRatio: (parseInt(v) || 10) / 100 })}
            keyboardType="numeric"
            editable={gr.enabled}
          />
        </View>
        <Text style={styles.hint}>Decline X% of low-margin orders to appear selective</Text>
      </View>

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Current Status</Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            Guardrails: {gr.enabled ? '🟢 ACTIVE' : '🔴 DISABLED'}
          </Text>
          <Text style={styles.statusDetail}>
            Limits: {gr.maxAcceptsPerHour}/hour, {gr.maxAcceptsPerDay}/day
          </Text>
          <Text style={styles.statusDetail}>
            Break after: {gr.maxConsecutiveAccepts} accepts ({Math.floor(gr.breakDurationMs / 60000)}min pause)
          </Text>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Safety Tips</Text>
        <Text style={styles.tipText}>
          • Start conservative and gradually increase limits{'\n'}
          • Monitor your acceptance rate on each platform{'\n'}
          • Don't run 24/7 — take real breaks{'\n'}
          • Vary your schedule day-to-day{'\n'}
          • Keep decline ratio realistic (humans decline too){'\n'}
          • If flagged, pause for a few days
        </Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
        <Text style={styles.saveButtonText}>💾 Save Guardrails</Text>
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
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 8,
  },
  statusBox: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  tipText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 22,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#34C759',
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
