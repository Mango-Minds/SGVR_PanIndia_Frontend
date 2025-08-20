import React, { useState, useEffect } from "react";
import { Image, Text, View, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { IconButton } from "react-native-paper";
import { RowBetween} from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import { SafeArea } from "../../components/utility/safe-area.component";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";


// Static constant data for community
const STATIC_COMMUNITY_DATA = {
  name: "Community Name",
  state: "Community State",
  city: "Community City",
  imageUrl: ["https://picsum.photos/3000", "https://picsum.photos//3000", "https://picsum.photos///3000"],
};

export default function CommunityProfileScreenNew({ route, navigation }) {
  const [showViewer, setShowViewer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modelImages, setModelImages] = useState([]);

  useEffect(() => {
    const setModalImagesFunc = (images) => {
      const arr = images.map((image) => ({
        url: image,
        props: { style: { width: "100%", height: "100%" } },
      }));
      setModelImages(arr);
    };
    setModalImagesFunc(STATIC_COMMUNITY_DATA.imageUrl);
  }, []);

  const renderBackground = () => (
    <TouchableOpacity activeOpacity={1} onPress={() => setShowViewer(true)}>
      <View style={styles.backgroundImageContainer}>
        <Image
          source={
            STATIC_COMMUNITY_DATA.imageUrl[0]
              ? { uri: STATIC_COMMUNITY_DATA.imageUrl[0] }
              : require("../../assets/images/general/community.png")
          }
          resizeMode="cover"
          style={styles.backgroundImage}
        />
      </View>
    </TouchableOpacity>
  );

  const renderContentBackground = () => (
    <View style={styles.scrollContainer}>
      <View>
        <Text style={styles.title}>{STATIC_COMMUNITY_DATA.name}</Text>
        <Text style={styles.content}>
          {STATIC_COMMUNITY_DATA.state}, {STATIC_COMMUNITY_DATA.city}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContainer}>
        {STATIC_COMMUNITY_DATA.imageUrl.map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setShowViewer(true);
              setCurrentIndex(i);
            }}
          >
            <Image source={{ uri: item }} resizeMode="cover" style={styles.galleryImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.descriptionTitle}>Description</Text>
      <Text style={styles.content}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum.
      </Text>
    </View>
  );

  return (
    <SafeArea>
       <RowBetween style={{ paddingTop: 24 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText
              style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
            >
              Community
            </TopText>
          </View>
        </RowBetween>
      <ScrollView
        renderBackground={renderBackground}
        renderContentBackground={renderContentBackground}
        parallaxHeaderHeight={200}
      />

      <Modal visible={showViewer} transparent={false}>
        <ImageViewerScreen images={modelImages} index={currentIndex} setShowViewer={setShowViewer} />
      </Modal>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 50,
    height: "60%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  content: {
    color: "#898E92",
  },
  galleryContainer: {
    flexDirection: "row",
    paddingTop: 16,
    paddingBottom: 16,
  },
  galleryImage: {
    width: 150,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  backgroundImageContainer: {
    height: 200,
    padding: 16,
    backgroundColor: "#FFF",
    zIndex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
});
