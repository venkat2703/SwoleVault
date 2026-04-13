import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from '@navigation/TabNavigator'; // Alias in action

export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}