import React, { useState, useRef } from "react";
import { Image, Text, View, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions, ScrollView } from "react-native";
import { SafeArea } from "../../components/utility/safe-area.component";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { Ionicons } from "@expo/vector-icons";
import Theme from "../../styles/theme";
import { useTranslation } from "react-i18next";
const screenWidth = Dimensions.get("window").width;
const imageHeight = screenWidth * 0.6;

const ReadMoreComponent = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
const { t } = useTranslation();
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.readMoreContainer}>
      <Text style={styles.description}>{isExpanded ? description : `${description.slice(0, 100)}...`}</Text>
      <TouchableOpacity onPress={handleToggle} >
        <View>
          {isExpanded ? (
            <Text >
              <Text style={styles.readMore}>Read less</Text>
              <Ionicons name="chevron-up-outline" size={16} color={Theme.themeColor} />
            </Text>
          ) : (
            <Text>
              <Text style={styles.readMore}>Read more</Text>
              <Ionicons name="chevron-down-outline" size={16} color={Theme.themeColor} />
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default function MatrimonyProfileNew({ route, navigation }) {
  const [viewerState, setViewerState] = useState({
    showViewer: false,
    currentIndex: 0,
  });

  const { vendorData } = route.params;
  const mainFlatListRef = useRef(null);
  const modalFlatListRef = useRef(null);

  const openImageModal = (index) => setViewerState({ showViewer: true, currentIndex: index });
  const closeImageModal = () => {
    setViewerState((prevState) => ({ ...prevState, showViewer: false }));
    if (mainFlatListRef.current) {
      mainFlatListRef.current.scrollToIndex({ index: viewerState.currentIndex, animated: false });
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => openImageModal(index)}>
      <Image source={item} style={styles.image} />
    </TouchableOpacity>
  );

  const syncScrollToIndex = (index) => {
    setViewerState((prevState) => ({ ...prevState, currentIndex: index }));
    if (viewerState.showViewer) {
      if (modalFlatListRef.current) {
        modalFlatListRef.current.scrollToIndex({ index, animated: true });
      }
    } else {
      if (mainFlatListRef.current) {
        mainFlatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  };

  const goToPreviousImage = () => {
    const newIndex = viewerState.currentIndex > 0 ? viewerState.currentIndex - 1 : vendorData.image.length - 1;
    syncScrollToIndex(newIndex);
  };

  const goToNextImage = () => {
    const newIndex = (viewerState.currentIndex + 1) % vendorData.image.length;
    syncScrollToIndex(newIndex);
  };

  return (
    <SafeArea style={{ flex: 1 }}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <TopText style={styles.headerText}>{vendorData.vendor}</TopText>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.carouselContainer}>
          <FlatList
            ref={mainFlatListRef}
            data={vendorData.image}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          />
          <TouchableOpacity style={styles.leftButton} onPress={goToPreviousImage}>
            <Text style={styles.buttonText}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rightButton} onPress={goToNextImage}>
            <Text style={styles.buttonText}>{">"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <ReadMoreComponent description={vendorData.about} />
          <View style={styles.infoItem}>
            <Ionicons name="location" size={24} color={Theme.themeColor} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.label}>City:</Text> {vendorData.city}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call" size={24} color={Theme.themeColor} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.label}>Mobile Number:</Text> {vendorData.phone}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={24} color={Theme.themeColor} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              <Text style={styles.label}>Email:</Text> {vendorData.email}
            </Text>
          </View>
        </View>

        <View style={styles.facilitiesContainer}>
          <View style={styles.facilitiesLabelContainer}>
            <Ionicons name="options" size={24} color={Theme.themeColor} style={styles.facilitiesIcon} />
            <Text style={styles.facilitiesLabel}>Facilities</Text>
          </View>
          <View style={styles.facilitiesIcons}>
            <View style={styles.facilityItem}>
              <Ionicons name="restaurant" size={24} color={Theme.themeColor} />
              <Text style={styles.facilityText}>Catering</Text>
            </View>
            <View style={styles.facilityItem}>
              <Ionicons name="fast-food-outline" size={24} color={Theme.themeColor} />
              <Text style={styles.facilityText}>Food</Text>
            </View>
            <View style={styles.facilityItem}>
              <Ionicons name="wine" size={24} color={Theme.themeColor} />
              <Text style={styles.facilityText}>Bar</Text>
            </View>
            <View style={styles.facilityItem}>
              <Ionicons name="ice-cream" size={24} color={Theme.themeColor} />
              <Text style={styles.facilityText}>Dessert</Text>
            </View>
          </View>
        </View>

        <View style={styles.priceBookNowContainer}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceText}>₹199</Text>
          </View>
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={() => {
              /* Handle book now */
            }}
          >
            <Text style={styles.bookNowButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal visible={viewerState.showViewer} transparent={true} onRequestClose={closeImageModal}>
        <View style={styles.modalContainer}>
          <FlatList
            ref={modalFlatListRef}
            data={vendorData.image}
            renderItem={({ item }) => <Image source={item} style={styles.modalImage} />}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerState.currentIndex}
            getItemLayout={(data, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
            onScroll={({ nativeEvent }) => {
              const { contentOffset, layoutMeasurement } = nativeEvent;
              const index = Math.floor(contentOffset.x / layoutMeasurement.width);
              setViewerState((prevState) => ({ ...prevState, currentIndex: index }));
            }}
          />

          <TouchableOpacity style={styles.closeButton} onPress={closeImageModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.leftButton} onPress={goToPreviousImage}>
            <Text style={styles.buttonText}>{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rightButton} onPress={goToNextImage}>
            <Text style={styles.buttonText}>{">"}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  headerText: {
    color: Theme.themeColor,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  carousel: {
    alignItems: "center",
    paddingTop: 10,
  },
  image: {
    width: screenWidth * 0.9,
    height: imageHeight,
    borderRadius: 8,
    marginHorizontal: screenWidth * 0.05,
  },
  infoContainer: {
    flex: 4,
    marginTop: 10,
    width: "100%",
    paddingHorizontal: 16,
  },
  infoText: {
    color: "black",
    fontSize: 18,
    marginVertical: 4,
  },
  label: {
    fontWeight: "bold",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: screenWidth,
    height: "100%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 20,
  },
  closeButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  leftButton: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -25 }],
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
  },
  rightButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -25 }],
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 30,
    color: "white",
  },
  readMoreContainer: {
    marginBottom: 16,
    marginVertical: 10,
  },
  description: {
    fontSize: 18,
    color: "black",
    marginTop: 10,
  },
  readMore: {
    color: Theme.themeColor,
    fontSize: 18,
  },
  facilitiesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24, // Increase the padding to make the container taller
  },
  facilitiesLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "black",
  },
  facilitiesIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  facilityItem: {
    alignItems: "center",
    marginBottom: 16, // Add margin bottom to create space between items
  },
  facilityText: {
    fontSize: 18, // Increase the font size of the facility text
    color: "black",
  },
  priceBookNowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  priceText: {
    color: Theme.themeColor,
    fontSize: 32, // Increase the font size to make it bigger
    fontWeight: "bold",
  },
  priceLabel: {
    fontSize: 24,
  },
  bookNowButton: {
    backgroundColor: Theme.themeColor,
    borderRadius: 12, // Increase the border radius to make it rounder
    paddingVertical: 18, // Increase the padding vertically to make it taller
    paddingHorizontal: 24, // Increase the padding horizontally to make it wider
  },
  bookNowButtonText: {
    color: "white",
    fontSize: 20, // Increase the font size to make it bigger
    fontWeight: "bold",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  facilitiesLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  facilitiesIcon: {
    marginRight: 10,
  },
});
