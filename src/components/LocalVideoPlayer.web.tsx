// Web-specific video player using HTML5 video element
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface LocalVideoPlayerProps {
  videoPath: string;
  style?: any;
}

export default function LocalVideoPlayer({ videoPath, style }: LocalVideoPlayerProps) {
  return (
    <View style={[styles.container, style]}>
      <video
        controls
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000',
        }}
        src={videoPath}
      >
        Your browser does not support the video tag.
      </video>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
});
