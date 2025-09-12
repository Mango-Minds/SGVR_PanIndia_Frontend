import React, { useState, useEffect, useRef } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  ScrollView,
  SafeAreaView,
  PanResponder,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useSelector } from "react-redux";
import { Row } from "../../styles/dashboard.styles";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import { Card, Button } from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import UserImg from "../../assets/images/general/user.png";
import { BASEAPIURL } from "../../infrastructure/constants";
import { Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base-64";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";
import { useIsFocused } from "@react-navigation/native";
import { RowBetween } from "../../styles/common.styles";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Linking } from "react-native";
import * as Location from "expo-location";
import { VideoView, useVideoPlayer } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import { fetchSingleProduct, deleteSingleProduct } from "./B2CAPI";
import { Container } from "../../styles/common.styles";
import { connectToChat, reportPostApi } from "./B2CAPI";
import { useTranslation } from "react-i18next";
import DynamicProductInfo from "../../components/B2C/DynamicProductInfo";
const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const EachListing = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const videoRef = useRef(null);
  const { t } = useTranslation();
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const { itemId, fetchProducts } = route.params;
  const { user } = useSelector((state) => state.user);
  const userId = user?._id;
  console.log("User id: ", userId);

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  console.log("itemId: ", itemId);

  const loggedInUserId = decodedPayload.id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRepostModalVisible, setRepostModalVisible] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  const [productData, setProductData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  //co
  // const deleteProduct = async () => {
  //   try {
  //     let token = await AsyncStorage.getItem("token");

  //     if (!token) {
  //       console.error("Bearer token not found");
  //       Alert.alert("Error", "Authentication token is missing.");
  //       return;
  //     }

  //     // Make the DELETE request using apiClient
  //     const response = await apiClient.delete(`/listings/delete/${itemId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     Alert.alert(
  //       "Success",
  //       "Product deleted successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             fetchProducts();
  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error deleting product:", error);
  //     Alert.alert(
  //       "Error",
  //       `Something went wrong: ${error.message}`,
  //       [{ text: "OK" }],
  //       { cancelable: false }
  //     );
  //   }
  // };

  // const fetchProduct = async () => {
  //   try {
  //     let token = await AsyncStorage.getItem("token");

  //     if (!token) {
  //       console.error("Bearer token not found");
  //       Alert.alert("Error", "Authentication token is missing.");
  //       return;
  //     }

  //     setLoadingAnimation(true);

  //     // Make the GET request using apiClient
  //     const response = await apiClient.get(`/listings/${itemId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     setProductData(response.data.listing);
  //   } catch (error) {
  //     console.error("Error fetching product:", error);
  //     Alert.alert("Error", "Failed to fetch product.");
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  const fetchProduct = async () => {
    setLoadingAnimation(true);
    const data = await fetchSingleProduct(itemId);
    if (data) {
      setProductData(data);
    }
    setLoadingAnimation(false);
  };

  const deleteProduct = async (id) => {
    const success = await deleteSingleProduct(id);
    if (success) {
      Alert.alert("Success", "Product deleted successfully", [
        {
          text: "OK",
          onPress: () => {
            if (fetchProducts && typeof fetchProducts === 'function') {
              fetchProducts("", [], "");
            }
            navigation.goBack();
          },
        },
      ]);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchProduct();
    }
  }, [isFocused]);

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [mediaType, setMediaType] = useState("image"); // Default to "image"

  useEffect(() => {
    if (productData?.videos?.length > 0) {
      setMediaType("video");
    } else if (productData?.images?.length > 0) {
      setMediaType("image");
    }
  }, [productData]);
  console.log("Mediatype: ", mediaType);

  const changeSelectedMedia = (index, type) => {
    setSelectedMediaIndex(index);
    setMediaType(type);
  };
  const closeRepostModal = () => {
    setRepostModalVisible(false);
    pan.setValue({ x: 0, y: 0 });
  };
  const openRepostModal = () => {
    setRepostModalVisible(true);
  };
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeRepostModal();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const extractCoordinates = (url) => {
    if (!url) return null;

    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),(\d+)z/;
    const match = url.match(regex);

    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);
      const zoom = parseInt(match[3]);

      let latitudeDelta, longitudeDelta;
      switch (zoom) {
        case 19:
          latitudeDelta = 0.0001;
          longitudeDelta = 0.0001;
          break;
        case 15:
          latitudeDelta = 0.01;
          longitudeDelta = 0.01;
          break;
        case 10:
          latitudeDelta = 0.1;
          longitudeDelta = 0.1;
          break;
        default:
          latitudeDelta = 0.1;
          longitudeDelta = 0.1;
      }

      return {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      };
    } else {
      return null;
    }
  };
  const url = productData?.address_link;
  const coordinates = extractCoordinates(url);

  const [mapReady, setMapReady] = useState(false);
  const [layout, setLayout] = useState({
    width: Dimensions.get("window").width,
    height: 200,
  });
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);

  useEffect(() => {
    if (layout.width > 0 && layout.height > 0 && coordinates) {
      setMapReady(true);
    }
  }, [layout, coordinates]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access location was denied. The map feature may not work as expected."
      );
      setLocationPermissionGranted(false);
      return false;
    }
    setLocationPermissionGranted(true);
    return true;
  };
  console.log("ProductData: ", productData);

  useEffect(() => {
    requestLocationPermission(); // Request location permissions on component mount
  }, []);
  const renderContentBackground = (user) => {
    console.log("Pd in content background: ", productData);

    return (
      <View style={styles.scrollContainer}>
        <RowBetween>
          <Modal
            transparent={true}
            visible={isRepostModalVisible}
            animationType="slide"
            onRequestClose={closeRepostModal}
          >
            <TouchableWithoutFeedback onPress={closeRepostModal}>
              <View style={styles.modalOverlay}>
                <Animated.View
                  style={[
                    styles.modalContainer,
                    { transform: [{ translateY: pan.y }] },
                  ]}
                  {...panResponder.panHandlers}
                >
                  <TouchableOpacity style={styles.modalOption}>
                    <View style={styles.iconTextContainer}>
                      <Text style={styles.modalText}>
                        {t("product")}: {productData.name}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Map Section */}
                  <TouchableOpacity style={styles.mapModalOption}>
                    <View
                      style={styles.mapContainer}
                      onLayout={(event) => {
                        const { width, height } = event.nativeEvent.layout;
                        if (width > 0 && height > 0) {
                          setLayout({ width, height });
                        }
                      }}
                    >
                      {coordinates && mapReady && locationPermissionGranted ? (
                        <MapView
                          style={{ width: layout.width, height: layout.height }}
                          provider={PROVIDER_GOOGLE}
                          initialRegion={{
                            latitude: coordinates.latitude,
                            longitude: coordinates.longitude,
                            latitudeDelta: coordinates.latitudeDelta,
                            longitudeDelta: coordinates.longitudeDelta,
                          }}
                          showsUserLocation
                          showsMyLocationButton
                          scrollEnabled={true}
                          zoomEnabled={true}
                          rotateEnabled={true}
                        >
                          <Marker
                            coordinate={{
                              latitude: coordinates.latitude,
                              longitude: coordinates.longitude,
                            }}
                          />
                        </MapView>
                      ) : (
                        <View style={styles.noMapContainer}>
                          <Text style={{ textAlign: "center", padding: 10 }}>
                            {coordinates === null
                              ? t("map_preview_not_available")
                              : t("location_not_available")}
                          </Text>
                          {url && (
                            <TouchableOpacity
                              onPress={() => Linking.openURL(url)}
                            >
                              <Text
                                style={{ textAlign: "center", color: "blue" }}
                              >
                                {t("open_in_google_maps")}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Address Section */}
                  <View style={styles.locationText}>
                    <View style={styles.iconTextContainer}>
                      <Text style={styles.modalSubText}>
                        {productData.address || t("address_not_available")}
                      </Text>

                      {url && (
                        <Ionicons
                          name="navigate"
                          size={24}
                          style={styles.navigateIcon}
                          onPress={() => {
                            Linking.openURL(url).catch((err) =>
                              console.error(
                                "Error opening location link: ",
                                err
                              )
                            );
                          }}
                        />
                      )}
                    </View>
                  </View>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </RowBetween>
      </View>
    );
  };

  const businessId = productData?.createdBy;

  // const connectToChat = async (owner_id, business_id, item) => {
  //   console.log("Owner id: ", owner_id);
  //   console.log("Business id: ", business_id);
  //   console.log("Item: ", item);

  //   if (owner_id === business_id) {
  //     console.log("Chat room cannot be created: same ID");
  //     return;
  //   }

  //   try {
  //     let token = await AsyncStorage.getItem("token");

  //     if (!token) {
  //       console.error("Bearer token not found");
  //       Alert.alert("Error", "Authentication token is missing.");
  //       return;
  //     }

  //     console.log("PD in connectToChat: ", productData);
  //     console.log("Authorization Header: ", `Bearer ${token}`);

  //     // Create chat room
  //     const response = await apiClient.post(
  //       "/chat/room/",
  //       { userIds: [owner_id, business_id] },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     console.log("Chat room creation response:", response);

  //     // Fetch chat rooms
  //     const roomResponse = await apiClient.get("/chat/rooms/", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (roomResponse.data && roomResponse.data.rooms.length > 0) {
  //       const room_with_user = roomResponse.data.rooms.find(
  //         (room) => room?.participants[0]?.id === business_id
  //       );

  //       console.log("Room with user: ", room_with_user);

  //       if (!room_with_user) {
  //         Alert.alert("Error", "No chat room found for this user.");
  //         return;
  //       }

  //       const initialMessage = `Hi, I have a query about this product: ${item?.name}\n Price: Rs. ${item.price} \n\nCan you provide more details?`;

  //       console.log("Initial Message: ", initialMessage);

  //       Alert.alert("OK", "Chat Room Created", [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             console.log("Navigating with Initial Message: ", initialMessage);
  //             navigation.navigate("ChatScreenNew", {
  //               user_auth_token: token,
  //               room: room_with_user,
  //               participant_name:
  //                 `${room_with_user.participants[0].firstName} ${room_with_user.participants[0].lastName}`,
  //               initialMessage,
  //             });
  //           },
  //         },
  //       ]);
  //     } else {
  //       Alert.alert("No rooms found");
  //     }
  //   } catch (error) {
  //     console.error("Error connecting to chat:", error);
  //     Alert.alert("Error", "Something went wrong while creating the chat room.");
  //   }
  // };

  const blockUser = async (blockedUserId) => {
    try {
      console.log("Blocking user", blockedUserId);
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASEAPIURL}/social/post/block-user/${blockedUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Block user response", response);
      if (response.ok) {
        const data = await response.json();
        Alert.alert("Success", data.message);
      } else {
        Alert.alert("Error", "Failed to block user.");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      Alert.alert("Error", "An error occurred while trying to block the user.");
    }
  };

  //  const reportPost = async (postId, reason) => {
  //     try {

  //       console.log("Reporting post", postId);
  //       const response = await reportPostApi(postId, reason);
  //       console.log("Report post response", response);

  //       if (response.status === 200) {
  //         Alert.alert(
  //           "Success",
  //           "If this post violates our policies, it will be removed within 24 hours."
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error reporting post:", error);
  //       Alert.alert(
  //         "Error",
  //         "An error occurred while trying to report the post."
  //       );
  //     }
  //   };
  const reportPost = async (postId, reason) => {
    try {
      console.log("Reporting post", postId);
      const response = await reportPostApi(postId, reason);
      console.log("Report post response", response);

      if (response.status === 200) {
        Alert.alert(
          "Success",
          "If this post violates our policies, it will be removed within 24 hours."
        );
      }
    } catch (error) {
      // Check if the error is due to already reported
      if (error.response && error.response.status === 400) {
        Alert.alert("Already Reported", "You have already reported this post.");
      } else {
        console.error("Error reporting post:", error);
        Alert.alert(
          "Error",
          "An error occurred while trying to report the post."
        );
      }
    }
  };

  const createdBy = productData?.createdBy;
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      {loadingAnimation ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={Theme.themeColor} />
        </View>
      ) : (
        <>
          <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {Object.keys(productData).length > 0 && (
              <View style={styles.headerImageContainer}>
                {mediaType === "image" ? (
                  <Image
                    style={styles.headerImage}
                    source={{
                      uri: `${productData.images[selectedMediaIndex]}`,
                    }}
                  />
                ) : (
                  <Video
                    ref={videoRef}
                    style={styles.headerImage}
                    source={{
                      uri: `${productData.videos[selectedMediaIndex]}`,
                    }}
                    controls
                    resizeMode="contain"
                    useNativeControls
                    isLooping
                    shouldPlay={false}
                  />
                )}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.gradientOverlay}
                />
                <TouchableOpacity style={styles.backButton}>
                  <IconButton
                    icon="arrow-left"
                    onPress={() => navigation.goBack()}
                  />
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[
                    ...(productData.images || []).map((image, index) => ({
                      type: "image",
                      src: image,
                      index,
                    })),
                    ...(productData.videos || []).map((video, index) => ({
                      type: "video",
                      src: video,
                      index,
                    })),
                  ].map((media, idx) => (
                    <View
                      key={idx}
                      style={{
                        margin: "3%",
                        marginHorizontal: 6,
                        borderWidth: 3,
                        borderColor:
                          selectedMediaIndex === media.index &&
                          mediaType === media.type
                            ? Theme.themeColor
                            : "transparent",
                        borderRadius: 7,
                        elevation:
                          selectedMediaIndex === media.index &&
                          mediaType === media.type
                            ? 5
                            : 0,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          changeSelectedMedia(media.index, media.type)
                        }
                      >
                        {media.type === "image" ? (
                          <Image
                            style={{ width: 60, height: 60, borderRadius: 5 }}
                            source={{ uri: `${media.src}` }}
                          />
                        ) : (
                          <Video
                            style={{ width: 60, height: 60, borderRadius: 5 }}
                            source={{ uri: `${media.src}` }}
                            controls
                            resizeMode="contain"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            <View style={styles.eventInfoContainer}>
              <View style={styles.nameAndLocationContainer}>
                <Text style={styles.headerTitle}>{productData.name}</Text>
                <TouchableOpacity onPress={openRepostModal}>
                  <View style={styles.locationContainer}>
                    <MaterialIcon
                      name="location-on"
                      size={18}
                      color={Theme.themeColor}
                    />
                    <Text style={styles.homeTown}>{productData.address}</Text>
                  </View>
                </TouchableOpacity>

                {/* <TouchableOpacity
                  style={{
                    position: "absolute",
                    right: -22,
                    top: -3,
                    zIndex: 10,
                  }}
                  onPress={() => {
                    setModalVisible(true)
                  }}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="gray" />
                </TouchableOpacity> */}
                {createdBy !== userId && (
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: -22,
                      top: -3,
                      zIndex: 10,
                    }}
                    onPress={() => {
                      setModalVisible(true);
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="gray" />
                  </TouchableOpacity>
                )}
              </View>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setModalVisible(false)}
                />

                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>{t("user_options")}</Text>
                  {/* Report Listing */}
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => {
                      setModalVisible(false);
                      reportPost(itemId, "Inappropriate content");
                    }}
                  >
                    <Text style={styles.optionText}>
                      {" "}
                      {t("report_listing")}
                    </Text>
                  </TouchableOpacity>
                  {/* Block User */}
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => {
                      setModalVisible(false);
                      blockUser(businessId);
                    }}
                  >
                    <Text style={styles.optionText}>{t("block_user")}</Text>
                  </TouchableOpacity>
                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={[styles.optionButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelText}>{t("cancel")}</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
              <ScrollView style={{ flex: 1 }}>
                {renderContentBackground()}
              </ScrollView>

              <View style={styles.eventDetails}>
                <Text style={styles.detailItem}>
                  {productData.productAge} | {productData.phone}
                </Text>
              </View>
            </View>

            <View style={styles.eventInfoContainer}>
              <View style={styles.eventDetails}>
                <Text style={styles.priceText}>{t("price_details")}</Text>

                {productData?.createdBy &&
                productData?.createdBy === user._id ? (
                  <TouchableOpacity
                    style={styles.editIconContainer}
                    onPress={() => {
                      navigation.navigate("EditListing", {
                        productId: productData._id,
                        listing: productData,
                        fetchProducts: fetchProducts,
                        fetchProduct: fetchProduct,
                      });
                    }}
                  >
                    <Icon name="pencil" size={24} color={Theme.themeColor} />
                  </TouchableOpacity>
                ) : null}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t("price")}</Text>
                  <Text style={styles.infoValue}>Rs. {productData.price}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t("original_price")}</Text>
                  <Text style={styles.infoValue}>
                    Rs. {productData.originalPrice}
                  </Text>
                </View>
              </View>
            </View>
            {/* Dynamic Product Information */}
            <DynamicProductInfo productData={productData} />
          </ScrollView>
          <View style={styles.bottomBarContainer}>
            <View style={styles.bottomBar}>
              <View style={styles.ticketInfoContainer}>
                {productData?.createdBy !== user._id ? (
                  <>
                    <Text style={styles.priceText}>{t("interested")}</Text>
                    <TouchableOpacity
                      style={styles.bookNowButton}
                      // onPress={() => {
                      //   connectToChat(loggedInUserId, businessId, productData);
                      // }}
                      onPress={() => {
                        connectToChat({
                          owner_id: loggedInUserId,
                          business_id: businessId,
                          productData,
                          navigation,
                        });
                      }}
                    >
                      <Text style={styles.bookNowButtonText}>
                        {t("message_owner")}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.priceText}>{t("delete_product")}</Text>
                    <TouchableOpacity
                      style={styles.bookNowButton}
                      onPress={() => deleteProduct(productData._id)}
                    >
                      <Text s style={styles.bookNowButtonText}>
                        {t("delete")}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default EachListing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerImageContainer: {
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: 400,
  },
  gradientOverlay: {
    position: "",
    top: "20px",
    left: 0,
    right: 0,
    bottom: "150px",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: Theme.themeColor,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    bottom: 10,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
  },

  headerTitle: {
    bottom: 10,
    left: 0,
    color: Theme.themeColor,
    fontSize: 26,
    fontWeight: "bold",
  },
  contact: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1C1C1C",
    marginLeft: 10,
    lineHeight: 20,
  },
  homeTown: {
    fontSize: 13,
    fontWeight: "400",
    color: Theme.themeColor,
    marginLeft: 5,
    lineHeight: 20,
  },
  nameAndLocationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventInfoContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    padding: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  interestedText: {
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  interestedButton: {
    borderWidth: 1,
    borderColor: "#f44336",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  interestedButtonText: {
    color: "#f44336",
    fontWeight: "bold",
  },

  eventDetails: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  productUsage: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    color: "black",

    fontSize: 18,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
  },

  ticketInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "white",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  phoneDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
  },
  fillingFast: {
    color: "orange",
    fontWeight: "bold",
  },
  bookNowButton: {
    backgroundColor: Theme.themeColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  bookNowButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 2,
  },
  hobbiesContainer: {
    marginTop: 10,
  },
  bottomBarContainer: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  hobbiesHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: Theme.themeColor,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    padding: 5,
    margin: 2,
  },
  tagText: {
    color: "#fff",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: "black",
    width: 150,
  },
  infoValue: {
    fontSize: 16,
    color: "black",
    flex: 1,
  },

  card: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subText: {
    fontSize: 14,
    color: "#555",
  },
  updateText: {
    fontSize: 12,
    color: "#888",
  },
  kmText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#27ae60",
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: "#888",
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  detailItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#f4c20d",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  editIconContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: Theme.themeBackgroundColor,
    borderRadius: 20,
    padding: 5,
    zIndex: 1,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  // scrollContainer: {
  //   borderRadius: 16,
  //   padding: 16,
  //   position: "relative",
  // },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: "gray",
  },

  //Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    // height: "40%",
  },
  modalOption: {
    padding: 10,
    width: "100%",
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  modalText: {
    fontSize: 18,
    textAlign: "left",
  },
  postIcon: {
    marginRight: 10,
    color: "red",
  },
  modalPostText: {
    fontSize: 18,
    textAlign: "left",
    color: "red",
  },
  modalSubText: {
    fontSize: 15,
    color: "gray",
    marginTop: 5,
    marginLeft: "auto",
  },
  swipeBar: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  bar: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
  },

  //map
  mapModalOption: {
    padding: 10,
    width: "100%",
    borderRadius: 10,
    marginRight: 60,
  },
  mapContainer: {
    flex: 1,

    marginRight: 10,
  },

  map: {
    flex: 1,
    width: "100%",
    marginRight: -10,
  },

  locationText: {
    marginTop: 200,
  },
  noMapContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    padding: 10,
    width: "100%",
    left: 30,
  },
  noMapText: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  navigateIcon: {
    marginTop: 10,
    left: 100,
  },
  optionButton: {
    width: "100%",
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
});
