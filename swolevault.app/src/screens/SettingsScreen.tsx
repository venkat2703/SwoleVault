import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <TouchableOpacity 
        style={styles.settingRow} 
        onPress={() => navigation.navigate('ExerciseLibrary')}
      >
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Ionicons name="barbell-outline" size={24} color="#FFF" style={{marginRight: 15}}/>
          <Text style={styles.settingText}>Manage Exercise Library</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 30, marginTop: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 18, borderRadius: 12 },
  settingText: { color: '#FFF', fontSize: 18, fontWeight: '600' }
});