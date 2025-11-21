import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '@/store/useProjectStore';
import { colors, radii } from '@/utils/theme';
import { images } from '@/assets/images';

export default function ProjectHistoryScreen() {
  const navigation = useNavigation();
  const completedProjects = useProjectStore((s) => s.completedProjects);
  const removeProject = useProjectStore((s) => s.removeProject);

  // Log current projects when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('📊 ProjectHistory screen focused. Projects:', completedProjects.length);
      completedProjects.forEach(p => {
        console.log('  - Project:', p.projectTitle, 'Material:', p.material);
      });
    }, [completedProjects])
  );

  const getMaterialEmoji = (material: string): string => {
    const materialLower = material.toLowerCase();
    
    // Match exact material names from ideas.ts
    if (materialLower.includes('bottle caps')) return '🔵';
    if (materialLower.includes('cardboard')) return '📦';
    if (materialLower.includes('chiffon')) return '🧵';
    if (materialLower.includes('copper')) return '🟠';
    if (materialLower.includes('corduroy')) return '🧵';
    if (materialLower.includes('cotton')) return '🧵';
    if (materialLower.includes('denim')) return '👖';
    if (materialLower.includes('hanger')) return '🧥';
    if (materialLower.includes('metal') || materialLower.includes('can')) return '🔩';
    if (materialLower.includes('plastic bottle')) return '🧴';
    if (materialLower.includes('cup')) return '🥤';
    if (materialLower.includes('utensil')) return '🍴';
    if (materialLower.includes('wood')) return '🪵';
    if (materialLower.includes('paper')) return '📄';
    if (materialLower.includes('glass')) return '🫙';
    
    // Fallback for broader categories
    if (materialLower.includes('textile') || materialLower.includes('fabric')) return '🧵';
    if (materialLower.includes('plastic')) return '🧴';
    
    return '♻️'; // Default recycling emoji
  };

  const toImageSource = (imageStr?: string) => {
    if (!imageStr) return undefined;
    if (imageStr.startsWith('local:video:')) return undefined;
    if (imageStr.startsWith('local:project:')) {
      const key = imageStr.split(':').pop() as keyof typeof images.projectIdeas;
      return images.projectIdeas[key] as any;
    }
    return { uri: imageStr };
  };

  const handleDeleteProject = async (id: string, title: string) => {
    console.log('🗑️ Delete clicked for:', title, 'ID:', id);
    
    // Direct delete without confirmation (same as Mark as Done)
    try {
      console.log('Removing project...');
      await removeProject(id);
      console.log('✅ Project removed successfully');
      
      // Verify removal
      const remaining = useProjectStore.getState().completedProjects;
      console.log('📊 Remaining projects:', remaining.length);
    } catch (error) {
      console.error('❌ Failed to remove project:', error);
      Alert.alert('Error', 'Failed to remove project. Please try again.');
    }
  };

  const renderProjectItem = ({ item }: { item: any }) => {
    const imageSource = toImageSource(item.image);
    
    return (
      <View style={styles.projectCard}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.projectImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.projectImagePlaceholder}>
            <Text style={styles.projectEmoji}>{getMaterialEmoji(item.material)}</Text>
          </View>
        )}
        <View style={styles.projectInfo}>
        <View style={styles.projectHeader}>
          <View style={styles.projectTextContainer}>
            <Text style={styles.projectTitle} numberOfLines={2}>
              {item.projectTitle}
            </Text>
            <Text style={styles.projectMaterial}>{item.material}</Text>
            <Text style={styles.completedDate}>
              Completed: {new Date(item.completedAt).toLocaleDateString()}
            </Text>
          </View>
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteProject(item.id, item.projectTitle)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      </View>
    </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.headerTitle}>Finished Projects</Text>
          <View style={{ width: 24 }} />
        </View>

        {completedProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Completed Projects</Text>
            <Text style={styles.emptyText}>
              Start a project and mark it as done to track your progress!
            </Text>
            <Pressable
              style={styles.exploreButton}
              onPress={() => {
                console.log('🔍 Explore Projects clicked');
                try {
                  // Navigate back to main screen which will show Library tab
                  navigation.goBack();
                  console.log('✅ Navigation triggered - going back to main');
                } catch (error) {
                  console.error('❌ Navigation failed:', error);
                }
              }}
            >
              <Text style={styles.exploreButtonText}>Explore Projects</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{completedProjects.length}</Text>
                <Text style={styles.statLabel}>Projects Completed</Text>
              </View>
            </View>

            <FlatList
              data={completedProjects}
              renderItem={renderProjectItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statBox: {
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
  },
  statLabel: {
    fontSize: 16,
    color: 'white',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // Extra space for tab bar
  },
  projectCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  projectImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  projectImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  projectEmoji: {
    fontSize: 80,
    textAlign: 'center',
    lineHeight: 80,
  },
  projectInfo: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  projectTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  projectMaterial: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
