import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { colors, radii } from '@/utils/theme';
import { getRandomVideoForMaterial, LocalVideo } from '@/services/videoMapping';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

interface VideoViewerProps {
  projectTitle: string;
  material?: string;
  onClose: () => void;
}

export default function VideoViewer({ projectTitle, material, onClose }: VideoViewerProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [videoData, setVideoData] = useState<LocalVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noLocalVideo, setNoLocalVideo] = useState(false);

  useEffect(() => {
    loadLocalVideo();
  }, [projectTitle, material]);

  const loadLocalVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoLocalVideo(false);

      // Extract material from project title if not provided
      const materialToUse = material || extractMaterialFromTitle(projectTitle);
      
      // Get a video for the material
      const video = getRandomVideoForMaterial(materialToUse);
      
      if (!video) {
        // No local video found - redirect to YouTube
        setNoLocalVideo(true);
        setLoading(false);
        return;
      }

      setVideoData(video);
    } catch (err) {
      console.error('Video Loading Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract material from project title
  const extractMaterialFromTitle = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    const materials = ['plastic', 'cardboard', 'cotton', 'metal', 'wood', 'denim', 'copper', 'corduroy', 'chiffon', 'hanger', 'utensils'];
    for (const mat of materials) {
      if (lowerTitle.includes(mat)) {
        return mat;
      }
    }
    return 'plastic'; // default
  };

  const handleSearchYouTube = () => {
    const materialToUse = material || extractMaterialFromTitle(projectTitle);
    onClose(); // Close the current modal
    navigation.navigate('YouTubeVideoList', {
      material: materialToUse,
      projectTitle: projectTitle,
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tutorial video...</Text>
        </View>
      );
    }

    if (noLocalVideo) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>No local video available</Text>
          <Text style={styles.infoSubtext}>Would you like to search YouTube for tutorials?</Text>
          <Pressable style={styles.youtubeSearchButton} onPress={handleSearchYouTube}>
            <Text style={styles.youtubeSearchText}>Search YouTube</Text>
          </Pressable>
        </View>
      );
    }

    if (error || !videoData) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Unable to load video</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadLocalVideo}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
          <Pressable style={[styles.retryButton, { marginTop: 12, backgroundColor: '#dc2626' }]} onPress={handleSearchYouTube}>
            <Text style={styles.retryText}>Search YouTube Instead</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <>
        <View style={styles.videoContainer}>
          <LocalVideoPlayer
            videoPath={videoData.videoPath}
            style={styles.video}
            onError={() => setError('Failed to play video')}
          />
        </View>

        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{videoData.title}</Text>
          <Text style={styles.channelName}>Local Tutorial</Text>
          <Text style={styles.videoDescription}>Material: {videoData.material}</Text>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tutorial: {projectTitle}</Text>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
    margin: 16,
    borderRadius: radii.l,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoInfo: {
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: radii.l,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  channelName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
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
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  youtubeSearchButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  youtubeSearchText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
