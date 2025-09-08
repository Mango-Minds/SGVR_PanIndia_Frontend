import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeArea } from "../../components/utility/safe-area.component";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import Theme from "../../styles/theme";
import {
  BASEAPIURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { connectToChat } from "./matrimonyAPIs";
import { useTranslation } from "react-i18next";
const screenWidth = Dimensions.get("window").width;
const imageHeight = screenWidth * 0.6;

const ReadMoreComponent = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle undefined or null description
  if (!description || typeof description !== 'string') {
    return (
      <View style={styles.readMoreContainer}>
        <Text style={styles.description}>
          {t('noDescriptionAvailable') || 'No description available'}
        </Text>
      </View>
    );
  }

  const shouldShowReadMore = description.length > 100;

  return (
    <View style={styles.readMoreContainer}>
      <Text style={styles.description}>
        {isExpanded ? description : `${description.slice(0, 100)}...`}
      </Text>
      {shouldShowReadMore && (
        <TouchableOpacity onPress={handleToggle}>
          <View>
            {isExpanded ? (
              <Text>
                <Text style={styles.readMore}>{t('readLess')}</Text>
                <Ionicons name="chevron-up-outline" size={16} color={Theme.themeColor}  />
              </Text>
            ) : (
              <Text>
                <Text style={styles.readMore}>{t('readMore')}</Text>
                <Ionicons name="chevron-down-outline" size={16} color={Theme.themeColor}/>
              </Text>
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function MatrimonyProfileNewWithConnection({
  route,
  navigation,
}) {
  const [viewerState, setViewerState] = useState({
    showViewer: false,
    currentIndex: 0,
  });
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);
  const [vendorData, setVendorData] = useState(route.params);
  const [refreshKey, setRefreshKey] = useState(0);
  console.log("user: ", user);
  console.log("vendorData: ", vendorData);
  
  // Use useMemo to normalize vendor data reactively
  const { normalizedVendorData, vendorId } = useMemo(() => {
    console.log("useMemo recalculating with vendorData:", JSON.stringify(vendorData, null, 2));
    console.log("useMemo recalculating with refreshKey:", refreshKey);
    
    if (!vendorData) return { normalizedVendorData: null, vendorId: null };
    
    let normalizedVendorData;
    let vendorId;
    
    if (vendorData?.user) {
      // Case 1: vendorData has a nested user property (when viewing own profile)
      const userData = vendorData.user;
      console.log("Extracting from user data:", JSON.stringify(userData, null, 2));
      
      // For own profile, we need to extract the business data from roleData
      const userTypes = userData?.userType || [];
      const roleData = userData?.roleData || {};
      
      console.log("User types:", userTypes);
      console.log("Role data:", JSON.stringify(roleData, null, 2));
      
      if (userTypes.includes('caterer') && roleData.caterer) {
        normalizedVendorData = roleData.caterer;
        vendorId = roleData.caterer.owner;
        console.log("Extracted caterer data:", JSON.stringify(normalizedVendorData, null, 2));
      } else if (userTypes.includes('decorator') && roleData.decorator) {
        normalizedVendorData = roleData.decorator;
        vendorId = roleData.decorator.owner;
      } else if (userTypes.includes('planner') && roleData.planner) {
        normalizedVendorData = roleData.planner;
        vendorId = roleData.planner.owner;
      } else if (userTypes.includes('venue') && roleData.venue) {
        normalizedVendorData = roleData.venue;
        vendorId = roleData.venue.owner;
      } else if (userTypes.includes('matrimonyVendor') && roleData.MatrimonyVendor) {
        normalizedVendorData = roleData.MatrimonyVendor;
        vendorId = roleData.MatrimonyVendor.owner;
      }
    } else {
      // Case 2: vendorData is the actual business data (when viewing other's profile)
      normalizedVendorData = vendorData;
      // Handle both cases: owner as string ID or owner as object with _id
      vendorId = typeof vendorData?.owner === 'string' 
        ? vendorData.owner 
        : vendorData?.owner?._id;
    }
    
    console.log("Final normalized data:", JSON.stringify(normalizedVendorData, null, 2));
    return { normalizedVendorData, vendorId };
  }, [vendorData, refreshKey]); // Add refreshKey as dependency to force recalculation
  
  console.log("normalizedVendorData: ", normalizedVendorData);
  console.log("vendorId: ", vendorId);

  // Remove useEffect to avoid conflicts with useFocusEffect
  
  // Get the current user's ID for ownership comparison
  const currentUserId = user?.user?._id;
  console.log("currentUserId: ", currentUserId);
  console.log("vendorId (shop owner): ", vendorId);

  // Function to determine vendor type and get appropriate API endpoint
  const getVendorApiEndpoint = (businessData, businessId) => {
    // Determine vendor type from the business data structure or user types
    const userTypes = user?.user?.userType || [];
    
    if (userTypes.includes('caterer')) {
      return `/matrimony/caterer/caterers/${businessId}`;
    } else if (userTypes.includes('decorator')) {
      return `/matrimony/decorator/decorators/${businessId}`;
    } else if (userTypes.includes('planner')) {
      return `/matrimony/planner/planners/${businessId}`;
    } else if (userTypes.includes('venue')) {
      return `/matrimony/venue/venues/${businessId}`;
    } else if (userTypes.includes('matrimonyVendor')) {
      return `/matrimony/matrimonyVendor/matrimonyVendors/${businessId}`;
    }
    
    // Default to matrimonyVendor
    return `/matrimony/matrimonyVendor/matrimonyVendors/${businessId}`;
  };

  // Function to fetch updated vendor data (only when needed)
  const fetchUpdatedVendorData = useCallback(async () => {
    // Skip API fetch if we already have the data from route params
    // This prevents unnecessary API calls and 404 errors
    console.log("Skipping API fetch - using data from route params");
    return;
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Always update vendorData from route params when screen comes into focus
      // This ensures we get the latest data after editing
      const newRouteParams = route.params;
      if (newRouteParams) {
        console.log("Screen focused, updating vendor data from route params");
        console.log("New route params:", JSON.stringify(newRouteParams, null, 2));
        console.log("Current vendorData:", JSON.stringify(vendorData, null, 2));
        
        // Force update the vendorData state
        setVendorData(newRouteParams);
        setRefreshKey(prev => {
          console.log("Incrementing refreshKey from", prev, "to", prev + 1);
          return prev + 1;
        });
      }
      
      fetchUpdatedVendorData();
      // Reset currentIndex to 0 when data changes to prevent out-of-bounds errors
      setViewerState(prevState => ({ ...prevState, currentIndex: 0 }));
    }, [fetchUpdatedVendorData, route.params, vendorData])
  );


  
 
  const mainFlatListRef = useRef(null);
  const modalFlatListRef = useRef(null);
  const token = useSelector((state) => state.user.token);

  const openImageModal = (index) =>
    setViewerState({ showViewer: true, currentIndex: index });
  const closeImageModal = () => {
    setViewerState((prevState) => ({ ...prevState, showViewer: false }));
    if (mainFlatListRef.current && normalizedVendorData?.images?.length > 0) {
      // Ensure currentIndex is a valid number and within bounds
      const currentIndex = Number(viewerState.currentIndex) || 0;
      const validIndex = Math.max(0, Math.min(currentIndex, normalizedVendorData.images.length - 1));
      mainFlatListRef.current.scrollToIndex({
        index: validIndex,
        animated: false,
      });
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => openImageModal(index)}>
      <Image source={{ uri: item }} style={styles.image} />
    </TouchableOpacity>
  );

  const syncScrollToIndex = (index) => {
    // Ensure index is a valid number and within bounds
    if (!normalizedVendorData?.images?.length || 
        typeof index !== 'number' || 
        isNaN(index) || 
        index < 0 || 
        index >= normalizedVendorData.images.length) {
      return;
    }
    
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
    if (!normalizedVendorData?.images?.length || normalizedVendorData.images.length === 0) return;
    
    const currentIndex = Number(viewerState.currentIndex) || 0;
    const newIndex = currentIndex > 0 
      ? currentIndex - 1 
      : normalizedVendorData.images.length - 1;
    syncScrollToIndex(newIndex);
  };

  const goToNextImage = () => {
    if (!normalizedVendorData?.images?.length || normalizedVendorData.images.length === 0) return;
    
    const currentIndex = Number(viewerState.currentIndex) || 0;
    const newIndex = (currentIndex + 1) % normalizedVendorData.images.length;
    syncScrollToIndex(newIndex);
  };

  
  // const connectToChat = async (owner_id, business_id) => {
  //   console.log("OI:", owner_id);
  //   console.log("BI:", business_id);
  
  //   if (owner_id === business_id) {
  //     alert("Chat room Cannot be created: same id");
  //     return;
  //   }
  
  //   try {
  //     const token = await AsyncStorage.getItem("token");
  
  //     const response = await apiClient.post(
  //       `${BASEAPIURL}/chat/room/`,
  //       { userIds: [owner_id, business_id] },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  
  //     console.log("Response:", response);
  //     console.log("Authorization:", `Bearer ${token}`);
  
  //     if (response.status === 200 || response.status === 201) {
  //       const roomResponse = await apiClient.get(`${BASEAPIURL}/chat/rooms/`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  
  //       if (roomResponse.status === 200) {
  //         const roomData = roomResponse.data;
  //         console.log("Room Details:", roomData);
  
  //         if (roomData?.rooms?.length > 0) {
  //           const room_with_user = roomData.rooms.find(
  //             (room) => room.participants[0].id === vendorId
  //           );
  
  //           Alert.alert("OK", "Chat Room Created", [
  //             {
  //               text: "OK",
  //               onPress: () => {
  //                 navigation.navigate("ChatScreenNew", {
  //                   user_auth_token: token,
  //                   room: room_with_user,
  //                   participant_name:
  //                     room_with_user.participants[0].firstName +
  //                     " " +
  //                     room_with_user.participants[0].lastName,
  //                 });
  //               },
  //             },
  //           ]);
  //         } else {
  //           Alert.alert("No rooms found");
  //         }
  //       } else {
  //         const errorData = roomResponse.data;
  //         console.error("Error Fetching Room Details:", errorData);
  //         Alert.alert("Error Fetching Room Details");
  //       }
  //     } else {
  //       const errorData = response.data;
  //       console.error("Error Creating Chat Room:", errorData);
  //       Alert.alert("Error Creating Chat Room");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };
  return (
    <SafeArea key={refreshKey} style={{ flex: 1 }}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate("MatrimonyNew");
          }
        }} />
        <TopText style={styles.headerText}>{normalizedVendorData?.businessName || t('businessName') || 'Business Name'}</TopText>
        {/* Only show edit button if current user is the owner of this shop */}
        {currentUserId === vendorId && (
          <IconButton 
            icon="pencil" 
            iconColor={Theme.themeColor}
            onPress={() => {
              navigation.navigate("MyMatrimonyShopProfileEdit", {
                user_details: normalizedVendorData,
              });
            }}
            style={styles.editIcon}
          />
        )}
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.carouselContainer}>
          {normalizedVendorData?.images?.length > 0 ? (
            <>
              <FlatList
                ref={mainFlatListRef}
                data={normalizedVendorData.images.map(imagePath => `${imagePath}`)}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              />
              <TouchableOpacity
                style={styles.leftButton}
                onPress={goToPreviousImage}
              >
                <Text style={styles.buttonText}>{"<"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rightButton} onPress={goToNextImage}>
                <Text style={styles.buttonText}>{">"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>{t('noImagesAvailable')}</Text>
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <ReadMoreComponent description={normalizedVendorData?.description} />
          <View style={styles.infoItem}>
            <Ionicons
              name="home"
              size={24}
              color={Theme.themeColor}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              <Text style={styles.label}>{t('address') || 'Address'}:</Text> {normalizedVendorData?.address || t('notProvided') || 'Not provided'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="location"
              size={24}
              color={Theme.themeColor}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              <Text style={styles.label}>{t('city') || 'City'}:</Text> {normalizedVendorData?.address || t('notProvided') || 'Not provided'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="call"
              size={24}
              color={Theme.themeColor}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              <Text style={styles.label}>{t('mobileNumber') || 'Mobile Number'}:</Text>{" "}
              {normalizedVendorData?.contactInfo || t('notProvided') || 'Not provided'}
            </Text>
          </View>
          {/* Only show Book Now button if user is not viewing their own shop */}
          {currentUserId !== vendorId && (
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={() => {
                // Generate conversation ID from current user and vendor
                const conversationId = [currentUserId, vendorId].sort().join('_');
                
                // Navigate to chat screen with the vendor's information
                navigation.navigate("ChatScreen", {
                  toid: vendorId,
                  toName: `${normalizedVendorData?.owner?.firstName || ''} ${normalizedVendorData?.owner?.lastName || ''}`.trim(),
                  index: 0, // Default index for new chat
                  conversationId: conversationId, // Pass the conversation ID
                });
              }}
            >
              <Text style={styles.bookNowButtonText}>{t('bookNow') || 'Book Now'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={viewerState.showViewer}
        transparent={true}
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <FlatList
            ref={modalFlatListRef}
            data={normalizedVendorData?.images?.map(imagePath => `${imagePath}`) || []}
            renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.modalImage} />
            )}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerState.currentIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onScroll={({ nativeEvent }) => {
              const { contentOffset, layoutMeasurement } = nativeEvent;
              const index = Math.floor(
                contentOffset.x / layoutMeasurement.width
              );
              setViewerState((prevState) => ({
                ...prevState,
                currentIndex: index,
              }));
            }}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeImageModal}
          >
            <Text style={styles.closeButtonText}>{t('close') || 'Close'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.leftButton}
            onPress={goToPreviousImage}
          >
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
    flex: 1,
  },
  editIcon: {
    marginLeft: "auto",
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
    borderColor: "#fff",
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
    backgroundColor:Theme.themeColor,
    borderRadius: 12, // Increase the border radius to make it rounder
    paddingVertical: 18, // Increase the padding vertically to make it taller
    paddingHorizontal: 24, // Increase the padding horizontally to make it wider
  },
  bookNowButtonText: {
    color: "white",
    fontSize: 20, // Increase the font size to make it bigger
    fontWeight: "bold",
    textAlign: "center",
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
  noImageContainer: {
    width: screenWidth * 0.9,
    height: imageHeight,
    borderRadius: 8,
    marginHorizontal: screenWidth * 0.05,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  noImageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});


// import React, { useState, useRef } from "react";
// import {
//   Image,
//   Text,
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   FlatList,
//   Dimensions,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { SafeArea } from "../../components/utility/safe-area.component";
// import { IconButton } from "react-native-paper";
// import { TopText } from "../../styles/social.styles";
// import { Ionicons } from "@expo/vector-icons";
// import { useSelector } from "react-redux";
// import Theme from "../../styles/theme";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import apiClient from "../../store/apiClient";
// import { connectToChat } from "./matrimonyAPIs";
// const screenWidth = Dimensions.get("window").width;
// const imageHeight = screenWidth * 0.6;

// const ReadMoreComponent = ({ description }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleToggle = () => {
//     setIsExpanded(!isExpanded);
//   };

//   return (
//     <View style={styles.readMoreContainer}>
//       <Text style={styles.description}>
//         {isExpanded ? description : `${description.slice(0, 100)}...`}
//       </Text>
//       <TouchableOpacity onPress={handleToggle}>
//         <View>
//           {isExpanded ? (
//             <Text>
//               <Text style={styles.readMore}>Read less</Text>
//               <Ionicons name="chevron-up-outline" size={16} color={Theme.themeColor}  />
//             </Text>
//           ) : (
//             <Text>
//               <Text style={styles.readMore}>Read more</Text>
//               <Ionicons name="chevron-down-outline" size={16} color={Theme.themeColor}/>
//             </Text>
//           )}
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default function MatrimonyProfileNewWithConnection({
//   route,
//   navigation,
// }) {
//   const [viewerState, setViewerState] = useState({
//     showViewer: false,
//     currentIndex: 0,
//   });
//   const user = useSelector((state) => state.user);
//   const vendorData = route.params;
//   const vendorId = vendorData.owner;
//   const ownerId = user.user.roleData.owner;
//   console.log(user.user.roleData.owner);
//   const mainFlatListRef = useRef(null);
//   const modalFlatListRef = useRef(null);
//   const token = useSelector((state) => state.user.token);

//   const openImageModal = (index) =>
//     setViewerState({ showViewer: true, currentIndex: index });
//   const closeImageModal = () => {
//     setViewerState((prevState) => ({ ...prevState, showViewer: false }));
//     if (mainFlatListRef.current) {
//       mainFlatListRef.current.scrollToIndex({
//         index: viewerState.currentIndex,
//         animated: false,
//       });
//     }
//   };

//   const renderItem = ({ item, index }) => (
//     <TouchableOpacity onPress={() => openImageModal(index)}>
//       <Image source={{ uri: item }} style={styles.image} />
//     </TouchableOpacity>
//   );

//   const syncScrollToIndex = (index) => {
//     setViewerState((prevState) => ({ ...prevState, currentIndex: index }));
//     if (viewerState.showViewer) {
//       if (modalFlatListRef.current) {
//         modalFlatListRef.current.scrollToIndex({ index, animated: true });
//       }
//     } else {
//       if (mainFlatListRef.current) {
//         mainFlatListRef.current.scrollToIndex({ index, animated: true });
//       }
//     }
//   };

//   const goToPreviousImage = () => {
//     const newIndex =
//       viewerState.currentIndex > 0
//         ? viewerState.currentIndex - 1
//         : vendorData.images.length - 1;
//     syncScrollToIndex(newIndex);
//   };

//   const goToNextImage = () => {
//     const newIndex = (viewerState.currentIndex + 1) % vendorData.images.length;
//     syncScrollToIndex(newIndex);
//   };

  
//   // const connectToChat = async (owner_id, business_id) => {
//   //   console.log("OI:", owner_id);
//   //   console.log("BI:", business_id);
  
//   //   if (owner_id === business_id) {
//   //     alert("Chat room Cannot be created: same id");
//   //     return;
//   //   }
  
//   //   try {
//   //     const token = await AsyncStorage.getItem("token");
  
//   //     const response = await apiClient.post(
//   //       `${BASEAPIURL}/chat/room/`,
//   //       { userIds: [owner_id, business_id] },
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );
  
//   //     console.log("Response:", response);
//   //     console.log("Authorization:", `Bearer ${token}`);
  
//   //     if (response.status === 200 || response.status === 201) {
//   //       const roomResponse = await apiClient.get(`${BASEAPIURL}/chat/rooms/`, {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       });
  
//   //       if (roomResponse.status === 200) {
//   //         const roomData = roomResponse.data;
//   //         console.log("Room Details:", roomData);
  
//   //         if (roomData?.rooms?.length > 0) {
//   //           const room_with_user = roomData.rooms.find(
//   //             (room) => room.participants[0].id === vendorId
//   //           );
  
//   //           Alert.alert("OK", "Chat Room Created", [
//   //             {
//   //               text: "OK",
//   //               onPress: () => {
//   //                 navigation.navigate("ChatScreenNew", {
//   //                   user_auth_token: token,
//   //                   room: room_with_user,
//   //                   participant_name:
//   //                     room_with_user.participants[0].firstName +
//   //                     " " +
//   //                     room_with_user.participants[0].lastName,
//   //                 });
//   //               },
//   //             },
//   //           ]);
//   //         } else {
//   //           Alert.alert("No rooms found");
//   //         }
//   //       } else {
//   //         const errorData = roomResponse.data;
//   //         console.error("Error Fetching Room Details:", errorData);
//   //         Alert.alert("Error Fetching Room Details");
//   //       }
//   //     } else {
//   //       const errorData = response.data;
//   //       console.error("Error Creating Chat Room:", errorData);
//   //       Alert.alert("Error Creating Chat Room");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error:", error);
//   //   }
//   // };
//   return (
//     <SafeArea style={{ flex: 1 }}>
//       <View style={styles.header}>
//         <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
//         <TopText style={styles.headerText}>{vendorData.businessName}</TopText>
//       </View>
//       <ScrollView style={styles.scrollView}>
//         <View style={styles.carouselContainer}>
//           <FlatList
//             ref={mainFlatListRef}
//             data={vendorData.images.map(imagePath => `${imagePath}`)}
//             renderItem={renderItem}
//             keyExtractor={(item, index) => index.toString()}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.carousel}
//           />
//           <TouchableOpacity
//             style={styles.leftButton}
//             onPress={goToPreviousImage}
//           >
//             <Text style={styles.buttonText}>{"<"}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.rightButton} onPress={goToNextImage}>
//             <Text style={styles.buttonText}>{">"}</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.infoContainer}>
//           <ReadMoreComponent description={vendorData.description} />
//           <View style={styles.infoItem}>
//             <Ionicons
//               name="home"
//               size={24}
//               color={Theme.themeColor}
//               style={styles.infoIcon}
//             />
//             <Text style={styles.infoText}>
//               <Text style={styles.label}>Address:</Text> {vendorData.address}
//             </Text>
//           </View>
//           <View style={styles.infoItem}>
//             <Ionicons
//               name="location"
//               size={24}
//               color={Theme.themeColor}
//               style={styles.infoIcon}
//             />
//             <Text style={styles.infoText}>
//               <Text style={styles.label}>City:</Text> {vendorData.address}
//             </Text>
//           </View>
//           <View style={styles.infoItem}>
//             <Ionicons
//               name="call"
//               size={24}
//               color={Theme.themeColor}
//               style={styles.infoIcon}
//             />
//             <Text style={styles.infoText}>
//               <Text style={styles.label}>Mobile Number:</Text>{" "}
//               {vendorData.contactInfo}
//             </Text>
//           </View>
//           <TouchableOpacity
//             style={styles.bookNowButton}
//             onPress={() => {
//               connectToChat(ownerId, vendorId, vendorId, navigation);
//             }}
//           >
//             <Text style={styles.bookNowButtonText}>Book Now</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//       <Modal
//         visible={viewerState.showViewer}
//         transparent={true}
//         onRequestClose={closeImageModal}
//       >
//         <View style={styles.modalContainer}>
//           <FlatList
//             ref={modalFlatListRef}
//             data={vendorData.images.map(imagePath => `${imagePath}`)}
//             renderItem={({ item }) => (
//                 <Image source={{ uri: item }} style={styles.modalImage} />
//             )}
//             keyExtractor={(item, index) => index.toString()}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             initialScrollIndex={viewerState.currentIndex}
//             getItemLayout={(data, index) => ({
//               length: screenWidth,
//               offset: screenWidth * index,
//               index,
//             })}
//             onScroll={({ nativeEvent }) => {
//               const { contentOffset, layoutMeasurement } = nativeEvent;
//               const index = Math.floor(
//                 contentOffset.x / layoutMeasurement.width
//               );
//               setViewerState((prevState) => ({
//                 ...prevState,
//                 currentIndex: index,
//               }));
//             }}
//           />

//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={closeImageModal}
//           >
//             <Text style={styles.closeButtonText}>Close</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.leftButton}
//             onPress={goToPreviousImage}
//           >
//             <Text style={styles.buttonText}>{"<"}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.rightButton} onPress={goToNextImage}>
//             <Text style={styles.buttonText}>{">"}</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </SafeArea>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//   },
//   headerText: {
//     color: Theme.themeColor,
//     fontSize: 20,
//     fontWeight: "bold",
//     marginLeft: 10,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   carouselContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   carousel: {
//     alignItems: "center",
//     paddingTop: 10,
//   },
//   image: {
//     width: screenWidth * 0.9,
//     height: imageHeight,
//     borderRadius: 8,
//     marginHorizontal: screenWidth * 0.05,
//   },
//   infoContainer: {
//     flex: 4,
//     marginTop: 10,
//     width: "100%",
//     paddingHorizontal: 16,
//   },
//   infoText: {
//     color: "black",
//     fontSize: 18,
//     marginVertical: 4,
//   },
//   label: {
//     fontWeight: "bold",
//     fontSize: 18,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalImage: {
//     width: screenWidth,
//     height: "100%",
//     resizeMode: "contain",
//   },
//   closeButton: {
//     position: "absolute",
//     top: 20,
//     right: 20,
//     padding: 10,
//     backgroundColor: "white",
//     borderRadius: 20,
//   },
//   closeButtonText: {
//     color: "black",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   leftButton: {
//     position: "absolute",
//     left: 10,
//     top: "50%",
//     transform: [{ translateY: -25 }],
//     padding: 10,
//     backgroundColor: "rgba(255, 255, 255, 0.5)",
//     borderRadius: 20,
//   },
//   rightButton: {
//     position: "absolute",
//     right: 10,
//     top: "50%",
//     transform: [{ translateY: -25 }],
//     padding: 10,
//     backgroundColor: "rgba(255, 255, 255, 0.5)",
//     borderRadius: 20,
//   },
//   buttonText: {
//     fontSize: 30,
//     color: "white",
//   },
//   readMoreContainer: {
//     marginBottom: 16,
//     marginVertical: 10,
//   },
//   description: {
//     fontSize: 18,
//     color: "black",
//     marginTop: 10,
//   },
//   readMore: {
//     color: Theme.themeColor,
//     fontSize: 18,
//   },
//   facilitiesContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 24, // Increase the padding to make the container taller
//   },
//   facilitiesLabel: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 8,
//     color: "black",
//   },
//   facilitiesIcons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//   },
//   facilityItem: {
//     alignItems: "center",
//     marginBottom: 16, // Add margin bottom to create space between items
//   },
//   facilityText: {
//     fontSize: 18, // Increase the font size of the facility text
//     color: "black",
//   },
//   priceBookNowContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderTopWidth: 1,
//     borderColor: "#fff",
//   },
//   priceText: {
//     color: Theme.themeColor,
//     fontSize: 32, // Increase the font size to make it bigger
//     fontWeight: "bold",
//   },
//   priceLabel: {
//     fontSize: 24,
//   },
//   bookNowButton: {
//     backgroundColor:Theme.themeColor,
//     borderRadius: 12, // Increase the border radius to make it rounder
//     paddingVertical: 18, // Increase the padding vertically to make it taller
//     paddingHorizontal: 24, // Increase the padding horizontally to make it wider
//   },
//   bookNowButtonText: {
//     color: "white",
//     fontSize: 20, // Increase the font size to make it bigger
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   infoItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   infoIcon: {
//     marginRight: 10,
//   },
//   facilitiesLabelContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   facilitiesIcon: {
//     marginRight: 10,
//   },
// });
