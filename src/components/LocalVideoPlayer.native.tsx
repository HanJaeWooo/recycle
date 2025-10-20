// Native video player using expo-av
import React, { useRef } from 'react';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

interface LocalVideoPlayerProps {
  videoPath: string;
  style?: any;
  onError?: () => void;
}

export default function LocalVideoPlayer({ videoPath, style, onError }: LocalVideoPlayerProps) {
  const videoRef = useRef<Video>(null);

  return (
    <Video
      ref={videoRef}
      source={typeof videoPath === 'string' ? { uri: videoPath } : videoPath}
      style={style}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
      isLooping={false}
      shouldPlay={true}
      onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
        if (!status.isLoaded && 'error' in status) {
          console.error('Video playback error:', status.error);
          onError?.();
        }
      }}
    />
  );
}
