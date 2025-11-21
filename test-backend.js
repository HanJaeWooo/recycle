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
      console.log(`✅ ${host}:${port}${path} - Status: ${res.statusCode}`);
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

async function testBackend() {
  console.log('🧪 Testing backend connectivity...\n');
  
  try {
    // Test API server
    await testEndpoint('localhost', 4000, '/');
    await testEndpoint('localhost', 4000, '/api/test');
  } catch (err) {
    console.log('Backend API server is not running or not accessible');
  }

  try {
    // Test detection server
    await testEndpoint('localhost', 8000, '/');
  } catch (err) {
    console.log('Detection server is not running or not accessible');
  }

  console.log('\n🏁 Test completed');
}

testBackend();
