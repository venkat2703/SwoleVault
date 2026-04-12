import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- NEW IMPORT
import { RootStackParamList, OnboardingStackParamList } from '@navigation/types';

import { database } from '@database/index';
import UserProfile from '@database/models/UserProfile';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
type CalculationRouteProp = RouteProp<OnboardingStackParamList, 'Calculation'>;

export default function CalculationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CalculationRouteProp>();
  const { name, sex, dob, weightKg, heightCm } = route.params;

  const [isCalculating, setIsCalculating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  const bmi = (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);
  
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  bmr = sex === 'Male' ? bmr + 5 : bmr - 161;
  const roundedBmr = Math.round(bmr);

  const waterTargetLiters = (weightKg * 0.033).toFixed(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCalculating(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    
    try {
      await database.write(async () => {
        const profilesCollection = database.get<UserProfile>('user_profiles');
        
        await profilesCollection.create((profile) => {
          profile.name = name;
          profile.sex = sex;
          profile.dob = new Date(dob);
          profile.currentWeightKg = weightKg;
          profile.currentHeightCm = heightCm;
          profile.currentBmi = parseFloat(bmi);
          profile.currentBmr = roundedBmr;
          profile.waterTargetLiters = parseFloat(waterTargetLiters);
        });
      });

      // --- THE NEW PERSISTENCE FLAG ---
      await AsyncStorage.setItem('@onboarding_complete', 'true');

      navigation.replace('MainTabs');
      
    } catch (error) {
      console.error("Failed to save profile:", error);
      Alert.alert("Error", "Could not save your profile. Please try again.");
      setIsSaving(false);
    }
  };

  if (isCalculating) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Crunching your numbers...</Text>
        <Text style={styles.loadingSubText}>Securing the Vault</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={50} color="#28a745" />
        <Text style={styles.title}>Welcome, {name}</Text>
        <Text style={styles.subtitle}>Your baseline targets are locked in.</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="body-outline" size={20} color="#A0A0A0" />
            <Text style={styles.cardTitle}>Current BMI</Text>
          </View>
          <Text style={styles.cardValue}>{bmi}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame-outline" size={20} color="#ff4757" />
            <Text style={styles.cardTitle}>Base Calories</Text>
          </View>
          <Text style={styles.cardValue}>{roundedBmr} <Text style={styles.unit}>kcal</Text></Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="water-outline" size={20} color="#1e90ff" />
            <Text style={styles.cardTitle}>Daily Water</Text>
          </View>
          <Text style={styles.cardValue}>{waterTargetLiters} <Text style={styles.unit}>L</Text></Text>
        </View>
        
        <View style={[styles.card, { justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', backgroundColor: 'transparent' }]}>
          <Text style={{color: '#666', fontSize: 14, textAlign: 'center'}}>More targets inside...</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, isSaving && { opacity: 0.7 }]} 
        onPress={handleSaveAndContinue}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Text style={styles.buttonText}>Save Profile & Enter</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" style={{marginLeft: 8}} />
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  loadingSubText: { color: '#888', fontSize: 16, marginTop: 8 },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginTop: 15, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#A0A0A0', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  card: { backgroundColor: '#1E1E1E', width: '47%', padding: 20, borderRadius: 16, marginBottom: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardTitle: { color: '#A0A0A0', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  cardValue: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  unit: { fontSize: 16, color: '#666', fontWeight: 'normal' },
  button: { backgroundColor: '#28a745', padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});