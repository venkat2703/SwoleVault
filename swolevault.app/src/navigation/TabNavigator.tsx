import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '@screens/DashboardScreen';
import WorkoutScreen from '@screens/WorkoutScreen';
import NutritionScreen from '@screens/NutritionScreen';
import SettingsScreen from '@screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        // Dark Mode Header
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#FFFFFF',
        headerShadowVisible: false,
        
        // Dark Mode Bottom Tabs
        tabBarStyle: { backgroundColor: '#1A1A1A', borderTopColor: '#333' },
        tabBarActiveTintColor: '#28a745', // SwoleVault Green!
        tabBarInactiveTintColor: '#888',
        
        // Dynamic Icons based on the tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workout') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}