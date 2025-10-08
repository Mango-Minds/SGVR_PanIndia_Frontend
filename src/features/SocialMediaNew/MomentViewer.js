import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text, SafeAreaView } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import Ionicons from "react-native-vector-icons/Ionicons";

const MomentVideo = ({ mediaUrl }) => {
  const player = useVideoPlayer(mediaUrl, { autoPlay: true, isMuted: false, repeat: false });
  return (
    <VideoView
      style={styles.media}
      player={player}
      allowsFullscreen={true}
      allowsPictureInPicture={true}
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
          <Ionicons name="arrow-back" size={24} color="#fff" />
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
    padding: 12,
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


