import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { processAndSaveProgressPic } from '@utils/imageManager';

export default function CameraScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // Allow passing the pose (front, side, back) via navigation params. Default to 'front'
  const pose = (route.params as any)?.pose || 'front';

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // 1. Loading State
  if (!permission) {
    return <View style={styles.container} />;
  }

  // 2. Permission Denied / Fallback UI
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={64} color="#52525B" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            SwoleVault needs camera access to capture your progress photos. Please enable it to continue.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // Capture at 0.8 quality to balance high quality with storage space
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo) {
          setCapturedPhotoUri(photo.uri);
        }
      } catch (error) {
        console.error("Failed to capture image:", error);
        Alert.alert('Error', 'Could not capture photo. Please try again.');
      }
    }
  };

  const confirmPhoto = async () => {
        if (!capturedPhotoUri) return;

        // We are mapping the general string 'pose' to the strict literal types expected by the DB
        const validPose = pose as 'front' | 'back' | 'left' | 'right';

        const success = await processAndSaveProgressPic(capturedPhotoUri, validPose);

        if (success) {
            Alert.alert('Photo Saved', `${pose.toUpperCase()} picture compressed and linked to your latest check-in!`, [
            { text: 'Awesome', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', 'Failed to compress and save the image. Did you log your weight today?');
        }
        };

  // 4. Review State UI
  if (capturedPhotoUri) {
    return (
      <View style={styles.container}>
        {/* Strictly enforce 3:4 Aspect ratio for future FFmpeg processing */}
        <View style={styles.aspectRatioContainer}>
          <Image source={{ uri: capturedPhotoUri }} style={styles.fullImage} />
        </View>
        
        <View style={styles.reviewControls}>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => setCapturedPhotoUri(null)}>
            <Ionicons name="close" size={24} color="#FFF" />
            <Text style={styles.retakeBtnText}>Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.confirmBtn} onPress={confirmPhoto}>
            <Text style={styles.confirmBtnText}>Confirm {pose}</Text>
            <Ionicons name="checkmark" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 5. Active Viewfinder UI
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.poseBadge}>
          <Text style={styles.poseBadgeText}>{pose.toUpperCase()} POSE</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Strictly enforce 3:4 Aspect ratio container for viewfinder */}
      <View style={styles.aspectRatioContainer}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
          animateShutter={false} // Disable default flash animation for a cleaner UX
        />
        {/* Visual Overlays for alignment could go here in the future */}
      </View>

      <View style={styles.captureFooter}>
        <TouchableOpacity style={styles.captureRing} onPress={takePicture}>
          <View style={styles.captureButton} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B', justifyContent: 'center' },
  
  // Aspect Ratio Enforcement (3:4 portrait mapping)
  aspectRatioContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  camera: { flex: 1 },
  fullImage: { flex: 1, resizeMode: 'cover' },

  // Permission Fallback UI
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  permissionTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  permissionText: { color: '#A1A1AA', textAlign: 'center', fontSize: 16, marginBottom: 40, lineHeight: 24 },
  primaryBtn: { backgroundColor: '#10B981', width: '100%', paddingVertical: 16, borderRadius: 100, alignItems: 'center', marginBottom: 15 },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { width: '100%', paddingVertical: 16, borderRadius: 100, alignItems: 'center', backgroundColor: '#18181B' },
  secondaryBtnText: { color: '#A1A1AA', fontWeight: '600', fontSize: 16 },

  // Active Viewfinder UI
  header: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, zIndex: 10 },
  iconBtn: { backgroundColor: 'rgba(0,0,0,0.5)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  poseBadge: { backgroundColor: 'rgba(16, 185, 129, 0.9)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  poseBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  
  captureFooter: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  captureRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  captureButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },

  // Review State UI
  reviewControls: { position: 'absolute', bottom: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 100 },
  retakeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 100 },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
});