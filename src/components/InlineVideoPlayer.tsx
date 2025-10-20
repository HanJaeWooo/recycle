import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { colors, radii } from '@/utils/theme';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { getRandomVideoForMaterial, LocalVideo } from '@/services/videoMapping';

interface InlineVideoPlayerProps {
  projectTitle: string;
  material: string;
  isVisible: boolean;
}

export default function InlineVideoPlayer({ projectTitle, material, isVisible }: InlineVideoPlayerProps) {
  const [videoData, setVideoData] = useState<LocalVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (isVisible && !videoData && !loading) {
      loadLocalVideo();
    }
  }, [isVisible, projectTitle, material]);

  const loadLocalVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get a video for the material
      const video = getRandomVideoForMaterial(material);
      
      if (!video) {
        throw new Error('No video found for this material');
      }

      setVideoData(video);
    } catch (err) {
      console.error('Video Loading Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tutorial...</Text>
        </View>
      </View>
    );
  }

  if (error || !videoData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load video</Text>
          <Pressable style={styles.retryButton} onPress={loadLocalVideo}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={typeof videoData.videoPath === 'string' ? { uri: videoData.videoPath } : videoData.videoPath}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
            if (!status.isLoaded && 'error' in status) {
              console.error('Video playback error:', status.error);
              setError('Failed to play video');
            }
          }}
        />
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{videoData.title}</Text>
        <Text style={styles.channelName}>Local Tutorial</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: radii.l,
    overflow: 'hidden',
    marginTop: 8,
  },
  videoContainer: {
    width: '100%',
    height: 250,
    maxHeight: 300,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
