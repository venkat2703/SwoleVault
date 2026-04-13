import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class WeightTracker extends Model {
  static table = 'weight_trackers';

  @date('date') date!: Date;
  @field('weight_kg') weightKg!: number;
  @text('left_pic_path') leftPicPath?: string;
  @text('right_pic_path') rightPicPath?: string;
  @text('front_pic_path') frontPicPath?: string;
  @text('back_pic_path') backPicPath?: string;
}