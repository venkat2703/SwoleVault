import { Model } from '@nozbe/watermelondb';
import { field, text, children } from '@nozbe/watermelondb/decorators';

export default class WorkoutLookup extends Model {
  static table = 'workout_lookups';

  @text('name') name!: string;
  @text('muscle_group') muscleGroup!: string;
  @field('intensity_score') intensityScore!: number;
  @field('is_active') isActive!: boolean;

  // Has-Many Relationship to Workout Trackers
  @children('workout_trackers') trackers!: any; 
}