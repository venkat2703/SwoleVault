import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';

export default class CardioWorkoutLookup extends Model {
  static table = 'cardio_workout_lookups';

  // @ts-ignore
  @field('name') name: string;
  // @ts-ignore
  @field('intensity_score') intensityScore: number;
  // @ts-ignore
  @field('is_active') isActive: boolean; // NEW DECORATOR

  // @ts-ignore
  @children('cardio_trackers') trackers: any;
}