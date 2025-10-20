// Custom YOLO Detection API integration
// Uses your trained YOLO model for real-time object detection

export type VisionResponse = {
  best: { label: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } };
  detections: { label: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } }[];
};

export async function classifyWithVision({ base64 }: { base64: string }): Promise<VisionResponse> {
  // Now uses your custom YOLO detection server instead of Google Vision
  const baseUrl = process.env.EXPO_PUBLIC_DETECTION_API_URL || process.env.EXPO_PUBLIC_API_BASE;
  if (!baseUrl) throw new Error('Missing EXPO_PUBLIC_DETECTION_API_URL - make sure your detection API URL is configured');
  
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 }),
  });

  if (!res.ok) {
    throw new Error(`YOLO Detection API error: ${res.status}`);
  }
  const json = (await res.json()) as {
    detections: { label: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } }[];
  };
  
  // Parse YOLO detection results
  const detections = (json?.detections ?? []).map(detection => ({
    label: detection.label,
    confidence: detection.confidence,
    bbox: detection.bbox
  }));
  
  const best = detections[0] ?? { label: 'Unknown', confidence: 0 };
  return { best, detections };
}

// Helper functions removed - no longer needed for YOLO API


