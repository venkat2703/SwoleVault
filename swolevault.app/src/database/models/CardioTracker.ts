import { Model } from '@nozbe/watermelondb';
import { field, date, immutableRelation } from '@nozbe/watermelondb/decorators';

export default class CardioTracker extends Model {
  static table = 'cardio_trackers';
  static associations = {
    cardio_workout_lookups: { type: 'belongs_to', key: 'cardio_id' },
  } as const;

  // @ts-ignore
  @date('date') date: number;
  // @ts-ignore
  @field('cardio_id') cardioId: string;
  // @ts-ignore
  @field('duration_mins') durationMins: number;
  // @ts-ignore
  @field('steps') steps: number;
  // @ts-ignore
  @field('calories_burned') caloriesBurned: number;

  // @ts-ignore
  @immutableRelation('cardio_workout_lookups', 'cardio_id') cardio;
}