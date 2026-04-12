import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@database/index';
import { Q } from '@nozbe/watermelondb'; // Q allows us to write strict database queries!
import WorkoutLookup from '@database/models/WorkoutLookup';
import CardioWorkoutLookup from '@database/models/CardioWorkoutLookup';

// Custom chips for the UI so you don't need to install a dropdown package
const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Full Body'];

export default function ExerciseLibraryScreen() {
  const [activeTab, setActiveTab] = useState<'Strength' | 'Cardio'>('Strength');
  
  // Lists holding our actual Database Models
  const [strengthList, setStrengthList] = useState<WorkoutLookup[]>([]);
  const [cardioList, setCardioList] = useState<CardioWorkoutLookup[]>([]);

  // Modal Form State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkoutLookup | CardioWorkoutLookup | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formGroup, setFormGroup] = useState('Chest');
  const [formIntensity, setFormIntensity] = useState('5');

  // --- DATA FETCHING ---
  const fetchData = async () => {
    // Only fetch exercises where is_active is TRUE (Hides soft-deleted items)
    const strength = await database.collections.get<WorkoutLookup>('workout_lookups').query(Q.where('is_active', true)).fetch();
    const cardio = await database.collections.get<CardioWorkoutLookup>('cardio_workout_lookups').query(Q.where('is_active', true)).fetch();
    
    setStrengthList(strength.sort((a, b) => a.name.localeCompare(b.name)));
    setCardioList(cardio.sort((a, b) => a.name.localeCompare(b.name)));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- SAVE ACTIONS (CREATE OR EDIT) ---
  const handleSave = async () => {
    if (!formName.trim()) return Alert.alert('Error', 'Please enter a name');

    await database.write(async () => {
      const isEditing = editingItem !== null;
      const collectionName = activeTab === 'Strength' ? 'workout_lookups' : 'cardio_workout_lookups';
      const collection = database.collections.get(collectionName);

      if (isEditing) {
        // UPDATE EXISTING
        await editingItem.update((record: any) => {
          record.name = formName;
          record.intensityScore = parseInt(formIntensity) || 5;
          if (activeTab === 'Strength') record.muscleGroup = formGroup;
        });
      } else {
        // CREATE NEW
        await collection.create((record: any) => {
          record.name = formName;
          record.intensityScore = parseInt(formIntensity) || 5;
          record.isActive = true;
          if (activeTab === 'Strength') record.muscleGroup = formGroup;
        });
      }
    });

    closeModal();
    fetchData(); // Refresh the list
  };

  // --- THE DATABASE SAFETY DELETION ENGINE ---
  const handleDelete = async (item: WorkoutLookup | CardioWorkoutLookup) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const isStrength = activeTab === 'Strength';
            const trackerTable = isStrength ? 'workout_trackers' : 'cardio_trackers';
            const foreignKey = isStrength ? 'workout_id' : 'cardio_id';

            // 1. SAFETY CHECK: Have they ever logged this exercise before?
            const historicalLogsCount = await database.collections.get(trackerTable)
              .query(Q.where(foreignKey, item.id))
              .fetchCount();

            await database.write(async () => {
              if (historicalLogsCount > 0) {
                // SOFT DELETE: Hide it, but preserve the historical logs
                await item.update((record: any) => {
                  record.isActive = false; 
                });
                console.log(`Soft deleted ${item.name} to preserve ${historicalLogsCount} past logs.`);
              } else {
                // HARD DELETE: Completely safe to nuke it from the database
                await item.destroyPermanently();
                console.log(`Permanently deleted ${item.name}.`);
              }
            });

            fetchData();
          }
        }
      ]
    );
  };

  // --- UI HELPERS ---
  const openModal = (item: any = null) => {
    setEditingItem(item);
    setFormName(item ? item.name : '');
    setFormGroup(item && item.muscleGroup ? item.muscleGroup : 'Chest');
    setFormIntensity(item ? item.intensityScore.toString() : '5');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingItem(null);
  };

  // --- RENDER FUNCTIONS ---
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.listItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemSub}>
          {activeTab === 'Strength' ? item.muscleGroup : 'Cardio'} • Intensity: {item.intensityScore}/10
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => openModal(item)}>
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash" size={20} color="#ff4757" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'Strength' && styles.activeTab]} onPress={() => setActiveTab('Strength')}>
          <Text style={[styles.tabText, activeTab === 'Strength' && styles.activeTabText]}>Strength</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'Cardio' && styles.activeTab]} onPress={() => setActiveTab('Cardio')}>
          <Text style={[styles.tabText, activeTab === 'Cardio' && styles.activeTabText]}>Cardio</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise List */}
      <FlatList
        data={activeTab === 'Strength' ? strengthList : cardioList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No exercises found.</Text>}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingItem ? 'Edit Exercise' : 'New Exercise'}</Text>

          <Text style={styles.label}>Exercise Name</Text>
          <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholderTextColor="#666" placeholder="e.g. Incline Bench Press" />

          {activeTab === 'Strength' && (
            <>
              <Text style={styles.label}>Muscle Group</Text>
              <View style={styles.chipContainer}>
                {MUSCLE_GROUPS.map((group) => (
                  <TouchableOpacity 
                    key={group} 
                    style={[styles.chip, formGroup === group && styles.chipActive]}
                    onPress={() => setFormGroup(group)}
                  >
                    <Text style={[styles.chipText, formGroup === group && styles.chipTextActive]}>{group}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>Intensity Score (1-10)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={formIntensity} onChangeText={setFormIntensity} />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  tabContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#1A1A1A' },
  tab: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#333' },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: '#FFF' },
  
  listItem: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333', alignItems: 'center' },
  itemName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  itemSub: { color: '#888', marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 5 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50, fontSize: 16 },

  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },

  modalContainer: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 50 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 30 },
  label: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 15 },
  input: { backgroundColor: '#1E1E1E', color: '#FFF', padding: 15, borderRadius: 8, fontSize: 16 },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333' },
  chipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  chipText: { color: '#888' },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },

  saveBtn: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 40 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  cancelBtnText: { color: '#ff4757', fontSize: 16 }
});