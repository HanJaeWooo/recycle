import { useNavigation } from '@react-navigation/native';
import { View, Text, Pressable, StyleSheet, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '@/navigation/types';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const featuredCategories = [
  { id: 'plastic', title: 'Plastic', emoji: '🧴', borderColor: '#60A5FA' },
  { id: 'metal', title: 'Metal', emoji: '🔩', borderColor: '#C084FC' },
  { id: 'cardboard', title: 'Cardboard', emoji: '📦', borderColor: '#FBBF24' },
  { id: 'textile', title: 'Fabric', emoji: '🧵', borderColor: '#4ADE80' },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        {/* --- Scan Section --- */}
        <View style={styles.scanSection}>
          <LinearGradient colors={['#D2691E', '#8B4513']} style={styles.scanCard}>
            <View style={styles.scanContent}>
              <View>
                <Text style={styles.scanTitle}>Scan & Identify</Text>
                <Text style={styles.scanSubtitle}>Point camera at material</Text>
              </View>
              <Pressable style={styles.scanButton} onPress={() => navigation.navigate('Capture')}>
                <Ionicons name="scan-circle" size={52} color="#ffffff" />
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* --- Materials Header --- */}
        <View style={styles.materialsHeader}>
          <Text style={styles.materialsTitle}>Materials</Text>
          <Pressable style={styles.viewAllBtn} onPress={() => navigation.navigate('AllMaterials')}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#8B7355" />
          </Pressable>
        </View>

        {/* --- Materials Grid --- */}
        <FlatList
          data={featuredCategories}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={styles.gridColumns}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { borderColor: item.borderColor }]}
              onPress={() => {
                // Navigate to Library tab with material parameter
                navigation.navigate('Library', { material: item.title });
              }}
            >
              <View style={styles.cardContent}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            </Pressable>
          )}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAEAB1' }, // Match gradient top color
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scanSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  scanCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scanContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  scanSubtitle: {
    color: '#F5DEB3',
    fontSize: 16,
  },
  scanButton: {
    padding: 8,
  },
  materialsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  materialsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B4513',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5DEB3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllText: {
    color: '#8B7355',
    fontWeight: '600',
  },
  gridColumns: {
    gap: 12,
    paddingHorizontal: 20,
  },
  grid: {
    gap: 12,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 3,
    borderBottomWidth: 5,
    minHeight: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
});
