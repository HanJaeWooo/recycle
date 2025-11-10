import Constants from 'expo-constants';

function getApiBase(): string {
  const apiBase = 
    Constants.expoConfig?.extra?.API_BASE ||
    process.env.EXPO_PUBLIC_API_BASE || 
    'https://recycle-production-up.railway.app';
  return apiBase;
}

export async function testBackendConnectivity(): Promise<{
  success: boolean;
  message: string;
  apiBase: string;
  error?: string;
}> {
  const apiBase = getApiBase();
  const testUrl = `${apiBase}/test`;
  
  console.log('🔗 [CONNECTIVITY TEST] Testing connection to:', testUrl);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log('🔗 [CONNECTIVITY TEST] Response status:', response.status);
    
    if (!response.ok) {
      return {
        success: false,
        message: `Backend returned status ${response.status}`,
        apiBase,
        error: `HTTP ${response.status}`
      };
    }
    
    const data = await response.json();
    console.log('🔗 [CONNECTIVITY TEST] Success:', data);
    
    return {
      success: true,
      message: 'Backend is reachable and responding',
      apiBase,
    };
  } catch (error: any) {
    console.error('🔗 [CONNECTIVITY TEST] Error:', error);
    
    return {
      success: false,
      message: 'Failed to connect to backend',
      apiBase,
      error: error?.message || String(error)
    };
  }
}
