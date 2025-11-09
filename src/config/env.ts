// Environment configuration for different platforms
import { Platform } from 'react-native';

// Get the Metro bundler URL for serving static videos
export function getVideoServerUrl(): string {
  // For web, videos are served from the public folder
  if (Platform.OS === 'web') {
    // Use the current origin for web
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:8082';
  }

  // For native (iOS/Android), use the video server URL from environment
  // This is set by start-dev.js to point to Metro bundler
  const videoServerUrl = process.env.EXPO_PUBLIC_VIDEO_SERVER_URL;
  
  if (videoServerUrl) {
    return videoServerUrl;
  }

  // Fallback - use localhost (development only)
  console.warn('EXPO_PUBLIC_VIDEO_SERVER_URL not set, using localhost fallback');
  return 'http://localhost:8081';
}

// Get detection API URL
export function getDetectionApiUrl(): string {
  return process.env.EXPO_PUBLIC_DETECTION_API_URL || 'http://localhost:8000';
}

// Get main API base URL
export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_BASE || 'https://recycle-production-up.railway.app';
}

// Get YouTube API key
export function getYouTubeApiKey(): string {
  return process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '';
}
