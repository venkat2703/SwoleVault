import { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  Welcome: undefined;
  BasicInfo: undefined;
  Metrics: { name: string; sex: 'Male' | 'Female'; dob: number };
  Calculation: { name: string; sex: 'Male' | 'Female'; dob: number; weightKg: number; heightCm: number };
};

export type RootStackParamList = {
  // Existing Screens
  Onboarding: undefined;
  MainTabs: undefined;
  ExerciseLibrary: undefined;
  LogWorkout: undefined;
  LogCardio: undefined;
  LogNutrition: undefined;
  LogWater: undefined;
  LogWeight: undefined;
  
  // New Epic 3 Screens
  GalleryScreen: undefined;
  CameraScreen: { pose: 'front' | 'back' | 'left' | 'right' };
};