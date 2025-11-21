import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { searchYouTubeVideos, YouTubeVideo } from '@/services/youtubeApi';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import YouTubePlayerWrapper from '@/components/YouTubePlayer';
import { getIdeasForMaterial } from '@/services/ideas';
import { useProjectStore } from '@/store/useProjectStore';

export default function YouTubeVideoListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const material = route.params?.material || '';
  const projectTitle = route.params?.projectTitle || `${material} DIY Projects`;

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // Get project details
  const ideas = getIdeasForMaterial(material.toLowerCase());
  const projectIdea = ideas.find(idea => idea.title === projectTitle) || ideas[0];
  
  // Project completion tracking - track per VIDEO, not per project
  const markAsComplete = useProjectStore((s) => s.markAsComplete);
  const isProjectCompleted = useProjectStore((s) => s.isProjectCompleted);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if CURRENT VIDEO is completed (not just the project)
  useEffect(() => {
    const activeVideo = videos[currentVideoIndex];
    if (projectIdea && activeVideo) {
      // Create unique ID for this specific video tutorial
      const videoSpecificId = `${projectIdea.id}-${activeVideo.videoId}`;
      setIsCompleted(isProjectCompleted(videoSpecificId));
      console.log('📹 Checking completion for video:', activeVideo.title, 'ID:', videoSpecificId, 'Completed:', isProjectCompleted(videoSpecificId));
    }
  }, [projectIdea, videos, currentVideoIndex, isProjectCompleted]);

  useEffect(() => {
    loadYouTubeVideos();
  }, [projectTitle]); // Re-search when project title changes

  const loadYouTubeVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use projectTitle directly (as shown in OnboardingScreen)
      // This ensures we search for the exact tutorial title like:
      // "Cellphone Stand made from Bottle Caps", "Cat Scratcher made from Cardboard", etc.
      const searchQuery = projectTitle;
      const result = await searchYouTubeVideos(searchQuery);

      if (result.error) {
        setError(result.error);
      } else if (result.videos.length === 0) {
        setError('No videos found for this tutorial');
      } else {
        setVideos(result.videos);
        setCurrentVideoIndex(0); // Set first video as current
      }
    } catch (err) {
      console.error('Error loading YouTube videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleOpenInYouTube = (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(url);
  };

  const handleMarkAsDone = async () => {
    if (!projectIdea || !currentVideo) return;
    
    console.log('🔥 Mark as Done clicked! Video:', currentVideo.title, 'Completed:', isCompleted);
    console.log('✅ Button press registered!');
    
    if (isCompleted) {
      console.log('⚠️ This video already completed');
      Alert.alert('Already Completed', 'This video tutorial has already been marked as done!');
      return;
    }

    console.log('🚀 Marking YouTube video as complete...');
    
    try {
      // Create unique ID for this specific video tutorial
      const videoSpecificId = `${projectIdea.id}-${currentVideo.videoId}`;
      const videoTitle = `${projectIdea.title} - ${currentVideo.title.substring(0, 50)}`;
      
      console.log('📤 Calling markAsComplete with:', {
        projectId: videoSpecificId,
        projectTitle: videoTitle,
        material: material,
        videoId: currentVideo.videoId,
      });
      
      await markAsComplete({
        projectId: videoSpecificId,
        projectTitle: videoTitle,
        material: material,
        image: projectIdea.image, // Use project's original image, not YouTube thumbnail
        videoPath: `https://youtube.com/watch?v=${currentVideo.videoId}`,
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
        `Video tutorial marked as completed!\n\nView in: Settings → Finished Projects`,
        [
          { text: 'OK', onPress: () => console.log('Success dialog dismissed') },
          { 
            text: 'View Projects', 
            onPress: () => {
              console.log('🔄 Navigating to ProjectHistory');
              navigation.navigate('ProjectHistory' as never);
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error marking video as complete:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      Alert.alert(
        'Error', 
        `Failed to mark video as done.\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nCheck console for details.`
      );
    }
  };

  const currentVideo = videos[currentVideoIndex];

  if (loading) {
    return (
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </Pressable>
          <Text style={styles.headerTitle}>{projectTitle}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Searching YouTube for tutorials...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </Pressable>
          <Text style={styles.headerTitle}>{projectTitle}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadYouTubeVideos}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FAEAB1', '#EBC46C']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8B4513" />
        </Pressable>
        <Text style={styles.headerTitle}>{projectTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Steps Section */}
        {projectIdea?.steps && projectIdea.steps.length > 0 && (
          <View style={styles.stepsCard}>
            <Text style={styles.sectionTitle}>STEPS TO BUILD THE PROJECT</Text>
            <Text style={styles.materialsTitle}>Materials Needed:</Text>
            <Text style={styles.materialsList}>• {material} materials</Text>
            {projectIdea.steps.map((step, index) => (
              <Text key={index} style={styles.materialsList}>• {step}</Text>
            ))}
          </View>
        )}

        {/* Main Video Player */}
        <View style={styles.mainVideoSection}>
          <Text style={styles.videoSectionTitle}>Video Tutorial</Text>
          {currentVideo && (
            <View style={styles.mainVideoContainer}>
              <YouTubePlayerWrapper
                videoId={currentVideo.videoId}
                height={220}
                play={false}
              />
              <View style={styles.mainVideoInfo}>
                <Text style={styles.mainVideoTitle} numberOfLines={2}>
                  {currentVideo.title}
                </Text>
                <Text style={styles.channelText}>{currentVideo.channelTitle}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Mark as Done Button */}
        {projectIdea && (
          <Pressable 
            style={({ pressed }) => [
              styles.markDoneButton, 
              isCompleted && styles.markDoneButtonCompleted,
              pressed && !isCompleted && styles.markDoneButtonPressed
            ]}
            onPress={handleMarkAsDone}
            disabled={isCompleted}
            android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
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
        )}

        {/* More Tutorials Section */}
        <View style={styles.moreTutorialsSection}>
          <View style={styles.moreTutorialsHeader}>
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <Text style={styles.moreTutorialsTitle}>More Tutorials from YouTube</Text>
          </View>

          {videos.map((video, index) => (
            <Pressable
              key={video.id}
              style={styles.thumbnailCard}
              onPress={() => handleVideoSelect(index)}
            >
              <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnailImage} />
              <View style={styles.playOverlay}>
                <Ionicons name="play-circle" size={40} color="white" />
              </View>
              <View style={styles.thumbnailInfo}>
                <Text style={styles.thumbnailTitle} numberOfLines={2}>
                  {video.title}
                </Text>
                <Text style={styles.thumbnailChannel}>{video.channelTitle}</Text>
              </View>
            </Pressable>
          ))}

          {/* View All Button */}
          <Pressable
            style={styles.viewAllButton}
            onPress={() => currentVideo && handleOpenInYouTube(currentVideo.videoId)}
          >
            <Text style={styles.viewAllText}>View All Related Tutorials</Text>
            <Ionicons name="chevron-forward" size={20} color="#8B4513" />
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: '#F5DEB3',
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#8B4513',
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
  },
  stepsCard: {
    backgroundColor: '#FFF8DC',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 12,
  },
  materialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  materialsList: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 20,
  },
  mainVideoSection: {
    marginBottom: 8,
  },
  videoSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B4513',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  mainVideoContainer: {
    backgroundColor: '#000',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainVideoInfo: {
    backgroundColor: '#FFF8DC',
    padding: 12,
  },
  mainVideoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  moreTutorialsSection: {
    marginTop: 16,
    paddingBottom: 24,
  },
  moreTutorialsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  moreTutorialsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  thumbnailCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFF8DC',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 120,
    height: 90,
    backgroundColor: '#000',
  },
  playOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 120,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  thumbnailInfo: {
    flex: 1,
    padding: 12,
  },
  thumbnailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  thumbnailChannel: {
    fontSize: 12,
    color: '#64748b',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F5DEB3',
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginRight: 4,
  },
  channelText: {
    fontSize: 13,
    color: '#64748b',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B7355',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  markDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 20,
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
