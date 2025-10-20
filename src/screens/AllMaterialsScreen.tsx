import { useNavigation, CommonActions } from '@react-navigation/native';
import { View, Text, Pressable, StyleSheet, FlatList, StatusBar } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '@/navigation/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type AllMaterialsScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'AllMaterials'>,
  BottomTabNavigationProp<TabParamList>
>;

const allCategories = [
  { id: 'plastic', title: 'Plastic', emoji: '♻️', borderColor: '#60A5FA' },
  { id: 'metal', title: 'Metal', emoji: '🔩', borderColor: '#C084FC' },
  { id: 'cardboard', title: 'Cardboard', emoji: '📦', borderColor: '#FBBF24' },
  { id: 'wood', title: 'Wood', emoji: '🪵', borderColor: '#92400E' },
  { id: 'textile', title: 'Organic', emoji: '🍎', borderColor: '#4ADE80' },
  { id: 'hangers', title: 'Hangers', emoji: '👗', borderColor: '#F59E0B' },
  { id: 'utensils', title: 'Utensils', emoji: '🔪', borderColor: '#EF4444' },
  { id: 'bottlecaps', title: 'Cups', emoji: '🥤', borderColor: '#FB923C' },
];

export default function AllMaterialsScreen() {
  const navigation = useNavigation<AllMaterialsScreenNavigationProp>();

  return (
    <>
      <StatusBar hidden={true} />
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        {/* --- Header --- */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#8B4513" />
          </Pressable>
          <Text style={styles.headerTitle}>All Materials</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.subtitle}>Select a material to explore upcycling ideas</Text>

        {/* --- Materials Grid --- */}
        <FlatList
          data={allCategories}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={styles.gridColumns}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { borderColor: item.borderColor }]}
              onPress={() => {
                // Navigate to Main tabs, then to Library with material
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Main',
                        state: {
                          routes: [
                            { name: 'Home' },
                            { name: 'Capture' },
                            { name: 'Library', params: { material: item.title } },
                            { name: 'History' },
                          ],
                          index: 2, // Library tab
                        },
                      },
                    ],
                  })
                );
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  backBtn: {
    backgroundColor: '#F5DEB3',
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B4513',
  },
  subtitle: {
    textAlign: 'center',
    color: '#8B7355',
    fontSize: 15,
    marginBottom: 16,
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
