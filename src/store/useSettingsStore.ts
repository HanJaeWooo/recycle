import { create } from 'zustand';

type SettingsState = {
  useMockClassifier: boolean;
  backend: 'api' | 'vision' | 'mock';
  toggleMock: () => void;
  setBackend: (backend: 'api' | 'vision' | 'mock') => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  useMockClassifier: false,
  backend: 'api', // Default to API backend (your YOLO model)
  toggleMock: () => set((state) => ({
    useMockClassifier: !state.useMockClassifier,
    backend: !state.useMockClassifier ? 'mock' : 'api'
  })),
  setBackend: (backend) => set({
    backend,
    useMockClassifier: backend === 'mock'
  }),
}));


