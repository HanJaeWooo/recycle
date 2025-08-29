import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image, ImageBackground, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { classifyImage, type Detection } from '@/services/classifier';
import { useHistoryStore } from '@/store/useHistoryStore';
import { mapLabelToGuide } from '@/services/materials';
import { useNavigation } from '@react-navigation/native';
import { images } from '@/assets/images';
import { saveScanHistory } from '@/services/materials';
import { useAuthStore } from '@/store/useAuthStore';

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
  const cameraRef = useRef<CameraView | null>(null);
  const addHistory = useHistoryStore((s) => s.addItem);
  const navigation = useNavigation<any>();
  const CONFIDENCE_THRESHOLD = 0.95;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const applyPrediction = async (prediction: { best?: Detection; detections?: Detection[] }, currentUri: string | null) => {
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
    
    // Add to local history
    addHistory({ label: best.label, uri: currentUri });
    
    // Save to backend scan history
    if (lastBase64) {
      try {
        const sessionToken = useAuthStore.getState().sessionToken;
        const userId = useAuthStore.getState().userId;

        console.log('[CaptureScreen] Scan History Save Context:', {
          sessionTokenAvailable: !!sessionToken,
          userIdAvailable: !!userId,
          imageUrlAvailable: !!currentUri,
          lastBase64Available: !!lastBase64,
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
      await applyPrediction(prediction, currentUri);
    } catch (e) {
      setError('Failed to recognize. Please retry or recapture.');
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
      const base64 = await FileSystem.readAsStringAsync(photo.uri, { encoding: FileSystem.EncodingType.Base64 });
      setLastBase64(base64);
      await classifyAndApply(base64, photo.uri);
    } catch (e) {
      setError('Failed to capture. Please try again.');
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
    <View style={styles.container}>
      {!photoUri ? (
        <CameraView style={styles.camera} ref={(ref) => { cameraRef.current = ref; }}>
          <View style={styles.targetWrap}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <View style={styles.topRight} />
          {result ? (
            <>
              <View style={styles.label}><Text style={styles.labelText}>{result}{confidence != null ? ` (${Math.round(confidence * 100)}%)` : ''}</Text></View>
              {bbox ? (
                <View style={[styles.detectBox, { left: `${bbox.x * 100}%`, top: `${bbox.y * 100}%`, width: `${bbox.width * 100}%`, height: `${bbox.height * 100}%` }]} />
              ) : null}
            </>
          ) : null}
        </CameraView>
      ) : (
        <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
      )}
      <View style={styles.footer}>
        <Pressable
          style={styles.actionSmall}
          onPress={() => {
            const guide = mapLabelToGuide(result ?? 'Other');
            navigation.navigate('MaterialGuide', { materialKey: guide.key });
          }}
          disabled={!result}
        >
          <Text style={styles.smallText}>Material Guide</Text>
        </Pressable>
        <Pressable style={styles.actionCircle} onPress={photoUri ? recapture : takePhoto} disabled={isBusy}>
          <Image source={images.appLogo.camButton} style={{ width: 72, height: 72 }} />
        </Pressable>
        <Pressable style={styles.actionSmall} onPress={pickImage} disabled={isBusy}><Text style={styles.smallText}>Gallery</Text></Pressable>
      </View>
      <View style={styles.result}>
        {isBusy ? (
          <ActivityIndicator />
        ) : error ? (
          <>
            <Text style={styles.errorText}>{error}</Text>
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
            <Text style={styles.resultText}>Detected: {result}{confidence != null ? `  •  ${Math.round(confidence * 100)}%` : ''}</Text>
            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.chip, styles.chipDark]}
                onPress={() => {
                  const guide = mapLabelToGuide(result ?? 'Other');
                  navigation.navigate('MaterialGuide', { materialKey: guide.key });
                }}
              >
                <Text style={styles.chipTextLight}>Disposal Tips</Text>
              </Pressable>
              <Pressable
                style={styles.chip}
                onPress={() => {
                  // Navigate to idea list filtered by detected material
                  navigation.navigate('Library', { material: mapLabelToGuide(result ?? 'Other').category });
                }}
              >
                <Text style={styles.chipTextDark}>Upcycling Ideas</Text>
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
          <Text style={styles.hint}>Take a photo or pick from gallery</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  targetWrap: { position: 'absolute', top: '20%', left: '10%', right: '10%', bottom: '25%' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: 'white' },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  topRight: { position: 'absolute', top: 20, right: 20, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.3)' },
  label: { position: 'absolute', top: '35%', left: '20%', backgroundColor: '#6d28d9', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  labelText: { color: 'white', fontWeight: '800' },
  detectBox: { position: 'absolute', borderWidth: 3, borderColor: '#6d28d9', borderRadius: 4 },
  preview: { flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(0,0,0,0.4)' },
  actionCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  circleIcon: { fontSize: 28 },
  actionSmall: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  smallText: { fontWeight: '700' },
  result: { padding: 12, backgroundColor: 'white' },
  resultText: { fontWeight: '700' },
  errorText: { color: '#DC2626', fontWeight: '700' },
  hint: { color: '#6b7280' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#E5E7EB' },
  chipDark: { backgroundColor: '#111827' },
  chipTextLight: { color: 'white', fontWeight: '700' },
  chipTextDark: { color: '#111827', fontWeight: '700' },
  altWrap: { marginTop: 8 },
  altLabel: { color: '#6b7280', marginBottom: 6 },
  altChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});


