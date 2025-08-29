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
  category: 'Plastic' | 'Glass' | 'Metal' | 'Paper' | 'Cardboard' | 'Wood' | 'Organic' | 'Other';
  bin: string;
  tips: string[];
};

const guides: Record<string, MaterialGuide> = {
  plastic: {
    key: 'Plastic',
    title: 'Plastic',
    category: 'Plastic',
    bin: 'Recyclables',
    tips: [
      'Rinse bottles/containers; remove caps and labels if possible',
      'Flatten to save space',
      'Avoid mixing with food waste',
    ],
  },
  glass: {
    key: 'Glass',
    title: 'Glass',
    category: 'Glass',
    bin: 'Glass Recycling',
    tips: [
      'Rinse jars/bottles and remove lids',
      'Do not include ceramics or mirrors',
      'Wrap broken glass safely before disposal',
    ],
  },
  metal: {
    key: 'Metal',
    title: 'Metal',
    category: 'Metal',
    bin: 'Recyclables',
    tips: [
      'Rinse cans; remove sharp edges',
      'Crush cans to reduce volume',
      'Keep free of food residue',
    ],
  },
  paper: {
    key: 'Paper',
    title: 'Paper',
    category: 'Paper',
    bin: 'Recyclables',
    tips: [
      'Keep clean and dry',
      'Remove plastic coatings when possible',
      'Flatten boxes and bundle papers',
    ],
  },
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
  wood: {
    key: 'Wood',
    title: 'Wood',
    category: 'Wood',
    bin: 'Special/Organic (varies by locality)',
    tips: [
      'Untreated wood can often be composted or mulched',
      'Avoid disposing painted/treated wood with organics',
      'Consider upcycling for crafts or repairs',
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
  const l = label.toLowerCase();
  if (l.includes('plastic')) return 'plastic';
  if (l.includes('pet')) return 'plastic';
  if (l.includes('hdpe')) return 'plastic';
  if (l.includes('glass')) return 'glass';
  if (l.includes('aluminum') || l.includes('aluminium') || l.includes('metal') || l.includes('can')) return 'metal';
  if (l.includes('cardboard')) return 'cardboard';
  if (l.includes('paper')) return 'paper';
  if (l.includes('wood')) return 'wood';
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
  return [guides.plastic, guides.glass, guides.metal, guides.paper, guides.cardboard, guides.wood];
}


