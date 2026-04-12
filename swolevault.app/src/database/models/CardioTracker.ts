import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import CardioWorkoutLookup from './CardioWorkoutLookup';

export default class CardioTracker extends Model {
  static table = 'cardio_trackers';

  // @ts-ignore
  @date('date') date: Date;
  // @ts-ignore
  @field('duration_mins') durationMins: number;
  // @ts-ignore
  @field('steps') steps: number;
  // @ts-ignore
  @field('calories_burned') caloriesBurned: number;

  // THE FOREIGN KEY
  // @ts-ignore
  @relation('cardio_workout_lookups', 'cardio_id') cardioWorkout: CardioWorkoutLookup;
}