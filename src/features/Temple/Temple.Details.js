import React, { useState, useEffect, useRef } from "react";
import { Alert, BackHandler } from "react-native";
import { Calendar } from "react-native-calendars";
import { getImageUrl } from "../../services/socialMedia.services";
import {
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  PanResponder,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import Theme from "../../styles/theme";
import ParallaxScrollView from "react-native-parallax-scroll-view";
import Temp1 from "../../assets/images/Temple/temp1.jpg";
import { SafeArea } from "../../components/utility/safe-area.component";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Row } from "../../styles/dashboard.styles";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";
import { useQuery } from "react-query";
import { getShceduledDates } from "../../services/matrimony.services";
import CommunityMemberCard from "../../components/community/communityMemberCard";
import { useNavigation } from "@react-navigation/native";
import { getAllEventsTemple } from "../../services/Temple.Services";
import { TempleEvents } from "./TempleEvents";
import { Card, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import moment from "moment";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import TempleShops from "./TempleShops";
import { decode } from "base-64";
import { useIsFocused } from "@react-navigation/native";
import GodCard from "./GodsCard";
import BottomNavigation from "./BottomNavigation";
import UserImg from "../../assets/images/general/user.png";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Linking } from "react-native";
import * as Location from "expo-location";
import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
const TempleDetails = ({ route, navigation }) => {
  const Navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const { t } = useTranslation();
  console.log("User in temple details: ", user);
  const outeruser = useSelector((state) => state.user);
  const isFocused = useIsFocused();

  const token = useSelector((state) => state.user.token);
  console.log("temple details page usertoken: ", token);
  const userType = useSelector((state) => state.user.user.userType[0]);
  const { templeinfo, fromPandits } = route.params;
  const ShopId = user?.roleData?._id;
  console.log("Shopid: ", ShopId);

  const [templeDetails, setTempleDetails] = useState(templeinfo);
  const [isRequestSent, setIsRequestSent] = useState(false);
  console.log("templeDetails in details page: ", templeDetails);
  const tokenPayload = token?.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  console.log(decodedPayload);
  const userId = decodedPayload.id;
  console.log("outeruser", outeruser);

  console.log("templeinfo in details: ", templeinfo);
  console.log("Locaion link: ", templeDetails.templeLocationLink);

  useEffect(() => {
    async () => {
      const getCalendarEvents = await getAllEventsTemple(templeinfo._id);
    };
  }, []);

  const [selectedTab, setSelectedTab] = useState("Events");

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };

  const [vendorImages, setVendorImages] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().toISOString().slice(5, 7)); // 05/02/2022
  const [markedDates, setMarkedDates] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);

  const HEADER_EXPANDED_HEIGHT = 400;
  const HEADER_COLLAPSED_HEIGHT = 60;
  const [showViewer, setShowViewer] = React.useState(false);
  let scrollY = new Animated.Value(0);

  const [members, setMembers] = useState(templeinfo ? templeinfo.members : []);
  console.log("Members in details page: ", members);
  const [gods, setGods] = useState(templeinfo ? templeinfo.gods : []);
  // const gods = templeinfo ? templeinfo.gods : [];
  console.log("Gods: ", gods);

  const pandits = templeinfo ? templeinfo.pandits : [];
  console.log("Pandits: ", pandits);

  // const fetchTemple = async () => {
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/temple/${templeDetails._id}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch temple");
  //     }
  //     const data = await response.json();
  //     console.log("temple response data", data);
  //     setTempleDetails(data);
  //     setMembers(data.members);
  //     setGods(data.gods);
  //   } catch (error) {
  //     console.error("Error deleting temple:", error);
  //   }
  // };

  const fetchTemple = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/temple/${templeDetails._id}`);
      console.log("Temple Data: ", response.data);

      const selectedLanguage =
        (await AsyncStorage.getItem("user-language")) || "en";

      if (response.status === 200) {
        const templeData = response.data;
        console.log("templeData in Details: ", templeData);

        if (selectedLanguage !== "en" && Array.isArray(templeData)) {
          const translationResponse = await apiClient.post("/translate", {
            data: templeData,
            targetLang: selectedLanguage,
          });

          if (translationResponse?.data?.translatedData?.length) {
            setTempleDetails(translationResponse.data.translatedData);
            console.log(
              "Translated response fetchTemple: ",
              translationResponse?.data
            );
          } else {
            setTempleDetails(translationResponse.data.translatedData);
          }
          console.log(
            "temple Data in Details 2: ",
            translationResponse.data.translatedData
          );

          setMembers(data.members);
          setGods(data.gods);
        } else {
          setTempleDetails(templeData);
        }
      }
    } catch (error) {
      console.error("Error fetching temple:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchTemple();
    }
  }, [isFocused]);

  // const deleteTemple = async () => {
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/temple/${templeDetails._id}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log("temple deletion response", response);
  //     if (!response.ok) {
  //       throw new Error("Failed to delete temple");
  //     }

  //     Alert.alert(
  //       "Success",
  //       "Temple deleted successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error deleting temple:", error);
  //   }
  // };
  const deleteTemple = async () => {
    try {
      await apiClient.delete(`/temple/${templeDetails._id}`);
      Alert.alert(
        "Success",
        "Temple deleted successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error deleting temple:", error);
    }
  };
  const confirmDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete the temple?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => deleteTemple(),
        },
      ],
      { cancelable: false }
    );
  };

  const [shopData, setShopData] = useState([]);

  const fetchShops = async () => {
    try {
      const response = await apiClient.get("/templeShops");
      console.log("Shop Data: ", response.data);

      const selectedLanguage =
        (await AsyncStorage.getItem("user-language")) || "en";

      if (response.status === 200) {
        const shopsData = response.data;
        console.log("shopsData in fetchShops Details: ", shopsData);

        if (selectedLanguage !== "en" && Array.isArray(shopsData)) {
          const translationResponse = await apiClient.post("/translate", {
            data: shopsData,
            targetLang: selectedLanguage,
          });

          if (translationResponse?.data?.translatedData?.length) {
            setShopData(translationResponse.data.translatedData);
            console.log(
              "Translated response fetchShops: ",
              translationResponse?.data
            );
          } else {
            setShopData(shopsData);
          }
          
        } else {
          setShopData(shopsData);
        }
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchShops();
    }
  }, [isFocused]);

  console.log("ShopData in details: ", shopData);
  const loggedInShop = shopData.find(
    (shop) =>
      (shop.owner && shop.owner.id?._id === userId) || shop.owner === userId
  );

  console.log("Loggedinshop data: ", loggedInShop);

  const templeShopId = loggedInShop ? loggedInShop._id : null;

  console.log("shop id:", templeShopId);

  // const handleConnect = async () => {
  //   try {

  //     let url;
  //     let requestBody;

  //     if (userType === "templeShopOwner") {
  //       url = `${BASEAPIURL}/templeConnections/request`;
  //       requestBody = {
  //         templeId: templeinfo._id,
  //         templeShopId,
  //       };
  //     } else if (userType === "pandit") {
  //       url = `${BASEAPIURL}/panditToTempleRequest`;
  //       requestBody = {
  //         requestToTempleId: templeinfo._id,
  //         requestByPanditId: user.roleData._id,
  //       };
  //     }

  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(requestBody),
  //     });
  //     console.log("response of sending request", response);
  //     if (response.ok) {
  //       setIsRequestSent(true);
  //       Alert.alert("Success", "Connection request sent successfully", [
  //         {
  //           text: "OK",
  //         },
  //       ]);
  //     } else {
  //       console.error("Failed to send connection request");
  //     }
  //   } catch (error) {
  //     console.error("Error connecting to user:", error);
  //   }
  // };

  // const goToEvents = (date) => {
  //   Navigation.navigate("TempleEvents", {
  //     date: date,
  //     templeAdmin: templeDetails.createdBy,
  //     templeId: templeDetails._id,
  //     templePandits: templeDetails.pandits,

  //   });
  // };
  const handleConnect = async () => {
    try {
      let url = "";
      let requestBody = {};
      console.log("templeinfo._id: ", templeinfo._id);
      console.log("user?.roleData?.pandit?._id: ", user?.roleData?.pandit?._id);
      console.log("templeShopId: ", templeShopId);
      

      if (userType === "templeShopOwner") {
        url = "/templeConnections/request";
        requestBody = {
          templeId: templeinfo._id,
          templeShopId,
        };
         console.log("Request body: ", requestBody);
      } else if (userType === "pandit") {
        url = "/panditToTempleRequest";
        requestBody = {
          requestToTempleId: templeinfo._id,
          requestByPanditId: user?.roleData?.pandit?._id,
        };
        console.log("Request body: ", requestBody);
      }

      await apiClient.post(url, requestBody);
      setIsRequestSent(true);
      Alert.alert(t("success"), t("connectionReqSentSuccessfully"), [
        { text: t("ok") },
      ]);
    } catch (error) {
      console.error("Error connecting to user:", error);
       Alert.alert(t("error"), t("connectionReqFailed"), [{ text: t("ok") }]);
    }
  };

 

  const goToEvents = (date) => {
    navigation.navigate("TempleEvents", {
      date,
      templeAdmin: templeDetails.createdBy,
      templeId: templeDetails._id,
      templePandits: templeDetails.pandits,
      onMarkedDatesUpdate: (updatedDates) => {
        setMarkedDates(updatedDates);
        setLoadingDates(false);
      },
    });
  };

  console.log("templeDetails.createdBy: ", templeDetails.createdBy);

  const today = moment().format("YYYY-MM-DD");
  useEffect(() => {
    // Simulate fetching data
    const updateMarkedDates = () => {
      const today = moment();
      const nextDay = moment(today).add(1, "days");
      const dayAfterNext = moment(today).add(2, "days");

      const newMarkedDates = {
        [today.format("YYYY-MM-DD")]: { marked: true, dotColor: "#D8AE25" },
        [nextDay.format("YYYY-MM-DD")]: { marked: false, dotColor: "#D8AE25" },
        [dayAfterNext.format("YYYY-MM-DD")]: {
          marked: false,
          dotColor: "#D8AE25",
        },
      };

      setMarkedDates(newMarkedDates);
    };

    updateMarkedDates();
    setLoadingDates(false);
  }, []);

  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const renderDescription = () => {
    if (showFullDescription) {
      return (
        <Text style={{ color: "#898E92", marginTop: "2%", marginBottom: "2%" }}>
          {templeDetails.description}
        </Text>
      );
    } else {
      const truncatedDescription = templeDetails.description
        ?.split(" ")
        .slice(0, 20)
        .join(" ");
      return (
        <Text style={{ color: "#898E92", marginTop: "2%", marginBottom: "2%" }}>
          {truncatedDescription}...
        </Text>
      );
    }
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: "clamp",
  });
  const isPanditWithTemples =
    user.userType === "pandit" && user.roleData.temples.length > 0;
  console.log("ispandit: ", isPanditWithTemples);

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

  const renderBackground = () => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => setShowViewer(true)}>
        <Animated.View style={{ height: headerHeight }}>
          <Image
            source={{ uri: `${templeDetails.images[0]}` }}
            resizeMode="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderContentBackground = (user) => {
    const url = templeDetails?.templeLocationLink;
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

    const fetchEventDates = async (month, year) => {
      setLoadingDates(true); // Show loading indicator while fetching

      try {
        const response = await apiClient.get(
          `templeEvents/eventsByMonth?templeId=${templeDetails._id}&month=${month}&year=${year}`,
          {}
        );

        const dates = response.data.dates || [];
        let updatedMarkedDates = {};
        const today = new Date().toISOString().slice(0, 10);

        if (!dates.includes(today)) {
          updatedMarkedDates[today] = {
            marked: true,
            dotColor: Theme.themeColor,
            dots: [
              { key: "dot1", color: Theme.themeColor },
              { key: "dot2", color: Theme.themeColor },
            ],
          };
        }

        // Process event dates
        dates.forEach((date) => {
          if (date !== today) {
            updatedMarkedDates[date] = {
              marked: true,
              dotColor: Theme.themeColor,
              dots: [{ key: "dot1", color: Theme.themeColor }],
            };
          }
        });

        console.log("Updated marked dates:", updatedMarkedDates);

        setMarkedDates((prevDates) => ({
          ...prevDates,
          ...updatedMarkedDates,
        }));
      } catch (error) {
        console.error("Error fetching event dates:", error);
      } finally {
        setLoadingDates(false);
      }
    };
    console.log("Marked dates: ", markedDates);

    // On calendar month change, fetch and mark dates
    const handleMonthChange = (data) => {
      const month = parseInt(data.dateString.slice(5, 7));
      const year = parseInt(data.year);
      fetchEventDates(month, year); // Fetch and mark dates for the new month
    };

    useEffect(() => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      fetchEventDates(currentMonth, currentYear); // Fetch events for the current month on load
    }, []);

    useEffect(() => {
      fetchEventDates();
    }, [month, year]);

    return (
      <View style={styles.scrollContainer}>
        <RowBetween>
          <View>
            <Text style={styles.title}>{templeDetails.templeName}</Text>
          </View>
          <TouchableOpacity onPress={openRepostModal}>
            <View style={styles.infoContainer}>
              <Ionicons name="location" size={16} color="gray" />
              <Text style={styles.infoText}>{t("locationInfo")}</Text>
            </View>
          </TouchableOpacity>

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
                  {/* Temple Name */}
                  <TouchableOpacity style={styles.modalOption}>
                    <View style={styles.iconTextContainer}>
                      <Text style={styles.modalText}>
                        {t("TempleName")} : {templeDetails.templeName}
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
                            title={templeDetails.templeName}
                            description={templeDetails.address}
                          />
                        </MapView>
                      ) : (
                        <View style={styles.noMapContainer}>
                          <Text style={{ textAlign: "center", padding: 10 }}>
                            {coordinates === null
                              ? t('mapPreviewNotAvailable')
                              : t('locationNotAvailable')}
                          </Text>
                          {url && (
                            <TouchableOpacity
                              onPress={() => Linking.openURL(url)}
                            >
                              <Text
                                style={{ textAlign: "center", color: "blue" }}
                              >
                                {t("OpeninGoogleMaps")}
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
                      <Ionicons name="location" size={24} style={styles.icon} />
                      <Text style={styles.modalSubText}>
                        {templeDetails.address || "Address not available"}
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
        <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
          {t("Temple'sGallery")}
        </Text>
        <Row style={{ paddingTop: 16, paddingBottom: 16 }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {templeDetails.images.map((item, index) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setCurrentIndex(index);
                    setShowViewer(true);
                  }}
                  key={index}
                >
                  <Image
                    source={{ uri: `${item}` }}
                    resizeMode="cover"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      marginRight: 10,
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Row>
        <View>
          <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
            {t("aboutTemple")}
          </Text>

          {renderDescription()}
          <TouchableOpacity onPress={toggleDescription}>
            <Text style={styles.readMore}>
              {showFullDescription ? t("readLess") : t("readMore")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: Theme.themeBackgroundColor,
              padding: 8,
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="map-marker" size={20} color={Theme.themeColor} />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#656565",
              marginLeft: 12,
              marginRight: 16,
              width: "90%",
              textTransform: "capitalize",
            }}
          >
            {templeDetails.city}, {templeDetails.country}
          </Text>
        </View>

        <View>
          <View style={styles.contentContainer}>
            <View
              style={{
                backgroundColor: Theme.themeBackgroundColor,
                padding: 8,
                borderRadius: 20,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="email" size={20} color={Theme.themeColor} />
            </View>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#656565",
                  marginLeft: 12,
                  marginRight: 16,
                  width: "90%",
                }}
              >
                {templeDetails.email}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contentContainer}>
            <View
              style={{
                backgroundColor: Theme.themeBackgroundColor,
                padding: 8,
                borderRadius: 20,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="phone" size={20} color={Theme.themeColor} />
            </View>

            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  color: "#656565",
                  marginLeft: 12,
                  marginRight: 16,
                  width: "90%",
                }}
              >
                +91-{templeDetails.phoneNumber}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!fromPandits && (
          <RowBetween style={{ paddingTop: 24 }}>
            <View
              style={{
                marginTop: 16,
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <TopText style={{ fontSize: 14, fontWeight: "bold" }}>
                {t("sssociatedGod")}
              </TopText>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {(userType === "templeAdmin" &&
                templeDetails?.createdBy === userId) ||
              userType === "superadmin" ? (
                <IconButton
                  icon="plus"
                  style={{ marginRight: 10 }}
                  onPress={() => navigation.navigate("AddGod", { templeinfo })}
                />
              ) : null}
            </View>
          </RowBetween>
        )}
        {!fromPandits && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          >
            <View style={{ flexDirection: "row" }}>
              {gods.map((god, index) => (
                <View
                  key={god.id}
                  style={{ alignItems: "center", marginRight: 18 }}
                >
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      navigation.navigate("Details", {
                        god: god,
                        godId: god._id,
                        userType: userType,
                        templeinfo: templeinfo,
                      })
                    }
                    style={{ position: "relative" }}
                  >
                    {console.log("Image: ", `${god.godImage}`)}
                    <Image
                      style={{
                        width: 90,
                        height: 100,
                        borderRadius: 8,
                        marginBottom: 4,
                      }}
                      // resizeMode="contain"
                      source={
                        god.godImage
                          ? {
                              uri: `${god.godImage}`,
                            }
                          : UserImg
                      }
                    />

                    <Text style={{ fontWeight: "600", opacity: 0.4 }}>
                      {god.godName}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              {gods.length === 0 && gods.length === 0 && (
                <View
                  style={{
                    // flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 35,
                  }}
                >
                  <Text style={{ fontSize: 15, color: "grey" }}>
                    {t("noAssociatedGod")}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
        {!fromPandits && (
          <View style={styles.tabsContainer}>
            {["Events", "Pandits", "Members", "Shops"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabPress(tab)}
                style={[
                  styles.tab,
                  selectedTab === tab ? styles.selectedTab : {},
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab ? styles.selectedTabText : {},
                  ]}
                >
                  {t(tab)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedTab === "Events" && (
          <View>
            <View style={{ display: "flex", flexDirection: "row" }}>
              {loadingDates && (
                <Image
                  style={{
                    width: 15,
                    height: 15,
                    marginTop: "5%",
                    marginLeft: "2%",
                    opacity: 0.4,
                  }}
                  source={{
                    uri: "https://i.gifer.com/ZZ5H.gif",
                  }}
                ></Image>
              )}
            </View>
            <View style={styles.calender}>
              {!fromPandits && (
                <Calendar
                  minDate={today}
                  markingType={"multi-dot"}
                  style={{
                    marginTop: "3%",
                    borderRadius: 6,
                    backgroundColor: "#F7EFD5",
                    height: 380,
                  }}
                  theme={{
                    arrowColor: "#D8AE25",
                    calendarBackground: "#f7f7f7",
                    todayTextColor: "#000000",
                    todayBackgroundColor: "#f7f7f7",
                  }}
                  markedDates={markedDates}
                  onMonthChange={handleMonthChange}
                  onDayPress={(day) => goToEvents(day.dateString)}
                />
              )}
            </View>
          </View>
        )}

        {selectedTab === "Shops" && <TempleShops templeinfo={templeinfo} />}

        {selectedTab === "Members" && (
          <ScrollView style={{ flex: 1, position: "relative" }}>
            <View
              style={{
                padding: "2%",
                margin: "2%",
                display: "flex",
                flexDirection: "column",
                marginTop: 20,
              }}
            >
              {members.map((member, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    Navigation.navigate("EachMember", {
                      member: member,
                      userType: userType,
                      templeinfo: templeinfo,
                    });
                  }}
                >
                  <View
                    style={{
                      paddingVertical: "4%",
                      flexDirection: "row",
                      alignItems: "center",
                      borderBottomWidth: 0.5,
                      borderBottomColor: "grey",
                    }}
                  >
                    <Image
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        marginRight: "10%",
                      }}
                      resizeMode="contain"
                      source={
                        member.profileImage
                          ? {
                              uri: `${member.profileImage}`,
                            }
                          : UserImg
                      }
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: "bold",
                          opacity: 0.7,
                          fontSize: 17,
                        }}
                      >
                        {member.name}
                      </Text>
                      <Text
                        style={{
                          fontWeight: "600",
                          opacity: 0.4,
                          marginTop: "2%",
                        }}
                      >
                        {member.location}
                      </Text>
                    </View>
                    <Text style={{ color: "grey", fontStyle: "italic" }}>
                      {member.designation}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {members.length === 0 && members.length === 0 && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "grey" }}>
                    {t("noMemberFound")}
                  </Text>
                </View>
              )}
            </View>

            {selectedTab === "Members" &&
              userType === "templeAdmin" &&
              templeDetails.createdBy === userId && (
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 0,
                    backgroundColor: Theme.themeColor,
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    elevation: 10,
                  }}
                  onPress={() => {
                    Navigation.navigate("AddMembers", { templeinfo });
                  }}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              )}
          </ScrollView>
        )}

        {selectedTab === "Pandits" && (
          <ScrollView style={{ flex: 1, position: "relative" }}>
            <View
              style={{
                padding: "2%",
                margin: "2%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Pandits Section */}
              {pandits.map((pandit, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    Navigation.navigate("EachPandit", {
                      pandit: pandit,
                      userType: userType,
                    });
                  }}
                >
                  <View
                    style={{
                      paddingVertical: "4%",
                      flexDirection: "row",
                      alignItems: "center",
                      borderBottomWidth: 0.5,
                      borderBottomColor: "grey",
                    }}
                  >
                    <Image
                      style={{
                        width: 60,
                        height: 65,
                        borderRadius: 8,
                        marginRight: "10%",
                      }}
                      resizeMode="contain"
                      source={
                        pandit.image
                          ? {
                              uri: `${pandit.image}`,
                            }
                          : UserImg
                      }
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: "bold",
                          opacity: 0.7,
                          fontSize: 17,
                        }}
                      >
                        {pandit.panditName}
                      </Text>
                      <Text
                        style={{
                          fontWeight: "600",
                          opacity: 0.4,
                          marginTop: "2%",
                        }}
                      >
                        {pandit.address}
                      </Text>
                    </View>
                    <Text style={{ color: "grey", fontStyle: "italic" }}>
                      {t("pandit")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {pandits.length === 0 && pandits.length === 0 && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "grey" }}>
                    {t("noPanditFound")}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <SafeArea style={{ position: "relative" }}>
      <RowBetween
        style={{ paddingTop: 10, zIndex: 1000, backgroundColor: "white" }}
      >
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{
              color: Theme.themeColor,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {t("templeDetails")}
          </TopText>
        </View>

        {((userType === "templeAdmin" && templeDetails.createdBy === userId) ||
          userType === "superadmin") && (
          <>
            <IconButton
              icon="trash-can-outline"
              style={{ marginLeft: "auto" }}
              onPress={confirmDelete}
            />
            <IconButton
              icon="pencil-outline"
              onPress={() =>
                navigation.navigate("EditTemple", {
                  temple: templeDetails,
                  members: members,
                  fetchTemple: fetchTemple,
                })
              }
            />
            <IconButton
              icon="bell-outline"
              onPress={() =>
                navigation.navigate("TempleNotifications", {
                  templeinfo: templeinfo,
                })
              }
            ></IconButton>
          </>
        )}
        {(userType === "templeShopOwner" || userType === "pandit") && (
          <TouchableOpacity
            style={{
              width: 125,
              height: 35,
              backgroundColor: !isPanditWithTemples
                ? Theme.themeColor
                : "#E0E0E0",
              borderRadius: 8,
              paddingHorizontal: 4,
              justifyContent: "center",
              alignItems: "center",
              opacity: !isPanditWithTemples ? 1 : 0.9,
              marginRight: 5,
            }}
            onPress={handleConnect}
            disabled={isPanditWithTemples}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 5,
              }}
            >
              <Icon
                name="send"
                size={15}
                color={!isPanditWithTemples ? "white" : "#B0B0B0"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={{ color: !isPanditWithTemples ? "white" : "#B0B0B0" }}
              >
                {t("sendRequest")}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </RowBetween>

      {templeDetails.images && templeDetails.images.length > 0 ? (
        <Modal
          visible={showViewer}
          transparent={true}
          onRequestClose={() => setShowViewer(false)}
        >
          <ImageViewerScreen
            images={templeDetails.images.map((item) => `${item}`)}
            setShowViewer={setShowViewer}
            index={currentIndex}
          />
        </Modal>
      ) : null}

      <ScrollView style={{ flex: 1 }}>
        {renderBackground()}
        {renderContentBackground()}
      </ScrollView>

      <BottomNavigation navigation={navigation} />
    </SafeArea>
  );
};

export default TempleDetails;

const styles = StyleSheet.create({
  readMore: {
    color: "grey",
    marginBottom: "5%",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: Theme.themeColor,
  },
  tabText: {
    color: "black",
  },
  selectedTabText: {
    color: "white",
  },

  txtData: {
    color: "#656565",
    fontSize: 18,
    width: "30%",
  },
  txtDataValue: {
    color: "#656565",
    fontSize: 18,
  },
  oneDetail: {
    marginBottom: 12,
    display: "flex",
    flexDirection: "row",
  },
  familyDetails: {
    paddingTop: "6%",
  },
  fatherFamilyData: {
    marginTop: "4%",
    paddingTop: "1%",
  },
  fatherDetails: {
    paddingTop: "1%",
  },
  famD: {
    color: Theme.themeColor,
    fontSize: 25,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    borderRadius: 16,
    padding: 16,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "capitalize",
    color: Theme.themeColor,
  },
  content: { color: "#898E92", textTransform: "capitalize" },
  contentContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  Catagory: {
    marginHorizontal: 10,
    marginVertical: 15,
  },
  CatagoryText: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
    color: "#616161",
  },
  StockCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  stockImage: {
    width: 90,
    height: 90,
    marginRight: 10,
  },
  stockName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#141414",
    marginBottom: 10,
  },
  stockspecs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "73%",
  },
  stockdetails: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.5,
  },
  stocklocation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  stockloacaiontext: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.8,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: Theme.themeColor,
  },
  tabText: {
    color: "black",
  },
  selectedTabText: {
    color: "white",
  },

  shadowProp: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
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
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },

  iconText: {
    marginTop: 4,
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
    marginLeft: 15,
  },
  navigateIcon: {
    marginRight: "auto",
    marginTop: 2,
  },
  circleImage: {
    width: 50,
    height: 50,
    borderRadius: 45,
    overflow: "hidden",
    marginBottom: 5,
    borderWidth: 0.1,
    borderColor: "gray",
  },
  chatIconBackground: {
    width: 60,
    height: 30,
    borderRadius: 22,
    backgroundColor: Theme.themeColor,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "lightgray",
    borderRadius: 10,
    width: 250,
    opacity: 1.5,
    height: 40,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 18,
  },
  closeButton: {
    position: "absolute",
    top: 1,
    right: 8,
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
  godname: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#898E92",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
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
});
