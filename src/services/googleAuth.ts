import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import appConfig from '../../app.json';

// Complete auth session for mobile
WebBrowser.maybeCompleteAuthSession();

/**
 * Initializes Google ID token auth for the current platform.
 * Uses Expo's Google provider with WebBrowser completion fix.
 *
 * Returns: [request, response, signIn]
 * - signIn(): Promise<string | null> 
 *   Resolves to Google id_token on success, or null if cancelled.
 */
export function useGoogleIdToken() {
  const extra = (appConfig as any)?.expo?.extra || {};
  const webClientId = extra.GOOGLE_WEB_CLIENT_ID;
  const iosClientId = extra.GOOGLE_IOS_CLIENT_ID;
  const androidClientId = extra.GOOGLE_ANDROID_CLIENT_ID;

  // Select client ID based on platform
  const googleClientId = Platform.select({
    ios: iosClientId,
    android: androidClientId,
    default: webClientId
  });

  // Determine redirect URI
  const redirectUri = Platform.select({
    ios: 'https://auth.expo.io/@davidsuballa26/rn-recycle',
    android: 'https://auth.expo.io/@davidsuballa26/rn-recycle',
    web: makeRedirectUri({ 
      preferLocalhost: true,
      scheme: 'rnrecycle'
    }),
    default: makeRedirectUri({
      scheme: 'rnrecycle',
      path: 'redirect'
    })
  });

  console.log('🔍 Comprehensive OAuth Debug:', {
    platform: Platform.OS,
    redirectUri,
    googleClientId,
    webClientId,
    iosClientId,
    androidClientId
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
    redirectUri,
    responseType: 'id_token',
    scopes: ['openid', 'email', 'profile']
  });

  const signIn = async (): Promise<string | null> => {
    try {
      console.log('🔐 Initiating OAuth Flow', {
        platform: Platform.OS,
        redirectUri,
        clientId: googleClientId
      });
      
      if (!request) {
        console.error('❌ OAuth Request Initialization Failed');
        return null;
      }

      const authResult = await promptAsync({
        useProxy: Platform.OS !== 'web',
        showInRecents: false
      });
      
      console.log('🔐 Full OAuth Response:', JSON.stringify(authResult, null, 2));
      
      switch (authResult.type) {
        case 'success':
          const idToken = 
            authResult.params?.id_token || 
            authResult.authentication?.idToken;
          
          if (!idToken) {
            console.error('❌ No ID Token Received Despite Successful Authentication');
            console.error('Full Auth Result:', JSON.stringify(authResult, null, 2));
            return null;
          }
          
          console.log('🆔 ID Token Successfully Retrieved');
          return idToken;
        
        case 'cancel':
          console.warn('🚫 OAuth Flow Cancelled by User');
          return null;
        
        case 'error':
          console.error('💥 OAuth Error Details:', {
            errorParams: authResult.params,
            errorMessage: authResult.error?.message
          });
          return null;
        
        default:
          console.error(`❌ Unexpected OAuth Response Type: ${authResult.type}`);
          return null;
      }
      
    } catch (error) {
      console.error('💥 Comprehensive OAuth Error:', error);
      return null;
    }
  };

  return [request, response, signIn] as const;
}


