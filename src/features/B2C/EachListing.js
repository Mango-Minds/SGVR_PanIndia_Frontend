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
} from "react-native";

import { useSelector } from "react-redux";
import { Row } from "../../styles/dashboard.styles";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import { Card, Button } from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import UserImg from "../../assets/images/general/user.png";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
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
import { Video } from "expo-av";
import * as VideoThumbnails from "expo-video-thumbnails";
const windowWidth = Dimensions.get("window").width;
export default function EachListing({ route, navigation }) {
  const { user } = useSelector((state) => state.user);
  const isFocused = useIsFocused();
  const { itemId, item, fetchProducts } = route.params;
  console.log("Item: ", item);
  console.log("Item id in each listing: ", itemId);
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const loggedInUserId = decodedPayload.id;
  console.log("loggedInUserId: ", loggedInUserId);
  const userType = decodedPayload.userType;
  const businessId = item?.createdBy?._id;
  console.log("BI: ", businessId);
  // const [productData, setProductData] = useState({});

  // const fetchProduct = async () => {
  //   try {
  //     const response = await fetch(`${BASEAPIURL}/listings/${itemId}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (!response.ok) {
  //       const errorMessage = await response.text();
  //       throw new Error(`Failed to fetch product: ${errorMessage}`);
  //     }

  //     const data = await response.json();
  //     console.log("Fetched Product:", data);
  //     setProductData(data.listing);
  //   } catch (error) {
  //     console.error("Error fetching product:", error);
  //   }
  // };

  // useEffect(() => {
  //   if (isFocused) {
  //     fetchProduct();
  //   }
  // }, [isFocused]);
  // console.log("ProductData: ", productData);
  const deleteProduct = async () => {
    try {
      // Make the DELETE request
      const response = await fetch(
        `${BASEAPIURL}/listings/delete/${item._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Failed to delete product: ${errorText}`);
      }

      Alert.alert(
        "Success",
        "Product deleted successfully",
        [
          {
            text: "OK",
            onPress: () => {
              fetchProducts();
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      Alert.alert(
        "Error",
        `Something went wrong: ${error.message}`,
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused]);
  console.log("Item: ", item);

  const [isRepostModalVisible, setRepostModalVisible] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const HEADER_EXPANDED_HEIGHT = 400;
  const HEADER_COLLAPSED_HEIGHT = 60;
  const [showViewer, setShowViewer] = React.useState(false);
  let scrollY = new Animated.Value(0);
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: "clamp",
  });

  const renderContentBackground = (user) => {
    const url = item?.address_link;
    const [mapReady, setMapReady] = useState(false);
    const [layout, setLayout] = useState({
      width: Dimensions.get("window").width,
      height: 200,
    });
    const [locationPermissionGranted, setLocationPermissionGranted] =
      useState(false);
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

    const coordinates = extractCoordinates(url);

    useEffect(() => {
      requestLocationPermission(); // Request location permissions on component mount
    }, []);
    console.log("coordinates: ", coordinates);
    console.log("Layout: ", layout);
    console.log("Map Ready: ", mapReady);
    console.log("Location Granted: ", locationPermissionGranted);

    useEffect(() => {
      if (layout.width > 0 && layout.height > 0 && coordinates) {
        setMapReady(true);
      }
    }, [layout, coordinates]);

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
                      <Text style={styles.modalText}>Product: {item.name}</Text>
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
                              ? "Map preview not available."
                              : "Location not available"}
                          </Text>
                          {url && (
                            <TouchableOpacity
                              onPress={() => Linking.openURL(url)}
                            >
                              <Text
                                style={{ textAlign: "center", color: "blue" }}
                              >
                                Open in Google Maps
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
                        {item.address || "Address not available"}
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

  const connectToChat = async (owner_id, business_id, item) => {
    console.log("Owner id: ", owner_id);
    console.log("Business id: ", business_id);
    console.log("Item: ", item);
    if (owner_id === business_id) {
      console.log("Chat room Cannot be created: same id");
    } else {
      try {
        const response = await fetch(`${BASEAPIURL}/chat/room/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [owner_id, business_id] }),
        });
        console.log("Response: ", response);
        console.log("Authorization: ", `Bearer ${token}`);
        if (response.ok) {
          const roomResponse = await fetch(`${BASEAPIURL}/chat/rooms/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            console.log("Room Details: ", roomData);
            if (roomData && roomData.rooms && roomData.rooms.length > 0) {
              const room = roomData.rooms[0];
              console.log("Room: ", room);

              const room_with_user = roomData?.rooms.filter((room) => {
                console.log(
                  "room?.participants[0].id:",
                  room?.participants[0]?.id
                );
                console.log("business_id:", business_id);
                return room?.participants[0]?.id === business_id;
              })[0];

              console.log("Room with user: ", room_with_user);
              const initialMessage = `Hi, I have a query about this product:${item?.name}\n Price: Rs. ${item.price} \n\nCan you provide more details?`;
              console.log("IM: ", initialMessage);

              Alert.alert("OK", "Chat Room Created", [
                {
                  text: "OK",
                  onPress: () => {
                    console.log(
                      "Navigating with Initial msg: ",
                      initialMessage
                    );
                    navigation.navigate("ChatScreenNew", {
                      user_auth_token: token,
                      room: room_with_user,
                      participant_name:
                        room_with_user.participants[0].firstName +
                        " " +
                        room_with_user.participants[0].lastName,
                      initialMessage, // Pass the message correctly
                    });
                  },
                },
              ]);
            } else {
              Alert.alert("No rooms found");
            }
          } else {
            const errorData = await roomResponse.json();
            console.error("Error Fetching Room Details:", errorData);
            Alert.alert("Error Fetching Room Details");
          }
        } else {
          const errorData = await response.json();
          console.error("Error Creating Chat Room:", errorData);
          Alert.alert("Error Creating Chat Room");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const [thumbnails, setThumbnails] = useState([]);

  const generateThumbnail = async (videoUri) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 10000,
      });
      setThumbnails((prevThumbnails) => [...prevThumbnails, uri]);
    } catch (e) {
      console.warn("Could not generate thumbnail", e);
    }
  };

  useEffect(() => {
    if (item?.videos && item?.videos.length > 0) {
      item.videos.forEach((videoUri) => {
        generateThumbnail(`${BASEIMGURL}${videoUri}`);
      });
    }
  }, [item?.videos]);

  const handleThumbnailClick = (index) => {
    if (index < item?.images.length) {
      setCurrentIndex(index);
    } else {
      const videoIndex = index - item?.images?.length;
      setCurrentIndex(item?.images.length + videoIndex);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <ScrollView style={styles.container}>
        {/* Main Image */}
        <View style={styles.headerImageContainer}>
          {currentIndex < item?.images?.length ? (
            <Image
              source={{ uri: `${BASEIMGURL}${item?.images[currentIndex]}` }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          ) : (
            <Video
              source={{
                uri: `${BASEIMGURL}${
                  item?.videos[currentIndex - item?.images.length]
                }`,
              }} // Use correct video URI
              style={styles.headerImage}
              useNativeControls
              isLooping
              shouldPlay
            />
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradientOverlay}
          />
          <TouchableOpacity style={styles.backButton}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          </TouchableOpacity>
        </View>

        <View style={{ paddingTop: 16, paddingBottom: 16, marginLeft: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {item?.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleThumbnailClick(index)}
                style={{
                  borderWidth: currentIndex === index ? 2 : 0,
                  borderColor:
                    currentIndex === index ? "transparent" : "transparent",
                  borderRadius: 8,
                }}
              >
                <Image
                  source={{ uri: `${BASEIMGURL}${image}` }}
                  resizeMode="cover"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    marginRight: 10,
                  }}
                />
              </TouchableOpacity>
            ))}

            {item?.videos.map((video, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  handleThumbnailClick(item?.images.length + index)
                } // Click on video thumbnail
                style={{
                  borderWidth:
                    currentIndex === item?.images.length + index ? 2 : 0,
                  borderColor:
                    currentIndex === item?.images.length + index
                      ? "transparent"
                      : "transparent",
                  borderRadius: 8,
                }}
              >
                <Image
                  source={{ uri: thumbnails[index] }} // Display thumbnail for video
                  resizeMode="cover"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    marginRight: 10,
                  }}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.nameAndLocationContainer}>
            <Text style={styles.headerTitle}>{item.name}</Text>
            <TouchableOpacity onPress={openRepostModal}>
              <View style={styles.locationContainer}>
                <MaterialIcon
                  name="location-on"
                  size={18}
                  color={Theme.themeColor}
                />
                <Text style={styles.homeTown}>{item.address}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }}>
            {/* {renderBackground()} */}
            {renderContentBackground()}
          </ScrollView>

          <View style={styles.eventDetails}>
            <Text style={styles.detailItem}>
              {item.productAge} | {item.phone}
            </Text>
          </View>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.eventDetails}>
            <Text style={styles.priceText}>Price Details</Text>

            {(typeof item.createdBy === "string"
              ? item.createdBy
              : item.createdBy._id) === user._id && (
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={() => {
                  navigation.navigate("EditListing", {
                    productId: productData._id,
                    product: productData,
                    fetchProducts: fetchProducts,
                  });
                }}
              >
                <Icon name="pencil" size={24} color={Theme.themeColor} />
              </TouchableOpacity>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>Rs. {item.price}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Original Price</Text>
              <Text style={styles.infoValue}>Rs. {item.originalPrice}</Text>
            </View>
          </View>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.eventDetails}>
            <Text style={styles.priceText}>Product Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Condition</Text>
              <Text style={styles.infoValue}>{item.condition}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Product age</Text>
              <Text style={styles.infoValue}>{item.productAge}</Text>
            </View>
          </View>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.eventDetails}>
            <Text style={styles.priceText}>Product Description</Text>
            <Text style={styles.bioText}>{item.description}</Text>
          </View>
        </View>
      </ScrollView>

      {console.log("CB: ", item.createdBy?._id)}
      {console.log("UI: ", user._id)}
      {/* {item.createdBy?._id !== user._id ? (
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomBar}>
            <View style={styles.ticketInfoContainer}>
              <Text style={styles.priceText}>Interested</Text>

              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => {
                  connectToChat(loggedInUserId, businessId, item);
                }}
              >
                <Text style={styles.bookNowButtonText}>Message Owner</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomBar}>
            <View style={styles.ticketInfoContainer}>
              <Text style={styles.priceText}>Delete Product</Text>
              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => deleteProduct(item.id)}
              >
                <Text s style={styles.bookNowButtonText}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )} */}
      {(typeof item.createdBy === "string"
        ? item.createdBy
        : item.createdBy._id) !== user._id ? (
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomBar}>
            <View style={styles.ticketInfoContainer}>
              <Text style={styles.priceText}>Interested</Text>

              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => {
                  connectToChat(loggedInUserId, businessId, item);
                }}
              >
                <Text style={styles.bookNowButtonText}>Message Owner</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomBar}>
            <View style={styles.ticketInfoContainer}>
              <Text style={styles.priceText}>Delete Product</Text>
              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => deleteProduct(item._id)}
              >
                <Text s style={styles.bookNowButtonText}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

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
    fontFamily: "Courier New",
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
});
