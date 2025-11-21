#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🚀 Starting backend servers only...');

// Start backend API server
console.log('🔧 Starting backend API server on port 4000...');
const backendServerPath = path.join(__dirname, 'backend', 'api', 'server.js');
const backendServer = spawn('node', [backendServerPath], {
  cwd: path.join(__dirname, 'backend', 'api'),
  stdio: 'inherit'
});

backendServer.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  backendServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down backend server...');
  backendServer.kill();
  process.exit(0);
});
