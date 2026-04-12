import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 3, // BUMPED TO VERSION 3!
  tables: [
    tableSchema({
      name: 'user_profiles',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'dob', type: 'number' },
        { name: 'sex', type: 'string' },
        { name: 'current_weight_kg', type: 'number' },
        { name: 'current_height_cm', type: 'number' },
        { name: 'current_bmi', type: 'number', isOptional: true },
        { name: 'current_bmr', type: 'number', isOptional: true },
        { name: 'water_target_liters', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'calorie_trackers',
      columns: [
        { name: 'date', type: 'number' },
        { name: 'breakfast_calories', type: 'number' },
        { name: 'lunch_calories', type: 'number' },
        { name: 'dinner_calories', type: 'number' },
        { name: 'overall_calories', type: 'number' },
        { name: 'breakfast_menu', type: 'string', isOptional: true },
        { name: 'lunch_menu', type: 'string', isOptional: true },
        { name: 'dinner_menu', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'workout_lookups',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'muscle_group', type: 'string' },
        { name: 'intensity_score', type: 'number' },
        { name: 'is_active', type: 'boolean' }, // NEW FIELD
      ],
    }),
    tableSchema({
      name: 'workout_trackers',
      columns: [
        { name: 'date', type: 'number' },
        { name: 'workout_id', type: 'string', isIndexed: true },
        { name: 'set_number', type: 'number' },
        { name: 'reps', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'calories_burned', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'cardio_workout_lookups',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'intensity_score', type: 'number' },
        { name: 'is_active', type: 'boolean' }, // NEW FIELD
      ],
    }),
    tableSchema({
      name: 'cardio_trackers',
      columns: [
        { name: 'date', type: 'number' },
        { name: 'cardio_id', type: 'string', isIndexed: true },
        { name: 'duration_mins', type: 'number' },
        { name: 'steps', type: 'number', isOptional: true },
        { name: 'calories_burned', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'water_trackers',
      columns: [
        { name: 'date', type: 'number' },
        { name: 'water_consumed_liters', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'weight_trackers',
      columns: [
        { name: 'date', type: 'number' },
        { name: 'weight_kg', type: 'number' },
        { name: 'left_pic_path', type: 'string', isOptional: true },
        { name: 'right_pic_path', type: 'string', isOptional: true },
        { name: 'front_pic_path', type: 'string', isOptional: true },
        { name: 'back_pic_path', type: 'string', isOptional: true },
      ],
    }),
  ],
});