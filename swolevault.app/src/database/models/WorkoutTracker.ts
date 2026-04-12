import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import WorkoutLookup from './WorkoutLookup';

export default class WorkoutTracker extends Model {
  static table = 'workout_trackers';

  // @ts-ignore
  @date('date') date: Date; // Converts the SQLite number to a JS Date automatically
  // @ts-ignore
  @field('set_number') setNumber: number;
  // @ts-ignore
  @field('reps') reps: number;
  // @ts-ignore
  @field('weight') weight: number;
  // @ts-ignore
  @field('calories_burned') caloriesBurned: number;

  // THE FOREIGN KEY RELATIONSHIP
  // @ts-ignore
  @relation('workout_lookups', 'workout_id') workout: WorkoutLookup;
}