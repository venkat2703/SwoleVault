import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { database } from '@database/index';
import { Q } from '@nozbe/watermelondb';
import WaterTracker from '@database/models/WaterTracker';
import UserProfile from '@database/models/UserProfile';

export default function LogWaterScreen() {
  const navigation = useNavigation();
  const [consumed, setConsumed] = useState(0);
  const [target, setTarget] = useState(2.5);
  const [existingRecord, setExistingRecord] = useState<WaterTracker | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 1. Get Target from Profile
    const profiles = await database.collections.get<UserProfile>('user_profiles').query().fetch();
    if (profiles.length > 0) setTarget(profiles[0].waterTargetLiters);

    // 2. Get Today's Consumed
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const endOfDay = new Date().setHours(23, 59, 59, 999);
    const logs = await database.collections.get<WaterTracker>('water_trackers')
      .query(Q.where('date', Q.between(startOfDay, endOfDay)))
      .fetch();

    if (logs.length > 0) {
      setExistingRecord(logs[0]);
      setConsumed(logs[0].waterConsumedLiters);
    }
  };

  const addWater = async (amount: number) => {
    const newTotal = parseFloat((consumed + amount).toFixed(2));
    setConsumed(newTotal);

    try {
      await database.write(async () => {
        if (existingRecord) {
          await existingRecord.update(log => { log.waterConsumedLiters = newTotal; });
        } else {
          const collection = database.collections.get<WaterTracker>('water_trackers');
          const newLog = await collection.create(log => {
            log.date = new Date();
            log.waterConsumedLiters = newTotal;
          });
          setExistingRecord(newLog);
        }
      });
    } catch (e) {
      Alert.alert("Error", "Sync failed.");
    }
  };

  const progress = Math.min(consumed / target, 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="water" size={80} color="#1e90ff" />
        <Text style={styles.title}>Hydration</Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.mainValue}>{consumed.toFixed(2)} <Text style={styles.unit}>L</Text></Text>
          <Text style={styles.targetLabel}>Goal: {target}L</Text>
          
          {/* Custom Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <View style={styles.buttonGrid}>
          {[0.25, 0.5, 0.75].map((amt) => (
            <TouchableOpacity key={amt} style={styles.quickAdd} onPress={() => addWater(amt)}>
              <Text style={styles.quickAddText}>+{amt}L</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={() => { setConsumed(0); addWater(-consumed); }}>
          <Text style={styles.resetText}>Reset Today</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.doneBtnText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginVertical: 10 },
  progressContainer: { width: '100%', alignItems: 'center', marginVertical: 30 },
  mainValue: { color: '#FFF', fontSize: 64, fontWeight: 'bold' },
  unit: { fontSize: 24, color: '#1e90ff' },
  targetLabel: { color: '#888', fontSize: 16, marginBottom: 15 },
  progressBarBg: { width: '80%', height: 12, backgroundColor: '#1E1E1E', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#1e90ff' },
  buttonGrid: { flexDirection: 'row', gap: 15, marginTop: 20 },
  quickAdd: { backgroundColor: '#1E1E1E', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 12, borderWidth: 1, borderColor: '#1e90ff' },
  quickAddText: { color: '#1e90ff', fontWeight: 'bold', fontSize: 18 },
  resetBtn: { marginTop: 40 },
  resetText: { color: '#444', textDecorationLine: 'underline' },
  doneBtn: { backgroundColor: '#1E1E1E', padding: 18, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold' }
});