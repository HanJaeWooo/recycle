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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { searchYouTubeVideos, YouTubeVideo } from '@/services/youtubeApi';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import YouTubePlayerWrapper from '@/components/YouTubePlayer';
import { getIdeasForMaterial } from '@/services/ideas';

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

      <ScrollView style={styles.scrollView}>
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
});
