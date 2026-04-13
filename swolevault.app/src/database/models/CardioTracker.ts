import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type CardioWorkoutLookup from './CardioWorkoutLookup';

export default class CardioTracker extends Model {
  static table = 'cardio_trackers';

  @date('date') date!: Date;
  @field('duration_mins') durationMins!: number;
  @field('steps') steps?: number;
  @field('calories_burned') caloriesBurned?: number;

  // Belongs-To Relationship (Foreign Key)
  @relation('cardio_workout_lookups', 'cardio_id') cardioWorkout!: CardioWorkoutLookup;
}