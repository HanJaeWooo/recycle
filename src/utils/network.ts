import { Platform } from 'react-native';
import * as Network from 'expo-network';

export async function getLocalIpAddress() {
  // For development in Expo Go
  if (__DEV__) {
    try {
      // Get the local network IP address (not public IP)
      const ip = await Network.getIpAddressAsync();
      console.log('🌐 [NETWORK] Detected local IP:', ip);
      return ip;
    } catch (error) {
      console.warn('⚠️ [NETWORK] Could not get local IP, using fallback', error);
      // Fallback to environment variable if detection fails
      const envUrl = process.env.EXPO_PUBLIC_DETECTION_API_URL;
      if (envUrl) {
        // Extract IP from env URL (e.g., "http://192.168.1.17:8000" -> "192.168.1.17")
        const match = envUrl.match(/http:\/\/([^:]+):/);
        if (match) {
          console.log('🌐 [NETWORK] Using IP from .env:', match[1]);
          return match[1];
        }
      }
      return 'localhost';
    }
  }
  
  // For production builds or when not in development
  return 'recycle-production.up.railway.app';
}

export async function getApiBaseUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE || 'https://recycle-production.up.railway.app';
  return baseUrl;
}

export async function getDetectionApiUrl() {
  // In development, use the environment variable (set by start-dev.js)
  if (__DEV__) {
    try {
      // ALWAYS use environment variable in development - it's set correctly by start-dev.js
      const envUrl = process.env.EXPO_PUBLIC_DETECTION_API_URL;
      
      // If env URL is set and valid, use it directly
      if (envUrl && envUrl.startsWith('http')) {
        console.log('🌐 [NETWORK] Using detection API from .env:', envUrl);
        return envUrl;
      }
      
      // Fallback: If we're on Android emulator, use 10.0.2.2 to access host machine
      if (Platform.OS === 'android') {
        const androidUrl = 'http://10.0.2.2:8000';
        console.log('🌐 [NETWORK] Android detected, using:', androidUrl);
        return androidUrl;
      }
      
      // Last resort fallback
      console.warn('⚠️ [NETWORK] No valid detection URL found, using localhost');
      return 'http://localhost:8000';
    } catch (error) {
      console.warn('⚠️ [NETWORK] Could not determine detection API URL, using fallback', error);
      return 'http://localhost:8000';
    }
  }
  
  // In production, use the production URL
  return process.env.EXPO_PUBLIC_DETECTION_API_URL || 'https://recycle-production.up.railway.app';
}
