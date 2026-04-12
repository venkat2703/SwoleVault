import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';

export default class WorkoutLookup extends Model {
  static table = 'workout_lookups';

  // @ts-ignore
  @field('name') name: string;
  // @ts-ignore
  @field('muscle_group') muscleGroup: string;
  // @ts-ignore
  @field('intensity_score') intensityScore: number;
  // @ts-ignore
  @field('is_active') isActive: boolean; // NEW DECORATOR

  // @ts-ignore
  @children('workout_trackers') trackers: any; 
}