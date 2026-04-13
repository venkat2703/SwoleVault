import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LogWeightScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Logging Weight Feature Coming in Story 2.2</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFF', fontSize: 18 }
});