import { StyleProp, ViewStyle } from 'react-native';

export interface LocalVideoPlayerProps {
  videoPath: string;
  style?: StyleProp<ViewStyle>;
  onError?: () => void;
}

declare const LocalVideoPlayer: React.FC<LocalVideoPlayerProps>;
export default LocalVideoPlayer;
