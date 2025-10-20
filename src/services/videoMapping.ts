// Platform-specific video mapping
// Metro bundler will automatically use:
// - videoMapping.native.ts for iOS/Android (with video files)
// - videoMapping.web.ts for web (without video files)
// - videoMapping.ts as fallback (default - no videos)

export interface LocalVideo {
  id: string;
  title: string;
  material: string;
  videoPath: any;
  thumbnailPath?: any;
}

// Default fallback - empty array
// Platform-specific implementations will override this
export const localVideos: LocalVideo[] = [];

export function getVideosForMaterial(material: string): LocalVideo[] {
  return [];
}

export function getRandomVideoForMaterial(material: string): LocalVideo | null {
  return null;
}

export function getVideoById(id: string): LocalVideo | null {
  return null;
}

export function getAvailableMaterials(): string[] {
  return [];
}
