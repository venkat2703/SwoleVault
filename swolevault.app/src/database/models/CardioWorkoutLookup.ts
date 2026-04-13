import { Model } from '@nozbe/watermelondb';
import { field, text, children } from '@nozbe/watermelondb/decorators';

export default class CardioWorkoutLookup extends Model {
  static table = 'cardio_workout_lookups';

  @text('name') name!: string;
  @field('intensity_score') intensityScore!: number;
  @field('is_active') isActive!: boolean;

  // Has-Many Relationship
  @children('cardio_trackers') trackers!: any;
}