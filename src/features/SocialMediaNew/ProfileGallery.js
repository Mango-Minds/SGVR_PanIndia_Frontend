import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEventListener } from "expo";
import { setAudioModeAsync } from "expo-audio";
import { useTranslation } from "react-i18next";
import { extractPostMedia } from "./utils/extractPostMedia";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const GRID_GAP = 2;
const GRID_PADDING = 10;
const NUM_COLUMNS = 3;
const itemSize =
  (screenWidth - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const androidVideoSurfaceProps =
  Platform.OS === "android" ? { surfaceType: "textureView" } : {};

let playbackAudioModePromise = null;

const ensurePlaybackAudioMode = () => {
  // Android: never call setAudioModeAsync here — it forces speakerphone ON
  // (setSpeakerphoneOn(true)) which causes wind/echo/vibration-like noise over video.
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
    }).catch(() => {
      playbackAudioModePromise = null;
    });
  }
  return playbackAudioModePromise;
};

const releasePlayer = (player) => {
  try {
    player.pause();
  } catch (_) {}
  try {
    player.replace(null);
  } catch (_) {}
};

const GalleryCell = ({ item, onPress }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.galleryItem, { width: itemSize, height: itemSize }]}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
    >
      {!imageError && item.uri && item.type !== "video" ? (
        <Image
          source={{ uri: item.uri }}
          style={styles.galleryImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.galleryImagePlaceholder}>
          <Icon
            name={item.type === "video" ? "videocam-outline" : "image-outline"}
            size={24}
            color="#9B9B9B"
          />
        </View>
      )}
      {item.type === "video" && (
        <View style={styles.videoIndicator}>
          <Icon name="play-circle" size={32} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

/** Only the currently visible page mounts a player */
const GalleryVideoPlayer = ({ uri }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.volume = 0.9;
    p.muted = false;
    p.audioMixingMode = "doNotMix";
    p.play();
  });

  useEffect(() => {
    ensurePlaybackAudioMode();
    return () => releasePlayer(player);
  }, [player]);

  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "readyToPlay") {
      player.muted = false;
      player.volume = 0.9;
      player.audioMixingMode = "doNotMix";
      player.play();
    }
  });

  return (
    <VideoView
      player={player}
      style={styles.viewerVideo}
      contentFit="contain"
      nativeControls
      {...androidVideoSurfaceProps}
    />
  );
};

const ViewerItem = ({ item, isActive }) => {
  if (item.type === "video") {
    return (
      <View style={styles.viewerPage}>
        {isActive ? (
          <GalleryVideoPlayer uri={item.uri} />
        ) : (
          <View style={[styles.viewerVideo, styles.viewerVideoPlaceholder]}>
            <Icon name="play-circle" size={56} color="rgba(255,255,255,0.85)" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.viewerPage}>
      <Image
        source={{ uri: item.uri }}
        style={styles.viewerImage}
        resizeMode="contain"
      />
    </View>
  );
};

export default function ProfileGallery({ posts = [] }) {
  const { t } = useTranslation();
  const items = useMemo(() => extractPostMedia(posts), [posts]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const viewerListRef = useRef(null);

  const openViewer = (item) => {
    const index = items.findIndex((i) => i.id === item.id);
    setViewerIndex(index >= 0 ? index : 0);
    setViewerVisible(true);
  };

  const closeViewer = () => setViewerVisible(false);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="images-outline" size={48} color="#9B9B9B" />
        <Text style={styles.emptyText}>{t("noGalleryMedia")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <GalleryCell item={item} onPress={openViewer} />
        )}
      />

      <Modal
        visible={viewerVisible}
        animationType="fade"
        transparent={false}
        onRequestClose={closeViewer}
      >
        <SafeAreaView style={styles.viewerContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeViewer}>
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {viewerVisible ? (
            <FlatList
              ref={viewerListRef}
              data={items}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={viewerIndex}
              windowSize={3}
              maxToRenderPerBatch={2}
              getItemLayout={(_, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              onScrollToIndexFailed={() => {
                viewerListRef.current?.scrollToOffset({
                  offset: viewerIndex * screenWidth,
                  animated: false,
                });
              }}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / screenWidth
                );
                setViewerIndex(index);
              }}
              renderItem={({ item, index }) => (
                <ViewerItem item={item} isActive={index === viewerIndex} />
              )}
            />
          ) : null}

          <Text style={styles.viewerCounter}>
            {viewerIndex + 1} / {items.length}
          </Text>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  gridContent: {
    padding: GRID_PADDING,
  },
  row: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  galleryItem: {
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  galleryImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ececec",
  },
  videoIndicator: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#9B9B9B",
    fontSize: 14,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  viewerPage: {
    width: screenWidth,
    height: screenHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  viewerImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  viewerVideo: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  viewerVideoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  viewerCounter: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    color: "#fff",
    fontSize: 14,
  },
});
