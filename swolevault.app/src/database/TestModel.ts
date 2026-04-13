import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class TestModel extends Model {
  // Must match the table name in schema.ts
  static table = 'tests';

  // @ts-ignore - Ignore strict TS initialization warnings for Watermelon fields
  @field('text') text: string;

  // @ts-ignore
  @readonly @date('created_at') createdAt: Date;
}