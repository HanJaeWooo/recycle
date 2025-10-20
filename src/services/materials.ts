import { useAuthStore } from '@/store/useAuthStore';
import Constants from 'expo-constants';

function getApiBase(): string {
  // Check environment variables first
  const envApiBase = process.env.API_BASE || 
                     process.env.EXPO_PUBLIC_API_BASE || 
                     process.env.REACT_APP_API_BASE;
  
  // Check Expo constants
  const constantsApiBase = Constants.expoConfig?.extra?.API_BASE || 
                            Constants.expoConfig?.extra?.API_BASE_DEV;
  
  // Fallback URLs
  const fallbackUrls = [
    'https://recycle-app-98di.onrender.com',
    'http://localhost:4000',
    'http://192.168.1.32:4000'
  ];

  // Detailed logging
  console.log('API Base URL Detection:', {
    envApiBase,
    constantsApiBase,
    fallbackUrls,
    NODE_ENV: process.env.NODE_ENV,
    EXPO_PUBLIC_API_BASE: process.env.EXPO_PUBLIC_API_BASE,
    REACT_APP_API_BASE: process.env.REACT_APP_API_BASE
  });

  // Prioritize sources
  const apiBase = envApiBase || 
                  constantsApiBase || 
                  fallbackUrls.find(url => url) || 
                  'https://recycle-app-98di.onrender.com';

  console.log('Selected API Base URL:', apiBase);
  return apiBase;
}

const API_BASE = getApiBase();

export async function saveScanHistory(scanData: {
  materialLabel: string;
  confidence: number;
  imageUrl?: string;
  detectionDetails?: any;
}): Promise<{
  id: string;
  material_label: string;
  confidence: number;
  image_url?: string;
  created_at: string;
}> {
  const sessionToken = useAuthStore.getState().sessionToken;
  const userId = useAuthStore.getState().userId;
  
  console.log('[DETAILED saveScanHistory] Context:', {
    sessionTokenAvailable: !!sessionToken,
    userIdAvailable: !!userId,
    materialLabel: scanData.materialLabel,
    confidence: scanData.confidence,
    imageUrlProvided: !!scanData.imageUrl,
    detectionDetailsType: typeof scanData.detectionDetails
  });

  // Validate input data with comprehensive checks
  if (!sessionToken) {
    console.error('[saveScanHistory] Critical: No session token available');
    throw new Error('Authentication required: No session token');
  }

  if (!userId) {
    console.error('[saveScanHistory] Critical: No user ID available');
    throw new Error('Authentication required: No user ID');
  }

  if (!scanData.materialLabel) {
    console.error('[saveScanHistory] Validation Error: Missing material label');
    throw new Error('Validation failed: Material label is required');
  }

  if (scanData.confidence === undefined || scanData.confidence === null) {
    console.error('[saveScanHistory] Validation Error: Invalid confidence score');
    throw new Error('Validation failed: Confidence score is required');
  }

  const fullScanData = {
    ...scanData,
    userId  // Explicitly add user ID to payload
  };

  try {
    console.log('[saveScanHistory] Preparing fetch:', {
      url: `${getApiBase()}/scan-history`,
      method: 'POST',
      headers: ['Content-Type', 'Authorization'],
      bodyKeys: Object.keys(fullScanData)
    });

    const res = await fetch(`${getApiBase()}/scan-history`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify(fullScanData)
    });

    console.log('[saveScanHistory] Fetch Response:', {
      status: res.status,
      ok: res.ok,
      headers: Object.fromEntries(res.headers.entries())
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[saveScanHistory] Error Response:', {
        status: res.status,
        errorText
      });

      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }

      throw Object.assign(new Error('Failed to save scan history'), { 
        status: res.status,
        errorText,
        details: errorDetails
      });
    }

    const savedHistory = await res.json();
    
    console.log('[saveScanHistory] Saved Successfully:', {
      id: savedHistory.id,
      materialLabel: savedHistory.material_label,
      confidence: savedHistory.confidence
    });

    return savedHistory;
  } catch (error: any) {
    console.error('[saveScanHistory] Comprehensive Error:', {
      message: error.message,
      status: error.status,
      details: error.details,
      stack: error.stack
    });

    throw error;
  }
}

export async function getScanHistory(options?: {
  limit?: number;
  offset?: number;
}): Promise<{
  scans: Array<{
    id: string;
    material_label: string;
    confidence: number;
    image_url?: string;
    created_at: string;
  }>;
  total: number;
}> {
  const sessionToken = useAuthStore.getState().sessionToken;
  const userId = useAuthStore.getState().userId;
  const apiBase = getApiBase();
  
  console.log('Fetching scan history:', {
    sessionToken: !!sessionToken,
    userId,
    apiBase,
    limit: options?.limit || 50,
    offset: options?.offset || 0
  });
  
  if (!sessionToken) {
    console.error('No session token available for scan history fetch');
    throw new Error('No session token available');
  }

  if (!userId) {
    console.error('No user ID available for scan history fetch');
    throw new Error('No user ID available');
  }

  const { limit = 50, offset = 0 } = options || {};
  const url = new URL(`${apiBase}/scan-history`);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('offset', offset.toString());
  url.searchParams.append('userId', userId);

  try {
    const fullUrl = url.toString();
    console.log('Fetch URL:', fullUrl);

    const fetchOptions = {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      }
    };

    console.log('Fetch Options:', fetchOptions);

    const res = await fetch(fullUrl, fetchOptions);

    console.log('Scan history fetch response:', {
      status: res.status,
      ok: res.ok,
      headers: Object.fromEntries(res.headers.entries())
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Scan history fetch error text:', errorText);
      
      throw Object.assign(new Error('Failed to fetch scan history'), { 
        status: res.status,
        errorText 
      });
    }

    const data = await res.json();
    console.log('Scan history data:', {
      scansCount: data.scans?.length || 0,
      total: data.total
    });

    return data;
  } catch (error: any) {
    console.error('Unexpected scan history fetch error:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      errorText: error.errorText
    });

    throw error;
  }
}

export type MaterialGuide = {
  key: string;
  title: string;
  category: 'Plastic' | 'Glass' | 'Metal' | 'Paper' | 'Cardboard' | 'Wood' | 'Textile' | 'Utensils' | 'Other';
  bin: string;
  tips: string[];
};

const guides: Record<string, MaterialGuide> = {
  cardboard: {
    key: 'Cardboard',
    title: 'Cardboard',
    category: 'Cardboard',
    bin: 'Recyclables',
    tips: [
      'Flatten boxes',
      'Remove packing tape and labels',
      'Keep dry to maintain recyclability',
    ],
  },
  metalcans: {
    key: 'Metal cans',
    title: 'Metal Cans',
    category: 'Metal',
    bin: 'Recyclables',
    tips: [
      'Rinse cans; remove sharp edges',
      'Crush cans to reduce volume',
      'Keep free of food residue',
    ],
  },
  plasticbottle: {
    key: 'Plastic bottle',
    title: 'Plastic Bottle',
    category: 'Plastic',
    bin: 'Recyclables',
    tips: [
      'Rinse bottles; remove caps and labels if possible',
      'Flatten to save space',
      'Avoid mixing with food waste',
    ],
  },
  woods: {
    key: 'Woods',
    title: 'Woods',
    category: 'Wood',
    bin: 'Special/Organic (varies by locality)',
    tips: [
      'Untreated wood can often be composted or mulched',
      'Avoid disposing painted/treated wood with organics',
      'Consider upcycling for crafts or repairs',
    ],
  },
  corduroy: {
    key: 'Corduroy',
    title: 'Corduroy',
    category: 'Textile',
    bin: 'Textile Recycling',
    tips: [
      'Donate if in good condition',
      'Use textile recycling bins',
      'Consider upcycling into bags or patches',
    ],
  },
  denim: {
    key: 'Denim',
    title: 'Denim',
    category: 'Textile',
    bin: 'Textile Recycling',
    tips: [
      'Donate if wearable',
      'Perfect for upcycling projects',
      'Use textile recycling programs',
    ],
  },
  cotton: {
    key: 'Cotton',
    title: 'Cotton',
    category: 'Textile',
    bin: 'Textile Recycling',
    tips: [
      'Donate clean cotton items',
      'Great for cleaning rags when worn out',
      'Compostable if 100% cotton',
    ],
  },
  hangers: {
    key: 'Hangers',
    title: 'Hangers',
    category: 'Other',
    bin: 'Special Collection',
    tips: [
      'Return wire hangers to dry cleaners',
      'Plastic hangers can often be recycled',
      'Donate good condition hangers',
    ],
  },
  utensils: {
    key: 'Utensils',
    title: 'Utensils',
    category: 'Utensils',
    bin: 'Varies by Material',
    tips: [
      'Metal utensils go in metal recycling',
      'Plastic utensils often not recyclable',
      'Consider reusable alternatives',
    ],
  },
  metalbars: {
    key: 'Metal bars',
    title: 'Metal Bars',
    category: 'Metal',
    bin: 'Scrap Metal',
    tips: [
      'Take to scrap metal dealers',
      'Remove any non-metal attachments',
      'May have monetary value',
    ],
  },
  bottlecaps: {
    key: 'Bottle caps',
    title: 'Bottle caps',
    category: 'Plastic',
    bin: 'Recyclables',
    tips: [
      'Rinse thoroughly',
      'Check recycling number on bottom',
      'Great for upcycling projects',
    ],
  },
  cups: {
    key: 'Cups',
    title: 'Cups',
    category: 'Other',
    bin: 'Varies by Material',
    tips: [
      'Paper cups often not recyclable due to coating',
      'Plastic cups check recycling number',
      'Ceramic cups can be donated or repurposed',
    ],
  },
  chiffon: {
    key: 'Chiffon',
    title: 'Chiffon',
    category: 'Textile',
    bin: 'Textile Recycling',
    tips: [
      'Delicate fabric - handle carefully',
      'Great for craft projects',
      'Donate if in good condition',
    ],
  },
  coppers: {
    key: 'Coppers',
    title: 'Coppers',
    category: 'Metal',
    bin: 'Scrap Metal',
    tips: [
      'Valuable scrap metal',
      'Clean copper gets better prices',
      'Take to scrap metal dealers',
    ],
  },
  other: {
    key: 'Other',
    title: 'Other',
    category: 'Other',
    bin: 'General Waste',
    tips: [
      'When unsure, consult your local recycling guide',
      'Keep hazardous items (batteries, electronics) out of general waste',
      'Prefer reuse/upcycling when possible',
    ],
  },
};

function normalizeLabel(label: string): string {
  const l = label.toLowerCase().replace(/\s+/g, '');
  
  // Exact matches for training dataset classes
  if (l === 'cardboard') return 'cardboard';
  if (l === 'metalcans') return 'metalcans';
  if (l === 'plasticbottle') return 'plasticbottle';
  if (l === 'woods') return 'woods';
  if (l === 'corduroy') return 'corduroy';
  if (l === 'denim') return 'denim';
  if (l === 'cotton') return 'cotton';
  if (l === 'hangers') return 'hangers';
  if (l === 'utensils') return 'utensils';
  if (l === 'metalbars') return 'metalbars';
  if (l === 'bottlecaps') return 'bottlecaps';
  if (l === 'cups') return 'cups';
  if (l === 'chiffon') return 'chiffon';
  if (l === 'coppers') return 'coppers';
  
  // Partial matches for variations
  if (l.includes('cardboard')) return 'cardboard';
  if (l.includes('metalcan') || l.includes('metal') && l.includes('can')) return 'metalcans';
  if (l.includes('plastic') && l.includes('bottle')) return 'plasticbottle';
  if (l.includes('wood')) return 'woods';
  if (l.includes('corduroy')) return 'corduroy';
  if (l.includes('denim')) return 'denim';
  if (l.includes('cotton')) return 'cotton';
  if (l.includes('hanger')) return 'hangers';
  if (l.includes('utensil')) return 'utensils';
  if (l.includes('metalbar') || l.includes('metal') && l.includes('bar')) return 'metalbars';
  if (l.includes('bottlecap') || l.includes('bottle') && l.includes('cap')) return 'bottlecaps';
  if (l.includes('cup')) return 'cups';
  if (l.includes('chiffon')) return 'chiffon';
  if (l.includes('copper')) return 'coppers';
  
  // General fallbacks
  if (l.includes('plastic')) return 'plasticbottle';
  if (l.includes('metal') || l.includes('aluminum') || l.includes('aluminium')) return 'metalcans';
  if (l.includes('paper')) return 'cardboard';
  
  return 'other';
}

export function mapLabelToGuide(label: string): MaterialGuide {
  const key = normalizeLabel(label);
  return guides[key] ?? guides.other;
}

export function getGuideByKey(key: string): MaterialGuide {
  const k = key.toLowerCase();
  if (guides[k as keyof typeof guides]) return guides[k as keyof typeof guides];
  // Attempt to map common display keys like 'Plastic', 'Glass'
  return guides[normalizeLabel(key)] ?? guides.other;
}

export function listAllGuides(): MaterialGuide[] {
  return [
    guides.cardboard,
    guides.metalcans,
    guides.plasticbottle,
    guides.woods,
    guides.corduroy,
    guides.denim,
    guides.cotton,
    guides.hangers,
    guides.utensils,
    guides.metalbars,
    guides.bottlecaps,
    guides.cups,
    guides.chiffon,
    guides.coppers
  ];
}

// Get user inventory
export async function getInventory(): Promise<{
  items: Array<{
    id: string;
    material_label: string;
    quantity: number;
    max_quantity: number;
    image_url?: string;
    confidence?: number;
    created_at: string;
    updated_at: string;
  }>;
}> {
  const sessionToken = useAuthStore.getState().sessionToken;
  const userId = useAuthStore.getState().userId;
  const apiBase = getApiBase();
  
  console.log('Fetching inventory:', {
    sessionToken: !!sessionToken,
    userId,
    apiBase
  });
  
  if (!sessionToken) {
    console.error('No session token available for inventory fetch');
    throw new Error('No session token available');
  }

  if (!userId) {
    console.error('No user ID available for inventory fetch');
    throw new Error('No user ID available');
  }

  const url = new URL(`${apiBase}/inventory`);
  url.searchParams.append('userId', userId);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    console.log('Inventory fetch response:', {
      status: res.status,
      ok: res.ok
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Inventory fetch error:', errorText);
      throw Object.assign(new Error('Failed to fetch inventory'), { 
        status: res.status,
        errorText 
      });
    }

    const data = await res.json();
    console.log('Inventory data:', {
      itemsCount: data.items?.length || 0
    });

    return data;
  } catch (error: any) {
    console.error('Unexpected inventory fetch error:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Sync inventory from scan history
export async function syncInventory(): Promise<{
  items: Array<{
    id: string;
    material_label: string;
    quantity: number;
    max_quantity: number;
    image_url?: string;
    confidence?: number;
    created_at: string;
    updated_at: string;
  }>;
}> {
  const sessionToken = useAuthStore.getState().sessionToken;
  const apiBase = getApiBase();
  
  if (!sessionToken) {
    throw new Error('No session token available');
  }

  try {
    const res = await fetch(`${apiBase}/inventory/sync`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw Object.assign(new Error('Failed to sync inventory'), { 
        status: res.status,
        errorText 
      });
    }

    return await res.json();
  } catch (error: any) {
    console.error('Inventory sync error:', error);
    throw error;
  }
}

// Update inventory item quantity
export async function updateInventoryQuantity(itemId: string, quantity: number): Promise<{
  id: string;
  material_label: string;
  quantity: number;
  max_quantity: number;
  image_url?: string;
  confidence?: number;
  updated_at: string;
}> {
  const sessionToken = useAuthStore.getState().sessionToken;
  const apiBase = getApiBase();
  
  if (!sessionToken) {
    throw new Error('No session token available');
  }

  try {
    const res = await fetch(`${apiBase}/inventory/${itemId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({ quantity })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw Object.assign(new Error('Failed to update inventory item'), { 
        status: res.status,
        errorText 
      });
    }

    return await res.json();
  } catch (error: any) {
    console.error('Inventory update error:', error);
    throw error;
  }
}

// Delete inventory items
export async function deleteInventoryItems(itemIds: string[]): Promise<{ deleted: number }> {
  const sessionToken = useAuthStore.getState().sessionToken;
  const apiBase = getApiBase();
  
  if (!sessionToken) {
    throw new Error('No session token available');
  }

  try {
    const res = await fetch(`${apiBase}/inventory`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({ ids: itemIds })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw Object.assign(new Error('Failed to delete inventory items'), { 
        status: res.status,
        errorText 
      });
    }

    return await res.json();
  } catch (error: any) {
    console.error('Inventory delete error:', error);
    throw error;
  }
}


