import React, { useState, useEffect, useCallback } from 'react';
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

  // Stats State
  const [stats, setStats] = useState({
    calories: 0,
    water: 0,
    workoutLogged: false,
    cardioLogged: false,
  });

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const fetchTodayStats = async () => {
    // Get start and end of today in milliseconds
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const endOfDay = new Date().setHours(23, 59, 59, 999);

    // 1. Fetch Calories
    const calorieLogs = await database.collections.get('calorie_trackers')
      .query(Q.where('date', Q.between(startOfDay, endOfDay)))
      .fetch();
    const totalCals = calorieLogs.reduce((acc: any, curr: any) => acc + (curr.overallCalories || 0), 0);

    // 2. Fetch Water
    const waterLogs = await database.collections.get('water_trackers')
      .query(Q.where('date', Q.between(startOfDay, endOfDay)))
      .fetch();
    const totalWater = waterLogs.reduce((acc: any, curr: any) => acc + (curr.waterConsumedLiters || 0), 0);

    // 3. Check Workouts/Cardio
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
  };

  // useFocusEffect ensures data refreshes when user navigates back to Dashboard
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
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{dateString}</Text>
          <Text style={styles.welcomeText}>Daily Summary</Text>
        </View>

        {/* Quick Progress Row */}
        <View style={styles.statsRow}>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>CALORIES</Text>
            <Text style={styles.miniValue}>{stats.calories} <Text style={styles.unit}>kcal</Text></Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>WATER</Text>
            <Text style={styles.miniValue}>{stats.water.toFixed(1)} <Text style={styles.unit}>L</Text></Text>
          </View>
        </View>

        {/* Logging Grid */}
        <Text style={styles.sectionTitle}>Activity</Text>
        
        <View style={styles.grid}>
          {/* Main Workout - High Priority Card */}
          <TouchableOpacity 
            style={[styles.largeCard, stats.workoutLogged && styles.cardComplete]} 
            onPress={() => navigation.navigate('LogWorkout')}
          >
            <View style={styles.cardIconWrapper}>
              <Ionicons name="barbell" size={32} color={stats.workoutLogged ? "#FFF" : "#28a745"} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Strength Training</Text>
              <Text style={styles.cardStatus}>
                {stats.workoutLogged ? 'Session Logged' : 'Not started yet'}
              </Text>
            </View>
            <Ionicons name="add-circle" size={24} color="#333" style={styles.addIcon} />
          </TouchableOpacity>

          {/* Secondary Action Cards */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.mediumCard} onPress={() => navigation.navigate('LogCardio')}>
              <Ionicons name="heart" size={24} color="#ff4757" />
              <Text style={styles.mediumCardTitle}>Cardio</Text>
              <Text style={styles.mediumCardStatus}>{stats.cardioLogged ? 'Logged' : 'Add'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediumCard} onPress={() => navigation.navigate('LogNutrition')}>
              <Ionicons name="restaurant" size={24} color="#ffa502" />
              <Text style={styles.mediumCardTitle}>Nutrition</Text>
              <Text style={styles.mediumCardStatus}>Log Meals</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.mediumCard} onPress={() => navigation.navigate('LogWater')}>
              <Ionicons name="water" size={24} color="#1e90ff" />
              <Text style={styles.mediumCardTitle}>Water</Text>
              <Text style={styles.mediumCardStatus}>+ 250ml</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediumCard} onPress={() => navigation.navigate('LogWeight')}>
              <Ionicons name="scale" size={24} color="#a29bfe" />
              <Text style={styles.mediumCardTitle}>Weight</Text>
              <Text style={styles.mediumCardStatus}>Track</Text>
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
  dateText: { color: '#888', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  welcomeText: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  miniCard: { flex: 1, backgroundColor: '#1E1E1E', padding: 15, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#28a745' },
  miniLabel: { color: '#666', fontSize: 11, fontWeight: 'bold', marginBottom: 5 },
  miniValue: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  unit: { fontSize: 12, color: '#666', fontWeight: 'normal' },

  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  grid: { gap: 15 },
  
  largeCard: { 
    backgroundColor: '#1E1E1E', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: '#333'
  },
  cardComplete: { backgroundColor: '#28a745', borderColor: '#28a745' },
  cardIconWrapper: { backgroundColor: '#121212', padding: 12, borderRadius: 12 },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cardStatus: { color: '#888', fontSize: 14, marginTop: 2 },
  addIcon: { position: 'absolute', right: 20 },

  row: { flexDirection: 'row', gap: 15 },
  mediumCard: { 
    flex: 1, 
    backgroundColor: '#1E1E1E', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    gap: 8,
    borderWidth: 1,
    borderColor: '#333'
  },
  mediumCardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  mediumCardStatus: { color: '#666', fontSize: 12 }
});