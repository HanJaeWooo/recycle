import { View, Text, StyleSheet, FlatList, Image, Pressable, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { radii } from '@/utils/theme';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/useAuthStore';

export default function InventoryScreen() {
  const items = useHistoryStore((s) => s.items);
  const loadScanHistory = useHistoryStore((s) => s.loadScanHistory);
  const sessionToken = useAuthStore((s) => s.sessionToken);
  
  const navigation = useNavigation<any>();
  
  useEffect(() => {
    if (sessionToken) {
      loadScanHistory();
    }
  }, [sessionToken, loadScanHistory]);
  
  const handleScanMaterials = () => navigation.navigate('Capture');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        <View style={styles.mainCard}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Material Box ({items.length})</Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                {item.uri ? (
                  <Image source={{ uri: item.uri }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: '#f3f4f6' }]} />
                )}
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                </View>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>

      {/* Scan Materials Button */}
      <View style={styles.bottomActions}>
        <Pressable style={styles.bigCta} onPress={handleScanMaterials}>
          <Text style={styles.bigCtaText}>📷  Scan Your Materials Now</Text>
        </Pressable>
      </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FAEAB1' 
  },
  container: { 
    flex: 1,
    padding: 20,
  },
  mainCard: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F5DEB3',
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  header: { 
    fontWeight: '800', 
    fontSize: 18, 
    color: '#8B4513' 
  },
  card: { 
    backgroundColor: '#F5DEB3', 
    borderRadius: 12, 
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBC46C',
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  thumb: { 
    width: 54, 
    height: 40, 
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  labelContainer: { 
    flex: 1 
  },
  label: { 
    fontWeight: '700', 
    fontSize: 15, 
    color: '#8B4513' 
  },
  quantityDisplay: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBC46C',
  },
  quantityText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#8B7355',
  },
  bottomActions: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 80,
  },
  bigCta: { 
    backgroundColor: '#8B4513', 
    borderRadius: 20, 
    padding: 16, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bigCtaText: { 
    color: '#FFE4C8', 
    fontWeight: '700', 
    fontSize: 15, 
    textAlign: 'center' 
  },
});
