import type { ClassificationResult } from '@/services/classifier';

export async function classifyWithApi({ base64 }: { base64: string }): Promise<ClassificationResult> {
  // Use detection API URL from config
  const baseUrl = process.env.EXPO_PUBLIC_DETECTION_API_URL || process.env.EXPO_PUBLIC_API_BASE;
  if (!baseUrl) throw new Error('Missing EXPO_PUBLIC_DETECTION_API_URL - make sure your detection API URL is configured');
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const json = (await res.json()) as {
    detections: { label: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } }[];
  };
  const detections = (json?.detections ?? []).sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  const best = detections[0] ?? { label: 'Unknown', confidence: 0 };
  return { best, detections } as ClassificationResult;
}


