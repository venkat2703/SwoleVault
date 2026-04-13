import { database } from './index';
import WorkoutLookup from './models/WorkoutLookup';

const BASELINE_WORKOUTS = [
  { name: 'Bench Press', muscle_group: 'Chest', intensity_score: 8 },
  { name: 'Squat', muscle_group: 'Legs', intensity_score: 9 },
  { name: 'Deadlift', muscle_group: 'Back', intensity_score: 10 },
  { name: 'Bicep Curl', muscle_group: 'Arms', intensity_score: 4 },
];

export const seedDatabase = async () => {
  const workoutCollection = database.get<WorkoutLookup>('workout_lookups');
  const existingCount = await workoutCollection.query().fetchCount();
  
  if (existingCount === 0) {
    console.log('Seeding baseline workouts...');
    await database.write(async () => {
      const creations = BASELINE_WORKOUTS.map((workout) => 
        workoutCollection.prepareCreate((newRecord) => {
          newRecord.name = workout.name;
          newRecord.muscleGroup = workout.muscle_group;
          newRecord.intensityScore = workout.intensity_score;
          newRecord.isActive = true; // MUST BE TRUE
        })
      );
      await database.batch(...creations);
    });
    console.log('Seeding complete!');
  }
};