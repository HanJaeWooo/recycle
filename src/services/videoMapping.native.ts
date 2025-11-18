// This file is only used on native platforms (iOS/Android)
// Videos are streamed directly from Cloudinary CDN
import { cloudVideos, CloudVideo } from './videoData';

export interface LocalVideo extends CloudVideo {}

export const localVideos: LocalVideo[] = cloudVideos;

export function getVideosForMaterial(material: string): LocalVideo[] {
  const searchMaterial = material.toLowerCase();
  return localVideos.filter(video => 
    video.material.toLowerCase().includes(searchMaterial) ||
    searchMaterial.includes(video.material.toLowerCase())
  );
}

export function getRandomVideoForMaterial(material: string): LocalVideo | null {
  const videos = getVideosForMaterial(material);
  if (videos.length === 0) return null;
  return videos[Math.floor(Math.random() * videos.length)];
}

export function getVideoById(id: string): LocalVideo | undefined {
  return localVideos.find(video => video.id === id);
}

export function getAvailableMaterials(): string[] {
  return Array.from(new Set(localVideos.map(video => video.material)));
}
