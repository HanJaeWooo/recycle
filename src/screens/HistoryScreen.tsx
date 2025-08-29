import React, { useState, useEffect } from 'react';
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
import HeaderBar from '@/components/HeaderBar';
import { colors, radii } from '@/utils/theme';
import { getScanHistory } from '@/services/materials';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

type ScanHistoryItem = {
  id: string;
  material_label: string;
  confidence: number;
  image_url?: string;
  created_at: string;
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalScans, setTotalScans] = useState(0);

  const userId = useAuthStore((s) => s.userId);
  const navigation = useNavigation();

  const fetchHistory = async (isRefresh = false) => {
    if (!userId) {
      Alert.alert(
        'Authentication Error', 
        'You must be logged in to view scan history.',
        [{ 
          text: 'Sign In', 
          onPress: () => navigation.navigate('SignIn' as never) 
        }]
      );
      return;
    }

    try {
      setLoading(isRefresh ? false : true);
      setRefreshing(isRefresh);

      const offset = isRefresh ? 0 : page * 50;
      const { scans, total } = await getScanHistory({ limit: 50, offset });

      if (isRefresh) {
        setHistory(scans);
        setPage(0);
      } else {
        setHistory(prev => [...prev, ...scans]);
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
        // TODO: Navigate to detail view or show more info
        console.log('Scan details:', item);
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
    <View style={styles.container}>
      <HeaderBar 
        title="Scan History" 
        rightAction={{
          icon: 'trash',
          onPress: handleClearHistory
        }} 
      />
      {history.length === 0 && !loading ? (
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
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          onEndReached={() => {
            if (history.length < totalScans) {
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
  );
}

const styles = StyleSheet.create({
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


