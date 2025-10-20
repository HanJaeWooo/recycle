// This file is only used on native platforms (iOS/Android)
// Videos are served from Metro bundler as HTTP URLs instead of being bundled
import { getVideoServerUrl } from '@/config/env';

export interface LocalVideo {
  id: string;
  title: string;
  material: string;
  videoPath: string;
  thumbnailPath?: string;
}

// Get the video server base URL
const getVideoUrl = (path: string) => `${getVideoServerUrl()}${path}`;

// Map of all local videos organized by material
// Videos are served from Metro bundler's static file server
export const localVideos: LocalVideo[] = [
  // Bottle Caps
  {
    id: 'bottle-caps-1',
    title: 'Cellphone Stand made from Bottle Caps',
    material: 'Bottle caps',
    videoPath: getVideoUrl('/videos/BOTTLE CAPS/_Cellphone Stand made from Bottle Caps_.mp4'),
    thumbnailPath: getVideoUrl('/videos/BOTTLE CAPS/Cellphone Stand.jpeg'),
  },
  {
    id: 'bottle-caps-2',
    title: 'Coaster made from Bottle Caps',
    material: 'Bottle caps',
    videoPath: getVideoUrl('/videos/BOTTLE CAPS/_Coaster made from Bottle Caps_.mp4'),
    thumbnailPath: getVideoUrl('/videos/BOTTLE CAPS/Coaster.jpeg'),
  },
  // Cardboard
  {
    id: 'cardboard-1',
    title: 'Cat Scratcher made from Cardboard',
    material: 'Cardboard',
    videoPath: getVideoUrl('/videos/Cardboard Boxes/_Cat Scratcher made from Cardboard_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Cardboard Boxes/_Cat Scratcher made from Cardboard Thumbnail_.jpg'),
  },
  {
    id: 'cardboard-2',
    title: 'Clothes Folder made from Cardboard',
    material: 'Cardboard',
    videoPath: getVideoUrl('/videos/Cardboard Boxes/_Clothes Folder made from Cardboard_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Cardboard Boxes/_Clothes Folder made from Cardboard Thumbnail_.jpg'),
  },
  // Chiffon
  {
    id: 'chiffon-1',
    title: 'Ribbon Hair Tie made from Chiffon',
    material: 'Chiffon',
    videoPath: getVideoUrl('/videos/Chiffon/_Ribbon Hair Tie made from Chiffon_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Chiffon/_Ribbong Hair Tie made from Chiffon_.jpeg'),
  },
  {
    id: 'chiffon-2',
    title: 'Wallet made from Chiffon',
    material: 'Chiffon',
    videoPath: getVideoUrl('/videos/Chiffon/_Wallet made from Chiffon_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Chiffon/_Wallet made from Chiffon_.jpg'),
  },
  // Copper
  {
    id: 'copper-1',
    title: 'Rings made from Copper coil',
    material: 'Coppers',
    videoPath: getVideoUrl('/videos/Copper/_Rings made from Copper coil_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Copper/_Rings made from Copper_.jpg'),
  },
  {
    id: 'copper-2',
    title: 'Tree made from Copper',
    material: 'Coppers',
    videoPath: getVideoUrl('/videos/Copper/_Tree made from Copper_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Copper/_Tree made from Copper_.jpg'),
  },
  // Corduroy
  {
    id: 'corduroy-1',
    title: 'Bookmark made from Corduroy',
    material: 'Corduroy',
    videoPath: getVideoUrl('/videos/Corduroy/_Bookmark made from Corduroy_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Corduroy/_Bookmark made from Corduroy_.jpg'),
  },
  {
    id: 'corduroy-2',
    title: 'Square bookmark made from Corduroy',
    material: 'Corduroy',
    videoPath: getVideoUrl('/videos/Corduroy/_Square bookmark made from Corduroy_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Corduroy/_Square bookmark made from Corduroy_.jpg'),
  },
  // Cotton
  {
    id: 'cotton-1',
    title: 'Eye Glass pouch made from Cotton',
    material: 'Cotton',
    videoPath: getVideoUrl('/videos/Cotton/_Eye Glass pouch made from Cotton_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Cotton/_Eye Glass pouch made from Cotton_.jpg'),
  },
  {
    id: 'cotton-2',
    title: 'Scissor Pouch made from Cotton',
    material: 'Cotton',
    videoPath: getVideoUrl('/videos/Cotton/_Scissor Pouch made from Cotton_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Cotton/_Scissor Pouch made from Cotton_.jpg'),
  },
  // Hanger
  {
    id: 'hanger-1',
    title: 'Book Holder made from Hanger',
    material: 'Hangers',
    videoPath: getVideoUrl('/videos/HANGER/_Book Holder made from Hanger_.mp4'),
    thumbnailPath: getVideoUrl('/videos/HANGER/Book Holder.jpeg'),
  },
  {
    id: 'hanger-2',
    title: 'Shoe Organizer made from Hanger',
    material: 'Hangers',
    videoPath: getVideoUrl('/videos/HANGER/_Shoe Organizer made from Hanger_.mp4'),
    thumbnailPath: getVideoUrl('/videos/HANGER/Shoe Organizer.jpeg'),
  },
  // Metal Can
  {
    id: 'metal-can-1',
    title: 'Candle Holder made from Metal Can',
    material: 'Metal cans',
    videoPath: getVideoUrl('/videos/Metal Can/_Candle Holder made from Metal Can_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Metal Can/_Candle Holder made from Metal Can_.jpg'),
  },
  {
    id: 'metal-can-2',
    title: 'Mini stove made from Metal Can',
    material: 'Metal cans',
    videoPath: getVideoUrl('/videos/Metal Can/_Mini stove made from Metal Can_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Metal Can/_Mini stove made from Metal Can_.jpg'),
  },
  // Plastic Bottles
  {
    id: 'plastic-bottle-1',
    title: 'Flower made from Plastic Bottle',
    material: 'Plastic bottle',
    videoPath: getVideoUrl('/videos/Plastic Bottles/_Flower made from Plastic Bottle_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Plastic Bottles/_Flower made from Plastic Bottle_.jpg'),
  },
  {
    id: 'plastic-bottle-2',
    title: 'PAROL made from Plastic Bottle',
    material: 'Plastic bottle',
    videoPath: getVideoUrl('/videos/Plastic Bottles/_PAROL made from Plastic Bottle_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Plastic Bottles/_PAROL made with Plastic Bottle_.jpg'),
  },
  // Plastic Cups
  {
    id: 'plastic-cup-1',
    title: 'Mini Basket made from Plastic Cup',
    material: 'Cups',
    videoPath: getVideoUrl('/videos/Plastic Cups/_Mini Basket made from Plastic Cup_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Plastic Cups/_Mini Basket made from Plastic Cup_.jpg'),
  },
  {
    id: 'plastic-cup-2',
    title: 'Mini dustbin made from Plastic Cup',
    material: 'Cups',
    videoPath: getVideoUrl('/videos/Plastic Cups/_Mini dustbin made from Plastic Cup_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Plastic Cups/_Mini dustbin made from Plastic Cup_.jpg'),
  },
  // Utensils
  {
    id: 'utensils-1',
    title: 'Flower Vase made from Utensils',
    material: 'Utensils',
    videoPath: getVideoUrl('/videos/Utensils/_Flower Vase made from Utensils_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Utensils/Flower Vase.jpg'),
  },
  {
    id: 'utensils-2',
    title: 'Wall Decor made from Utensils',
    material: 'Utensils',
    videoPath: getVideoUrl('/videos/Utensils/_Wall Decor made from Utensils_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Utensils/Wall Decor.jpg'),
  },
  // Wood
  {
    id: 'wood-1',
    title: 'Book Shelf made from Wood',
    material: 'Woods',
    videoPath: getVideoUrl('/videos/Wood/_Book Shelf made from Wood_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Wood/Book Shelf.jpg'),
  },
  {
    id: 'wood-2',
    title: 'Wall Mounted Organizer made from Wood',
    material: 'Woods',
    videoPath: getVideoUrl('/videos/Wood/_Wall Mounted Organizer made from Wood_.mp4'),
    thumbnailPath: getVideoUrl('/videos/Wood/Wall-Mounted Organizer.jpg'),
  },
  // Denim
  {
    id: 'denim-1',
    title: 'Pocket purses made from Denim',
    material: 'Denim',
    videoPath: getVideoUrl('/videos/denim/Pocket purses.mp4'),
    thumbnailPath: getVideoUrl('/videos/denim/Pocket purses.jpg'),
  },
  {
    id: 'denim-2',
    title: 'Pot holder made from Denim',
    material: 'Denim',
    videoPath: getVideoUrl('/videos/denim/Pot holder.mp4'),
    thumbnailPath: getVideoUrl('/videos/denim/Pot holder.jpg'),
  },
];

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
