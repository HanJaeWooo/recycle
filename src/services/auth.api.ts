import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/useAuthStore';

export type RegisterPayload = {
  email: string;
  username: string;
  fullName?: string;
  password: string;
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
};

// API configuration - using environment variable
function getApiBase(): string {
  console.log('🔍 DEBUG - Environment variables:', {
    EXPO_PUBLIC_API_BASE: process.env.EXPO_PUBLIC_API_BASE,
    NODE_ENV: process.env.NODE_ENV,
    'Constants.expoConfig?.extra': Constants.expoConfig?.extra,
  });
  
  // Always use Railway backend for both development and production
  console.log('🔍 DEBUG - Using Railway backend for all environments');
  
  // In production builds, process.env is not available
  // Priority: Constants.expoConfig (from app.json) > process.env > fallback
  const apiBase = 
    Constants.expoConfig?.extra?.API_BASE ||
    process.env.EXPO_PUBLIC_API_BASE || 
    'https://recycle-production-up.railway.app';
    
  console.log('🔍 DEBUG - Using API Base:', apiBase);
  console.log('🔍 DEBUG - Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
  
  return apiBase;
}

// Make API_BASE dynamic to ensure it's read at runtime, not module load time
function getAPI_BASE(): string {
  return getApiBase();
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const API_BASE = getAPI_BASE();
  const url = `${API_BASE}${path}`;
  console.log('🔍 [AUTH] Making request to:', url);
  console.log('🔍 [AUTH] Request options:', { method: options.method, headers: options.headers });
  
  try {
    // For HTTPS URLs, we need to handle SSL certificate issues
    // This is a workaround for self-signed or problematic certificates
    const fetchOptions: RequestInit = {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    };
    
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    fetchOptions.signal = controller.signal;
    
    const res = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    console.log('🔍 [AUTH] Response status:', res.status);
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error('🔍 [AUTH] Error response:', { status: res.status, data });
      throw Object.assign(new Error('RequestFailed'), { status: res.status, data });
    }
    
    const result = await res.json();
    console.log('🔍 [AUTH] Success response:', result);
    return result;
  } catch (err: any) {
    console.error('🔍 [AUTH] Catch block error:', {
      message: err?.message,
      status: err?.status,
      code: err?.code,
      name: err?.name,
      stack: err?.stack?.split('\n')[0]
    });
    
    if (err?.status == null) {
      throw Object.assign(new Error('NetworkError'), { 
        code: 'network_error', 
        base: API_BASE,
        message: `Unable to connect to ${API_BASE}. Check if the API server is running. Error: ${err?.message}` 
      });
    }
    throw err;
  }
}

export async function register(payload: RegisterPayload): Promise<{ userId: string }> {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function login(identifier: string, password: string): Promise<{ userId: string; sessionToken: string }> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; token?: string }> {
  return request('/auth/password-reset/request', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function consumePasswordReset(token: string, newPassword: string): Promise<{ ok: boolean }> {
  return request('/auth/password-reset/consume', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
}

export async function updateProfile(data: { 
  fullName?: string; 
  username?: string 
}): Promise<{
  message: string;
  profile: {
    full_name?: string;
    username: string;
  }
}> {
  const sessionToken = useAuthStore.getState().sessionToken;
  
  if (!sessionToken) {
    throw new Error('No session token available');
  }

  const API_BASE = getAPI_BASE();
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error('Profile update error:', {
      status: res.status,
      error: error
    });

    if (error.error === 'username_taken') {
      throw Object.assign(new Error('Username is already taken'), { 
        status: res.status, 
        code: error.error 
      });
    }

    throw Object.assign(new Error('Profile update failed'), { 
      status: res.status, 
      code: error.error 
    });
  }
  
  return res.json();
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const API_BASE = getAPI_BASE();
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw Object.assign(new Error('Password change failed'), { code: error.error });
  }
  
  return res.json();
}

export async function fetchProfile(userId: string): Promise<{
  id: string;
  email: string;
  username: string;
  full_name?: string;
  last_login_at?: string;
  created_at: string;
}> {
  // Get the current session token from the auth store
  const sessionToken = useAuthStore.getState().sessionToken;
  
  if (!sessionToken) {
    throw new Error('No session token available');
  }

  const API_BASE = getAPI_BASE();
  const res = await fetch(`${API_BASE}/auth/profile?userId=${userId}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error('Profile fetch error:', {
      status: res.status,
      error: error
    });
    
    throw Object.assign(new Error('Profile fetch failed'), { 
      status: res.status, 
      code: error.error 
    });
  }
  
  return res.json();
}


