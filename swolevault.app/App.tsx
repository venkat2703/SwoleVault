// App.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '@navigation/types';

// Import Navigators and Screens
import TabNavigator from '@navigation/TabNavigator';
import OnboardingStack from '@navigation/OnboardingStack';
import ExerciseLibraryScreen from '@screens/ExerciseLibraryScreen';
import LogWorkoutScreen from '@screens/LogWorkoutScreen';
import LogNutritionScreen from '@screens/LogNutritionScreen';
import LogWaterScreen from '@screens/LogWaterScreen';
import LogWeightScreen from '@screens/LogWeightScreen';

// Import New Epic 3 Screens
import CameraScreen from '@screens/CameraScreen';
import GalleryScreen from '@screens/GalleryScreen';

import { seedDatabase } from '@database/seeder';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Onboarding');

  useEffect(() => {
    async function prepareApp() {
      try {
        await seedDatabase();
        const onboardingStatus = await AsyncStorage.getItem('@onboarding_complete');
        if (onboardingStatus === 'true') {
          setInitialRoute('MainTabs');
        }
      } catch (e) {
        console.error("Failed to load initial app state:", e);
      } finally {
        setIsAppReady(true);
      }
    }
    prepareApp();
  }, []);

  if (!isAppReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator 
        initialRouteName={initialRoute} 
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="Onboarding" component={OnboardingStack} />
        <RootStack.Screen name="MainTabs" component={TabNavigator} />
        <RootStack.Screen 
          name="ExerciseLibrary" 
          component={ExerciseLibraryScreen} 
          options={{ headerShown: true, title: 'Exercise Library', headerStyle: { backgroundColor: '#121212' }, headerTintColor: '#FFF' }} 
        />
        <RootStack.Screen name="LogWorkout" component={LogWorkoutScreen} />
        <RootStack.Screen name="LogCardio" component={LogWorkoutScreen} />
        <RootStack.Screen name="LogNutrition" component={LogNutritionScreen} />
        <RootStack.Screen name="LogWater" component={LogWaterScreen} />
        <RootStack.Screen name="LogWeight" component={LogWeightScreen} />
        
        {/* NEW EPIC 3 SCREENS REGISTERED HERE */}
        <RootStack.Screen name="GalleryScreen" component={GalleryScreen} />
        <RootStack.Screen name="CameraScreen" component={CameraScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}