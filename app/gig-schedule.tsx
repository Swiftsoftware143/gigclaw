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
import { GigConfig, WeeklySchedule, DaySchedule, TimeSlot, Zone } from '../src/gig';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const STORAGE_KEY = '@gigclaw_config';

export default function GigScheduleScreen() {
  const router = useRouter();
  const [config, setConfig] = useState<GigConfig | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState('10');
  const [newZoneLat, setNewZoneLat] = useState('');
  const [newZoneLng, setNewZoneLng] = useState('');

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
      Alert.alert('Success', 'Schedule saved!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save');
    }
  };

  const updateDaySchedule = (day: string, updates: Partial<DaySchedule>) => {
    if (!config) return;
    setConfig(prev => ({
      ...prev!,
      schedule: {
        ...prev!.schedule,
        [day]: { ...prev!.schedule[day as keyof WeeklySchedule], ...updates },
      },
    }));
  };

  const addTimeSlot = (day: string) => {
    if (!config) return;
    const currentSlots = config.schedule[day as keyof WeeklySchedule].timeSlots;
    const newSlot: TimeSlot = {
      startTime: '09:00',
      endTime: '17:00',
      zoneId: Object.keys(config.zones)[0] || 'default',
    };
    updateDaySchedule(day, { timeSlots: [...currentSlots, newSlot] });
  };

  const updateTimeSlot = (day: string, index: number, updates: Partial<TimeSlot>) => {
    if (!config) return;
    const slots = [...config.schedule[day as keyof WeeklySchedule].timeSlots];
    slots[index] = { ...slots[index], ...updates };
    updateDaySchedule(day, { timeSlots: slots });
  };

  const removeTimeSlot = (day: string, index: number) => {
    if (!config) return;
    const slots = config.schedule[day as keyof WeeklySchedule].timeSlots.filter((_, i) => i !== index);
    updateDaySchedule(day, { timeSlots: slots });
  };

  const addZone = () => {
    if (!config || !newZoneName.trim()) return;
    const id = newZoneName.toLowerCase().replace(/\s+/g, '_');
    const newZone: Zone = {
      id,
      name: newZoneName,
      center: {
        lat: parseFloat(newZoneLat) || 0,
        lng: parseFloat(newZoneLng) || 0,
      },
      radiusMiles: parseFloat(newZoneRadius) || 10,
      addresses: [],
    };
    setConfig(prev => ({
      ...prev!,
      zones: { ...prev!.zones, [id]: newZone },
    }));
    setNewZoneName('');
    setNewZoneLat('');
    setNewZoneLng('');
  };

  const removeZone = (zoneId: string) => {
    if (!config) return;
    const { [zoneId]: _, ...remainingZones } = config.zones;
    setConfig(prev => ({ ...prev!, zones: remainingZones }));
  };

  const formatTime = (time: string) => {
    const [hours, mins] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  if (!config) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📅 Schedule & Zones</Text>

      {/* Future Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Future Orders</Text>
        <View style={styles.row}>
          <Text>Accept Future Orders</Text>
          <Switch
            value={config.acceptFutureOrders}
            onValueChange={(v) => setConfig(prev => ({ ...prev!, acceptFutureOrders: v }))}
          />
        </View>
        <View style={styles.row}>
          <Text>Max Days Ahead</Text>
          <TextInput
            style={styles.input}
            value={String(config.maxFutureDays)}
            onChangeText={(v) => setConfig(prev => ({ ...prev!, maxFutureDays: parseInt(v) || 7 }))}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Zones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Work Zones</Text>
        
        {Object.entries(config.zones).map(([id, zone]) => (
          <View key={id} style={styles.zoneCard}>
            <View style={styles.zoneHeader}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <TouchableOpacity onPress={() => removeZone(id)}>
                <Text style={styles.removeBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.zoneDetail}>Radius: {zone.radiusMiles} miles</Text>
            <Text style={styles.zoneDetail}>
              Center: {zone.center.lat.toFixed(4)}, {zone.center.lng.toFixed(4)}
            </Text>
          </View>
        ))}

        <View style={styles.addZoneForm}>
          <Text style={styles.formLabel}>Add New Zone</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Zone name (e.g., Downtown Miami)"
            value={newZoneName}
            onChangeText={setNewZoneName}
          />
          <View style={styles.coordRow}>
            <TextInput
              style={[styles.textInput, styles.coordInput]}
              placeholder="Latitude"
              value={newZoneLat}
              onChangeText={setNewZoneLat}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.textInput, styles.coordInput]}
              placeholder="Longitude"
              value={newZoneLng}
              onChangeText={setNewZoneLng}
              keyboardType="numeric"
            />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Radius (miles)"
            value={newZoneRadius}
            onChangeText={setNewZoneRadius}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addZone}>
            <Text style={styles.addBtnText}>+ Add Zone</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekly Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📆 Weekly Schedule</Text>
        
        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
          {DAYS.map(day => (
            <TouchableOpacity
              key={day}
              style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayBtnText, selectedDay === day && styles.dayBtnTextActive]}>
                {DAY_LABELS[day].slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Day Schedule */}
        <View style={styles.daySchedule}>
          <View style={styles.row}>
            <Text style={styles.dayTitle}>{DAY_LABELS[selectedDay]}</Text>
            <Switch
              value={config.schedule[selectedDay as keyof WeeklySchedule].enabled}
              onValueChange={(v) => updateDaySchedule(selectedDay, { enabled: v })}
            />
          </View>

          {config.schedule[selectedDay as keyof WeeklySchedule].enabled && (
            <>
              {config.schedule[selectedDay as keyof WeeklySchedule].timeSlots.map((slot, index) => (
                <View key={index} style={styles.timeSlot}>
                  <View style={styles.timeRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={slot.startTime}
                      onChangeText={(v) => updateTimeSlot(selectedDay, index, { startTime: v })}
                      placeholder="09:00"
                    />
                    <Text style={styles.timeSep}>to</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={slot.endTime}
                      onChangeText={(v) => updateTimeSlot(selectedDay, index, { endTime: v })}
                      placeholder="17:00"
                    />
                  </View>
                  
                  <View style={styles.zoneSelectRow}>
                    <Text style={styles.zoneLabel}>Zone:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {Object.entries(config.zones).map(([id, zone]) => (
                        <TouchableOpacity
                          key={id}
                          style={[styles.zoneChip, slot.zoneId === id && styles.zoneChipActive]}
                          onPress={() => updateTimeSlot(selectedDay, index, { zoneId: id })}
                        >
                          <Text style={[styles.zoneChipText, slot.zoneId === id && styles.zoneChipTextActive]}>
                            {zone.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity onPress={() => removeTimeSlot(selectedDay, index)}>
                      <Text style={styles.removeBtn}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addSlotBtn} onPress={() => addTimeSlot(selectedDay)}>
                <Text style={styles.addSlotBtnText}>+ Add Time Slot</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveConfig}>
        <Text style={styles.saveButtonText}>💾 Save Schedule</Text>
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
    width: 80,
    textAlign: 'center',
  },
  zoneCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  zoneDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  removeBtn: {
    fontSize: 18,
    padding: 4,
  },
  addZoneForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  coordInput: {
    flex: 1,
  },
  addBtn: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  daySelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  dayBtnActive: {
    backgroundColor: '#007AFF',
  },
  dayBtnText: {
    color: '#666',
    fontWeight: '500',
  },
  dayBtnTextActive: {
    color: 'white',
  },
  daySchedule: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeSlot: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 70,
    textAlign: 'center',
  },
  timeSep: {
    marginHorizontal: 8,
    color: '#666',
  },
  zoneSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  zoneChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  zoneChipActive: {
    backgroundColor: '#007AFF',
  },
  zoneChipText: {
    fontSize: 12,
    color: '#666',
  },
  zoneChipTextActive: {
    color: 'white',
  },
  addSlotBtn: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addSlotBtnText: {
    color: 'white',
    fontWeight: '600',
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
