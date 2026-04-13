import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class UserProfile extends Model {
  static table = 'user_profiles';

  @text('name') name!: string;
  @date('dob') dob!: Date;
  @text('sex') sex!: string;
  @field('current_weight_kg') currentWeightKg!: number;
  @field('current_height_cm') currentHeightCm!: number;
  @field('current_bmi') currentBmi?: number;
  @field('current_bmr') currentBmr?: number;
  @field('water_target_liters') waterTargetLiters!: number;
}