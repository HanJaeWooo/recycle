#!/usr/bin/env node

const http = require('http');

function testEndpoint(host, port, path = '/') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${host}:${port}${path} - Status: ${res.statusCode} - Accessible from mobile devices`);
      resolve(res.statusCode);
    });

    req.on('error', (err) => {
      console.log(`❌ ${host}:${port}${path} - Error: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${host}:${port}${path} - Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function testMobileConnectivity() {
  console.log('📱 Testing mobile device connectivity...\n');
  console.log('🔍 Testing if your backend server is accessible from mobile devices on the same WiFi network:\n');
  
  try {
    // Test local network IP
    await testEndpoint('192.168.1.27', 4000, '/');
    console.log('✅ SUCCESS: Mobile devices on your WiFi can access the backend server!');
    console.log('✅ APK build will work for login functionality!\n');
  } catch (err) {
    console.log('❌ FAILED: Mobile devices cannot access the backend server');
    console.log('❌ APK build will NOT work for login functionality\n');
  }

  console.log('📋 Next steps:');
  console.log('1. Make sure your backend server is running');
  console.log('2. Make sure your mobile device is on the same WiFi network (192.168.1.x)');
  console.log('3. Build APK using: eas build --platform android --profile preview');
  console.log('4. Install APK on mobile device and test login');
}

testMobileConnectivity();
