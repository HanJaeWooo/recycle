import { create } from 'zustand';

type AuthState = {
  userId: string | null;
  sessionToken: string | null;
  setAuth: (userId: string, sessionToken: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  sessionToken: null,
  setAuth: (userId, sessionToken) => set({ userId, sessionToken }),
  clear: () => set({ userId: null, sessionToken: null }),
}));


