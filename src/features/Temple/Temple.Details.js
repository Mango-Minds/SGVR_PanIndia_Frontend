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
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Theme from "../../styles/theme";
import Temp1 from "../../assets/images/Temple/temp1.jpg";
import { SafeArea } from "../../components/utility/safe-area.component";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Row } from "../../styles/dashboard.styles";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";
import { useQuery } from "@tanstack/react-query";
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
import { decode } from "base-64";
import { useIsFocused } from "@react-navigation/native";
import GodCard from "./GodsCard";
import UserImg from "../../assets/images/general/user.png";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { Linking } from "react-native";
import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
const EMPTY_USER_TYPES = [];

const TempleDetails = ({ route, navigation }) => {
  const Navigation = useNavigation();
  const { user, token, isGuest, loading } = useSelector((state) => state.user);
  const { t } = useTranslation();
  console.log("User in temple details: ", user);
  const outeruser = useSelector((state) => state.user);
  const isFocused = useIsFocused();

  // Wait only while restoring an authenticated session — guests have no user object
  if (!user && !isGuest && loading) {
    return (
      <SafeArea>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Theme.themeColor} />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
        </View>
      </SafeArea>
    );
  }

  console.log("temple details page usertoken: ", token);
  const rawUserType = user?.userType ?? EMPTY_USER_TYPES;
  const userType = Array.isArray(rawUserType) ? rawUserType : [rawUserType].filter(Boolean);
  const { templeinfo, fromPandits } = route.params;
  const ShopId = user?.roleData?._id;
  console.log("Shopid: ", ShopId);

  const [templeDetails, setTempleDetails] = useState(templeinfo);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [hasAcceptedConnection, setHasAcceptedConnection] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  // Check if there's already a pending or accepted connection
  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (user?.userType?.includes("pandit") && user?.roleData?.pandit?._id) {
        try {
          setIsCheckingConnection(true);
          const response = await apiClient.get(`/panditRequests/${user.roleData.pandit._id}`);
          if (response.status === 200) {
            const allRequests = response.data.requests || [];
            
            // Find any request related to this temple
            const templeRequest = allRequests.find(
              req => req.requestToTempleId._id === templeinfo._id
            );
            
            if (templeRequest) {
              if (templeRequest.status === 'pending') {
                setIsRequestSent(true);
                setHasAcceptedConnection(false);
              } else if (templeRequest.status === 'accepted') {
                setIsRequestSent(false);
                setHasAcceptedConnection(true);
              }
            } else {
              // No request found, reset states
              setIsRequestSent(false);
              setHasAcceptedConnection(false);
            }
          }
        } catch (error) {
          console.log("Error checking connection status:", error);
          // On error, reset states
          setIsRequestSent(false);
          setHasAcceptedConnection(false);
        } finally {
          setIsCheckingConnection(false);
        }
      } else {
        setIsCheckingConnection(false);
      }
    };

    checkConnectionStatus();
  }, [user, templeinfo._id]);
  console.log("templeDetails in details page: ", templeDetails);
  const tokenPayload = token?.split(".")?.[1];
  const decodedPayload = tokenPayload ? JSON.parse(decode(tokenPayload)) : null;
  console.log(decodedPayload);
  const userId = decodedPayload?.id ?? null;
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
  const [showViewer, setShowViewer] = useState(false);
  let scrollY = new Animated.Value(0);

  const [members, setMembers] = useState(templeinfo ? templeinfo.members : []);
  console.log("Members in details page: ", members);
  const [gods, setGods] = useState(templeinfo ? templeinfo.gods : []);
  // const gods = templeinfo ? templeinfo.gods : [];
  console.log("Gods: ", gods);

  const [pandits, setPandits] = useState(templeinfo ? templeinfo.pandits : []);
  console.log("Pandits: ", pandits);

  const [shops, setShops] = useState(templeinfo ? templeinfo.templeShops : []);
  console.log("Shops: ", shops);

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

  const fetchTempleDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const selectedLanguage = 
        (await AsyncStorage.getItem("user-language")) || "en";

      const response = await apiClient.get(`/temple/${templeDetails._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Temple Data: ", response.data);

      if (response.status === 200) {
        let templeData = response.data;
        console.log("templeData in Details: ", templeData);

        // Translate if not English
        if (selectedLanguage !== "en" && templeData) {
          const translationResponse = await apiClient.post("/translate", {
            data: [templeData], // Wrap in array for translation
            targetLang: selectedLanguage,
          });

          if (translationResponse?.data?.translatedData?.length) {
            templeData = translationResponse.data.translatedData[0];
            console.log("Translated response fetchTemple: ", templeData);
          }
        }

        setTempleDetails(templeData);
        setMembers(templeData.members || []);
        setGods(templeData.gods || []);
        setPandits(templeData.pandits || []);
        setShops(templeData.templeShops || []);
        
        return templeData;
      }
    } catch (error) {
      console.error("Error fetching temple:", error);
      throw error;
    }
  };

  // Manual temple details refresh function
  const refetchTemple = async () => {
    try {
      const updatedTempleData = await fetchTempleDetails();
      if (updatedTempleData) {
        setPandits(updatedTempleData.pandits || []);
        setShops(updatedTempleData.templeShops || []);
      }
    } catch (error) {
      console.error("Error refreshing temple:", error);
    }
  };

  useEffect(() => {
    if (isFocused && templeDetails._id) {
      refetchTemple();
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
    if (isFocused && token && userType.includes("templeShopOwner")) {
      fetchShops();
    }
  }, [isFocused, token, userType]);

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
      console.log("=== HANDLE CONNECT DEBUG START ===");
      console.log("templeinfo._id: ", templeinfo._id);
      console.log("user?.roleData?.pandit?._id: ", user?.roleData?.pandit?._id);
      console.log("templeShopId: ", templeShopId);
      console.log("userType: ", userType);
      console.log("BASEAPIURL: ", apiClient.defaults.baseURL);
      

      if (userType.includes("templeShopOwner")) {
        url = "/templeConnections/request";
        requestBody = {
          templeId: templeinfo._id,
          templeShopId,
        };
         console.log("Request body: ", requestBody);
      } else if (userType.includes("pandit")) {
        url = "/panditToTempleRequest";
        requestBody = {
          requestToTempleId: templeinfo._id,
          requestByPanditId: user?.roleData?.pandit?._id,
          initiatedBy: "pandit",
        };
        console.log("Request body: ", requestBody);
      }

      console.log("Making API call to:", apiClient.defaults.baseURL + url);
      console.log("Full request payload:", JSON.stringify(requestBody, null, 2));
      
      const response = await apiClient.post(url, requestBody);
      console.log("API Response:", response.status, response.data);
      
      setIsRequestSent(true);
      Alert.alert(t("success"), t("connectionReqSentSuccessfully"), [
        { text: t("ok") },
      ]);
      console.log("=== HANDLE CONNECT DEBUG END (SUCCESS) ===");
    } catch (error) {
      console.error("=== HANDLE CONNECT DEBUG END (ERROR) ===");
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          data: error.config?.data
        }
      });
      
      if (error.response?.status === 409) {
        const errorMessage = error.response?.data?.message || "";
        if (errorMessage.includes("connection already established")) {
          // Connection already exists, set as connected
          setHasAcceptedConnection(true);
          setIsRequestSent(false);
          Alert.alert(t("info"), t("alreadyConnected"), [{ text: t("ok") }]);
        } else {
          // Request already exists, treat as pending
          setIsRequestSent(true);
          Alert.alert(t("info"), t("requestAlreadyPending"), [{ text: t("ok") }]);
        }
      } else {
        Alert.alert(t("error"), t("connectionReqFailed"), [{ text: t("ok") }]);
      }
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

  const handleRemovePandit = async (panditId) => {
    Alert.alert(
      t("confirmRemoval"),
      t("confirmRemovePandit"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("remove"),
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete("/removePanditFromTemple", {
                data: {
                  templeId: templeDetails._id,
                  panditId: panditId,
                },
              });
              
              Alert.alert(t("success"), t("panditRemovedSuccessfully"));
              // Refresh temple details
              try {
                const updatedTempleData = await fetchTempleDetails();
                if (updatedTempleData) {
                  setPandits(updatedTempleData.pandits || []);
                  setShops(updatedTempleData.templeShops || []);
                }
              } catch (error) {
                console.error("Error refreshing temple data:", error);
              }
            } catch (error) {
              console.error("Error removing pandit:", error);
              Alert.alert(t("error"), t("failedToRemovePandit"));
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleRemoveShop = async (shopId) => {
    Alert.alert(
      t("confirmRemoval"),
      t("confirmRemoveShop"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("remove"),
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete("/removeShopFromTemple", {
                data: {
                  templeId: templeDetails._id,
                  shopId: shopId,
                },
              });
              
              Alert.alert(t("success"), t("shopRemovedSuccessfully"));
              // Refresh temple details
              try {
                const updatedTempleData = await fetchTempleDetails();
                if (updatedTempleData) {
                  setPandits(updatedTempleData.pandits || []);
                  setShops(updatedTempleData.templeShops || []);
                }
              } catch (error) {
                console.error("Error refreshing temple data:", error);
              }
            } catch (error) {
              console.error("Error removing shop:", error);
              Alert.alert(t("error"), t("failedToRemoveShop"));
            }
          },
        },
      ],
      { cancelable: false }
    );
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
  const isPanditAlreadyConnected =
    user?.userType?.includes("pandit") && 
    (hasAcceptedConnection || 
     (user?.roleData?.pandit?.temples && 
      user.roleData.pandit.temples.some(templeId => templeId === templeinfo._id)));
  console.log("isPanditAlreadyConnected: ", isPanditAlreadyConnected);
  console.log("hasAcceptedConnection from API: ", hasAcceptedConnection);

  // Check if shop is already connected to this temple
  // Try multiple ways to get the current user's shop ID
  const currentUserShopId = user?.roleData?.templeShopOwner?._id || 
                           loggedInShop?._id ||
                           shops.find(shop => shop.owner === userId || shop.owner.id === userId || shop.owner._id === userId)?._id;
  
  const isShopAlreadyConnected =
    user?.userType?.includes("templeShopOwner") &&
    (shops.some(shop => 
      shop._id === currentUserShopId ||
      shop.owner === userId ||
      shop.owner?.id === userId ||
      shop.owner?._id === userId
    ));
  
  console.log("isShopAlreadyConnected: ", isShopAlreadyConnected);
  console.log("Current user shop ID: ", currentUserShopId);
  console.log("User ID: ", userId);
  console.log("Temple shops: ", shops.map(shop => ({id: shop._id, owner: shop.owner})));
  console.log("Shop found in temple list: ", shops.some(shop => 
    shop._id === currentUserShopId ||
    shop.owner === userId ||
    shop.owner?.id === userId ||
    shop.owner?._id === userId
  ));


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
    // All map and location functionality removed

    const fetchEventDates = async (month, year) => {
      setLoadingDates(true); // Show loading indicator while fetching

      try {
        // First try the eventsByMonth endpoint
        let dates = [];
        try {
          const response = await apiClient.get(
            `templeEvents/eventsByMonth?templeId=${templeDetails._id}&month=${month}&year=${year}`
          );
          dates = response.data.dates || [];
          console.log("Events fetched from eventsByMonth:", dates);
        } catch (monthError) {
          console.warn("eventsByMonth failed, trying alternative approach:", monthError.message);
          
          // Fallback: fetch all temple events and filter by month
          try {
            const allEventsResponse = await apiClient.get(`templeEvents/temple/${templeDetails._id}`);
            const allEvents = allEventsResponse.data || [];
            
            // Filter events for the current month/year
            dates = allEvents
              .filter(event => {
                const eventDate = moment(event.eventDate);
                return eventDate.month() === (month - 1) && eventDate.year() === year;
              })
              .map(event => moment(event.eventDate).format('YYYY-MM-DD'));
            
            console.log("Events fetched from temple endpoint:", dates);
          } catch (templeError) {
            console.warn("Temple events fetch also failed:", templeError.message);
          }
        }

        let updatedMarkedDates = {};
        const today = new Date().toISOString().slice(0, 10);

        // Mark today with a special indicator
        updatedMarkedDates[today] = {
          marked: true,
          dotColor: Theme.themeColor, // Gold color for today
          selectedColor: Theme.themeColor,
          selected: dates.includes(today), // Highlight if today has events
          selectedTextColor: dates.includes(today) ? 'white' : '#333',
          dots: dates.includes(today) 
            ? [
                { key: "today", color: Theme.themeColor },
                { key: "event", color: Theme.themeColor }
              ]
            : [{ key: "today", color: '#D4AF37' }],
        };

        // Mark event dates with enhanced visual indicators
        dates.forEach((date) => {
          if (date !== today) {
            updatedMarkedDates[date] = {
              marked: true,
              dotColor: Theme.themeColor,
              selectedColor: Theme.themeColor,
              dots: [
                { key: "event", color: Theme.themeColor },
                { key: "event2", color: '#4CAF50' } // Green accent for variety
              ],
            };
          }
        });

        console.log("Final marked dates:", updatedMarkedDates);
        setMarkedDates(updatedMarkedDates);
      } catch (error) {
        console.warn("Error fetching event dates:", error.message);
        // Initialize with today's marker on error
        const today = new Date().toISOString().slice(0, 10);
        setMarkedDates({
          [today]: {
            marked: true,
            dotColor: Theme.themeColor,
            dots: [{ key: "today", color: '#D4AF37' }],
          }
        });
      } finally {
        setLoadingDates(false);
      }
    };

    // On calendar month change, fetch and mark dates
    const handleMonthChange = (data) => {
      const month = parseInt(data.dateString.slice(5, 7));
      const year = parseInt(data.year);
      console.log("Calendar month changed to:", month, year);
      fetchEventDates(month, year); // Fetch and mark dates for the new month
    };

    useEffect(() => {
      // Initialize markedDates with today's marker
      const today = new Date().toISOString().slice(0, 10);
      setMarkedDates({
        [today]: {
          marked: true,
          dotColor: '#D4AF37',
          dots: [{ key: "today", color: '#D4AF37' }],
        }
      });

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      console.log("Initial fetch for month/year:", currentMonth, currentYear);
      fetchEventDates(currentMonth, currentYear); // Fetch events for the current month on load
    }, [templeDetails._id]);


    return (
      <View style={styles.scrollContainer}>
        <RowBetween>
          <View>
            <Text style={styles.title}>{templeDetails.templeName}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Ionicons name="location" size={16} color="gray" />
            <Text style={styles.infoText}>{templeDetails.city || "City not available"}</Text>
          </View>

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
              {(userType.includes("templeAdmin") &&
                templeDetails?.createdBy === userId) ||
              userType.includes("superadmin") ? (
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
                    
                    {/* Edit button for temple admins */}
                    {userType.includes("templeAdmin") && (
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          borderRadius: 12,
                          padding: 4,
                        }}
                        onPress={() =>
                          navigation.navigate("EditGod", {
                            god: god,
                            templeinfo: templeinfo,
                            fetchTempleGods: () => {
                              // Refresh the temple details after editing using React Query
                              refetchTemple();
                            },
                          })
                        }
                      >
                        <Icon name="pencil" size={16} color="white" />
                      </TouchableOpacity>
                    )}

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
                <>
                  {/* Add Event Button for Temple Admin */}
                  {userType && userType.includes('templeAdmin') && user?._id === templeDetails.createdBy && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: Theme.themeColor,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'flex-start',
                        marginTop: 8,
                        marginBottom: 8
                      }}
                      onPress={() => Navigation.navigate('TempleEventsCreate', {
                        date: moment().format('YYYY-MM-DD'),
                        templeId: templeDetails._id,
                        templeAdmin: templeDetails.createdBy,
                        templePandits: templeDetails.pandits
                      })}
                    >
                      <Icon name="plus" size={16} color="white" style={{ marginRight: 4 }} />
                      <Text style={{
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 'bold'
                      }}>
                        {t('Add Event')}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Calendar Legend */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    backgroundColor: '#FFF8E1',
                    borderRadius: 8,
                    marginTop: 8,
                    marginBottom: 8
                  }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: Theme.themeColor,
                        marginRight: 4
                      }} />
                      <Text style={{fontSize: 12, color: '#666'}}>{t('Events')}</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: Theme.themeColor,
                        marginRight: 4
                      }} />
                      <Text style={{fontSize: 12, color: '#666'}}>{t('Today')}</Text>
                    </View>
                    {loadingDates && (
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <ActivityIndicator size="small" color={Theme.themeColor} style={{marginRight: 4}} />
                        <Text style={{fontSize: 12, color: '#666'}}>{t('Loading...')}</Text>
                      </View>
                    )}
                  </View>

                  <Calendar
                    minDate={today}
                    markingType={"multi-dot"}
                    style={{
                      marginTop: "1%",
                      borderRadius: 6,
                      backgroundColor: "#F7EFD5",
                      height: 380,
                    }}
                    theme={{
                      arrowColor: Theme.themeColor,
                      calendarBackground: "#f7f7f7",
                      todayTextColor: "#000000",
                      todayBackgroundColor: "transparent",
                      selectedDayBackgroundColor: Theme.themeColor,
                      selectedDayTextColor: 'white',
                      dayTextColor: '#333',
                      textDisabledColor: '#ccc',
                      monthTextColor: '#333',
                      textDayFontWeight: '600',
                      textMonthFontWeight: 'bold',
                      textDayHeaderFontWeight: '600',
                      textSectionTitleColor: '#666',
                    }}
                    markedDates={markedDates}
                    onMonthChange={handleMonthChange}
                    onDayPress={(day) => goToEvents(day.dateString)}
                  />
                </>
              )}
            </View>
          </View>
        )}

        {selectedTab === "Shops" && (
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
              {shops.map((shop, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    Navigation.navigate("EachShopProfile", {
                      shop: shop,
                      shopId: shop._id,
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
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        marginRight: "3%",
                      }}
                      source={
                        shop.image
                          ? {
                              uri: `${shop.image}`,
                            }
                          : UserImg
                      }
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          fontSize: 20,
                          textTransform: "capitalize",
                        }}
                      >
                        {shop.name}
                      </Text>
                      <Text
                        style={{
                          fontWeight: "600",
                          opacity: 0.4,
                          marginTop: "2%",
                        }}
                      >
                        {shop.address}
                      </Text>
                    </View>
                    
                    {/* Remove button for temple admin */}
                    {userType.includes("templeAdmin") && templeDetails.createdBy === userId ? (
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#ff4444",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 15,
                          marginLeft: 10,
                        }}
                        onPress={() => handleRemoveShop(shop._id)}
                      >
                        <Text style={{ color: "white", fontSize: 12 }}>
                          {t("remove")}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={{ color: "grey", fontStyle: "italic" }}>
                        {t("shop")}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {shops.length === 0 && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "grey" }}>
                    {t("noShopFound")}
                  </Text>
                </View>
              )}
            </View>

            {/* Add Shop button for temple admin */}
            {selectedTab === "Shops" &&
              userType.includes("templeAdmin") &&
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
                    Navigation.navigate("AddShops", { 
                      templeinfo: templeinfo,
                      onShopAdded: refetchTemple
                    });
                  }}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              )}
          </ScrollView>
        )}

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
              userType.includes("templeAdmin") &&
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
                marginTop: 20,
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
                    
                    {/* Remove button for temple admin */}
                    {userType.includes("templeAdmin") && templeDetails.createdBy === userId ? (
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#ff4444",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 15,
                          marginLeft: 10,
                        }}
                        onPress={() => handleRemovePandit(pandit._id)}
                      >
                        <Text style={{ color: "white", fontSize: 12 }}>
                          {t("remove")}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={{ color: "grey", fontStyle: "italic" }}>
                        {t("pandit")}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {pandits.length === 0 && (
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

            {/* Add Pandit button for temple admin */}
            {selectedTab === "Pandits" &&
              userType.includes("templeAdmin") &&
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
                    Navigation.navigate("AddPandits", { 
                      templeinfo: templeinfo,
                      onPanditAdded: refetchTemple
                    });
                  }}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              )}
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

        {((userType.includes("templeAdmin") && templeDetails.createdBy === userId) ||
          userType.includes("superadmin")) && (
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
                  fetchTemple: () => {
                    // Use React Query refetch for temple details
                    refetchTemple();
                  },
                })
              }
            />
            <IconButton
              icon="bell-outline"
              onPress={() =>
                navigation.navigate("TempleNotifications", {
                  templeinfo: templeinfo,
                  onRequestAccepted: refetchTemple,
                })
              }
            ></IconButton>
          </>
        )}
        {(userType.includes("templeShopOwner") || userType.includes("pandit")) && (
          <TouchableOpacity
            style={{
              width: 125,
              height: 35,
              backgroundColor: isCheckingConnection
                ? "#B0BEC5"  // Gray for loading
                : (userType.includes("templeShopOwner") ? !isShopAlreadyConnected : !isPanditAlreadyConnected) && !isRequestSent
                  ? Theme.themeColor
                  : (userType.includes("templeShopOwner") ? isShopAlreadyConnected : isPanditAlreadyConnected)
                    ? "#4CAF50"  // Green for connected
                    : "#D4AF37", // Yellow-gold for pending
              borderRadius: 8,
              paddingHorizontal: 4,
              justifyContent: "center",
              alignItems: "center",
              opacity: isCheckingConnection || (userType.includes("templeShopOwner") ? !isShopAlreadyConnected : !isPanditAlreadyConnected) && !isRequestSent ? 1 : 0.9,
              marginRight: 5,
            }}
            onPress={handleConnect}
            disabled={isCheckingConnection || (userType.includes("templeShopOwner") ? isShopAlreadyConnected : isPanditAlreadyConnected) || isRequestSent}
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
                name={isCheckingConnection ? "loading" : (userType.includes("templeShopOwner") ? isShopAlreadyConnected : isPanditAlreadyConnected) ? "check" : isRequestSent ? "check-circle" : "send"}
                size={15}
                color="white"
                style={{ marginRight: 5 }}
              />
              <Text
                style={{ color: "white" }}
              >
                {isCheckingConnection ? t("loading") : (userType.includes("templeShopOwner") ? isShopAlreadyConnected : isPanditAlreadyConnected) ? t("connected") : isRequestSent ? t("pending") : t("sendRequest")}
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

      <ScrollView 
        style={{ flex: 1 }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {renderBackground()}
        {renderContentBackground()}
      </ScrollView>

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
