import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii } from '@/utils/theme';
import { getScanHistory, clearScanHistory } from '@/services/materials';
import FullScreenWrapper from '@/components/FullScreenWrapper';
import { useAuthStore } from '@/store/useAuthStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useNavigation } from '@react-navigation/native';

type ScanHistoryItem = {
  id: string;
  material_label: string;
  confidence: number;
  image_url?: string;
  created_at: string;
};

export default function HistoryScreen() {
  const [backendHistory, setBackendHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalScans, setTotalScans] = useState(0);

  const userId = useAuthStore((s) => s.userId);
  const localHistory = useHistoryStore((s) => s.items);
  const navigation = useNavigation();

  const getMaterialEmoji = (material: string): string => {
    const materialLower = material.toLowerCase();
    if (materialLower.includes('bottle caps')) return '🔵';
    if (materialLower.includes('cardboard')) return '📦';
    if (materialLower.includes('chiffon')) return '🧵';
    if (materialLower.includes('copper')) return '🟠';
    if (materialLower.includes('corduroy')) return '🧵';
    if (materialLower.includes('cotton')) return '🧵';
    if (materialLower.includes('denim')) return '👖';
    if (materialLower.includes('hanger')) return '🧥';
    if (materialLower.includes('metal') || materialLower.includes('can')) return '🔩';
    if (materialLower.includes('plastic bottle') || materialLower.includes('bottle')) return '🧴';
    if (materialLower.includes('cup')) return '🥤';
    if (materialLower.includes('utensil')) return '🍴';
    if (materialLower.includes('wood')) return '🪵';
    if (materialLower.includes('paper')) return '📄';
    if (materialLower.includes('glass')) return '🫙';
    if (materialLower.includes('textile') || materialLower.includes('fabric')) return '🧵';
    if (materialLower.includes('plastic')) return '🧴';
    return '♻️';
  };

  // Combine and deduplicate local and backend history
  const combinedHistory = useMemo(() => {
    const combined: ScanHistoryItem[] = [];
    
    // Add backend history
    combined.push(...backendHistory);
    
    // Add local history items that aren't in backend (convert format)
    localHistory.forEach(localItem => {
      const existsInBackend = backendHistory.some(backendItem =>
        backendItem.material_label === localItem.label &&
        Math.abs(new Date(backendItem.created_at).getTime() - localItem.timestamp) < 60000 // Within 1 minute
      );
      
      if (!existsInBackend) {
        combined.push({
          id: localItem.id,
          material_label: localItem.label,
          confidence: localItem.confidence ?? 0.95, 
          image_url: localItem.uri || undefined,
          created_at: new Date(localItem.timestamp).toISOString()
        });
      }
    });
    
    // Sort by created_at descending
    return combined.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [backendHistory, localHistory]);

  const fetchHistory = async (isRefresh = false) => {
    if (!userId) {
      // User is not logged in - silently return without showing error
      // The navigation will handle redirecting to sign-in screen
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(isRefresh ? false : true);
      setRefreshing(isRefresh);

      const offset = isRefresh ? 0 : page * 50;
      const { scans, total } = await getScanHistory({ limit: 50, offset });

      if (isRefresh) {
        setBackendHistory(scans);
        setPage(0);
      } else {
        setBackendHistory(prev => [...prev, ...scans]);
        setPage(prev => prev + 1);
      }

      setTotalScans(total);
    } catch (error) {
      console.error('Failed to fetch scan history:', error);
      Alert.alert(
        'Error', 
        'Failed to load scan history. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const renderHistoryItem = ({ item }: { item: ScanHistoryItem }) => {
    // Show image if available (both remote URLs and local file URIs)
    const hasImage = item.image_url && item.image_url.trim().length > 0;
    
    return (
      <TouchableOpacity 
        style={styles.historyItem}
        onPress={() => {
          // Navigate to Library with the scanned material to show project ideas
          navigation.navigate('Library' as never, { material: item.material_label } as never);
        }}
      >
        {hasImage ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.historyImage} 
            resizeMode="cover"
            onError={(error) => {
              console.log('Image load error:', item.image_url, error.nativeEvent.error);
            }}
          />
        ) : (
          <View style={styles.historyImagePlaceholder}>
            <Text style={styles.historyEmoji}>{getMaterialEmoji(item.material_label)}</Text>
          </View>
        )}
        <View style={styles.historyDetails}>
        <Text style={styles.materialLabel}>
          {item.material_label}
        </Text>
        <Text style={styles.confidence}>
          Confidence: {(item.confidence * 100).toFixed(2)}%
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.bg} />
      </View>
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History', 
      'Are you sure you want to clear your scan history? This action cannot be undone.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear both local and backend history
              useHistoryStore.getState().clear(); // Clear local history
              await clearScanHistory(); // Clear backend history
              
              // Refresh the view
              await fetchHistory(true);
              Alert.alert('Success', 'Scan history cleared successfully.');
            } catch (error) {
              console.error('Failed to clear scan history:', error);
              Alert.alert('Error', 'Failed to clear scan history. Please try again.');
            }
          } 
        }
      ]
    );
  };

  return (
    <FullScreenWrapper>
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        <View style={styles.headerSection}>
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Scan History</Text>
          </View>
          <View style={styles.clearButtonContainer}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearHistory}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>🗑 Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      {combinedHistory.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scan history yet</Text>
          <TouchableOpacity 
            style={styles.startScanButton}
            onPress={() => navigation.navigate('Capture' as never)}
          >
            <Text style={styles.startScanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={combinedHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
          onEndReached={() => {
            if (backendHistory.length < totalScans) {
              fetchHistory();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={refreshing}
          onRefresh={() => fetchHistory(true)}
        />
      )}
      </LinearGradient>
    </FullScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#8B4513',
    textAlign: 'center',
  },
  clearButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 69, 19, 0.15)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButtonText: {
    color: '#8B4513',
    fontWeight: '500',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for tab bar
  },
  historyItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F5DEB3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16
  },
  historyImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#F5DEB3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyEmoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  historyDetails: {
    flex: 1,
    justifyContent: 'center'
  },
  materialLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#8B4513',
  },
  confidence: {
    color: '#8B7355',
    marginBottom: 4,
    fontSize: 14,
  },
  timestamp: {
    color: '#8B7355',
    fontSize: 12
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  emptyText: {
    fontSize: 18,
    color: '#8B4513',
    marginBottom: 16,
    textAlign: 'center'
  },
  startScanButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  startScanButtonText: {
    color: '#FFE4C8',
    fontWeight: '700'
  }
});


