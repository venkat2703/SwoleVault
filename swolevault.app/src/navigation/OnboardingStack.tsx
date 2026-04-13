import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';

import WelcomeScreen from '@screens/onboarding/WelcomeScreen';
import BasicInfoScreen from '@screens/onboarding/BasicInfoScreen';
import MetricsScreen from '@screens/onboarding/MetricsScreen';
import CalculationScreen from '@screens/onboarding/CalculationScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false, // Removes the ugly border line below the header
      }}
    >
      {/* headerShown: false hides the top bar on the welcome screen so it's full screen */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BasicInfo" component={BasicInfoScreen} options={{ title: 'Step 1 of 3' }} />
      <Stack.Screen name="Metrics" component={MetricsScreen} options={{ title: 'Step 2 of 3' }} />
      <Stack.Screen name="Calculation" component={CalculationScreen} options={{ title: 'Final Step' }} />
    </Stack.Navigator>
  );
}