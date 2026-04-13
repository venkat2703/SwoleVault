import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { OnboardingStackParamList } from '@navigation/types';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'BasicInfo'>;

export default function BasicInfoScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [name, setName] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleNext = () => {
    if (!name.trim()) return alert('Please enter your name');
    navigation.navigate('Metrics', { name, sex, dob: dob.getTime() });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.label}>What is your name?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Biological Sex</Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.toggleButton, sex === 'Male' && styles.toggleActive]} 
            onPress={() => setSex('Male')}
          >
            <Text style={styles.toggleText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, sex === 'Female' && styles.toggleActive]} 
            onPress={() => setSex('Female')}
          >
            <Text style={styles.toggleText}>Female</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Date of Birth</Text>
        {Platform.OS === 'android' ? (
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{dob.toLocaleDateString()}</Text>
          </TouchableOpacity>
        ) : null}

        {(showDatePicker || Platform.OS === 'ios') && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDob(selectedDate);
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next: Body Metrics</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  content: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 18, color: '#FFF', fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  input: { backgroundColor: '#1E1E1E', color: '#FFF', padding: 15, borderRadius: 8, fontSize: 16 },
  row: { flexDirection: 'row', gap: 10 },
  toggleButton: { flex: 1, padding: 15, backgroundColor: '#1E1E1E', borderRadius: 8, alignItems: 'center' },
  toggleActive: { backgroundColor: '#007AFF' },
  toggleText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  dateButton: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 8, alignItems: 'center' },
  dateButtonText: { color: '#FFF', fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});