import { Model } from '@nozbe/watermelondb';
import { field, date, immutableRelation } from '@nozbe/watermelondb/decorators';

export default class WorkoutTracker extends Model {
  static table = 'workout_trackers';
  static associations = {
    workout_lookups: { type: 'belongs_to', key: 'workout_id' },
  } as const;

  // @ts-ignore
  @date('date') date: number;
  // @ts-ignore
  @field('workout_id') workoutId: string;
  // @ts-ignore
  @field('set_number') setNumber: number;
  // @ts-ignore
  @field('reps') reps: number;
  // @ts-ignore
  @field('weight') weight: number;

  // This allows us to call .workout.fetch() to get the name
  // @ts-ignore
  @immutableRelation('workout_lookups', 'workout_id') workout;
}