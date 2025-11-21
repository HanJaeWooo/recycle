/**
 * Simple script to generate video mapping with Cloudinary URLs
 * 
 * Instructions:
 * 1. Replace the VIDEO_BASE_URL with your Cloudinary base URL format
 * 2. Update the public IDs for each video
 * 3. Run: node scripts/generate-video-mapping-simple.js
 */

const fs = require('fs');
const path = require('path');

// Your Cloudinary base URL (update the version and folder structure as needed)
const CLOUDINARY_BASE = 'https://res.cloudinary.com/dahlpf7fr/video/upload/';

// Helper function to generate full URL
function getVideoUrl(publicId) {
  return `${CLOUDINARY_BASE}${publicId}`;
}

// Video mapping with actual Cloudinary URLs
const videoMappings = [
  // Bottle Caps
  {
    id: 'bottle-caps-1',
    title: 'Cellphone Stand made from Bottle Caps',
    material: 'Bottle caps',
    cloudinaryPublicId: 'v1762350337/_Cellphone_Stand_made_from_Bottle_Caps__uzvpf3.mp4',
  },
  {
    id: 'bottle-caps-2',
    title: 'Coaster made from Bottle Caps',
    material: 'Bottle caps',
    cloudinaryPublicId: 'v1762350337/_Cellphone_Stand_made_from_Bottle_Caps__uzvpf3.mp4', // MISSING - Using duplicate
  },
  // Cardboard
  {
    id: 'cardboard-1',
    title: 'Cat Scratcher made from Cardboard',
    material: 'Cardboard',
    cloudinaryPublicId: 'v1762350255/_Cat_Scratcher_made_from_Cardboard__fwjpnz.mp4',
  },
  {
    id: 'cardboard-2',
    title: 'Clothes Folder made from Cardboard',
    material: 'Cardboard',
    cloudinaryPublicId: 'v1762350322/_Clothes_Folder_made_from_Cardboard__kqp8gc.mp4',
  },
  // Chiffon
  {
    id: 'chiffon-1',
    title: 'Ribbon Hair Tie made from Chiffon',
    material: 'Chiffon',
    cloudinaryPublicId: 'v1762350314/_Ribbon_Hair_Tie_made_from_Chiffon__furosb.mp4',
  },
  {
    id: 'chiffon-2',
    title: 'Wallet made from Chiffon',
    material: 'Chiffon',
    cloudinaryPublicId: 'v1762350320/_Wallet_made_from_Chiffon__mrunhh.mp4',
  },
  // Copper
  {
    id: 'copper-1',
    title: 'Rings made from Copper coil',
    material: 'Coppers',
    cloudinaryPublicId: 'v1762350340/_Rings_made_from_Copper_coil__dmuuuh.mp4',
  },
  {
    id: 'copper-2',
    title: 'Tree made from Copper',
    material: 'Coppers',
    cloudinaryPublicId: 'v1762350340/_Rings_made_from_Copper_coil__dmuuuh.mp4', // MISSING - Using duplicate
  },
  // Corduroy
  {
    id: 'corduroy-1',
    title: 'Bookmark made from Corduroy',
    material: 'Corduroy',
    cloudinaryPublicId: 'v1762350336/_Bookmark_made_from_Corduroy__xbdqu4.mp4',
  },
  {
    id: 'corduroy-2',
    title: 'Square bookmark made from Corduroy',
    material: 'Corduroy',
    cloudinaryPublicId: 'v1762350292/_Square_bookmark_made_from_Corduroy__iugrnx.mp4',
  },
  // Cotton
  {
    id: 'cotton-1',
    title: 'Eye Glass pouch made from Cotton',
    material: 'Cotton',
    cloudinaryPublicId: 'v1762350343/_Eye_Glass_pouch_made_from_Cotton__eousta.mp4',
  },
  {
    id: 'cotton-2',
    title: 'Scissor Pouch made from Cotton',
    material: 'Cotton',
    cloudinaryPublicId: 'v1762350276/_Scissor_Pouch_made_from_Cotton__roobj1.mp4',
  },
  // Hangers
  {
    id: 'hanger-1',
    title: 'Book Holder made from Hanger',
    material: 'Hangers',
    cloudinaryPublicId: 'v1762350278/_Book_Holder_made_from_Hanger__qdxvli.mp4',
  },
  {
    id: 'hanger-2',
    title: 'Shoe Organizer made from Hanger',
    material: 'Hangers',
    cloudinaryPublicId: 'v1762350344/_Shoe_Organizer_made_from_Hanger__c967da.mp4',
  },
  // Metal Cans
  {
    id: 'metal-can-1',
    title: 'Candle Holder made from Metal Can',
    material: 'Metal cans',
    cloudinaryPublicId: 'v1762350365/_Candle_Holder_made_from_Metal_Can__gw1jln.mp4',
  },
  {
    id: 'metal-can-2',
    title: 'Mini stove made from Metal Can',
    material: 'Metal cans',
    cloudinaryPublicId: 'v1762350330/_Mini_stove_made_from_Metal_Can__xgtwxi.mp4',
  },
  // Plastic Bottles
  {
    id: 'plastic-bottle-1',
    title: 'Flower made from Plastic Bottle',
    material: 'Plastic bottle',
    cloudinaryPublicId: 'v1762350327/_Flower_made_from_Plastic_Bottle__k7spz8.mp4',
  },
  {
    id: 'plastic-bottle-2',
    title: 'PAROL made from Plastic Bottle',
    material: 'Plastic bottle',
    cloudinaryPublicId: 'v1762350327/_Flower_made_from_Plastic_Bottle__k7spz8.mp4', // MISSING - Using duplicate
  },
  // Plastic Cups
  {
    id: 'plastic-cup-1',
    title: 'Mini Basket made from Plastic Cup',
    material: 'Cups',
    cloudinaryPublicId: 'v1762350349/_Mini_Basket_made_from_Plastic_Cup__n4umdl.mp4',
  },
  {
    id: 'plastic-cup-2',
    title: 'Mini dustbin made from Plastic Cup',
    material: 'Cups',
    cloudinaryPublicId: 'v1762350322/_Mini_dustbin_made_from_Plastic_Cup__mzlgfk.mp4',
  },
  // Utensils
  {
    id: 'utensils-1',
    title: 'Flower Vase made from Utensils',
    material: 'Utensils',
    cloudinaryPublicId: 'v1762350333/_Flower_Vase_made_from_Utensils__o2mr8o.mp4',
  },
  {
    id: 'utensils-2',
    title: 'Wall Decor made from Utensils',
    material: 'Utensils',
    cloudinaryPublicId: 'v1762350355/_Wall_Decor_made_from_Utensils__sfgstq.mp4',
  },
  // Wood
  {
    id: 'wood-1',
    title: 'Book Shelf made from Wood',
    material: 'Woods',
    cloudinaryPublicId: 'v1762350312/_Book_Shelf_made_from_Wood__g1qmp7.mp4',
  },
  {
    id: 'wood-2',
    title: 'Wall Mounted Organizer made from Wood',
    material: 'Woods',
    cloudinaryPublicId: 'v1762350302/_Wall_Mounted_Organizer_made_from_Wood__hfnibp.mp4',
  },
  // Denim
  {
    id: 'denim-1',
    title: 'Pocket purses made from Denim',
    material: 'Denim',
    cloudinaryPublicId: 'v1762350287/Pocket_purses_gkgpxs.mp4',
  },
  {
    id: 'denim-2',
    title: 'Pot holder made from Denim',
    material: 'Denim',
    cloudinaryPublicId: 'v1762350347/Pot_holder_tbrh5j.mp4',
  },
];

// Generate the video array with full URLs
const videoArray = videoMappings.map(video => ({
  id: video.id,
  title: video.title,
  material: video.material,
  videoPath: getVideoUrl(video.cloudinaryPublicId),
  thumbnailPath: undefined
}));

// Generate the TypeScript code for videoMapping.native.ts
const nativeCode = `// This file is only used on native platforms (iOS/Android)
// Videos are served from Cloudinary CDN
export interface LocalVideo {
  id: string;
  title: string;
  material: string;
  videoPath: string;
  thumbnailPath?: string;
}

// All videos served from Cloudinary
export const localVideos: LocalVideo[] = ${JSON.stringify(videoArray, null, 2)};

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
`;

// Generate the TypeScript code for videoMapping.web.ts
const webCode = `// This file is only used on web platform
// Videos are served from Cloudinary CDN
export interface LocalVideo {
  id: string;
  title: string;
  material: string;
  videoPath: any; // For web, this will be a URL string
  thumbnailPath?: any;
}

// All videos served from Cloudinary
export const localVideos: LocalVideo[] = ${JSON.stringify(videoArray, null, 2)};

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
`;

// Write the updated files
const nativePath = path.join(__dirname, '..', 'src', 'services', 'videoMapping.native.ts');
const webPath = path.join(__dirname, '..', 'src', 'services', 'videoMapping.web.ts');

try {
  console.log('🔄 Generating video mapping files with Cloudinary URLs...\n');
  
  fs.writeFileSync(nativePath, nativeCode);
  console.log('✅ Updated: src/services/videoMapping.native.ts');
  
  fs.writeFileSync(webPath, webCode);
  console.log('✅ Updated: src/services/videoMapping.web.ts');
  
  console.log('\n📋 Generated URLs (sample):');
  console.log('  ', videoArray[0].videoPath);
  console.log('  ', videoArray[14].videoPath, '(your example)');
  
  console.log('\n⚠️  IMPORTANT: Update the cloudinaryPublicId values in this script with your actual Cloudinary public IDs!');
  console.log('\n📝 Next steps:');
  console.log('1. Open this script: scripts/generate-video-mapping-simple.js');
  console.log('2. Go to your Cloudinary Media Library and get the public ID for each video');
  console.log('3. Update each cloudinaryPublicId in the videoMappings array');
  console.log('4. Run this script again: node scripts/generate-video-mapping-simple.js');
  console.log('5. Test the app to make sure videos load from Cloudinary');
  console.log('6. Once confirmed working, delete the public/videos folder');
  
} catch (error) {
  console.error('❌ Error writing files:', error.message);
  process.exit(1);
}
