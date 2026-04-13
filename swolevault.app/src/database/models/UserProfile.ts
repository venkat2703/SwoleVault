import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class UserProfile extends Model {
  static table = 'user_profiles';

  // @ts-ignore
  @field('name') name: string;
  // @ts-ignore
  @date('dob') dob: Date; 
  // @ts-ignore
  @field('sex') sex: string;
  // @ts-ignore
  @field('current_weight_kg') currentWeightKg: number;
  // @ts-ignore
  @field('current_height_cm') currentHeightCm: number;
  // @ts-ignore
  @field('current_bmi') currentBmi: number;
  // @ts-ignore
  @field('current_bmr') currentBmr: number;
  // @ts-ignore
  @field('water_target_liters') waterTargetLiters: number;
}