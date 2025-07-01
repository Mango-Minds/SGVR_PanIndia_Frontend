
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import Theme from "../../styles/theme";
import { useTranslation } from 'react-i18next';
const { width } = Dimensions.get("window");

const images = [
  "https://media.istockphoto.com/id/1990444472/photo/scandinavian-style-cozy-living-room-interior.webp?a=1&b=1&s=612x612&w=0&k=20&c=F5A3eF6myaJpITu5ABnGqNjacGWYskuxeZviU-KpxPE=",
  "https://plus.unsplash.com/premium_photo-1678386645963-3f5b0bdb8dcd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmxhdHN8ZW58MHx8MHx8fDA%3D",
  "https://media.istockphoto.com/id/2174110343/photo/indian-couple-celebration-traditional-festival-stock-photo.webp?a=1&b=1&s=612x612&w=0&k=20&c=PnB8sfZswn5jDFeXnXW-1dHsTxPsdQjAZxEXf_BV5kA=",
];

const Banner = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [imageVisible, setImageVisible] = useState(true);

  const toggleImageVisibility = () => {
    setImageVisible((prevVisible) => !prevVisible);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(nextIndex);
      flatListRef.current.scrollToIndex({ animated: true, index: nextIndex });
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderItem = ({ item }) => (
    <TouchableOpacity>
       
      <View style={styles.imageContainer}>
        {imageVisible && <Image style={styles.image} source={{ uri: item }} />}
        {imageVisible && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleImageVisibility}
          >
            <Text style={styles.closeButtonText}>&#x2715;</Text>
          </TouchableOpacity>
        )}
      </View>

    </TouchableOpacity>
  );

  return (
    <View style={styles.banner}>
      {/* Banner Image Carousel */}
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        onMomentumScrollEnd={(event) => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const index = Math.round(contentOffsetX / width);
          setCurrentIndex(index);
        }}
      />

      {/* New Static Banner Below */}

     <View style={styles.bannerTextContainer}>
  <Text style={styles.bannerTitle}>{t('introducing_b2c')}</Text>
  <TouchableOpacity style={styles.bannerButton}>
    <Text style={styles.bannerButtonText}>{t('grab_now')}</Text>
  </TouchableOpacity>
</View>

    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "96%",
    height: 160,
    borderRadius: 8,
  },
  closeButton: {
    position: "absolute",
    top: 3,
    right: 13,
    paddingHorizontal: 4,
    paddingVertical: 1,
    opacity: 0.8,
    backgroundColor: "white",
  },
  closeButtonText: {
    fontSize: 10,
    color: "black",
  },

  banner: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 10,
  },
  bannerImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  bannerTextContainer: {
    padding: 10,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Theme.themeColor
  },
  bannerSubtitle: {
    fontSize: 14,
    marginVertical: 5,
  },
  bannerButton: {
    
    backgroundColor: Theme.themeBackgroundColor,
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: Theme.themeColor,
    fontSize: 14,
  },

  
});

export default Banner;
