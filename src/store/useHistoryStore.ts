import { create } from 'zustand';
import { getScanHistory, getInventory, syncInventory, updateInventoryQuantity, deleteInventoryItems } from '@/services/materials';

export type HistoryItem = {
  id: string;
  uri: string | null;
  label: string;
  confidence?: number; // Detection confidence score (0-1)
  timestamp: number;
  quantity: number;
  maxQuantity: number; // Maximum quantity based on actual scans
  selected: boolean;
};

type HistoryState = {
  items: HistoryItem[];
  addItem: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'quantity' | 'selected' | 'maxQuantity'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  deleteSelected: () => void;
  loadScanHistory: () => Promise<void>;
  clear: () => void;
};

export const useHistoryStore = create<HistoryState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [
        { 
          id: Math.random().toString(36).slice(2), 
          timestamp: Date.now(), 
          quantity: 1,
          selected: false, 
          maxQuantity: 1, // New items start with max quantity of 1
          ...item 
        },
        ...state.items,
      ].slice(0, 50),
    })),
  updateQuantity: (id, quantity) =>
    set((state) => {
      const newItems = state.items.map(item =>
        item.id === id ? { 
          ...item, 
          quantity: Math.max(0, Math.min(quantity, item.maxQuantity)) 
        } : item
      );
      
      // Persist to backend
      const item = newItems.find(i => i.id === id);
      if (item) {
        updateInventoryQuantity(id, item.quantity).catch(err => {
          console.error('Failed to update quantity in backend:', err);
        });
      }
      
      return { items: newItems };
    }),
  toggleSelection: (id) =>
    set((state) => ({
      items: state.items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ),
    })),
  selectAll: () =>
    set((state) => ({
      items: state.items.map(item => ({ ...item, selected: true })),
    })),
  deselectAll: () =>
    set((state) => ({
      items: state.items.map(item => ({ ...item, selected: false })),
    })),
  deleteSelected: () =>
    set((state) => {
      const selectedIds = state.items.filter(item => item.selected).map(item => item.id);
      
      // Persist deletion to backend
      if (selectedIds.length > 0) {
        deleteInventoryItems(selectedIds).catch(err => {
          console.error('Failed to delete items from backend:', err);
        });
      }
      
      return { items: state.items.filter(item => !item.selected) };
    }),
  loadScanHistory: async () => {
    try {
      // Load scan history and group by material type
      const historyData = await getScanHistory({ limit: 100 });
      
      // Group scans by material label and count occurrences
      const materialCounts: { [key: string]: { count: number; latestScan: any } } = {};
      
      historyData.scans.forEach(scan => {
        const label = scan.material_label;
        if (materialCounts[label]) {
          materialCounts[label].count += 1;
          // Keep the latest scan for image and metadata
          if (new Date(scan.created_at).getTime() > new Date(materialCounts[label].latestScan.created_at).getTime()) {
            materialCounts[label].latestScan = scan;
          }
        } else {
          materialCounts[label] = { count: 1, latestScan: scan };
        }
      });
      
      // Convert to inventory items with grouped quantities
      const inventoryItems = Object.entries(materialCounts).map(([label, data]) => ({
        id: data.latestScan.id,
        uri: data.latestScan.image_url || null,
        label: label,
        confidence: data.latestScan.confidence,
        timestamp: new Date(data.latestScan.created_at).getTime(),
        quantity: data.count,
        maxQuantity: data.count,
        selected: false,
      }));
      
      set({ items: inventoryItems });
      console.log('✅ Inventory loaded with grouped materials:', inventoryItems.length, 'unique materials');
    } catch (error) {
      console.error('❌ Failed to load scan history:', error);
    }
  },
  clear: () => set({ items: [] }),
}));


