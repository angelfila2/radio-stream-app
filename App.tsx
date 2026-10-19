import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  StatusBar as AndroidStatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import { useNowPlaying } from "./hooks/useNowPlaying";
import { station } from "./station";

const streamUrl = station.streamUrl.trim();
const configured = /^https:\/\//i.test(streamUrl);
export default function App() {
  const player = useAudioPlayer(configured ? streamUrl : null);
  useEffect(() => {
    let confirmationOpen = false;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (confirmationOpen) return true;
        confirmationOpen = true;
        Alert.alert(
          `Quit ${station.name}?`,
          "Are you sure you want to quit?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                confirmationOpen = false;
              },
            },
            {
              text: "Yes, quit",
              onPress: () => {
                player.pause();
                confirmationOpen = false;
                BackHandler.exitApp();
              },
            },
          ],
          {
            cancelable: true,
            onDismiss: () => {
              confirmationOpen = false;
            },
          },
        );
        // Consume Back so Android waits for the user's answer.
        return true;
      },
    );
    return () => subscription.remove();
  }, [player]);
  const { status, nowPlaying } = useNowPlaying(player);
  const isPlaying = status.playing;
  const { width, height } = useWindowDimensions();
  const [artworkHeight, setArtworkHeight] = useState(0);
  const compact = height < 740;
  // The artwork uses only the space left after the header and player controls.
  const discSize = Math.max(0, Math.min(width - 92, artworkHeight - 88, 320));
  const discScale = Math.min(1, discSize / 240);
  const playbackLabel = !configured
    ? "Set an authorized HTTPS stream URL in station.ts"
    : status.error
    ? "Unable to connect · tap Play to retry"
    : status.isBuffering
      ? `Connecting to ${station.name}…`
      : isPlaying
        ? "Streaming live"
        : "Paused · tap Play to listen";
  function handlePlaybackPress() {
    if (!configured) return;
    if (isPlaying) {
      player.pause();
    } else {
      // Open a fresh live connection instead of replaying the paused buffer.
      player.replace(streamUrl);
      player.play();
    }
  }
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.backgroundGlow} />
      <View style={[styles.container, compact && styles.compactContainer]}>
        <View style={[styles.header, compact && styles.compactHeader]}>
          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.3}
          >
            {station.name}
          </Text>
          <Text
            style={styles.caption}
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.3}
          >
            {station.tagline}
          </Text>
        </View>

        <View
          style={styles.artworkArea}
          onLayout={({ nativeEvent }) =>
            setArtworkHeight(nativeEvent.layout.height)
          }
        >
          <View
            style={[
              styles.outerRing,
              {
                width: discSize + 36,
                height: discSize + 36,
                borderRadius: (discSize + 36) / 2,
              },
            ]}
          >
            <View
              style={[
                styles.disc,
                {
                  width: discSize,
                  height: discSize,
                  borderRadius: discSize / 2,
                },
              ]}
              accessibilityLabel={`${station.name} station artwork`}
              accessible
            >
              <View style={styles.discInnerRing} />
              <View
                style={[
                  styles.discLabel,
                  { transform: [{ scale: discScale }] },
                ]}
              >
                <Text style={styles.discWordmark}>radio</Text>
                <Text style={styles.discFrequency}>
                  LIVE <Text style={styles.discFm}>ON AIR</Text>
                </Text>
                <View style={styles.discRule} />
                <Text style={styles.discCaption}>STREAMING</Text>
              </View>
            </View>
          </View>
          <View style={styles.liveBadge}>
            <View style={[styles.liveDot, !isPlaying && styles.pausedDot]} />
            <Text style={styles.liveText}>
              {status.isBuffering
                ? "BUFFERING"
                : isPlaying
                  ? "ON AIR"
                  : "LIVE RADIO"}
            </Text>
          </View>
        </View>

        <View style={[styles.playerPanel, compact && styles.compactPanel]}>
          <View
            style={[styles.nowPlaying, compact && styles.compactNowPlaying]}
            accessibilityLiveRegion="polite"
          >
            <Text
              style={styles.eyebrow}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
            >
              {isPlaying ? "NOW PLAYING" : "PAUSED"}
            </Text>
            <Text
              style={styles.songTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
              maxFontSizeMultiplier={1.3}
            >
              {nowPlaying?.title ?? "Live broadcast"}
            </Text>
            <Text
              style={styles.artist}
              numberOfLines={1}
              ellipsizeMode="tail"
              maxFontSizeMultiplier={1.3}
            >
              {nowPlaying?.artist ?? station.tagline}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.playButton,
              pressed && styles.playButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              `${isPlaying ? "Pause" : "Play"} ${station.name}`
            }
            disabled={!configured}
            accessibilityState={{ disabled: !configured }}
            onPress={handlePlaybackPress}
          >
            {status.isBuffering ? (
              <ActivityIndicator color="#10152D" size="large" />
            ) : isPlaying ? (
              <View style={styles.pauseIcon}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
            ) : (
              <View style={styles.playIcon} />
            )}
          </Pressable>
          <Text
            style={styles.buttonLabel}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            {isPlaying ? "Pause" : "Play live"}
          </Text>
          <Text
            style={styles.playbackStatus}
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            {playbackLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#090D1C" },
  backgroundGlow: {
    position: "absolute",
    top: -130,
    left: "-25%",
    width: "150%",
    height: 660,
    borderRadius: 330,
    backgroundColor: "#141D42",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: (AndroidStatusBar.currentHeight ?? 24) + 16,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  compactContainer: {
    paddingTop: (AndroidStatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 32,
  },
  compactHeader: { gap: 4 },
  compactPanel: { gap: 6 },
  compactNowPlaying: { gap: 4, marginBottom: 4 },
  header: { alignItems: "center", width: "100%", gap: 10 },
  eyebrow: {
    color: "#A0ACCE",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
    textAlign: "center",
  },
  title: {
    color: "#F7F5F0",
    fontSize: 29,
    fontWeight: "700",
    textAlign: "center",
  },
  caption: { color: "#B7C0DB", fontSize: 16, textAlign: "center" },
  artworkArea: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  outerRing: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#364777",
  },
  disc: {
    backgroundColor: "#202C55",
    borderWidth: 3,
    borderColor: "#7386C1",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  discInnerRing: {
    position: "absolute",
    width: "88%",
    height: "88%",
    borderRadius: 500,
    borderWidth: 1,
    borderColor: "#3A4976",
  },
  discLabel: { alignItems: "center", gap: 4 },
  discWordmark: {
    color: "#F8E6BC",
    fontSize: 43,
    fontWeight: "700",
    fontStyle: "italic",
    letterSpacing: -2,
  },
  discFrequency: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "300",
    letterSpacing: 2,
  },
  discFm: { fontSize: 15, fontWeight: "700" },
  discRule: {
    width: 32,
    height: 2,
    backgroundColor: "#D8BB82",
    marginVertical: 10,
  },
  discCaption: { color: "#B9C5E6", fontSize: 10, letterSpacing: 4 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#36446D",
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#B8D8BF" },
  pausedDot: { backgroundColor: "#9BA6C4" },
  liveText: {
    color: "#D6DEEF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  playerPanel: { alignItems: "center", width: "100%", maxWidth: 500, gap: 12 },
  nowPlaying: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  songTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
  },
  artist: { color: "#B8C3DD", fontSize: 16, textAlign: "center" },
  playButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#E9D3A3",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  playButtonPressed: {
    backgroundColor: "#CDB37D",
    transform: [{ scale: 0.96 }],
  },
  playIcon: {
    marginLeft: 6,
    width: 0,
    height: 0,
    borderTopWidth: 13,
    borderBottomWidth: 13,
    borderLeftWidth: 21,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#10152D",
  },
  pauseIcon: { flexDirection: "row", gap: 7 },
  pauseBar: {
    width: 7,
    height: 26,
    borderRadius: 2,
    backgroundColor: "#10152D",
  },
  buttonLabel: { color: "#EEE4D0", fontSize: 14, fontWeight: "600" },
  playbackStatus: {
    color: "#A0ACCE",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
