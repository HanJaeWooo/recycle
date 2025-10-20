// Web platform YouTube player using iframe
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface YouTubePlayerProps {
  videoId: string;
  height?: number;
  play?: boolean;
}

export default function YouTubePlayerWrapper({ videoId, height = 250, play = true }: YouTubePlayerProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${play ? 1 : 0}&rel=0`;

  return (
    <View style={[styles.container, { height }]}>
      <iframe
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video player"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
