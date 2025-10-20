import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
  userId: string | null;
  sessionToken: string | null;
  isLoading: boolean;
  setAuth: (userId: string, sessionToken: string) => Promise<void>;
  clear: () => Promise<void>;
  loadAuth: () => Promise<void>;
};

const AUTH_STORAGE_KEY = '@recycle_app_auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  sessionToken: null,
  isLoading: true,
  
  setAuth: async (userId: string, sessionToken: string) => {
    try {
      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId, sessionToken }));
      
      // Update state
      set({ userId, sessionToken, isLoading: false });
      
      console.log('✅ Auth saved successfully:', {
        userId: userId.substring(0, 8) + '...',
        hasSessionToken: !!sessionToken
      });
    } catch (error) {
      console.error('❌ Failed to save auth:', error);
      set({ userId, sessionToken, isLoading: false }); // Still update state even if storage fails
    }
  },
  
  clear: async () => {
    try {
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      
      // Clear state
      set({ userId: null, sessionToken: null, isLoading: false });
      
      console.log('✅ Auth cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear auth:', error);
      set({ userId: null, sessionToken: null, isLoading: false }); // Still clear state
    }
  },
  
  loadAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Load from AsyncStorage
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (storedAuth) {
        const { userId, sessionToken } = JSON.parse(storedAuth);
        
        if (userId && sessionToken) {
          set({ userId, sessionToken, isLoading: false });
          console.log('✅ Auth loaded from storage:', {
            userId: userId.substring(0, 8) + '...',
            hasSessionToken: !!sessionToken
          });
          return;
        }
      }
      
      // No stored auth found
      set({ userId: null, sessionToken: null, isLoading: false });
      console.log('ℹ️ No stored auth found');
      
    } catch (error) {
      console.error('❌ Failed to load auth:', error);
      set({ userId: null, sessionToken: null, isLoading: false });
    }
  },
}));

// Auto-load auth on app startup
useAuthStore.getState().loadAuth();


