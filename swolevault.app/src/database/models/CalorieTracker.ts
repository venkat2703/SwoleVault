import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class CalorieTracker extends Model {
  static table = 'calorie_trackers';

  @date('date') date!: Date;
  @field('breakfast_calories') breakfastCalories!: number;
  @field('lunch_calories') lunchCalories!: number;
  @field('dinner_calories') dinnerCalories!: number;
  @field('overall_calories') overallCalories!: number;
  @text('breakfast_menu') breakfastMenu?: string;
  @text('lunch_menu') lunchMenu?: string;
  @text('dinner_menu') dinnerMenu?: string;
}