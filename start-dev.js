#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

console.log('🚀 Starting development environment...');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') ||
            iface.address.startsWith('10.') ||
            iface.address.startsWith('172.')) {
          return iface.address;
        }
      }
    }
  }
  return '127.0.0.1';
}

// Update .env file with correct IP
const localIP = getLocalIP();
console.log(`🌐 Detected local IP: ${localIP}`);

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Detection server remains local, so keep the dynamic IP there
// Update the detection API URL
const detectionUrl = `http://${localIP}:8000`;
envContent = envContent.replace(
  /EXPO_PUBLIC_DETECTION_API_URL=http:\/\/[^:\s]+:8000/,
  `EXPO_PUBLIC_DETECTION_API_URL=${detectionUrl}`
);

// Update the video server URL (Metro bundler on port 8082)
const videoServerUrl = `http://${localIP}:8082`;
if (envContent.includes('EXPO_PUBLIC_VIDEO_SERVER_URL=')) {
  envContent = envContent.replace(
    /EXPO_PUBLIC_VIDEO_SERVER_URL=http:\/\/[^:\s]+:\d+/,
    `EXPO_PUBLIC_VIDEO_SERVER_URL=${videoServerUrl}`
  );
} else {
  envContent += `\nEXPO_PUBLIC_VIDEO_SERVER_URL=${videoServerUrl}`;
}

// Add video server port if not present
if (!envContent.includes('EXPO_PUBLIC_VIDEO_SERVER_PORT=')) {
  envContent += `\nEXPO_PUBLIC_VIDEO_SERVER_PORT=8082`;
}

fs.writeFileSync(envPath, envContent);
console.log(`📝 Updated .env with detection URL: ${detectionUrl}`);
console.log(`📝 Updated .env with video server URL: ${videoServerUrl}`);

// Start detection server
console.log('📡 Starting detection server...');
const detectionServerPath = path.join(__dirname, 'backend', 'detection_server.py');
const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';

const detectionServer = spawn(pythonCmd, [detectionServerPath], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe'
});

detectionServer.stdout.on('data', (data) => {
  console.log(`[DETECTION] ${data.toString().trim()}`);
});

detectionServer.stderr.on('data', (data) => {
  console.error(`[DETECTION ERROR] ${data.toString().trim()}`);
});

// Start backend API server
console.log('🔧 Starting backend API server...');
const backendServerPath = path.join(__dirname, 'backend', 'api', 'server.js');
const backendServer = spawn('node', [backendServerPath], {
  cwd: path.join(__dirname, 'backend', 'api'),
  stdio: 'pipe'
});

backendServer.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

backendServer.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
});

// Wait a bit for servers to start, then start Expo
setTimeout(() => {
  console.log('📱 Starting Expo development server on port 8082...');
  const expo = spawn('npx', ['expo', 'start', '--port', '8082', '--offline'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, EXPO_OFFLINE: '1' }
  });

  expo.on('close', (code) => {
    console.log(`Expo exited with code ${code}`);
    detectionServer.kill();
    backendServer.kill();
    process.exit(code);
  });
}, 3000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  detectionServer.kill();
  backendServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development environment...');
  detectionServer.kill();
  backendServer.kill();
  process.exit(0);
});