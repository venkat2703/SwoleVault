import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { database } from '@database/index';
import WeightTracker from '@database/models/WeightTracker';
import { Q } from '@nozbe/watermelondb';

/**
 * Compresses an image, saves it permanently, and links it to today's weight log.
 */
export const processAndSaveProgressPic = async (
  tempUri: string, 
  pose: 'front' | 'back' | 'left' | 'right'
): Promise<boolean> => {
  try {
    // 1. IMAGE COMPRESSION (1080px width, 70% Quality JPEG)
    // This guarantees the file size will be well under 500kb.
    const manipResult = await manipulateAsync(
      tempUri,
      [{ resize: { width: 1080 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );

    // 2. FILE MANAGEMENT
    // Generate a unique permanent path in the app's document directory
    const timestamp = Date.now();
    const fileName = `swole_${pose}_${timestamp}.jpg`;
    const permanentUri = `${FileSystem.documentDirectory}${fileName}`;

    // Move the newly compressed image from cache to permanent storage
    await FileSystem.moveAsync({
      from: manipResult.uri,
      to: permanentUri,
    });

    // 3. STORAGE BLOAT PREVENTION
    // Actively flush the original massive uncompressed file from the camera cache
    await FileSystem.deleteAsync(tempUri, { idempotent: true });

    // 4. DATABASE INTEGRATION
    // Find the most recent weight log to attach these pictures to
    const recentLogs = await database.get<WeightTracker>('weight_trackers')
      .query(
        Q.sortBy('date', Q.desc),
        Q.take(1)
      )
      .fetch();

    if (recentLogs.length === 0) {
      throw new Error("No weight log found. Please log your weight first.");
    }

    const targetRecord = recentLogs[0];

    // Ensure we only store the STRING PATH in SQLite, not a binary blob
    await database.write(async () => {
      await targetRecord.update((record: any) => {
        if (pose === 'front') record.frontPicPath = permanentUri;
        if (pose === 'back') record.backPicPath = permanentUri;
        if (pose === 'left') record.leftPicPath = permanentUri;
        if (pose === 'right') record.rightPicPath = permanentUri;
      });
    });

    console.log(`[Storage] Successfully saved and linked ${pose} picture: ${permanentUri}`);
    return true;

  } catch (error) {
    console.error("[Storage Error] Failed to process image:", error);
    return false;
  }
};