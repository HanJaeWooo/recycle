import { useSettingsStore } from '@/store/useSettingsStore';
import { classifyWithVision } from './classifier.vision';
import { classifyWithApi } from './classifier.api';

export type BBox = { x: number; y: number; width: number; height: number }; // normalized 0..1
export type Detection = { label: string; confidence: number; bbox?: BBox };
export type ClassificationResult = {
  best: Detection;
  detections: Detection[];
};

export async function classifyImage({ base64 }: { base64: string }): Promise<ClassificationResult> {
  console.log('🔍 [CLASSIFIER DEBUG] Starting classification...');
  console.log('🔍 [CLASSIFIER DEBUG] Module resolution test - checking imports...');
  
  try {
    console.log('🔍 [CLASSIFIER DEBUG] Getting settings state...');
    const settingsState = useSettingsStore.getState();
    console.log('🔍 [CLASSIFIER DEBUG] Settings state:', settingsState);
    
    const { backend } = settingsState;
    console.log('🔍 [CLASSIFIER DEBUG] Backend setting:', backend);
    
    if (backend === 'vision') {
      console.log('🔍 [CLASSIFIER DEBUG] Using Vision API backend');
      const r = await classifyWithVision({ base64 });
      console.log('🔍 [CLASSIFIER DEBUG] Vision API result:', r);
      return r as ClassificationResult;
    } else if (backend === 'api') {
      console.log('🔍 [CLASSIFIER DEBUG] Using API backend');
      const r = await classifyWithApi({ base64 });
      console.log('🔍 [CLASSIFIER DEBUG] API result:', r);
      return r;
    } else if (backend === 'mock') {
      console.log('🔍 [CLASSIFIER DEBUG] Using mock backend (simulator)');
      const simulated = await simulateClassifier(base64);
      console.log('🔍 [CLASSIFIER DEBUG] Simulator result:', simulated);
      return simulated;
    }
    
    // No valid backend configured - throw error instead of falling back to simulator
    throw new Error('No detection backend configured. Please check your settings or contact support.');
  } catch (error: any) {
    console.error('🔍 [CLASSIFIER DEBUG] Classification error:', error);
    
    // Don't fall back to simulator - throw the actual error
    if (error.message?.includes('API error: 404')) {
      throw new Error('Detection service is not available. Please try again later or contact support.');
    } else if (error.message?.includes('Missing EXPO_PUBLIC_DETECTION_API_URL')) {
      throw new Error('Detection service is not configured. Please contact support.');
    } else if (error.message?.includes('No detection backend configured')) {
      throw error; // Re-throw our custom error
    } else {
      throw new Error('No recyclable materials detected. Please try taking a clearer photo of items like cardboard boxes, plastic bottles, metal cans, newspapers, or wood.');
    }
  }
}

async function simulateClassifier(_base64: string): Promise<ClassificationResult> {
  // SIMULATOR DISABLED - This function should only be used in explicit mock mode
  console.warn('🚨 [CLASSIFIER DEBUG] Simulator called - this should only happen in mock mode');
  
  // More realistic simulation - detect common recyclable materials
  const commonMaterials = [
    { label: 'Plastic Bottle', confidence: 0.85 },
    { label: 'Glass Jar', confidence: 0.78 },
    { label: 'Aluminum Can', confidence: 0.82 },
    { label: 'Cardboard', confidence: 0.75 },
    { label: 'Paper', confidence: 0.72 },
  ];
  
  // Simulate processing time
  await new Promise((r) => setTimeout(r, 800));
  
  const best = commonMaterials[0];
  const detections = commonMaterials.map((d) => ({
    ...d,
    bbox: { x: 0.25, y: 0.28, width: 0.5, height: 0.35 }
  }));
  
  return { best, detections };
}


