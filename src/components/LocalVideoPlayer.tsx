// Platform-agnostic export for LocalVideoPlayer
// React Native will automatically pick .native.tsx for mobile and .web.tsx for web
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface LocalVideoPlayerProps {
  videoPath: string;
  style?: StyleProp<ViewStyle>;
  onError?: () => void;
}

// This is a placeholder that React Native's bundler will replace
// with the correct platform-specific implementation
const LocalVideoPlayer: React.FC<LocalVideoPlayerProps> = () => {
  throw new Error('LocalVideoPlayer should be replaced by platform-specific implementation');
};

export default LocalVideoPlayer;
