import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type WorkoutLookup from './WorkoutLookup';

export default class WorkoutTracker extends Model {
  static table = 'workout_trackers';

  @date('date') date!: Date;
  @field('set_number') setNumber!: number;
  @field('reps') reps!: number;
  @field('weight') weight!: number;
  @field('calories_burned') caloriesBurned?: number;

  // Belongs-To Relationship (Foreign Key)
  @relation('workout_lookups', 'workout_id') workout!: WorkoutLookup;
}