const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Minimal configuration to fix import.meta issues
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

// Simple asset extensions
config.resolver.assetExts.push('mp4', 'mov', 'avi', 'mkv', 'webm');

module.exports = config;
