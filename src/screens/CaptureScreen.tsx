import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image, ImageBackground, Alert, Modal, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
// Use legacy FileSystem API for compatibility with Expo SDK 54
import { readAsStringAsync } from 'expo-file-system/legacy';
import { classifyImage, type Detection } from '@/services/classifier';
import { useHistoryStore } from '@/store/useHistoryStore';
import { mapLabelToGuide } from '@/services/materials';
import { useNavigation } from '@react-navigation/native';
import { images } from '@/assets/images';
import { saveScanHistory } from '@/services/materials';
import { useAuthStore } from '@/store/useAuthStore';

// Helper function to convert technical errors to user-friendly messages
const getUserFriendlyError = (error: any): string => {
  const message = error?.message || '';
  
  // Network/API errors
  if (message.includes('Network request failed') || message.includes('fetch')) {
    return 'Unable to connect to server. Please check your internet connection.';
  }
  
  // File system errors
  if (message.includes('readAsStringAsync') || message.includes('file-system')) {
    return 'Unable to process image. Please try again.';
  }
  
  // Camera errors
  if (message.includes('camera data') || message.includes('construct an image')) {
    return 'Camera not ready. Please wait a moment and try again.';
  }
  
  // Permission errors
  if (message.includes('permission') || message.includes('denied')) {
    return 'Camera permission required. Please enable camera access.';
  }
  
  // Recognition errors
  if (message.includes('No detection') || message.includes('recognition')) {
    return 'Could not identify material. Please ensure good lighting and try again.';
  }
  
  // Generic fallback
  return 'Something went wrong. Please try again.';
};

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isBusy, setIsBusy] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [bbox, setBbox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [predictions, setPredictions] = useState<Detection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastBase64, setLastBase64] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const addHistory = useHistoryStore((s) => s.addItem);
  const navigation = useNavigation<any>();
  const CONFIDENCE_THRESHOLD = 0.4; 

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const applyPrediction = async (prediction: { best?: Detection; detections?: Detection[] }, currentUri: string | null, base64?: string) => {
    const best = prediction?.best;
    const detections = prediction?.detections ?? null;
    if (!best) {
      setResult(null);
      setConfidence(null);
      setBbox(null);
      setPredictions(null);
      setError('No detection. Please retry or recapture.');
      return;
    }
    if ((best.confidence ?? 0) < CONFIDENCE_THRESHOLD) {
      setResult(null);
      setConfidence(best.confidence ?? null);
      setBbox(best.bbox ?? null);
      setPredictions(null);
      setError('Failed to recognize. Please retry or recapture.');
      return;
    }
    // Confident enough
    setResult(best.label ?? 'Unknown');
    setConfidence(best.confidence ?? null);
    setBbox(best.bbox ?? null);
    setPredictions(detections ? detections.slice(0, 3) : null);
    setError(null);
    
    // Add to local history with proper structure including confidence
    addHistory({ 
      label: best.label ?? 'Unknown', 
      uri: currentUri,
      confidence: best.confidence ?? undefined
    });
    
    // Save to backend scan history - use passed base64 or fallback to state
    const imageBase64 = base64 || lastBase64;
    if (imageBase64) {
      try {
        const sessionToken = useAuthStore.getState().sessionToken;
        const userId = useAuthStore.getState().userId;

        console.log('[CaptureScreen] Scan History Save Context:', {
          sessionTokenAvailable: !!sessionToken,
          userIdAvailable: !!userId,
          imageUrlAvailable: !!currentUri,
          imageBase64Available: !!imageBase64,
          bestLabel: best.label,
          bestConfidence: best.confidence
        });

        // Validate required data before saving
        if (!sessionToken || !userId) {
          throw new Error('Missing authentication credentials');
        }

        const scanHistoryData = {
          materialLabel: best.label,
          confidence: best.confidence ?? 0,
          imageUrl: currentUri ?? undefined,
          detectionDetails: best
        };

        console.log('[CaptureScreen] Attempting to save scan history:', {
          materialLabel: scanHistoryData.materialLabel,
          confidence: scanHistoryData.confidence,
          imageUrlProvided: !!scanHistoryData.imageUrl
        });

        const savedHistory = await saveScanHistory(scanHistoryData);
        
        console.log('[CaptureScreen] Scan history saved successfully:', {
          id: savedHistory.id,
          materialLabel: savedHistory.material_label,
          confidence: savedHistory.confidence
        });
      } catch (historyError: any) {
        console.error('[CaptureScreen] Failed to save scan history:', {
          message: historyError.message,
          status: historyError.status,
          code: historyError.code,
          stack: historyError.stack,
          responseText: historyError.responseText
        });

        // User-friendly error handling
        Alert.alert(
          'Save History Error', 
          historyError.message || 'Failed to save scan history. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const classifyAndApply = async (base64: string, currentUri: string | null) => {
    setIsBusy(true);
    try {
      const prediction = await classifyImage({ base64 });
      await applyPrediction(prediction, currentUri, base64);
    } catch (e: any) {
      console.error('[CaptureScreen] Classification error:', e);
      setError(getUserFriendlyError(e));
    } finally {
      setIsBusy(false);
    }
  };

  const retryClassify = async () => {
    if (!lastBase64) return;
    await classifyAndApply(lastBase64, photoUri);
  };

  const recapture = () => {
    setPhotoUri(null);
    setResult(null);
    setConfidence(null);
    setBbox(null);
    setPredictions(null);
    setError(null);
    setLastBase64(null);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    setIsBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, skipProcessing: true });
      setPhotoUri(photo.uri);
      // Use legacy FileSystem API with 'base64' encoding
      const base64 = await readAsStringAsync(photo.uri, { encoding: 'base64' });
      setLastBase64(base64);
      await classifyAndApply(base64, photo.uri);
    } catch (e: any) {
      console.error('[CaptureScreen] takePhoto error:', e);
      setError(getUserFriendlyError(e));
    } finally {
      setIsBusy(false);
    }
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: true });
    if (!res.canceled && res.assets && res.assets[0].base64) {
      setIsBusy(true);
      try {
        const base64 = res.assets[0].base64;
        const uri = res.assets[0].uri ?? null;
        setPhotoUri(uri);
        setLastBase64(base64);
        await classifyAndApply(base64, uri);
      } finally {
        setIsBusy(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
      {!photoUri ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} ref={(ref) => { cameraRef.current = ref; }} />
          <Pressable 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </Pressable>
          {result && bbox ? (
            <View style={[styles.detectBox, { left: `${bbox.x * 100}%`, top: `${bbox.y * 100}%`, width: `${bbox.width * 100}%`, height: `${bbox.height * 100}%` }]}>
              <View style={styles.detectLabel}>
                <Text style={styles.detectLabelText}>{result} ({Math.round((confidence ?? 0) * 100)}%)</Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
          {result && bbox ? (
            <View style={[styles.detectBox, { left: `${bbox.x * 100}%`, top: `${bbox.y * 100}%`, width: `${bbox.width * 100}%`, height: `${bbox.height * 100}%` }]}>
              <View style={styles.detectLabel}>
                <Text style={styles.detectLabelText}>{result} ({Math.round((confidence ?? 0) * 100)}%)</Text>
              </View>
            </View>
          ) : null}
        </View>
      )}
      <View style={styles.bottomContainer}>
        <View style={styles.footer}>
          <Pressable
            style={styles.actionButton}
            onPress={() => setShowGuideModal(true)}
          >
            <Text style={styles.actionButtonText}>Material Guide</Text>
          </Pressable>
          <Pressable style={styles.actionCircle} onPress={photoUri ? recapture : takePhoto} disabled={isBusy}>
            <View style={styles.captureButtonOuter}>
              <View style={styles.captureButtonInner} />
            </View>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={pickImage} disabled={isBusy}>
            <Text style={styles.actionButtonText}>Gallery</Text>
          </Pressable>
        </View>
        <View style={styles.result}>
        {isBusy ? (
          <ActivityIndicator />
        ) : error ? (
          <>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <View style={styles.actionsRow}>
              <Pressable style={[styles.chip, styles.chipDark]} onPress={retryClassify} disabled={!lastBase64 || isBusy}>
                <Text style={styles.chipTextLight}>Retry</Text>
              </Pressable>
              <Pressable style={styles.chip} onPress={recapture} disabled={isBusy}>
                <Text style={styles.chipTextDark}>Recapture</Text>
              </Pressable>
            </View>
          </>
        ) : result ? (
          <>
            <Text style={styles.detectedText}>Detected: {result} - {confidence != null ? `${Math.round(confidence * 100)}%` : ''}</Text>
            <View style={styles.actionButtonsRow}>
              <Pressable
                style={styles.disposeButton}
                onPress={() => {
                  const guide = mapLabelToGuide(result ?? 'Other');
                  navigation.navigate('MaterialGuide', { materialKey: guide.key });
                }}
              >
                <Text style={styles.disposeButtonText}>Dispose</Text>
              </Pressable>
              <Pressable
                style={styles.upcyclingButton}
                onPress={() => {
                  const guide = mapLabelToGuide(result ?? 'Other');
                  console.log('🎨 Navigating to Library with material:', guide.key);
                  navigation.navigate('Library' as never, { material: guide.key } as never);
                }}
              >
                <Text style={styles.upcyclingButtonText}>Upcycling Ideas</Text>
              </Pressable>
            </View>
            {predictions && predictions.length > 1 ? (
              <View style={styles.altWrap}>
                <Text style={styles.altLabel}>Also detected:</Text>
                <View style={styles.altChips}>
                  {predictions.slice(1).map((d, idx) => (
                    <Pressable
                      key={`${d.label}-${idx}`}
                      style={styles.chip}
                      onPress={() => {
                        setResult(d.label);
                        setConfidence(d.confidence ?? null);
                        setBbox(d.bbox ?? null);
                      }}
                    >
                      <Text style={styles.chipTextDark}>{d.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <Text style={styles.hint}>Point camera at recyclable material</Text>
        )}
        </View>
      </View>

      {/* Guide Modal */}
      <Modal
        visible={showGuideModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGuideModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How to Use Recognition Camera</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>📸 Step 1: Position Your Item</Text>
                <Text style={styles.guideText}>
                  Place the recyclable item in the camera view. Make sure the item is well-lit and clearly visible.
                </Text>
              </View>

              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>🎯 Step 2: Capture</Text>
                <Text style={styles.guideText}>
                  Tap the blue circular button at the bottom center to take a photo. The AI will automatically analyze the material.
                </Text>
              </View>

              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>📚 Step 3: View Results</Text>
                <Text style={styles.guideText}>
                  Once detected, you'll see a purple box around the material with its name and confidence percentage. Tap "Dispose" for disposal tips or "Upcycling Ideas" for creative projects.
                </Text>
              </View>

              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>🖼️ Alternative: Use Gallery</Text>
                <Text style={styles.guideText}>
                  You can also select an existing photo from your gallery by tapping the "Gallery" button.
                </Text>
              </View>

              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>💡 Tips for Best Results</Text>
                <Text style={styles.guideText}>
                  • Ensure good lighting{'\n'}
                  • Keep the item centered{'\n'}
                  • Avoid cluttered backgrounds{'\n'}
                  • Use a single item at a time{'\n'}
                  • If recognition fails, try recapturing
                </Text>
              </View>
            </ScrollView>

            <Pressable
              style={styles.modalButton}
              onPress={() => setShowGuideModal(false)}
            >
              <Text style={styles.modalButtonText}>Got It!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'black' },
  container: { flex: 1, backgroundColor: 'black' },
  cameraContainer: { flex: 1, position: 'relative' },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  detectBox: { 
    position: 'absolute', 
    borderWidth: 3, 
    borderColor: '#8B5CF6', 
    borderRadius: 8,
  },
  detectLabel: {
    position: 'absolute',
    top: -32,
    left: 0,
    backgroundColor: '#8B5CF6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  detectLabelText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  previewContainer: { flex: 1, position: 'relative' },
  preview: { flex: 1 },
  bottomContainer: {
    backgroundColor: '#000',
  },
  footer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-evenly', 
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#000',
  },
  actionCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1d4ed8'
  },
  circleIcon: { fontSize: 28 },
  actionButton: { 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: { 
    fontWeight: '700', 
    color: 'white',
    fontSize: 13,
  },
  result: { 
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  detectedText: { 
    fontWeight: '700',
    color: 'white',
    fontSize: 15,
    marginBottom: 12,
  },
  disposeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disposeButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  upcyclingButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  upcyclingButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
    marginBottom: 12,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: { 
    color: '#FCA5A5',
    fontWeight: '600',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  hint: { 
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, backgroundColor: '#FFFFFF' },
  chipDark: { backgroundColor: '#8B5CF6' },
  chipTextLight: { color: 'white', fontWeight: '700', fontSize: 14 },
  chipTextDark: { color: '#000', fontWeight: '700', fontSize: 14 },
  altWrap: { marginTop: 12 },
  altLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 8 },
  altChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 400,
  },
  guideSection: {
    marginBottom: 20,
  },
  guideSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});


