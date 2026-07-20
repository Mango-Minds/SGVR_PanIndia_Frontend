import React, { useMemo, useRef, useState } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { VideoView } from "expo-video";
import { useTranslation } from "react-i18next";
import { extractPostMedia } from "./utils/extractPostMedia";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const GRID_GAP = 2;
const GRID_PADDING = 10;
const NUM_COLUMNS = 3;
const itemSize =
  (screenWidth - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

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

const ViewerItem = ({ item }) => {
  if (item.type === "video") {
    return (
      <View style={styles.viewerPage}>
        <VideoView
          source={{ uri: item.uri }}
          style={styles.viewerVideo}
          resizeMode="contain"
          shouldPlay
          isLooping
          useNativeControls
        />
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

          <FlatList
            ref={viewerListRef}
            data={items}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerIndex}
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
            renderItem={({ item }) => <ViewerItem item={item} />}
          />

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
    backgroundColor: "#f0f0f0",
  },
  videoIndicator: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9B9B9B",
    textAlign: "center",
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 10,
    padding: 8,
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
  viewerCounter: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    color: "#fff",
    fontSize: 14,
  },
});
