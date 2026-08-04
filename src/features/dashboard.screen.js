import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Dimensions,
  Linking,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  View,
  Text,
  Button,
  Image,
  RefreshControl,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from "react-native";

const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
import { Badge, IconButton, Surface } from "react-native-paper";
import { SafeArea } from "../components/utility/safe-area.component";
import HallCard from "../components/dashboard/HallCard";
import samajImg from "../assets/images/homepage/samaj.png";
import socialImg from "../assets/images/homepage/social.png";
import b2bImg from "../assets/images/homepage/b2b.png";
import jobImg from "../assets/images/homepage/job.png";
import UserImg from "../assets/images/general/user.png";

const { width } = Dimensions.get("window");
import {
  BannerContainer,
  HeaderText,
  TopHeader,
  DashboardSection,
  SectionTitle,
  MainContainerDashboard,
  ExploreContainer,
  ExploreIcon,
  IconWrapper,
  ExploreIconContainer,
  ExploreIconName,
} from "../styles/dashboard.styles";
import CommunityCard from "../components/dashboard/CommunityCard";
import PopularHalls from "../components/dashboard/PopularHalls";
import CustomCarousel from "../components/dashboard/CustomCarousel";
import axios from "axios";
import { BASEAPIURL, SOCKETURL } from "../infrastructure/constants";
import * as Notifications from "expo-notifications";
import authHeader from "../services/auth.header";
import { ScrollView } from "react-native-gesture-handler";
import {
  ErrorToggle,
  setHomeScreenNotification,
  setSocialScreenNotification,
  updateNotification,
} from "../store/user";
import {
  getHomeScreenNotification,
  getNotification,
  getSocialScreenNotification,
} from "../services/notification.services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getImageUrl } from "../services/socialMedia.services";
import { UpdateNotification } from "../store/Handlers/Reducer.Handler";
import { registerForPushNotificationsAsync } from "../Utility/PushNotificationNavigation";
import { BASEIMGURL } from "../infrastructure/constants";
import { io } from "socket.io-client";
import { decode } from "base-64";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { log } from "react-native-reanimated";
import { CommonActions } from "@react-navigation/native";
import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import publicApiClient from "../store/publicApiClient";
import { requireAuth, isAccountModule, signInFromGuest, navigateToJewellery } from "../utils/requireAuth";
import useMessageUnreadBadge from "../hooks/useMessageUnreadBadge";
import { useTranslation } from "react-i18next";
import {
  floatingBottomBarStyles,
  FLOATING_BAR_ICONS,
  FLOATING_BAR_ICON_SIZE,
  FLOATING_BAR_INACTIVE_COLOR,
} from "../styles/floatingBottomBar.styles";

const YELLOW_COLOR = "#D4AF37";
const FLOATING_BAR_HEIGHT = 72;
const BANNER_WIDTH = width - HORIZONTAL_PADDING * 2;
const BANNER_HEIGHT = Math.round(BANNER_WIDTH * 0.62);
const JEWELLERY_CARD_WIDTH = Math.round((width - HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 2.6);

const renderHallItem = (item, index) => {
  return <HallCard key={index} {...item.item} />;
};

const applianceListings = [
  {
    id: 1,
    title: "Smart Refrigerator",
    price: "₹45,999",
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&h=300&fit=crop",
    rating: 4.5,
    location: "Mumbai",
    category: "Kitchen",
  },
  {
    id: 2,
    title: "Washing Machine",
    price: "₹32,499",
    image:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500&h=300&fit=crop",
    rating: 4.2,
    location: "Delhi",
    category: "Laundry",
  },
  {
    id: 3,
    title: "Air Conditioner",
    price: "₹28,999",
    image:
      "https://images.unsplash.com/photo-1613408181615-8406dde27055?w=500&h=300&fit=crop",
    rating: 4.7,
    location: "Bangalore",
    category: "Cooling",
  },
  {
    id: 4,
    title: "Smart TV",
    price: "₹35,999",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=300&fit=crop",
    rating: 4.3,
    location: "Chennai",
    category: "Entertainment",
  },
];

const jewelleryListings = [
  {
    id: 1,
    title: "Diamond Necklace",
    price: "₹2,49,999",
    image:
      "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=500&h=300&fit=crop",
    rating: 4.8,
    location: "Jaipur",
    category: "Necklace",
  },
  {
    id: 2,
    title: "Gold Bangles Set",
    price: "₹1,89,999",
    image:
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&h=300&fit=crop",
    rating: 4.6,
    location: "Mumbai",
    category: "Bangles",
  },
  {
    id: 3,
    title: "Pearl Earrings",
    price: "₹89,999",
    image:
      "https://images.unsplash.com/photo-1596033389715-beef9276c0a0?w=500&h=300&fit=crop",
    rating: 4.4,
    location: "Delhi",
    category: "Earrings",
  },
  {
    id: 4,
    title: "Ruby Ring",
    price: "₹1,29,999",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=300&fit=crop",
    rating: 4.7,
    location: "Bangalore",
    category: "Rings",
  },
];

const features = [
  { title: "Recharge", icon: "phone-portrait" },
  { title: "Pay", icon: "qr-code" },
  { title: "Bill Pay", icon: "cash" },
  { title: "Offers", icon: "gift" },
  { title: "Gold", icon: "card" },
  { title: "Movies", icon: "film" },
  { title: "Flights", icon: "airplane" },
  { title: "Train", icon: "train" },
];

const promoCards = [
  {
    title: "Cashback on Recharge",
    image: "https://via.placeholder.com/350x150",
  },
  { title: "Flight Discounts", image: "https://via.placeholder.com/350x150" },
];

const offers = [
  { title: "UPI Offers", image: "https://via.placeholder.com/100" },
  { title: "Electricity Cashback", image: "https://via.placeholder.com/100" },
  { title: "Train Coupons", image: "https://via.placeholder.com/100" },
  { title: "Movie Deals", image: "https://via.placeholder.com/100" },
];

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, token, isGuest, loading, notification } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();

  const showComingSoon = (moduleName) => {
    Alert.alert(
      t("comingSoon"),
      t("module_coming_soon", { module: moduleName })
    );
  };

  const userId = token
    ? JSON.parse(decode(token.split(".")[1])).id
    : null;

  const [notifications, setNotifications] = useState([]);
  const [belliconbadge, setBelliconbadge] = useState(1);
  const [index, setIndex] = useState(0);
  const messageUnreadCount = useMessageUnreadBadge();
  const messageBadgeLabel =
    messageUnreadCount > 99 ? "99+" : String(messageUnreadCount);

  const [latestJewellery, setLatestJewellery] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const socket = useMemo(() => {
    if (!token) return null;
    const socketConnection = io(SOCKETURL, {
      query: { token },
      transports: ["websocket"],
    });

    socketConnection.on("connect", () => {
      console.log("Socket connected successfully:", socketConnection.id);
    });

    socketConnection.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return socketConnection;
  }, [SOCKETURL, token]);

  // Request iOS/Android notification permission and register Expo push token after login.
  useEffect(() => {
    if (!token) return;
    registerForPushNotificationsAsync({ promptIfDenied: true });
  }, [token]);

  useEffect(() => {
    if (!socket || !userId) {
      return;
    }

    console.log("Joining user room with ID:", userId);
    socket.emit("joinUserRoom", userId);

    console.log("Setting up notification listener...");

    const handleNotification = (data) => {
      console.log("New notification received:", data);
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    };

    socket.on("notification", handleNotification);

    return () => {
      console.log("Cleaning up notification listener...");
      socket.off("notification", handleNotification);
    };
  }, [socket, userId]);

  useEffect(() => {
    console.log("Current notifications:", notifications);
    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;
    setBelliconbadge(unreadCount);
  }, [notifications]);

  //   console.log("logged in user details", user);
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  //interaction/tap on notification will navigate based upon notifcation's data
  const LastNotification = async () => {
    if (
      lastNotificationResponse &&
      // lastNotificationResponse.notification.request.content.data.url &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const not = lastNotificationResponse.notification.request.content.data;
      if (not.statusCode === "NOT001") {
        if (not.meetupPost) {
          navigation.navigate("ViewSinglePost", {
            meetupPost: not.meetupPost,
          });
        } else {
          alert("Post has been deleted");
        }
      } else if (not.statusCode === "NOT002") {
        //social media and meetup
        let udp;
        if (not.user.dp) {
          const res = await getImageUrl(not.user.dp);
          udp = res.status === 0 ? res.url : null;
        } else {
          udp = null;
        }
        navigation.navigate("ViewUserScreenForNotification", {
          username: not.user.username,
          userid: not.user._id,
          userdp: udp,
          userprofile: not.user,
        });
      } else if (not.statusCode === "NOT003") {
        //chat screen navigation
      } else if (not.statusCode === "NOT004") {
        showComingSoon(t("matrimonyHeading"));
      } else if (not.statusCode === "NOT007") {
        navigation.navigate("CommunityProfile", {
          communityId: not.community._id,
        });
      } else if (not.statusCode === "NOT006") {
        navigation.navigate("Event", {
          images: not.event.images,
          eventName: not.event.eventName,
          description: not.event.description,
          startdate: not.event.startdate,
          starttime: not.event.starttime,
          endtime: not.event.endtime,
          enddate: not.event.enddate,
          location: not.event.location,
          organizer: not.event.organizer,
          organizerPhone: not.event.organizerPhone,
          createdAt: not.event.createdAt,
        });
      } else if (
        not.statusCode === "EVENT_CREATED" ||
        not.type === "eventCreated"
      ) {
        const eventId = not.eventId;
        if (eventId) {
          navigation.navigate("Jewellery", {
            screen: "EventDetailScreen",
            params: { eventId: String(eventId) },
          });
        } else {
          navigateToJewellery(navigation);
        }
      }
    }
  };

  React.useEffect(() => {
    if (token) {
      LastNotification();
    }
  }, [lastNotificationResponse, token]);

  const handleModuleNavigation = (path, params) => {
    if (path === "Matrimony") {
      showComingSoon(t("matrimonyHeading"));
      return;
    }
    if (!token && isAccountModule(path)) {
      requireAuth({
        token,
        isGuest,
        dispatch,
        navigation,
        message: t("sign_in_access_section"),
      });
      return;
    }
    if (path === "Jewellery") {
      navigateToJewellery(navigation);
      return;
    }
    if (params) {
      navigation.navigate(path, params);
    } else {
      navigation.navigate(path);
    }
  };

  const handleAccountAction = (onAuthed, message) => {
    requireAuth({ token, isGuest, dispatch, navigation, onAuthed, message });
  };

  // Update the sample data for carousels
  const sampleImagesData = [
    {
      id: 1,
      title: "Traditional Temples",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      description: "Explore India's sacred heritage",
    },
    {
      id: 2,
      title: "Spiritual Retreats",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      description: "Find your inner peace",
    },
    {
      id: 3,
      title: "Cultural Events",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      description: "Experience local traditions",
    },
    {
      id: 4,
      title: "Heritage Sites",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      description: "Discover ancient wonders",
    },
    {
      id: 5,
      title: "Pilgrimage Destinations",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      description: "Journey to sacred places",
    },
  ];

  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const fetchLatestJewellery = async () => {
    try {
      const response = await publicApiClient.get("/jewelry-products?limit=4");
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const jewellery = response.data.data.map((item) => ({
          ...item,
          title: item.name || t("jewellery"),
          image: item.images && item.images.length > 0
            ? (item.images[0].startsWith('http') ? item.images[0] : `${BASEIMGURL}${item.images[0]}`)
            : null,
        }));
        setLatestJewellery(jewellery);
      }
    } catch (error) {
      console.error("Error fetching latest jewellery:", error);
      setLatestJewellery([]);
    }
  };

  useEffect(() => {
    const fetchAllFeaturedContent = async () => {
      setLoadingFeatured(true);
      try {
        await fetchLatestJewellery();
      } catch (error) {
        console.error("Error fetching featured content:", error);
      } finally {
        setLoadingFeatured(false);
      }
    };

    if (token || isGuest) {
      fetchAllFeaturedContent();
    }
  }, [token, isGuest]);

  const bottomBarItems = [
    { labelKey: "social", icon: FLOATING_BAR_ICONS.people, action: "module", path: "SocialMedia" },
    { labelKey: "jewellery", icon: FLOATING_BAR_ICONS.diamond, action: "module", path: "Jewellery" },
    { labelKey: "jobs", icon: FLOATING_BAR_ICONS.jobs, action: "comingSoon", moduleNameKey: "jobs" },
    { labelKey: "matrimonyHeading", icon: FLOATING_BAR_ICONS.heart, action: "comingSoon", moduleNameKey: "matrimonyHeading" },
    { labelKey: "messages", icon: FLOATING_BAR_ICONS.messages, action: "messages" },
    { labelKey: "alerts", icon: FLOATING_BAR_ICONS.alerts, action: "notifications" },
  ];

  const handleBottomBarPress = (item) => {
    if (item.action === "module") {
      handleModuleNavigation(item.path);
    } else if (item.action === "comingSoon") {
      showComingSoon(t(item.moduleNameKey || item.labelKey));
    } else if (item.action === "messages") {
      handleAccountAction(
        () => navigation.navigate("MessageScreen"),
        t("sign_in_messages")
      );
    } else if (item.action === "notifications") {
      handleAccountAction(
        () =>
          navigation.navigate("DashboardNotification", {
            notifications: [
              ...(notification?.homescreen ?? []),
              ...notifications,
            ],
          }),
        t("sign_in_notifications")
      );
    }
  };

  const banners = [
    {
      id: 1,
      uri: "https://www.aurorasouq.com/wp-content/uploads/2023/12/banner3-2.jpg",
    },
    {
      id: 2,
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGgf-pNvmFzSUtGZm4BEPO9pNjXq8hVnpJW6dZNHHturAf_3ZZKcds7KnpHilPW1u3tIk&usqp=CAU",
    },
    {
      id: 3,
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG9_99OyhFhdcBADNx_JmPVW1wRbyNjpg3LdPhZ8kcPoYygQWfoX1lzq-7RPWNoktWRQ&usqp=CAU",
    },
  ];

  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(insets.top + 49);
  const [bottomBarHeight, setBottomBarHeight] = useState(
    FLOATING_BAR_HEIGHT + Math.max(insets.bottom, 8)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      scrollRef.current.scrollTo({ x: width * nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const onScroll = (event) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slide);
  };

  if (!token && !isGuest) {
    return null;
  }

  if (loading && token) {
    return (
      <ActivityIndicator
        style={{
          flex: 1,
          backgroundColor: "#1F1F1F",
          justifyContent: "center",
          alignItems: "center",
        }}
        size={"large"}
        color={"#FF4B6E"}
      />
    );
  } else
    return (
      <View style={{ flex: 1 }}>
        {/* Fixed Header */}
          <LinearGradient
            colors={["#5C1838", "#3A0F24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.topHeader, { paddingTop: insets.top }]}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              if (height > 0) {
                setHeaderHeight(height);
              }
            }}
          >
            <View style={styles.headerTopRow}>
              <View style={styles.brandRow}>
                <Image
                  style={styles.logo}
                  source={require("../assets/images/pre-login/Indiyoura-mediumLogo.png")}
                  resizeMode="cover"
                />
                <View style={styles.brandTextWrap}>
                  <Text style={styles.brandName}>{t("brand_name")}</Text>
                  <Text style={styles.brandTagline}>{t("brand_tagline")}</Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                {isGuest ? (
                  <TouchableOpacity
                    onPress={() => signInFromGuest(dispatch)}
                    style={styles.loginButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.loginButtonText}>{t("sign_in")}</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  onPress={() =>
                    handleAccountAction(
                      () => navigation.navigate("SettingsScreen"),
                      t("sign_in_profile")
                    )
                  }
                  style={styles.headerProfile}
                  activeOpacity={0.85}
                >
                  <Image
                    source={
                      user && user.image ? { uri: user.image } : UserImg
                    }
                    style={styles.avatar}
                  />
                  <Text style={styles.username} numberOfLines={1}>
                    {isGuest
                      ? t("guest")
                      : user &&
                        user.firstName &&
                        user.firstName.charAt(0).toUpperCase() +
                          user.firstName.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

        <View style={[styles.scrollWrapper, { marginTop: headerHeight }]}>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: bottomBarHeight + 24,
            }}
          >
            {/* Carousel */}
            <View style={styles.safeContent}>
              <View style={{ position: "relative" }}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  ref={scrollRef}
                  onScroll={onScroll}
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  style={{ width }}
                >
                  {banners.map((banner) => (
                    <View key={banner.id} style={styles.bannerSlide}>
                      <Image
                        source={{ uri: banner.uri }}
                        style={styles.bannerImage}
                      />
                    </View>
                  ))}
                </ScrollView>

                {/* Dot Indicators */}
                <View style={styles.dotsContainer}>
                  {banners.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        currentIndex === index && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.quickActionsWrapper}>
                {/* Latest Jewellery */}
                {latestJewellery.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        {t("latest_jewellery_designs")}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate("Jewellery", {
                            screen: "BrowseScreen",
                          });
                        }}
                      >
                        <Text style={styles.seeAll}>{t("see_all")}</Text>
                      </TouchableOpacity>
                    </View>
                    {loadingFeatured ? (
                      <ActivityIndicator size="small" color={YELLOW_COLOR} style={{ padding: 20 }} />
                    ) : (
                      <FlatList
                        horizontal
                        nestedScrollEnabled={true}
                        data={latestJewellery}
                        keyExtractor={(item, index) => item._id || item.id || index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onPress={() => {
                              navigation.navigate("Jewellery", {
                                screen: "ProductDetailScreen",
                                params: {
                                  productId: item._id || item.id,
                                },
                              });
                            }}
                          >
                            <View style={styles.card} pointerEvents="box-none">
                              {item.image ? (
                                <Image
                                  source={{ uri: item.image }}
                                  style={styles.cardImage}
                                />
                              ) : (
                                <View style={[styles.cardImage, { backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center" }]}>
                                  <Icon name="image-outline" size={30} color="#999" />
                                </View>
                              )}
                              <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                                {item.title}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        showsHorizontalScrollIndicator={false}
                      />
                    )}
                  </View>
                )}
              </View>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>
        </View>

        <View
          style={[
            styles.floatingBar,
            floatingBottomBarStyles.floatingBar,
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              marginBottom: 0,
              paddingBottom: Math.max(insets.bottom, 8),
            },
          ]}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            if (height > 0) {
              setBottomBarHeight(height);
            }
          }}
        >
          {bottomBarItems.map((item, index) => {
            const label = t(item.labelKey);
            return (
            <TouchableOpacity
              key={index}
              style={floatingBottomBarStyles.floatingBarItem}
              onPress={() => handleBottomBarPress(item)}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <View style={floatingBottomBarStyles.floatingBarIconWrap}>
                <Icon
                  name={item.icon}
                  size={FLOATING_BAR_ICON_SIZE}
                  color={FLOATING_BAR_INACTIVE_COLOR}
                />
                {((item.action === "messages" || item.path === "Jewellery") &&
                  messageUnreadCount > 0) && (
                  <View style={floatingBottomBarStyles.messageBadge}>
                    <Text style={floatingBottomBarStyles.messageBadgeText}>
                      {messageBadgeLabel}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={floatingBottomBarStyles.floatingBarText}>
                {label}
              </Text>
            </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  topHeader: {
    paddingHorizontal: 16,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    paddingBottom: 14,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: 52,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: YELLOW_COLOR,
  },
  brandTextWrap: {
    marginLeft: 10,
    flexShrink: 1,
  },
  brandName: {
    color: YELLOW_COLOR,
    fontWeight: "800",
    fontSize: 20,
    letterSpacing: 0.4,
  },
  brandTagline: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    marginTop: 1,
    letterSpacing: 0.6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerProfile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(212,175,55,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.45)",
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 24,
    maxWidth: 130,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: YELLOW_COLOR,
    backgroundColor: "#F3F3F3",
  },
  username: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 7,
    flexShrink: 1,
  },
  loginButton: {
    backgroundColor: YELLOW_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#3A0F24",
    fontWeight: "700",
    fontSize: 13,
  },
  scrollWrapper: {
    flex: 1,
    backgroundColor: "#eff0f3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#eff0f3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  safeContent: {
    backgroundColor: "transparent",
    overflow: "hidden", // ✅ Prevents internal elements from bleeding out
  },

  bannerSlide: {
    width,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  bannerImage: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 12,
    resizeMode: "cover",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 6,
    width: 6,
    backgroundColor: "#ccc",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "white",
    width: 8,
    height: 8,
  },
  floatingBar: {
    zIndex: 20,
  },
  floatingBarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  floatingBarIconWrap: {
    position: "relative",
  },
  messageBadge: {
    position: "absolute",
    top: -6,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  messageBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  floatingBarText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
    color: "#333",
  },

  quickActionsWrapper: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 12,
  },

  section: {
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  seeAll: {
    fontSize: 12,
    color: "#007bff",
  },
  card: {
    width: JEWELLERY_CARD_WIDTH,
    marginRight: CARD_GAP,
  },
  cardImage: {
    width: JEWELLERY_CARD_WIDTH,
    height: Math.round(JEWELLERY_CARD_WIDTH * 0.77),
    borderRadius: 10,
  },
  cardTitle: {
    textAlign: "center",
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
});
