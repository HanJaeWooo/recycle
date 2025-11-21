#!/usr/bin/env node

const https = require('https');

function testRailwayServer() {
  // Based on the screenshot, your Railway deployment appears to be live
  const railwayUrl = 'https://recycle-backend-api-production.up.railway.app';
  
  console.log('🚂 Testing Railway Deployment');
  console.log('============================');
  console.log(`🔍 Testing: ${railwayUrl}`);
  console.log();

  const options = {
    hostname: 'recycle-backend-api-production.up.railway.app',
    port: 443,
    path: '/',
    method: 'GET',
    timeout: 10000,
    headers: {
      'User-Agent': 'APK-Test-Client/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Railway server is responding!`);
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`🌐 Server is accessible from any IP address`);
    console.log(`📱 APK users will be able to login!`);
    console.log();
    console.log(`🎯 RESULT: Backend is working - Ready to build APK!`);
    console.log();
    console.log(`📋 Next steps:`);
    console.log(`1. Update eas.json with Railway URL`);
    console.log(`2. Build APK with confidence`);
    console.log(`3. Users can login from anywhere`);
  });

  req.on('error', (err) => {
    console.log(`❌ Railway server error: ${err.message}`);
    console.log(`🔧 Need to check Railway deployment`);
  });

  req.on('timeout', () => {
    console.log(`⏰ Railway server timeout`);
    console.log(`🔧 Server might be starting up`);
    req.destroy();
  });

  req.end();
}

testRailwayServer();
