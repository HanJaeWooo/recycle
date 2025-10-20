import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Animated, Modal, Linking } from 'react-native';
import { colors, radii } from '@/utils/theme';
import { getIdeasForMaterial, Idea, searchYouTubeVideos } from '@/services/ideas';
import { useRoute } from '@react-navigation/native';
import { images } from '@/assets/images';
import VideoViewer from '@/components/VideoViewer';
import { getVideoById } from '@/services/videoMapping';

export default function IdeaListScreen() {
  const route = useRoute<any>();
  const material = (route.params?.material as string | undefined) ?? 'all';
  const ideas = getIdeasForMaterial(material);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  // Auto-open video search if no ideas found for non-'all' materials
  React.useEffect(() => {
    if (ideas.length === 0 && material !== 'all') {
      // Automatically create a search idea and open video viewer
      const searchIdea: Idea = {
        id: 'auto-search',
        title: `${material} DIY Projects`,
        description: `DIY and upcycling ideas for ${material}`,
        material: material,
      };
      setSelectedIdea(searchIdea);
      setVideoModalVisible(true);
    }
  }, [material, ideas.length]);

  const handleShowGuidelines = (idea: Idea) => {
    setSelectedIdea(idea);
    setVideoModalVisible(true);
  };

  const closeVideoModal = () => {
    setVideoModalVisible(false);
    setSelectedIdea(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PROJECT IDEAS{material !== 'all' ? ` • ${material}` : ''}</Text>
      {ideas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Searching YouTube for {material} tutorials...</Text>
          <Text style={styles.emptySubtitle}>We'll find the best DIY tutorials for you</Text>
          <Pressable 
            style={styles.cta} 
            onPress={() => {
              // Automatically open VideoViewer with the material name
              // This will trigger YouTube API search
              setSelectedIdea({
                id: 'search',
                title: `${material} DIY Projects`,
                description: `DIY and upcycling ideas for ${material}`,
                material: material,
              });
              setVideoModalVisible(true);
            }}
          >
            <Text style={styles.ctaText}>Find {material} Tutorials →</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={ideas}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item, index }) => (
            <IdeaCard
              item={item}
              index={index}
              onPress={() => handleShowGuidelines(item)}
            />
          )}
        />
      )}

      <Modal
        visible={videoModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideoModal}
      >
        {selectedIdea && (
          <VideoViewer
            projectTitle={selectedIdea.title}
            material={selectedIdea.material}
            onClose={closeVideoModal}
          />
        )}
      </Modal>
    </View>
  );
}

function IdeaCard({ item, index, onPress }: { item: Idea; index: number; onPress: () => void }) {
  const toSource = () => {
    if (item.image?.startsWith('local:project:')) {
      const key = item.image.split(':').pop() as keyof typeof images.projectIdeas;
      return images.projectIdeas[key] as any;
    }
    if (item.image?.startsWith('local:video:')) {
      // Get video ID from the image string (e.g., 'local:video:bottle-caps-1')
      const videoId = item.image.split(':').pop();
      const video = videoId ? getVideoById(videoId) : undefined;
      if (video?.thumbnailPath) {
        return { uri: video.thumbnailPath };
      }
      // Fallback to undefined if no thumbnail found
      return undefined;
    }
    return item.image ? ({ uri: item.image } as any) : undefined;
  };
  const fade = new Animated.Value(0);
  const translateY = new Animated.Value(12);
  Animated.timing(fade, { toValue: 1, duration: 350, delay: 60 * index, useNativeDriver: true }).start();
  Animated.timing(translateY, { toValue: 0, duration: 350, delay: 60 * index, useNativeDriver: true }).start();
  return (
    <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY }] }] }>
      {item.image ? (
        <View style={styles.imageWrap}>
          <Image source={toSource()} style={styles.image} resizeMode="contain" />
        </View>
      ) : null}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Pressable style={styles.cta} onPress={onPress}>
        <Text style={styles.ctaText}>Show me the guidelines →</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 14 },
  title: { fontWeight: '800', marginBottom: 12 },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 32,
    gap: 16 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    textAlign: 'center' 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: '#6b7280', 
    textAlign: 'center' 
  },
  card: { backgroundColor: 'white', borderRadius: radii.l, padding: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontWeight: '800', marginTop: 8, fontSize: 16 },
  imageWrap: { width: '100%', height: 200, backgroundColor: '#111', borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  cta: { marginTop: 10, backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 24, borderRadius: radii.pill, alignItems: 'center' },
  ctaText: { color: 'white', fontWeight: '700' },
});


