import { useRoute, useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '@/navigation/types';
import { RouteProp } from '@react-navigation/native';
import { getIdeasForMaterial } from '@/services/ideas';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getVideosForMaterial } from '@/services/videoMapping';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type LibraryScreenRouteProp = RouteProp<TabParamList, 'Library'>;
type LibraryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Library'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function LibraryScreen() {
  const route = useRoute<LibraryScreenRouteProp>();
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const material = route.params?.material || 'all';

  const ideas = getIdeasForMaterial(material.toLowerCase());
  const localVideos = getVideosForMaterial(material.toLowerCase());
  const hasLocalVideos = localVideos.length > 0;

  return (
    <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        {/* --- Header --- */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#8B4513" />
          </Pressable>
          <Text style={styles.headerTitle}>{material} Projects</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* --- Project List --- */}
        <FlatList
          data={ideas}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                // Check if THIS specific project has a local video
                const hasLocalVideo = item.image?.startsWith('local:video:');
                
                if (hasLocalVideo) {
                  // Has local video, go to IdeaDetail
                  navigation.navigate('IdeaDetail', { id: item.id });
                } else {
                  // No local video, search YouTube with project title
                  navigation.navigate('YouTubeVideoList', {
                    material: material,
                    projectTitle: item.title,
                  });
                }
              }}
            >
              <View style={styles.cardContent}>
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={30}
                  color="#8B7355"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#A0522D" />
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No local projects found for {material}</Text>
              <Pressable
                style={styles.youtubeButton}
                onPress={() => {
                  navigation.navigate('YouTubeVideoList', {
                    material: material,
                    projectTitle: `${material} DIY Projects`,
                  });
                }}
              >
                <Ionicons name="logo-youtube" size={20} color="white" />
                <Text style={styles.youtubeButtonText}>Search YouTube</Text>
              </Pressable>
            </View>
          }
        />
      </LinearGradient>
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
    marginBottom: 16,
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for tab bar
  },
  card: {
    backgroundColor: '#FFF8DC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#8B7355',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardDesc: {
    fontSize: 14,
    color: '#475569',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8B7355',
    fontWeight: '600',
    marginBottom: 16,
  },
  youtubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  youtubeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
