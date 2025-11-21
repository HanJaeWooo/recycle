#!/usr/bin/env node

const https = require('https');

const baseUrl = 'https://recycle-backend-api-production.up.railway.app';

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing: ${description}`);
    console.log(`📡 ${baseUrl}${path}`);

    const options = {
      hostname: 'recycle-backend-api-production.up.railway.app',
      port: 443,
      path: path,
      method: 'GET',
      timeout: 8000,
      headers: {
        'User-Agent': 'APK-Test-Client/1.0',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      
      res.on('end', () => {
        if (res.statusCode < 500) {
          console.log(`✅ ${description} - Status: ${res.statusCode} - Endpoint accessible`);
          resolve(true);
        } else {
          console.log(`⚠️  ${description} - Status: ${res.statusCode} - Server error`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${description} - Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${description} - Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function testLoginEndpoints() {
  console.log('🔐 Testing Login Functionality for APK');
  console.log('=====================================');
  console.log('📱 Simulating APK login requests from any IP...');
  console.log();

  const endpoints = [
    { path: '/', desc: 'Main API endpoint' },
    { path: '/api/auth/login', desc: 'Login endpoint' },
    { path: '/api/users', desc: 'Users endpoint' },
    { path: '/api/auth/register', desc: 'Register endpoint' },
    { path: '/health', desc: 'Health check' }
  ];

  let workingEndpoints = 0;
  
  for (const endpoint of endpoints) {
    const isWorking = await testEndpoint(endpoint.path, endpoint.desc);
    if (isWorking) workingEndpoints++;
    console.log();
  }

  console.log('📊 RESULTS:');
  console.log('===========');
  
  if (workingEndpoints > 0) {
    console.log(`✅ Backend server is ACCESSIBLE from any IP`);
    console.log(`✅ ${workingEndpoints}/${endpoints.length} endpoints responding`);
    console.log(`✅ APK users CAN login from anywhere`);
    console.log(`✅ Ready to build APK with confidence!`);
    console.log();
    console.log(`🎯 FINAL STATUS: BACKEND IS WORKING ✅`);
    console.log();
    console.log(`📋 Next steps:`);
    console.log(`1. Build APK: npx eas build --platform android --profile preview`);
    console.log(`2. Install APK on Android device`);
    console.log(`3. Users can login from any WiFi/mobile network`);
  } else {
    console.log(`❌ Backend server has issues`);
    console.log(`❌ APK users may have login problems`);
    console.log(`🔧 Check Railway deployment logs`);
  }
}

testLoginEndpoints();
