import React, { useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEventListener } from "expo";
import { setAudioModeAsync } from "expo-audio";
import Ionicons from "react-native-vector-icons/Ionicons";

const androidVideoSurfaceProps =
  Platform.OS === "android" ? { surfaceType: "textureView" } : {};

let playbackAudioModePromise = null;

const ensurePlaybackAudioMode = () => {
  if (Platform.OS === "android") {
    return Promise.resolve();
  }
  if (!playbackAudioModePromise) {
    playbackAudioModePromise = setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
      allowsRecording: false,
    }).catch((e) => {
      playbackAudioModePromise = null;
      console.warn("Failed to set playback audio mode:", e);
    });
  }
  return playbackAudioModePromise;
};

const applyPlayerMuteState = (player, muted) => {
  try {
    player.muted = !!muted;
    if (!muted) {
      player.volume = 0.9;
      player.audioMixingMode = "doNotMix";
    } else {
      player.audioMixingMode = "mixWithOthers";
    }
  } catch (e) {
    console.warn("Failed to apply mute state:", e);
  }
};

const selectFirstAudioTrack = (player) => {
  try {
    const tracks = player.availableAudioTracks;
    if (Array.isArray(tracks) && tracks.length > 0) {
      player.audioTrack = tracks[0];
    }
  } catch (_) {}
};

const MomentVideo = ({ mediaUrl }) => {
  const player = useVideoPlayer(mediaUrl, (p) => {
    p.loop = false;
    applyPlayerMuteState(p, false);
    p.audioMixingMode = "doNotMix";
    p.play();
  });

  useEffect(() => {
    ensurePlaybackAudioMode();
    applyPlayerMuteState(player, false);
    player.audioMixingMode = "doNotMix";
    player.play();
    return () => {
      try {
        player.pause();
      } catch (_) {}
      try {
        player.replace(null);
      } catch (_) {}
    };
  }, [player]);

  useEventListener(player, "statusChange", ({ status, error }) => {
    if (status === "readyToPlay") {
      selectFirstAudioTrack(player);
      applyPlayerMuteState(player, false);
      player.audioMixingMode = "doNotMix";
      player.play();
    }
    if (status === "error") {
      console.warn("Moment video error:", error);
    }
  });

  return (
    <VideoView
      style={styles.media}
      player={player}
      contentFit="contain"
      nativeControls
      allowsFullscreen
      allowsPictureInPicture
      {...androidVideoSurfaceProps}
    />
  );
};

const MomentViewer = ({ navigation, route }) => {
  const moment = route.params?.moment;
  const mediaUrl = moment?.mediaUrl;
  const mediaType = moment?.mediaType;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
      {mediaType === "video" ? (
        <MomentVideo mediaUrl={mediaUrl} />
      ) : (
        <Image source={{ uri: mediaUrl }} style={styles.media} resizeMode="contain" />
      )}
      {moment?.caption ? (
        <View style={styles.captionBar}>
          <Text numberOfLines={2} style={styles.captionText}>{moment.caption}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  backButton: {
    marginTop: 18,
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  media: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  captionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 12,
  },
  captionText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default MomentViewer;
