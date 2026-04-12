import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class WeightTracker extends Model {
  static table = 'weight_trackers';

  // @ts-ignore
  @date('date') date: Date;
  // @ts-ignore
  @field('weight_kg') weightKg: number;
  
  // These will hold the local file paths to the images on the user's phone
  // @ts-ignore
  @field('left_pic_path') leftPicPath: string;
  // @ts-ignore
  @field('right_pic_path') rightPicPath: string;
  // @ts-ignore
  @field('front_pic_path') frontPicPath: string;
  // @ts-ignore
  @field('back_pic_path') backPicPath: string;
}