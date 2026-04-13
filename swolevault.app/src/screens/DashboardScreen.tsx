import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { database } from '@database/index';
import { Q } from '@nozbe/watermelondb';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    calories: 0,
    water: 0,
    workoutLogged: false,
    cardioLogged: false,
  });

  const dateString = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const fetchTodayStats = async () => {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const endOfDay = new Date().setHours(23, 59, 59, 999);

    try {
      const calorieLogs: any = await database.collections.get('calorie_trackers')
        .query(Q.where('date', Q.between(startOfDay, endOfDay)))
        .fetch();
      const totalCals = calorieLogs.reduce((acc: number, curr: any) => acc + (curr.overallCalories || 0), 0);

      const waterLogs: any = await database.collections.get('water_trackers')
        .query(Q.where('date', Q.between(startOfDay, endOfDay)))
        .fetch();
      const totalWater = waterLogs.reduce((acc: number, curr: any) => acc + (curr.waterConsumedLiters || 0), 0);

      const workoutCount = await database.collections.get('workout_trackers')
        .query(Q.where('date', Q.between(startOfDay, endOfDay)))
        .fetchCount();
      
      const cardioCount = await database.collections.get('cardio_trackers')
        .query(Q.where('date', Q.between(startOfDay, endOfDay)))
        .fetchCount();

      setStats({
        calories: totalCals,
        water: totalWater,
        workoutLogged: workoutCount > 0,
        cardioLogged: cardioCount > 0,
      });
    } catch (e) {
      console.error("Dashboard data fetch error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTodayStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodayStats();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#28a745" />}
      >
        <View style={styles.header}>
          <Text style={styles.dateLabel}>{dateString}</Text>
          <Text style={styles.welcomeTitle}>Dashboard</Text>
        </View>

        {/* Top Summary Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderLeftColor: '#ffa502' }]}>
            <Text style={styles.statLabel}>CALORIES</Text>
            <Text style={styles.statValue}>{stats.calories} <Text style={styles.unit}>kcal</Text></Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: '#1e90ff' }]}>
            <Text style={styles.statLabel}>WATER</Text>
            <Text style={styles.statValue}>{stats.water.toFixed(1)} <Text style={styles.unit}>L</Text></Text>
          </View>
        </View>
        
        {/* Activity Grid (Large Card and Section Title Removed) */}
        <View style={styles.grid}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.squareCard} onPress={() => navigation.navigate('LogWorkout')}>
              <Ionicons name="barbell" size={24} color="#28a745" />
              <Text style={styles.squareTitle}>Lifting</Text>
              <Text style={styles.squareSub}>{stats.workoutLogged ? 'Logged' : 'Track'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.squareCard} onPress={() => navigation.navigate('LogCardio')}>
              <Ionicons name="heart" size={24} color="#ff4757" />
              <Text style={styles.squareTitle}>Cardio</Text>
              <Text style={styles.squareSub}>{stats.cardioLogged ? 'Logged' : 'Add'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.squareCard} onPress={() => navigation.navigate('LogNutrition')}>
              <Ionicons name="restaurant" size={24} color="#ffa502" />
              <Text style={styles.squareTitle}>Meals</Text>
              <Text style={styles.squareSub}>Track</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.squareCard} onPress={() => navigation.navigate('LogWater')}>
              <Ionicons name="water" size={24} color="#1e90ff" />
              <Text style={styles.squareTitle}>Hydration</Text>
              <Text style={styles.squareSub}>+ 250ml</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
             <TouchableOpacity style={[styles.squareCard, { flex: 0.48 }]} onPress={() => navigation.navigate('LogWeight')}>
              <Ionicons name="scale" size={24} color="#a29bfe" />
              <Text style={styles.squareTitle}>Weight</Text>
              <Text style={styles.squareSub}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 25 },
  dateLabel: { color: '#888', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  welcomeTitle: { color: '#FFF', fontSize: 34, fontWeight: 'bold', marginTop: 4 },
  
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 35 },
  statBox: { flex: 1, backgroundColor: '#1E1E1E', padding: 18, borderRadius: 16, borderLeftWidth: 4 },
  statLabel: { color: '#666', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  unit: { fontSize: 12, color: '#666', fontWeight: 'normal' },

  grid: { gap: 15 },
  row: { flexDirection: 'row', gap: 15 },
  squareCard: { 
    flex: 1, 
    backgroundColor: '#1E1E1E', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A'
  },
  squareTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  squareSub: { color: '#666', fontSize: 12 }
});