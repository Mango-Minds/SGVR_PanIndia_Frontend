import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEventListener } from "expo";

const INTRO_SOURCE = require("../assets/images/pre-login/indiyoura-animation.mp4");
const MAX_INTRO_MS = 4000;

const androidVideoSurfaceProps =
  Platform.OS === "android" ? { surfaceType: "textureView" } : {};

export default function IntroAnimation({ onFinish }) {
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish?.();
  };

  const player = useVideoPlayer(INTRO_SOURCE, (p) => {
    p.loop = false;
    p.muted = true;
    p.audioMixingMode = "mixWithOthers";
    p.play();
  });

  useEffect(() => {
    const timer = setTimeout(finish, MAX_INTRO_MS);
    try {
      player.muted = true;
      player.play();
    } catch (_) {}

    return () => {
      clearTimeout(timer);
      try {
        player.pause();
      } catch (_) {}
    };
  }, [player]);

  useEventListener(player, "playToEnd", () => {
    finish();
  });

  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "error") {
      finish();
    }
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        {...androidVideoSurfaceProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    zIndex: 9999,
    elevation: 9999,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
