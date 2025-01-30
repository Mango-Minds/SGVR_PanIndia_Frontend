import React from "react";
import { Dimensions, View, TouchableOpacity, Text } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
const windowWidth = Dimensions.get("window").width;
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ImageViewerScreen({ images, setShowViewer, index }) {
  console.log("images", images)
  if (images.length === 0) {
    return (
      <>
        <View
          style={{
            position: "absolute",
            width: "100%",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: 16,
            zIndex: 2,
            marginTop: 60,
          }}
        >
          <TouchableOpacity onPress={() => setShowViewer(false)}>
            <Icon name="chevron-left" size={36} color="black" />
          </TouchableOpacity>
          {/* <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginLeft: 16 }}>
            Madhu, 24
          </Text> */}
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>No Images</Text>
        </View>
      </>
    );
  } else
    return (
      <ImageViewer
        onCancel={() => setShowViewer(false)}
        enableSwipeDown={true}
        index={index}
        renderIndicator={() => null}
        imageUrls={images.map((item) => ({ url: item }))}
        menuContext={{
          cancel: true,
        }}
        renderFooter={(currentIndex) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              position: "absolute",
              bottom: 200,
              zIndex: 2,
              left: windowWidth / 2,
            }}
          >
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setShowViewer(false);
                }}
                style={{
                  margin: 5,
                  borderRadius: 20,
                  width: 12,
                  height: 12,
                  backgroundColor: currentIndex === index ? "#fff" : "#656565",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></TouchableOpacity>
            ))}
          </View>
        )}
        renderHeader={(currentIndex) => (
          <View
            style={{
              position: "absolute",
              width: "100%",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: 16,
              zIndex: 2,
              marginTop: 60,
            }}
          >
            <TouchableOpacity onPress={() => setShowViewer(false)}>
              <Icon name="chevron-left" size={36} color="#FFF" />
            </TouchableOpacity>
            {/* <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFF', marginLeft: 16 }}>
            Madhu, 24
          </Text> */}
          </View>
        )}
      />
    );
}
