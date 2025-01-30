import React, { useState, useEffect, useRef } from "react";
import { View, Image, FlatList, Dimensions, TouchableOpacity, Text } from "react-native";
import { useNavigation } from '@react-navigation/native';
const { width } = Dimensions.get("window");

const images = [
  "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/ring-jewellery-facebook-cover-design-template-d6d1bea1890a1386e2b3d966cf34b484_screen.jpg?ts=1682791227",
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8amV3ZWxsZXJ5fGVufDB8fDB8fHww",
  "https://plus.unsplash.com/premium_photo-1708958117373-5d354f07a61a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGpld2VsbGVyeXxlbnwwfHwwfHx8MA%3D%3D",
];

const Banner = () => {
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

  const renderItem = ({ item }) => {
    return (
        <TouchableOpacity onPress={()=>{navigation.navigate("EventPage")}}>
      <View style={{ width, alignItems: "center", justifyContent: "center" }}>
        {imageVisible && (
          <Image
            style={{
              width: "96%",
              height: 160,
              borderRadius: 8,
              opacity: 1,
            }}
            source={{ uri: item }}
          />
        )}
        {imageVisible && (
        <TouchableOpacity
        style={{
          position: "absolute",
          top: 3,
          right: 13,
          paddingHorizontal: 4,
          paddingVertical: 1,
          opacity: 0.8,
          backgroundColor: "white",
        }}
        onPress={toggleImageVisibility}
        >
        <Text style={{ color: "red", fontSize: 10, color: "black" }}>
        &#x2715;
        </Text>
        </TouchableOpacity>
        )}
      </View>
           </TouchableOpacity> 

    );
  };
  return (
    <View>
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
    </View>
  );
};

export default Banner;
