import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Look at those clean absolute imports!
import DashboardScreen from '@screens/DashboardScreen';
import WorkoutScreen from '@screens/WorkoutScreen';
import NutritionScreen from '@screens/NutritionScreen';
import SettingsScreen from '@screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#007AFF', // SwoleVault blue (change later!)
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}