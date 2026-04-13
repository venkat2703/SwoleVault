import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';

// Import all 8 models
import WorkoutLookup from './models/WorkoutLookup';
import WorkoutTracker from './models/WorkoutTracker';
import CardioWorkoutLookup from './models/CardioWorkoutLookup';
import CardioTracker from './models/CardioTracker';
import UserProfile from './models/UserProfile';
import WaterTracker from './models/WaterTracker';
import CalorieTracker from './models/CalorieTracker';
import WeightTracker from './models/WeightTracker';

const adapter = new SQLiteAdapter({ schema });

export const database = new Database({
  adapter,
  modelClasses: [
    WorkoutLookup,
    WorkoutTracker,
    CardioWorkoutLookup,
    CardioTracker,
    UserProfile,
    WaterTracker,
    CalorieTracker,
    WeightTracker
  ],
});