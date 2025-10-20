import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import HeaderBar from '@/components/HeaderBar';
import { colors, radii } from '@/utils/theme';
import { getScanHistory } from '@/services/materials';
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

  const renderHistoryItem = ({ item }: { item: ScanHistoryItem }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => {
        // Navigate to Library with the scanned material to show project ideas
        navigation.navigate('Library' as never, { material: item.material_label } as never);
      }}
    >
      {item.image_url && (
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.historyImage} 
          resizeMode="cover" 
        />
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
      'Are you sure you want to clear your scan history?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement clear history functionality
            Alert.alert('Not Implemented', 'Clear history feature coming soon.');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
      <HeaderBar 
        title="Scan History" 
        rightAction={{
          icon: 'trash',
          onPress: handleClearHistory
        }} 
      />
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { 
    flex: 1, 
    backgroundColor: 'white' 
  },
  historyItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    marginRight: 16
  },
  historyDetails: {
    flex: 1,
    justifyContent: 'center'
  },
  materialLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  confidence: {
    color: colors.text.secondary,
    marginBottom: 4
  },
  timestamp: {
    color: colors.text.secondary,
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
    color: colors.text.secondary,
    marginBottom: 16
  },
  startScanButton: {
    backgroundColor: colors.bg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radii.pill
  },
  startScanButtonText: {
    color: 'white',
    fontWeight: '700'
  }
});


