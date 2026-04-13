import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class WaterTracker extends Model {
  static table = 'water_trackers';

  @date('date') date!: Date;
  @field('water_consumed_liters') waterConsumedLiters!: number;
}