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

export default function LogWorkoutScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'Strength' | 'Cardio'>('Strength');
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  
  const [sets, setSets] = useState([{ reps: '', weight: '' }]);
  const [cardio, setCardio] = useState({ duration: '', steps: '', calories: '' });

  useEffect(() => {
    fetchExercises();
  }, [activeTab]);

  const fetchExercises = async () => {
    try {
      const table = activeTab === 'Strength' ? 'workout_lookups' : 'cardio_workout_lookups';
      // We fetch where is_active is true
      const data = await database.get(table).query(Q.where('is_active', true)).fetch();
      
      console.log(`[LogWorkout] Found ${data.length} ${activeTab} exercises`);
      setExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  const validateAndSave = async () => {
    if (!selectedId) return Alert.alert("Missing Selection", "Please choose an exercise from your library.");

    if (activeTab === 'Strength') {
      const validSets = sets.filter(s => s.reps.trim() !== '' && s.weight.trim() !== '');
      if (validSets.length === 0) {
        return Alert.alert("Incomplete Sets", "Please enter weight and reps for at least one set.");
      }

      await database.write(async () => {
        const creations = validSets.map((s, i) => database.get('workout_trackers').prepareCreate((r: any) => {
          r.date = new Date();
          r.workout_id = selectedId;
          r.set_number = i + 1;
          r.reps = parseInt(s.reps);
          r.weight = parseFloat(s.weight);
        }));
        await database.batch(...creations);
      });
    } else {
      if (!cardio.duration && !cardio.steps) {
        return Alert.alert("Missing Data", "Please enter at least duration or steps.");
      }

      await database.write(async () => {
        await database.get('cardio_trackers').create((r: any) => {
          r.date = new Date();
          r.cardio_id = selectedId;
          r.duration_mins = parseInt(cardio.duration) || 0;
          r.steps = parseInt(cardio.steps) || 0;
          r.calories_burned = parseInt(cardio.calories) || 0;
        });
      });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabHeader}>
        <TouchableOpacity onPress={() => { setActiveTab('Strength'); setSelectedId(''); }} style={[styles.tab, activeTab === 'Strength' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'Strength' && styles.activeTabText]}>Strength</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setActiveTab('Cardio'); setSelectedId(''); }} style={[styles.tab, activeTab === 'Cardio' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'Cardio' && styles.activeTabText]}>Cardio</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.label}>Select Exercise</Text>
        <View style={styles.pickerBox}>
          <Picker 
            selectedValue={selectedId} 
            onValueChange={setSelectedId} 
            style={{ color: '#FFF' }}
            dropdownIconColor="#FFF"
          >
            {/* 1. We removed the fixed white color from items to prevent 'invisible' text */}
            <Picker.Item label="Tap to select..." value="" color="#888" />
            {exercises.map(e => (
              <Picker.Item 
                key={e.id} 
                label={e.name} 
                value={e.id} 
                color={Platform.OS === 'ios' ? '#FFF' : '#000'} // White for iOS dark mode, Black for Android light modal
              />
            ))}
          </Picker>
        </View>

        {activeTab === 'Strength' ? (
          <View style={styles.section}>
            {sets.map((set, i) => (
              <View key={i} style={styles.setCard}>
                <Text style={styles.setNum}>SET {i + 1}</Text>
                <View style={styles.setInputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>KG</Text>
                    <TextInput 
                      style={styles.smallInput} 
                      keyboardType="numeric" 
                      value={set.weight}
                      onChangeText={v => { const n = [...sets]; n[i].weight = v; setSets(n); }}
                      placeholder="0"
                      placeholderTextColor="#333"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>REPS</Text>
                    <TextInput 
                      style={styles.smallInput} 
                      keyboardType="numeric" 
                      value={set.reps}
                      onChangeText={v => { const n = [...sets]; n[i].reps = v; setSets(n); }}
                      placeholder="0"
                      placeholderTextColor="#333"
                    />
                  </View>
                  <TouchableOpacity onPress={() => setSets(sets.filter((_, idx) => idx !== i))}>
                    <Ionicons name="trash-outline" size={20} color="#ff4757" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setSets([...sets, { reps: '', weight: '' }])}>
              <Ionicons name="add" size={20} color="#28a745" />
              <Text style={{ color: '#28a745', fontWeight: 'bold' }}>ADD SET</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.inputLabel}>Duration (Minutes)</Text>
              <TextInput 
                style={styles.fullInput} 
                keyboardType="numeric" 
                value={cardio.duration} 
                onChangeText={v => setCardio({...cardio, duration: v})} 
                placeholder="0"
                placeholderTextColor="#333"
              />
              
              <Text style={[styles.inputLabel, {marginTop: 15}]}>Steps</Text>
              <TextInput 
                style={styles.fullInput} 
                keyboardType="numeric" 
                value={cardio.steps} 
                onChangeText={v => setCardio({...cardio, steps: v})} 
                placeholder="0"
                placeholderTextColor="#333"
              />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={validateAndSave}>
          <Text style={styles.saveText}>Complete Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  tabHeader: { flexDirection: 'row', backgroundColor: '#1A1A1A', margin: 20, borderRadius: 12, padding: 5 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#333' },
  tabText: { color: '#666', fontWeight: 'bold' },
  activeTabText: { color: '#FFF' },
  label: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 5 },
  pickerBox: { backgroundColor: '#1E1E1E', borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  section: { gap: 10 },
  setCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  setNum: { color: '#28a745', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  setInputRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  inputGroup: { flex: 1 },
  inputLabel: { color: '#555', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  smallInput: { backgroundColor: '#121212', color: '#FFF', padding: 10, borderRadius: 8, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: 12, marginTop: 10 },
  fullInput: { backgroundColor: '#121212', color: '#FFF', padding: 15, borderRadius: 12, fontSize: 18 },
  card: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 16 },
  saveBtn: { backgroundColor: '#28a745', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});