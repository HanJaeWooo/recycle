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
  
  // Try multiple sources for the API base
  const apiBase = 
    process.env.EXPO_PUBLIC_API_BASE || 
    Constants.expoConfig?.extra?.API_BASE ||
    'https://recycle-app-98di.onrender.com';
    
  console.log('🔍 DEBUG - Using API Base:', apiBase);
  
  return apiBase;
}

const API_BASE = getApiBase();

async function request<T>(path: string, options: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw Object.assign(new Error('RequestFailed'), { status: res.status, data });
    }
    
    return await res.json();
  } catch (err: any) {
    if (err?.status == null) {
      throw Object.assign(new Error('NetworkError'), { 
        code: 'network_error', 
        base: API_BASE,
        message: `Unable to connect to ${API_BASE}. Check if the API server is running.` 
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

export async function googleLogin(idToken: string): Promise<{ userId: string; sessionToken: string }> {
  return request('/auth/login/google', { method: 'POST', body: JSON.stringify({ idToken }) });
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


