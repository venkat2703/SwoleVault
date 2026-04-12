import { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  Welcome: undefined;
  BasicInfo: undefined;
  Metrics: { name: string; sex: 'Male' | 'Female'; dob: number };
  Calculation: { name: string; sex: 'Male' | 'Female'; dob: number; weightKg: number; heightCm: number };
};

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  MainTabs: undefined;
  ExerciseLibrary: undefined;
  // Logging Routes
  LogWorkout: undefined;
  LogCardio: undefined;
  LogNutrition: undefined;
  LogWater: undefined;
  LogWeight: undefined;
};