// Native platform YouTube player wrapper
import React from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';

interface YouTubePlayerProps {
  videoId: string;
  height?: number;
  play?: boolean;
}

export default function YouTubePlayerWrapper({ videoId, height = 250, play = true }: YouTubePlayerProps) {
  return (
    <YoutubePlayer
      height={height}
      videoId={videoId}
      play={play}
    />
  );
}
