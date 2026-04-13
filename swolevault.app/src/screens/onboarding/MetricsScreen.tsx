import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '@navigation/types';
import { lbsToKg, ftInToCm } from '@utils/metrics';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Metrics'>;
type MetricsRouteProp = RouteProp<OnboardingStackParamList, 'Metrics'>;

export default function MetricsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<MetricsRouteProp>();
  const { name, sex, dob } = route.params;

  const [isMetric, setIsMetric] = useState(false);
  const [weight, setWeight] = useState('');
  const [heightPrimary, setHeightPrimary] = useState('');
  const [heightSecondary, setHeightSecondary] = useState('');

  const handleNext = () => {
    let finalWeightKg = 0;
    let finalHeightCm = 0;

    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return alert('Please enter a valid weight');
    finalWeightKg = isMetric ? w : lbsToKg(w);

    const h1 = parseFloat(heightPrimary);
    if (isNaN(h1) || h1 <= 0) return alert('Please enter a valid height');

    if (isMetric) {
      finalHeightCm = h1;
    } else {
      const h2 = parseFloat(heightSecondary) || 0;
      finalHeightCm = ftInToCm(h1, h2);
    }

    navigation.navigate('Calculation', { name, sex, dob, weightKg: finalWeightKg, heightCm: finalHeightCm });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.unitRow}>
          <Text style={styles.label}>Unit Preference</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity style={[styles.toggleBtn, !isMetric && styles.activeBtn]} onPress={() => setIsMetric(false)}>
              <Text style={styles.toggleText}>Imperial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, isMetric && styles.activeBtn]} onPress={() => setIsMetric(true)}>
              <Text style={styles.toggleText}>Metric</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Current Weight</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#666"
            value={weight}
            onChangeText={setWeight}
          />
          <Text style={styles.unitText}>{isMetric ? 'kg' : 'lbs'}</Text>
        </View>

        <Text style={styles.label}>Current Height</Text>
        {isMetric ? (
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#666"
              value={heightPrimary}
              onChangeText={setHeightPrimary}
            />
            <Text style={styles.unitText}>cm</Text>
          </View>
        ) : (
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#666"
                value={heightPrimary}
                onChangeText={setHeightPrimary}
              />
              <Text style={styles.unitText}>ft</Text>
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#666"
                value={heightSecondary}
                onChangeText={setHeightSecondary}
              />
              <Text style={styles.unitText}>in</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next: Calculate Targets</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  content: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 18, color: '#FFF', fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  row: { flexDirection: 'row', gap: 10 },
  unitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 8, overflow: 'hidden' },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  activeBtn: { backgroundColor: '#007AFF' },
  toggleText: { color: '#FFF', fontWeight: 'bold' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 8, paddingHorizontal: 15 },
  input: { flex: 1, color: '#FFF', paddingVertical: 15, fontSize: 18 },
  unitText: { color: '#A0A0A0', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});