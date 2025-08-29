import { create } from 'zustand';

type SettingsState = {
  useMockClassifier: boolean;
  toggleMock: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  useMockClassifier: false,
  toggleMock: () => set((state) => ({ useMockClassifier: !state.useMockClassifier })),
}));


