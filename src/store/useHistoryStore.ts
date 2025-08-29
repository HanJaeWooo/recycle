import { create } from 'zustand';

export type HistoryItem = {
  id: string;
  uri: string | null;
  label: string;
  timestamp: number;
};

type HistoryState = {
  items: HistoryItem[];
  addItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clear: () => void;
};

export const useHistoryStore = create<HistoryState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [
        { id: Math.random().toString(36).slice(2), timestamp: Date.now(), ...item },
        ...state.items,
      ].slice(0, 50),
    })),
  clear: () => set({ items: [] }),
}));


