import { View, Text, StyleSheet, Image, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { colors, radii } from '@/utils/theme';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import { getIdeasForMaterial } from '@/services/ideas';
import { getRandomVideoForMaterial, LocalVideo } from '@/services/videoMapping';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { images } from '@/assets/images';
import { Ionicons } from '@expo/vector-icons';
import { searchYouTubeVideos, YouTubeVideo } from '@/services/youtubeApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProjectStore } from '@/store/useProjectStore';

export default function IdeaDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'IdeaDetail'>>();
  const navigation = useNavigation();
  const id = route.params.id;
  const item = getIdeasForMaterial('all').find((i) => i.id === id);

  if (!item) return null;

  const toImageSource = () => {
    // Skip local:video: prefixed images (these are video thumbnails, not actual images)
    if (item.image?.startsWith('local:video:')) {
      return undefined;
    }
    if (item.image?.startsWith('local:project:')) {
      const key = item.image.split(':').pop() as keyof typeof images.projectIdeas;
      return images.projectIdeas[key] as any;
    }
    return item.image ? ({ uri: item.image } as any) : undefined;
  };

  const [videoData, setVideoData] = useState<LocalVideo | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [loadingYoutube, setLoadingYoutube] = useState(false);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const markAsComplete = useProjectStore((s) => s.markAsComplete);
  const isProjectCompleted = useProjectStore((s) => s.isProjectCompleted);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsCompleted(isProjectCompleted(item.id));
  }, [item.id, isProjectCompleted]);

  useEffect(() => {
    const video = getRandomVideoForMaterial(item.material);
    if (video) {
      setVideoData(video);
    }
    
    // Load YouTube suggestions
    loadYouTubeSuggestions();
  }, [item.material]);

  const loadYouTubeSuggestions = async () => {
    try {
      setLoadingYoutube(true);
      // Use the project title directly (as shown in OnboardingScreen)
      // This gives better YouTube search results
      const searchQuery = item.title;
      const response = await searchYouTubeVideos(searchQuery);
      setYoutubeVideos(response.videos.slice(0, 3)); // Show top 3 suggestions
    } catch (error) {
      console.error('Failed to load YouTube suggestions:', error);
    } finally {
      setLoadingYoutube(false);
    }
  };

  const handleYouTubeVideoPress = (video: YouTubeVideo) => {
    nav.navigate('YouTubeVideoList', {
      material: item.material,
      projectTitle: item.title,
    });
  };

  const handleMarkAsDone = async () => {
    console.log('🔥 Mark as Done clicked! Project:', item.title, 'Completed:', isCompleted);
    console.log('✅ Button press registered!');
    
    if (isCompleted) {
      console.log('⚠️ Project already completed');
      Alert.alert('Already Completed', 'This project has already been marked as done!');
      return;
    }

    console.log('🚀 Marking project as complete DIRECTLY (no confirmation)...');
    
    try {
      console.log('📤 Calling markAsComplete with:', {
        projectId: item.id,
        projectTitle: item.title,
        material: item.material,
      });
      
      await markAsComplete({
        projectId: item.id,
        projectTitle: item.title,
        material: item.material,
        image: undefined, // Don't save image - use emoji icon instead
        videoPath: videoData?.videoPath,
      });
      
      console.log('✅ markAsComplete returned successfully');
      setIsCompleted(true);
      console.log('✅ setIsCompleted(true) called');
      
      // Give state time to update
      setTimeout(() => {
        const currentProjects = useProjectStore.getState().completedProjects;
        console.log('📊 Current completed projects count:', currentProjects.length);
        currentProjects.forEach(p => console.log('  - ', p.projectTitle));
      }, 100);
      
      Alert.alert(
        '✅ Success!', 
        `"${item.title}" marked as completed!\n\nView in: Settings → Finished Projects`,
        [
          { text: 'OK', onPress: () => console.log('Success dialog dismissed') },
          { 
            text: 'View Projects', 
            onPress: () => {
              console.log('🔄 Navigating to ProjectHistory');
              nav.navigate('ProjectHistory');
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error marking project as complete:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      Alert.alert(
        'Error', 
        `Failed to mark project as done.\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nCheck console for details.`
      );
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* ✅ Back Button */}
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Text style={styles.title}>STEPS TO BUILD THE PROJECT</Text>

      <Text style={styles.sub}>Instructions:</Text>
      {item.steps?.map((s, i) => (
        <Text key={i} style={styles.step}>{i + 1}. {s}</Text>
      ))}

      <Text style={[styles.sub, { marginTop: 14 }]}>Video Tutorial</Text>
      {videoData ? (
        <View style={styles.videoBox}>
          <LocalVideoPlayer
            videoPath={videoData.videoPath}
            style={styles.video}
            onError={() => setVideoError(true)}
          />
        </View>
      ) : (
        <Text style={styles.note}>No video available for this material</Text>
      )}

      {toImageSource() ? (
        <View style={styles.detailImageWrap}>
          <Image source={toImageSource()} style={styles.detailImage} resizeMode="contain" />
        </View>
      ) : null}

      {/* Mark as Done Button */}
      <Pressable 
        style={({ pressed }) => [
          styles.markDoneButton, 
          isCompleted && styles.markDoneButtonCompleted,
          pressed && !isCompleted && styles.markDoneButtonPressed
        ]}
        onPress={handleMarkAsDone}
        disabled={isCompleted}
        android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
        testID="mark-done-button"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons 
          name={isCompleted ? "checkmark-circle" : "checkbox-outline"} 
          size={24} 
          color="white" 
        />
        <Text style={styles.markDoneButtonText}>
          {isCompleted ? 'Completed ✓' : 'Mark as Done'}
        </Text>
      </Pressable>

      {/* YouTube Suggestions Section */}
      <View style={styles.suggestionsSection}>
        <View style={styles.suggestionsHeader}>
          <Ionicons name="logo-youtube" size={24} color="#FF0000" />
          <Text style={styles.suggestionsTitle}>More Tutorials from YouTube</Text>
        </View>

        {loadingYoutube ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
        ) : youtubeVideos.length > 0 ? (
          <View style={styles.youtubeList}>
            {youtubeVideos.map((video) => (
              <Pressable
                key={video.videoId}
                style={styles.youtubeCard}
                onPress={() => handleYouTubeVideoPress(video)}
              >
                <Image
                  source={{ uri: video.thumbnailUrl }}
                  style={styles.youtubeThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.youtubeInfo}>
                  <Text style={styles.youtubeTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text style={styles.youtubeChannel} numberOfLines={1}>
                    {video.channelTitle}
                  </Text>
                </View>
              </Pressable>
            ))}
            <Pressable
              style={styles.viewAllButton}
              onPress={() => handleYouTubeVideoPress(youtubeVideos[0])}
            >
              <Text style={styles.viewAllText}>View All YouTube Tutorials</Text>
              <Ionicons name="chevron-forward" size={20} color="#FF0000" />
            </Pressable>
          </View>
        ) : (
          <Text style={styles.noVideosText}>No YouTube suggestions available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: 14, paddingBottom: 100 }, // Extra space for tab bar
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  backText: { color: 'white', fontWeight: '600', marginLeft: 6 },
  title: { fontWeight: '800', marginBottom: 10, fontSize: 16 },
  sub: { fontWeight: '700', marginTop: 6 },
  step: { 
    fontSize: 14, 
    lineHeight: 22, 
    marginVertical: 4,
    color: '#374151',
  },
  videoBox: {
    width: '100%',
    height: 250,
    alignSelf: 'center',
    borderRadius: radii.l,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginTop: 10,
  },
  video: { 
    width: '100%', 
    height: '100%',
  },
  note: { textAlign: 'center', color: '#6b7280', marginTop: 6 },
  detailImageWrap: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    aspectRatio: 16 / 9,
    borderRadius: radii.l,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailImage: { width: '100%', height: '100%' },
  suggestionsSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  youtubeList: {
    gap: 12,
  },
  youtubeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  youtubeThumbnail: {
    width: 120,
    height: 90,
    backgroundColor: '#000',
  },
  youtubeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  youtubeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  youtubeChannel: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8DC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0000',
  },
  noVideosText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 16,
  },
  markDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  markDoneButtonCompleted: {
    backgroundColor: '#6b7280',
  },
  markDoneButtonPressed: {
    backgroundColor: '#059669',
    transform: [{ scale: 0.98 }],
  },
  markDoneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
