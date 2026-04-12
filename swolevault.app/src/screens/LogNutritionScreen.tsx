import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { database } from '@database/index';
import { Q } from '@nozbe/watermelondb';
import CalorieTracker from '@database/models/CalorieTracker';

export default function LogNutritionScreen() {
  const navigation = useNavigation();

  const [meals, setMeals] = useState({
    breakfast: { cals: '', menu: '' },
    lunch: { cals: '', menu: '' },
    dinner: { cals: '', menu: '' },
  });

  const [existingRecord, setExistingRecord] = useState<CalorieTracker | null>(null);

  useEffect(() => {
    fetchTodayNutrition();
  }, []);

  const fetchTodayNutrition = async () => {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const endOfDay = new Date().setHours(23, 59, 59, 999);

    const logs = await database.collections.get<CalorieTracker>('calorie_trackers')
      .query(Q.where('date', Q.between(startOfDay, endOfDay)))
      .fetch();

    if (logs.length > 0) {
      const log = logs[0];
      setExistingRecord(log);
      setMeals({
        breakfast: { cals: log.breakfastCalories?.toString() || '', menu: log.breakfastMenu || '' },
        lunch: { cals: log.lunchCalories?.toString() || '', menu: log.lunchMenu || '' },
        dinner: { cals: log.dinnerCalories?.toString() || '', menu: log.dinnerMenu || '' },
      });
    }
  };

  const handleSave = async () => {
    const bCals = parseInt(meals.breakfast.cals) || 0;
    const lCals = parseInt(meals.lunch.cals) || 0;
    const dCals = parseInt(meals.dinner.cals) || 0;
    const total = bCals + lCals + dCals;

    try {
      await database.write(async () => {
        if (existingRecord) {
          await existingRecord.update((log) => {
            log.breakfastCalories = bCals;
            log.breakfastMenu = meals.breakfast.menu;
            log.lunchCalories = lCals;
            log.lunchMenu = meals.lunch.menu;
            log.dinnerCalories = dCals;
            log.dinnerMenu = meals.dinner.menu;
            log.overallCalories = total;
          });
        } else {
          const collection = database.collections.get<CalorieTracker>('calorie_trackers');
          await collection.create((log) => {
            log.date = new Date();
            log.breakfastCalories = bCals;
            log.breakfastMenu = meals.breakfast.menu;
            log.lunchCalories = lCals;
            log.lunchMenu = meals.lunch.menu;
            log.dinnerCalories = dCals;
            log.dinnerMenu = meals.dinner.menu;
            log.overallCalories = total;
          });
        }
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Could not save nutrition data.");
    }
  };

  const renderMealInput = (label: string, key: keyof typeof meals, icon: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={20} color="#ffa502" />
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Cals"
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={meals[key].cals}
          onChangeText={(txt) => setMeals({ ...meals, [key]: { ...meals[key], cals: txt } })}
        />
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="What did you eat?"
          placeholderTextColor="#555"
          value={meals[key].menu}
          onChangeText={(txt) => setMeals({ ...meals, [key]: { ...meals[key], menu: txt } })}
        />
      </View>
    </View>
  );

  const totalCalories = (parseInt(meals.breakfast.cals) || 0) + (parseInt(meals.lunch.cals) || 0) + (parseInt(meals.dinner.cals) || 0);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Nutrition Log</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{totalCalories} <Text style={styles.kcal}>kcal</Text></Text>
            </View>
          </View>

          {renderMealInput('Breakfast', 'breakfast', 'sunny-outline')}
          {renderMealInput('Lunch', 'lunch', 'partly-sunny-outline')}
          {renderMealInput('Dinner', 'dinner', 'moon-outline')}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Daily Totals</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scroll: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  totalBadge: { alignItems: 'flex-end' },
  totalLabel: { color: '#888', fontSize: 10, fontWeight: 'bold' },
  totalValue: { color: '#ffa502', fontSize: 24, fontWeight: 'bold' },
  kcal: { fontSize: 14, fontWeight: 'normal' },
  card: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  cardLabel: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', gap: 10 },
  // FIX APPLIED HERE: borderWeight -> borderWidth
  input: { backgroundColor: '#121212', borderRadius: 8, padding: 12, color: '#FFF', borderWidth: 1, borderColor: '#222' },
  saveBtn: { backgroundColor: '#ffa502', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 18 }
});