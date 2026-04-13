import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class WaterTracker extends Model {
  static table = 'water_trackers';

  // @ts-ignore
  @date('date') date: Date;
  // @ts-ignore
  @field('water_consumed_liters') waterConsumedLiters: number;
}