export type BBox = { x: number; y: number; width: number; height: number }; // normalized 0..1
export type Detection = { label: string; confidence: number; bbox?: BBox };
export type ClassificationResult = {
  best: Detection;
  detections: Detection[];
};

export async function classifyImage({ base64 }: { base64: string }): Promise<ClassificationResult> {
  // Switchable backend: mock or Vision (controlled by settings store)
  try {
    const { useSettingsStore } = await import('@/store/useSettingsStore');
    const { backend } = useSettingsStore.getState();
    if (backend === 'vision') {
      const { classifyWithVision } = await import('./classifier.vision');
      const r = await classifyWithVision({ base64 });
      return r as ClassificationResult;
    } else if (backend === 'api') {
      const { classifyWithApi } = await import('./classifier.api');
      const r = await classifyWithApi({ base64 });
      return r;
    }
  } catch {}
  const simulated = await simulateClassifier(base64);
  return simulated;
}

async function simulateClassifier(_base64: string): Promise<ClassificationResult> {
  const detections = [
    { label: 'Wood', confidence: 0.95 },
    { label: 'Plastic Bottle', confidence: 0.92 },
    { label: 'Glass Jar', confidence: 0.87 },
    { label: 'Aluminum Can', confidence: 0.9 },
    { label: 'Cardboard', confidence: 0.85 },
    { label: 'Paper', confidence: 0.82 },
  ].map((d) => ({ ...d, bbox: { x: 0.25, y: 0.28, width: 0.5, height: 0.35 } }));
  await new Promise((r) => setTimeout(r, 500));
  const best = detections[Math.floor(Math.random() * detections.length)];
  return { best, detections };
}


