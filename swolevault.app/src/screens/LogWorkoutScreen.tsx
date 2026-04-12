import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { database } from '@database/index';
import { Q } from '@nozbe/watermelondb';
import WorkoutLookup from '@database/models/WorkoutLookup';
import CardioWorkoutLookup from '@database/models/CardioWorkoutLookup';

// Define the shape of a single set
interface StrengthSet {
  reps: string;
  weight: string;
}

export default function LogWorkoutScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'Strength' | 'Cardio'>('Strength');

  // Library Data
  const [strengthExercises, setStrengthExercises] = useState<WorkoutLookup[]>([]);
  const [cardioExercises, setCardioExercises] = useState<CardioWorkoutLookup[]>([]);

  // Selection State
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  
  // Strength State (Multiple Sets)
  const [sets, setSets] = useState<StrengthSet[]>([{ reps: '', weight: '' }]);

  // Cardio State
  const [cardioData, setCardioData] = useState({ duration: '', steps: '', calories: '' });

  useEffect(() => {
    fetchLookups();
  }, [activeTab]);

  const fetchLookups = async () => {
    if (activeTab === 'Strength') {
      const data = await database.get<WorkoutLookup>('workout_lookups').query(Q.where('is_active', true)).fetch();
      setStrengthExercises(data);
    } else {
      const data = await database.get<CardioWorkoutLookup>('cardio_workout_lookups').query(Q.where('is_active', true)).fetch();
      setCardioExercises(data);
    }
  };

  // --- STRENGTH LOGIC ---
  const addSet = () => setSets([...sets, { reps: '', weight: '' }]);
  
  const updateSet = (index: number, field: keyof StrengthSet, value: string) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const saveStrengthWorkout = async () => {
    if (!selectedExerciseId) return Alert.alert("Error", "Select an exercise first.");
    
    try {
      await database.write(async () => {
        const trackerCollection = database.get('workout_trackers');
        
        // Loop through sets and create a record for each
        const creations = sets.map((set, index) => 
          trackerCollection.prepareCreate((record: any) => {
            record.date = new Date();
            record.workout_id = selectedExerciseId;
            record.set_number = index + 1;
            record.reps = parseInt(set.reps) || 0;
            record.weight = parseFloat(set.weight) || 0;
          })
        );
        
        await database.batch(...creations);
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to save workout.");
    }
  };

  // --- CARDIO LOGIC ---
  const saveCardioWorkout = async () => {
    if (!selectedExerciseId) return Alert.alert("Error", "Select cardio type first.");
    
    try {
      await database.write(async () => {
        await database.get('cardio_trackers').create((record: any) => {
          record.date = new Date();
          record.cardio_id = selectedExerciseId;
          record.duration_mins = parseInt(cardioData.duration) || 0;
          record.steps = parseInt(cardioData.steps) || 0;
          record.calories_burned = parseInt(cardioData.calories) || 0;
        });
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to save cardio.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Strength' && styles.activeTab]} 
          onPress={() => { setActiveTab('Strength'); setSelectedExerciseId(''); }}
        >
          <Text style={[styles.tabText, activeTab === 'Strength' && styles.activeTabText]}>Strength</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Cardio' && styles.activeTab]} 
          onPress={() => { setActiveTab('Cardio'); setSelectedExerciseId(''); }}
        >
          <Text style={[styles.tabText, activeTab === 'Cardio' && styles.activeTabText]}>Cardio</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* Exercise Picker Section */}
          <Text style={styles.label}>Choose Exercise</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedExerciseId}
              onValueChange={(itemValue) => setSelectedExerciseId(itemValue)}
              style={styles.picker}
              dropdownIconColor="#FFF"
            >
              <Picker.Item label="-- Select --" value="" color="#666" />
              {activeTab === 'Strength' 
                ? strengthExercises.map(e => <Picker.Item key={e.id} label={e.name} value={e.id} color="#FFF" />)
                : cardioExercises.map(e => <Picker.Item key={e.id} label={e.name} value={e.id} color="#FFF" />)
              }
            </Picker>
          </View>

          {/* DYNAMIC STRENGTH UI */}
          {activeTab === 'Strength' && (
            <View style={styles.section}>
              <View style={styles.setRowHeader}>
                <Text style={styles.setHeader}>Set</Text>
                <Text style={[styles.setHeader, {flex: 2}]}>Weight (kg)</Text>
                <Text style={[styles.setHeader, {flex: 2}]}>Reps</Text>
                <View style={{width: 40}} />
              </View>

              {sets.map((set, index) => (
                <View key={index} style={styles.setRow}>
                  <Text style={styles.setNumber}>{index + 1}</Text>
                  <TextInput 
                    style={styles.setInput} 
                    keyboardType="numeric" 
                    value={set.weight} 
                    onChangeText={(val) => updateSet(index, 'weight', val)}
                    placeholder="0" placeholderTextColor="#444"
                  />
                  <TextInput 
                    style={styles.setInput} 
                    keyboardType="numeric" 
                    value={set.reps} 
                    onChangeText={(val) => updateSet(index, 'reps', val)}
                    placeholder="0" placeholderTextColor="#444"
                  />
                  <TouchableOpacity onPress={() => removeSet(index)}>
                    <Ionicons name="close-circle" size={24} color="#ff4757" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addSetBtn} onPress={addSet}>
                <Ionicons name="add" size={20} color="#28a745" />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CARDIO UI */}
          {activeTab === 'Cardio' && (
            <View style={styles.section}>
              <Text style={styles.label}>Duration (mins)</Text>
              <TextInput 
                style={styles.fullInput} 
                keyboardType="numeric" 
                value={cardioData.duration}
                onChangeText={(val) => setCardioData({...cardioData, duration: val})}
              />
              
              <Text style={styles.label}>Steps (optional)</Text>
              <TextInput 
                style={styles.fullInput} 
                keyboardType="numeric"
                value={cardioData.steps}
                onChangeText={(val) => setCardioData({...cardioData, steps: val})}
              />

              <Text style={styles.label}>Estimated Calories</Text>
              <TextInput 
                style={styles.fullInput} 
                keyboardType="numeric"
                value={cardioData.calories}
                onChangeText={(val) => setCardioData({...cardioData, calories: val})}
              />
            </View>
          )}

          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={activeTab === 'Strength' ? saveStrengthWorkout : saveCardioWorkout}
          >
            <Text style={styles.saveBtnText}>Log Session</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  tabBar: { flexDirection: 'row', backgroundColor: '#1E1E1E', margin: 20, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#333' },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: '#FFF' },
  
  scroll: { padding: 20, paddingBottom: 100 },
  label: { color: '#888', fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
  pickerWrapper: { backgroundColor: '#1E1E1E', borderRadius: 12, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  picker: { color: '#FFF' },

  section: { marginTop: 25 },
  setRowHeader: { flexDirection: 'row', marginBottom: 10, paddingHorizontal: 10 },
  setHeader: { color: '#444', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: '#1A1A1A', padding: 10, borderRadius: 12 },
  setNumber: { color: '#28a745', fontWeight: 'bold', width: 25, textAlign: 'center' },
  setInput: { flex: 2, backgroundColor: '#121212', color: '#FFF', padding: 12, borderRadius: 8, textAlign: 'center', borderWidth: 1, borderColor: '#333' },
  
  addSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#444', borderRadius: 12, marginTop: 10 },
  addSetText: { color: '#28a745', fontWeight: 'bold', marginLeft: 5 },

  fullInput: { backgroundColor: '#1E1E1E', color: '#FFF', padding: 15, borderRadius: 12, fontSize: 18, borderWidth: 1, borderColor: '#333' },

  saveBtn: { backgroundColor: '#28a745', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 40 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 }
});