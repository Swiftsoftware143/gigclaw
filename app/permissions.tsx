import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface PermissionItem {
  id: string;
  name: string;
  description: string;
  critical: boolean;
  check: () => Promise<boolean>;
  openSettings: () => void;
}

export default function PermissionsScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [allGranted, setAllGranted] = useState(false);

  const permissions: PermissionItem[] = [
    {
      id: 'accessibility',
      name: 'Accessibility Service',
      description: 'Required to see your screen and tap buttons automatically',
      critical: true,
      check: async () => {
        // This would check actual accessibility status
        // For now, we'll rely on user confirmation
        return checked['accessibility'] || false;
      },
      openSettings: () => {
        Linking.openSettings();
      },
    },
    {
      id: 'location',
      name: 'Location (Always)',
      description: 'Needed to calculate distance to pickups and check work zones',
      critical: true,
      check: async () => checked['location'] || false,
      openSettings: () => {
        Linking.openSettings();
      },
    },
    {
      id: 'battery',
      name: 'Disable Battery Optimization',
      description: 'Prevents Android from killing GigClaw to save battery',
      critical: true,
      check: async () => checked['battery'] || false,
      openSettings: () => {
        Linking.openSettings();
      },
    },
    {
      id: 'overlay',
      name: 'Display Over Other Apps',
      description: 'Shows alerts without switching away from gig apps',
      critical: false,
      check: async () => checked['overlay'] || false,
      openSettings: () => {
        Linking.openSettings();
      },
    },
    {
      id: 'notifications',
      name: 'Notification Access',
      description: 'Reads notifications from gig apps (some show orders as notifications)',
      critical: false,
      check: async () => checked['notifications'] || false,
      openSettings: () => {
        Linking.openSettings();
      },
    },
  ];

  useEffect(() => {
    checkAllPermissions();
  }, [checked]);

  const checkAllPermissions = () => {
    const criticalGranted = permissions
      .filter(p => p.critical)
      .every(p => checked[p.id]);
    setAllGranted(criticalGranted);
  };

  const togglePermission = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const continueToApp = async () => {
    await AsyncStorage.setItem('@gigclaw_permissions_seen', 'true');
    router.replace('/gigclaw');
  };

  const openPermissionGuide = () => {
    // Could open a detailed guide or video
    Linking.openURL('https://github.com/Swiftsoftware143/gigclaw/blob/main/PERMISSIONS-CHECKLIST.md');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={64} color="#007AFF" />
        <Text style={styles.title}>Permissions Required</Text>
        <Text style={styles.subtitle}>
          GigClaw needs these permissions to automate your gig apps
        </Text>
      </View>

      <View style={styles.warningBox}>
        <Ionicons name="warning" size={24} color="#FF9500" />
        <Text style={styles.warningText}>
          ⚠️ Without these permissions, GigClaw CANNOT work.{'\n'}
          Check each box AFTER granting the permission in Settings.
        </Text>
      </View>

      {permissions.map((perm) => (
        <View key={perm.id} style={[styles.permissionCard, perm.critical && styles.criticalCard]}>
          <View style={styles.permissionHeader}>
            <View style={styles.permissionTitleRow}>
              {perm.critical && <Text style={styles.criticalBadge}>REQUIRED</Text>}
              <Text style={styles.permissionName}>{perm.name}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkBox, checked[perm.id] && styles.checkBoxChecked]}
              onPress={() => togglePermission(perm.id)}
            >
              {checked[perm.id] && <Ionicons name="checkmark" size={20} color="white" />}
            </TouchableOpacity>
          </View>
          <Text style={styles.permissionDesc}>{perm.description}</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={perm.openSettings}>
            <Text style={styles.settingsBtnText}>Open Settings →</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <TouchableOpacity style={styles.helpBtn} onPress={openPermissionGuide}>
          <Ionicons name="document-text" size={20} color="#007AFF" />
          <Text style={styles.helpBtnText}>View Detailed Permission Guide</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !allGranted && styles.continueBtnDisabled]}
        onPress={continueToApp}
        disabled={!allGranted}
      >
        <Text style={styles.continueBtnText}>
          {allGranted ? 'Continue to GigClaw →' : 'Grant Required Permissions First'}
        </Text>
      </TouchableOpacity>

      {!allGranted && (
        <Text style={styles.continueHint}>
          Check all REQUIRED boxes to continue
        </Text>
      )}

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
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  permissionCard: {
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
  criticalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criticalBadge: {
    backgroundColor: '#FF3B30',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  permissionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxChecked: {
    backgroundColor: '#007AFF',
  },
  permissionDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
  settingsBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  settingsBtnText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  helpSection: {
    margin: 16,
    marginTop: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  helpBtnText: {
    color: '#007AFF',
    fontSize: 14,
  },
  continueBtn: {
    backgroundColor: '#34C759',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: '#ccc',
  },
  continueBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  continueHint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    marginBottom: 16,
  },
  spacer: {
    height: 40,
  },
});
