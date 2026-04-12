import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class CalorieTracker extends Model {
  static table = 'calorie_trackers';

  // @ts-ignore
  @date('date') date: Date;
  // @ts-ignore
  @field('breakfast_calories') breakfastCalories: number;
  // @ts-ignore
  @field('lunch_calories') lunchCalories: number;
  // @ts-ignore
  @field('dinner_calories') dinnerCalories: number;
  // @ts-ignore
  @field('overall_calories') overallCalories: number;
  
  // @ts-ignore
  @field('breakfast_menu') breakfastMenu: string;
  // @ts-ignore
  @field('lunch_menu') lunchMenu: string;
  // @ts-ignore
  @field('dinner_menu') dinnerMenu: string;
}