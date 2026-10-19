import { useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';
import { parseNowPlaying } from '../utils/nowPlaying';

type RadioStatus = ReturnType<typeof useAudioPlayerStatus> & {
  // Added on Android by plugins/withRadioMetadata.js; absent in Expo Go.
  radioStreamTitle?: string | null;
};

export function useNowPlaying(player: AudioPlayer) {
  const status: RadioStatus = useAudioPlayerStatus(player);
  const nowPlaying = parseNowPlaying(status.radioStreamTitle);
  return { status, nowPlaying };
}
