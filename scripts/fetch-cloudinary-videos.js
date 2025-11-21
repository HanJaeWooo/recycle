/**
 * Script to fetch all videos from Cloudinary and generate video mapping
 * 
 * Setup:
 * 1. npm install cloudinary dotenv
 * 2. Set environment variables in .env:
 *    CLOUDINARY_CLOUD_NAME=dahlpf7fr
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 * 3. Run: node scripts/fetch-cloudinary-videos.js
 */

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dahlpf7fr',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function fetchAllVideos() {
  try {
    console.log('🔍 Fetching videos from Cloudinary...\n');
    
    // Fetch all videos
    const result = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      max_results: 500, // Adjust if you have more videos
      prefix: '' // Add prefix if videos are in a specific folder
    });

    console.log(`✅ Found ${result.resources.length} videos\n`);
    console.log('📋 Video URLs:\n');
    
    // Generate mapping
    const videoMapping = {};
    
    result.resources.forEach((video, index) => {
      const url = video.secure_url;
      const publicId = video.public_id;
      const displayName = publicId.split('/').pop(); // Get filename from public_id
      
      console.log(`${index + 1}. ${displayName}`);
      console.log(`   URL: ${url}`);
      console.log(`   Public ID: ${publicId}\n`);
      
      videoMapping[displayName] = {
        url: url,
        publicId: publicId,
        format: video.format,
        duration: video.duration,
        width: video.width,
        height: video.height
      };
    });

    // Save mapping to file
    const fs = require('fs');
    const mappingPath = './scripts/cloudinary-video-mapping.json';
    fs.writeFileSync(mappingPath, JSON.stringify(videoMapping, null, 2));
    
    console.log(`\n✅ Video mapping saved to: ${mappingPath}`);
    console.log('\n📝 Next steps:');
    console.log('1. Review the cloudinary-video-mapping.json file');
    console.log('2. Run the update-video-mapping.js script to update your code');
    
  } catch (error) {
    console.error('❌ Error fetching videos:', error.message);
    console.error('Full error:', error);
    
    if (error.http_code === 401) {
      console.error('\n⚠️  Authentication failed. Please check your Cloudinary credentials in .env file:');
      console.error('   CLOUDINARY_CLOUD_NAME=dahlpf7fr');
      console.error('   CLOUDINARY_API_KEY=your_api_key');
      console.error('   CLOUDINARY_API_SECRET=your_api_secret');
    }
  }
}

// Run the script
fetchAllVideos();
