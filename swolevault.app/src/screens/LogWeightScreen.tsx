import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@database/index';
import { lbsToKg } from '@utils/metrics';
import UserProfile from '@database/models/UserProfile';

export default function LogWeightScreen() {
  const navigation = useNavigation();
  const [weightInput, setWeightInput] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profiles = await database.get<UserProfile>('user_profiles').query().fetch();
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const calculateAge = (dobDate: Date) => {
    const today = new Date();
    const dob = new Date(dobDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) { age--; }
    return age;
  };

  const handleSave = async () => {
    const weightVal = parseFloat(weightInput);
    
    if (isNaN(weightVal) || weightVal <= 0) {
      return Alert.alert('Invalid Entry', 'Please enter a valid weight to continue.');
    }
    if (!profile) {
      return Alert.alert('Profile Error', 'We could not load your profile to update metrics.');
    }

    const newWeightKg = unit === 'lbs' ? lbsToKg(weightVal) : parseFloat(weightVal.toFixed(2));
    const heightMeters = profile.currentHeightCm / 100;
    const newBmi = parseFloat((newWeightKg / (heightMeters * heightMeters)).toFixed(2));
    const age = calculateAge(profile.dob);
    const s = (profile.sex && profile.sex.toLowerCase() === 'female') ? -161 : 5;
    const newBmr = Math.round((10 * newWeightKg) + (6.25 * profile.currentHeightCm) - (5 * age) + s);
    const newWaterLiters = parseFloat((newWeightKg * 0.033).toFixed(2));

    try {
      await database.write(async () => {
        const trackerCreation = database.get('weight_trackers').prepareCreate((record: any) => {
          record.date = new Date();
          record.weightKg = newWeightKg;
        });

        const profileUpdate = profile.prepareUpdate((record: any) => {
          record.currentWeightKg = newWeightKg;
          record.currentBmi = newBmi;
          record.currentBmr = newBmr;
          record.waterTargetLiters = newWaterLiters;
        });

        await database.batch(trackerCreation, profileUpdate);
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error saving weight:', error);
      Alert.alert('Error', 'Could not save weight data.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Body Weight</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.content}>
            <Text style={styles.promptText}>How much do you weigh today?</Text>
            
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.hugeInput}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor="#27272A"
                value={weightInput}
                onChangeText={setWeightInput}
                autoFocus
                selectionColor="#10B981"
                maxLength={5}
              />
              <Text style={styles.unitSuffix}>{unit}</Text>
            </View>

            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, unit === 'kg' && styles.activeToggleBtn]}
                onPress={() => setUnit('kg')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, unit === 'kg' && styles.activeToggleText]}>Kilograms</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, unit === 'lbs' && styles.activeToggleBtn]}
                onPress={() => setUnit('lbs')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, unit === 'lbs' && styles.activeToggleText]}>Pounds</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.infoBox}>
              <Ionicons name="sparkles" size={16} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={styles.infoText}>Your BMR & BMI will be updated automatically.</Text>
            </View>
            
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
              <Text style={styles.saveBtnText}>Log Weight</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  innerContainer: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#18181B', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  promptText: { color: '#A1A1AA', fontSize: 16, fontWeight: '500', marginBottom: 30 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 50 },
  hugeInput: { fontSize: 80, fontWeight: '800', color: '#FFF', textAlign: 'center', minWidth: 140 },
  unitSuffix: { fontSize: 24, fontWeight: '600', color: '#52525B', marginLeft: 8, paddingBottom: 10 },
  
  toggleContainer: { flexDirection: 'row', backgroundColor: '#18181B', borderRadius: 100, padding: 4, width: '90%', borderWidth: 1, borderColor: '#27272A' },
  toggleBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 100 },
  activeToggleBtn: { backgroundColor: '#27272A', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  toggleText: { color: '#71717A', fontWeight: '600', fontSize: 15 },
  activeToggleText: { color: '#FFF' },
  
  footer: { paddingBottom: Platform.OS === 'ios' ? 10 : 30 },
  infoBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  infoText: { color: '#10B981', fontSize: 13, fontWeight: '500' },
  
  saveBtn: { backgroundColor: '#10B981', flexDirection: 'row', paddingVertical: 18, borderRadius: 100, alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18, marginRight: 8 }
});