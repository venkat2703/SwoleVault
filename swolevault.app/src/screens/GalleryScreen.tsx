import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, 
  Modal, ActivityIndicator, SafeAreaView, Dimensions 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { database } from '@database/index';
import { Q } from '@nozbe/watermelondb';
import WeightTracker from '@database/models/WeightTracker';

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = (width - 70) / 4; // 4 columns with padding

type ValidatedImage = {
  pose: string;
  uri: string | null;
};

type GalleryEntry = {
  id: string;
  date: Date;
  weight: number;
  images: ValidatedImage[];
};

export default function GalleryScreen() {
  const [galleryLogs, setGalleryLogs] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Full-screen modal state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // --- PATH VALIDATION UTILITY ---
  // Safely checks if the file still exists on the disk
  const validatePath = async (uri: string | undefined | null): Promise<string | null> => {
    if (!uri) return null;
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info.exists ? uri : null;
    } catch (error) {
      console.warn(`[Gallery] File validation failed for ${uri}`, error);
      return null;
    }
  };

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all weight logs, newest first
      const rawLogs = await database.get<WeightTracker>('weight_trackers')
        .query(Q.sortBy('date', Q.desc))
        .fetch();

      const processedLogs: GalleryEntry[] = [];

      // 2. Loop through and validate paths
      for (const log of rawLogs) {
        // Only process logs that have at least one picture path saved in the DB
        if (log.frontPicPath || log.backPicPath || log.leftPicPath || log.rightPicPath) {
          
          const validFront = await validatePath(log.frontPicPath);
          const validBack = await validatePath(log.backPicPath);
          const validLeft = await validatePath(log.leftPicPath);
          const validRight = await validatePath(log.rightPicPath);

          // Build the image array for this specific check-in
          const images: ValidatedImage[] = [
            { pose: 'Front', uri: validFront },
            { pose: 'Back', uri: validBack },
            { pose: 'Left', uri: validLeft },
            { pose: 'Right', uri: validRight },
          ];

          processedLogs.push({
            id: log.id,
            date: log.date,
            weight: log.weightKg,
            images,
          });
        }
      }

      setGalleryLogs(processedLogs);
    } catch (error) {
      console.error("[Gallery] Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchGalleryData();
    }, [])
  );

  const renderThumbnail = (img: ValidatedImage, index: number) => {
    if (img.uri) {
      return (
        <TouchableOpacity 
          key={index} 
          activeOpacity={0.8}
          onPress={() => setSelectedImage(img.uri)}
        >
          <Image source={{ uri: img.uri }} style={styles.thumbnail} />
          <View style={styles.poseLabelBadge}>
            <Text style={styles.poseLabelText}>{img.pose}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // GRACEFUL FALLBACK: Render placeholder if file was deleted by OS or missing
    return (
      <View key={index} style={[styles.thumbnail, styles.placeholderBox]}>
        <Ionicons name="image-outline" size={24} color="#3F3F46" />
        <Text style={styles.placeholderText}>Missing</Text>
      </View>
    );
  };

  const renderLogEntry = ({ item }: { item: GalleryEntry }) => (
    <View style={styles.logCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
        <View style={styles.weightBadge}>
          <Text style={styles.weightText}>{item.weight} kg</Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {item.images.map((img, idx) => renderThumbnail(img, idx))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress Gallery</Text>
      </View>

      {loading ? (
        <View style={styles.centerLoad}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={galleryLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogEntry}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={64} color="#3F3F46" />
              <Text style={styles.emptyText}>No progress pictures yet.</Text>
              <Text style={styles.emptySubText}>Log your weight and snap some photos to start tracking your physique!</Text>
            </View>
          }
        />
      )}

      {/* FULL-SCREEN MODAL */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseBtn} 
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.fullScreenImage} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  
  centerLoad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  
  logCard: { backgroundColor: '#18181B', borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#27272A' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dateText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  weightBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  weightText: { color: '#10B981', fontWeight: 'bold', fontSize: 14 },
  
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  thumbnail: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE * 1.33, borderRadius: 8, backgroundColor: '#27272A' },
  poseLabelBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  poseLabelText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  
  placeholderBox: { justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#3F3F46', backgroundColor: '#18181B' },
  placeholderText: { color: '#52525B', fontSize: 10, marginTop: 4 },
  
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySubText: { color: '#A1A1AA', textAlign: 'center', marginTop: 10, paddingHorizontal: 40, lineHeight: 22 },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 5 },
  fullScreenImage: { width: '100%', height: '100%' },
});