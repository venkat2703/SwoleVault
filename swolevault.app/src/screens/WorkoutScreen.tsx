import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { database } from '@database/index';
import { Q } from '@nozbe/watermelondb';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WorkoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'Strength' | 'Cardio'>('Strength');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    // FIX 1: Instantly clear old data so the render function doesn't crash on stale data
    setHistory([]); 
    
    try {
      if (activeTab === 'Strength') {
        const logs: any[] = await database.get('workout_trackers').query(Q.sortBy('date', Q.desc)).fetch();
        const lookups: any[] = await database.get('workout_lookups').query().fetch();
        
        const lookupMap: Record<string, string> = {};
        lookups.forEach(l => { lookupMap[l.id] = l.name; });

        const groupedMap: { [key: string]: any } = {};

        for (const log of logs) {
          // FIX 2: Use _raw to safely get the foreign key ID in WatermelonDB
          const workoutId = log._raw.workout_id as string;
          const workoutName = lookupMap[workoutId] || 'Unknown Exercise';
          const dateKey = new Date(log.date).toDateString(); 
          const groupKey = `${dateKey}-${workoutName}`;

          if (!groupedMap[groupKey]) {
            groupedMap[groupKey] = {
              id: log.id,
              name: workoutName,
              date: log.date,
              sets: 0,
              totalReps: 0,
              weights: [],
            };
          }
          groupedMap[groupKey].sets += 1;
          groupedMap[groupKey].totalReps += (log.reps || 0);
          groupedMap[groupKey].weights.push(log.weight || 0);
        }
        setHistory(Object.values(groupedMap));
        
      } else {
        const logs: any[] = await database.get('cardio_trackers').query(Q.sortBy('date', Q.desc)).fetch();
        const lookups: any[] = await database.get('cardio_workout_lookups').query().fetch();
        
        const lookupMap: Record<string, string> = {};
        lookups.forEach(l => { lookupMap[l.id] = l.name; });

        const results = logs.map(log => {
          // Use _raw to safely get the cardio foreign key ID
          const cardioId = log._raw.cardio_id as string;
          return {
            id: log.id,
            name: lookupMap[cardioId] || 'Cardio Session',
            date: log.date,
            duration: log.durationMins || 0,
            steps: log.steps || 0,
            cals: log.caloriesBurned || 0
          };
        });
        setHistory(results);
      }
    } catch (e) {
      console.error("History Fetch Error: ", e);
    }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, [activeTab]));

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyCard}>
      <View style={[styles.indicator, { backgroundColor: activeTab === 'Strength' ? '#28a745' : '#ff4757' }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.historyTitle}>{item.name}</Text>
          <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        
        {activeTab === 'Strength' ? (
          <View>
            <Text style={styles.historyDetail}>
              {item.sets} Sets • {item.totalReps} Total Reps
            </Text>
            {/* FIX 3: Safe array spread using (item.weights || []) prevents iteration crashes */}
            <Text style={styles.weightTag}>Weights: {[...(item.weights || [])].reverse().join(', ')} kg</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.historyDetail}>{item.duration} mins • {item.steps} steps</Text>
            {item.cals > 0 && <Text style={styles.weightTag}>{item.cals} kcal burned</Text>}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity style={styles.logBtn} onPress={() => navigation.navigate('LogWorkout')}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.logBtnText}>New Log</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyTabs}>
        <TouchableOpacity 
          style={[styles.historyTab, activeTab === 'Strength' && styles.activeHistoryTab]} 
          onPress={() => setActiveTab('Strength')}
        >
          <Text style={[styles.historyTabText, activeTab === 'Strength' && styles.activeHistoryTabText]}>Strength</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.historyTab, activeTab === 'Cardio' && styles.activeHistoryTab]} 
          onPress={() => setActiveTab('Cardio')}
        >
          <Text style={[styles.historyTabText, activeTab === 'Cardio' && styles.activeHistoryTabText]}>Cardio</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#28a745" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          ListEmptyComponent={<Text style={styles.emptyText}>Nothing logged yet.</Text>}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  logBtn: { backgroundColor: '#28a745', flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  logBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 5 },
  
  historyTabs: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#1E1E1E', borderRadius: 12, padding: 4, marginBottom: 10 },
  historyTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeHistoryTab: { backgroundColor: '#333' },
  historyTabText: { color: '#666', fontWeight: 'bold' },
  activeHistoryTabText: { color: '#FFF' },

  historyCard: { backgroundColor: '#1E1E1E', flexDirection: 'row', padding: 18, borderRadius: 20, marginBottom: 15, alignItems: 'center' },
  indicator: { width: 4, height: 40, borderRadius: 2, marginRight: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  historyDate: { color: '#555', fontSize: 12 },
  historyDetail: { color: '#AAA', fontSize: 14 },
  weightTag: { color: '#28a745', fontSize: 12, marginTop: 5, fontWeight: '600' },
  emptyText: { color: '#444', textAlign: 'center', marginTop: 100 }
});