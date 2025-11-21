/**
 * Script to update videoMapping files with Cloudinary URLs
 * 
 * Instructions:
 * 1. Fill in all Cloudinary URLs in cloudinary-video-mapping-template.json
 * 2. Run: node scripts/update-video-mapping.js
 */

const fs = require('fs');
const path = require('path');

// Read the mapping file
const mappingPath = path.join(__dirname, 'cloudinary-video-mapping-template.json');

if (!fs.existsSync(mappingPath)) {
  console.error('❌ cloudinary-video-mapping-template.json not found!');
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Check if all URLs are filled
const videos = mapping.videos;
let missingUrls = [];

Object.keys(videos).forEach(key => {
  if (!videos[key].cloudinaryUrl || videos[key].cloudinaryUrl.trim() === '') {
    missingUrls.push(key);
  }
});

if (missingUrls.length > 0) {
  console.error('❌ Missing Cloudinary URLs for the following videos:');
  missingUrls.forEach(key => {
    console.error(`   - ${key}: ${videos[key].title}`);
  });
  console.error('\n⚠️  Please fill in all Cloudinary URLs in cloudinary-video-mapping-template.json');
  process.exit(1);
}

console.log('✅ All Cloudinary URLs are present!\n');

// Generate the videoMapping array
const videoArray = Object.keys(videos).map(key => {
  const video = videos[key];
  return {
    id: key,
    title: video.title,
    material: video.material,
    videoPath: video.cloudinaryUrl,
    thumbnailPath: video.thumbnailUrl || undefined
  };
});

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
export const localVideos: LocalVideo[] = ${JSON.stringify(videoArray, null, 2).replace(/"([^"]+)":/g, '$1:')};

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
export const localVideos: LocalVideo[] = ${JSON.stringify(videoArray, null, 2).replace(/"([^"]+)":/g, '$1:')};

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
  fs.writeFileSync(nativePath, nativeCode);
  console.log('✅ Updated: src/services/videoMapping.native.ts');
  
  fs.writeFileSync(webPath, webCode);
  console.log('✅ Updated: src/services/videoMapping.web.ts');
  
  console.log('\n🎉 Video mapping files updated successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Test the app to make sure videos load from Cloudinary');
  console.log('2. Once confirmed working, delete the public/videos folder');
  console.log('3. Rebuild your APK - it should be much smaller now!');
  
} catch (error) {
  console.error('❌ Error writing files:', error.message);
  process.exit(1);
}
