import type { ClassificationResult } from '@/services/classifier';
import { getDetectionApiUrl } from '@/utils/network';

export async function classifyWithApi({ base64 }: { base64: string }): Promise<ClassificationResult> {
  // Get the appropriate API URL based on the environment
  const baseUrl = await getDetectionApiUrl();
  console.log('🔍 [API DEBUG] Using detection API URL:', baseUrl);
  
  if (!baseUrl) throw new Error('Missing EXPO_PUBLIC_DETECTION_API_URL - make sure your detection API URL is configured');
  
  const apiUrl = `${baseUrl.replace(/\/$/, '')}/v1/detect`;
  console.log('🔍 [API DEBUG] Full API endpoint:', apiUrl);
  console.log('🔍 [API DEBUG] Image data length:', base64.length);
  
  try {
    console.log('🔍 [API DEBUG] Making fetch request...');
    const startTime = Date.now();
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    console.log(`🔍 [API DEBUG] Response received in ${responseTime}ms, status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('🔍 [API DEBUG] API error response:', errorText);
      throw new Error(`API error: ${res.status} - ${errorText}`);
    }
    
    const json = (await res.json()) as {
      detections: { label: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } }[];
    };
    
    console.log('🔍 [API DEBUG] API response:', json);
    const detections = (json?.detections ?? []).sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
    
    // Check if we have any valid detections
    if (!detections || detections.length === 0) {
      console.log('🔍 [API DEBUG] No detections returned from API');
      throw new Error('No recyclable materials detected. Please try taking a clearer photo of items like cardboard boxes, plastic bottles, metal cans, newspapers, or wood.');
    }
    
    const best = detections[0];
    console.log('🔍 [API DEBUG] Processed result:', { best, detectionCount: detections.length });
    return { best, detections } as ClassificationResult;
    
  } catch (error: any) {
    console.error('🔍 [API DEBUG] Fetch error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      throw new Error(`Network connection failed. Please check if your device is connected to the same WiFi network as your computer (${baseUrl})`);
    } else if (error.name === 'TypeError' && error.message.includes('timeout')) {
      throw new Error(`Request timed out. The detection server may be overloaded or unreachable (${baseUrl})`);
    } else if (error.message?.includes('API error:')) {
      throw error; // Re-throw API errors as-is
    } else {
      throw new Error(`Connection failed: ${error.message}. Please ensure the detection server is running and accessible at ${baseUrl}`);
    }
  }
}


