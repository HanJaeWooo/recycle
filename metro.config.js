const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add video file extensions to asset extensions
config.resolver.assetExts.push(
  'mp4',
  'mov',
  'avi',
  'mkv',
  'webm'
);

// Configure transformer to handle large assets
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

const publicDir = path.resolve(__dirname, 'public');
const hasPublicDir = fs.existsSync(publicDir);

// Add public folder to watch folders for web (when available)
if (hasPublicDir) {
  config.watchFolders = [
    publicDir,
    ...(config.watchFolders || []),
  ];
}

// Serve public folder as static assets
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, metroServer) => {
    return (req, res, next) => {
      // Serve files from public folder (videos and thumbnails)
      if (hasPublicDir && req.url.startsWith('/videos/')) {
        const filePath = path.join(publicDir, req.url);
        if (fs.existsSync(filePath)) {
          // Set appropriate content type based on file extension
          const ext = path.extname(filePath).toLowerCase();
          const contentTypes = {
            '.mp4': 'video/mp4',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.mkv': 'video/x-matroska',
            '.webm': 'video/webm',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
          };
          const contentType = contentTypes[ext] || 'application/octet-stream';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Accept-Ranges', 'bytes');
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
