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
} from "react-native";
import { Badge, IconButton, Surface } from "react-native-paper";
import { SafeArea } from "../components/utility/safe-area.component";
import HallCard from "../components/dashboard/HallCard";
import matrimonyImg from "../assets/images/homepage/matrimony.png";
import samajImg from "../assets/images/homepage/samaj.png";
import socialImg from "../assets/images/homepage/social.png";
import b2bImg from "../assets/images/homepage/b2b.png";
import jobImg from "../assets/images/homepage/job.png";
import Temple from "../assets/images/homepage/temple.png";
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
import {
  UpdateNotification,
  UpdateTemple,
} from "../store/Handlers/Reducer.Handler";
import { registerForPushNotificationsAsync } from "../Utility/PushNotificationNavigation";
import { BASEIMGURL } from "../infrastructure/constants";
import { io } from "socket.io-client";
import { decode } from "base-64";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { log } from "react-native-reanimated";
import { getTempleList } from "../services/Temple.Services";
import { CommonActions } from "@react-navigation/native";
import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import apiClient from "../store/apiClient";
import publicApiClient from "../store/publicApiClient";
import { requireAuth, isAccountModule, signInFromGuest } from "../utils/requireAuth";

const YELLOW_COLOR = "#D4AF37";

const exploreData = [
  {
    title: "Social",
    path: "SocialMedia",
    status: false,
    icon: "people",
    color: "#6B7280",
  },
  {
    title: "Jewellery",
    path: "Jewellery",
    status: true,
    icon: "diamond",
    color: "#6B7280",
  },
  {
    title: "Matrimony",
    path: "Matrimony",
    status: false,
    icon: "heart",
    color: "#6B7280",
  },
  {
    title: "Temple",
    path: "Temple",
    status: true,
    icon: "temple-hindu",
    color: "#6B7280",
  },
];

const featuredContent = [
  {
    id: 1,
    title: "Featured Temple",
    image: "https://source.unsplash.com/random/800x600/?temple",
    description: "Visit the most sacred temples in India",
  },
  {
    id: 2,
    title: "Latest Events",
    image: "https://source.unsplash.com/random/800x600/?festival",
    description: "Discover upcoming cultural events",
  },
  {
    id: 3,
    title: "Community Meetups",
    image: "https://source.unsplash.com/random/800x600/?community",
    description: "Join local community gatherings",
  },
];

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
  const { user, token, isGuest, loading, notification, temple } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();

  const userId = token
    ? JSON.parse(decode(token.split(".")[1])).id
    : null;

  const [notifications, setNotifications] = useState([]);
  const [belliconbadge, setBelliconbadge] = useState(1);
  const [index, setIndex] = useState(0);

  // State for featured content from API
  const [featuredTemples, setFeaturedTemples] = useState([]);
  const [latestJewellery, setLatestJewellery] = useState([]);
  const [matrimonyProfiles, setMatrimonyProfiles] = useState([]);
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
        //matrimony navigation
        navigation.navigate("MatrimonyViewUser", {
          userId: not.userid,
        });
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
      }
    }
  };

  React.useEffect(() => {
    if (token) {
      LastNotification();
    }
  }, [lastNotificationResponse, token]);

  const handleModuleNavigation = (path, params) => {
    if (!token && isAccountModule(path)) {
      requireAuth({
        token,
        isGuest,
        dispatch,
        navigation,
        message: "Sign in to access this section.",
      });
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
  const [isModuleMenuVisible, setIsModuleMenuVisible] = useState(false);

  // Add temple listings data
  const templeListings = [
    {
      id: 1,
      title: "Tirupati Temple",
      location: "Andhra Pradesh",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      rating: 4.9,
      category: "Hindu Temple",
    },
    {
      id: 2,
      title: "Meenakshi Temple",
      location: "Tamil Nadu",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      rating: 4.8,
      category: "Hindu Temple",
    },
    {
      id: 3,
      title: "Kashi Vishwanath",
      location: "Uttar Pradesh",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      rating: 4.9,
      category: "Hindu Temple",
    },
    {
      id: 4,
      title: "Golden Temple",
      location: "Punjab",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      rating: 4.9,
      category: "Sikh Temple",
    },
    {
      id: 5,
      title: "Lotus Temple",
      location: "Delhi",
      image:
        "https://images.unsplash.com/photo-1580128660010-f7ae1b1853f1?w=500&h=300&fit=crop",
      rating: 4.7,
      category: "Bahai Temple",
    },
  ];

  // API fetch functions
  const fetchFeaturedTemples = async () => {
    try {
      const response = await publicApiClient.get("/temple?limit=4");
      if (response.data && Array.isArray(response.data)) {
        // Take first 4 temples
        const temples = response.data.slice(0, 4).map((temple) => ({
          ...temple,
          title: temple.templeName || temple.name || "Temple",
          image: temple.images && temple.images.length > 0 
            ? (temple.images[0].startsWith('http') ? temple.images[0] : `${BASEIMGURL}${temple.images[0]}`)
            : null,
        }));
        setFeaturedTemples(temples);
      }
    } catch (error) {
      console.error("Error fetching featured temples:", error);
      setFeaturedTemples([]);
    }
  };

  const fetchLatestJewellery = async () => {
    try {
      const response = await publicApiClient.get("/jewelry-products?limit=4");
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const jewellery = response.data.data.map((item) => ({
          ...item,
          title: item.name || "Jewellery",
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

  const fetchMatrimonyProfiles = async () => {
    try {
      const response = await apiClient.get("/matrimony/matrimonyUsers?limit=5");
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const profiles = response.data.data.slice(0, 5).map((profile) => {
          const owner = profile.owner || {};
          const name = profile.name || `${owner.firstName || ""} ${owner.lastName || ""}`.trim() || "User";
          const age = profile.age ? `, ${profile.age}` : "";
          const workLocation = profile.workLocation || profile.homeTown || "";
          const profession = profile.profession || owner.profession || "";
          const details = profession && workLocation 
            ? `${profession}, ${workLocation}`
            : workLocation || profession || "Profile";
          
          return {
            ...profile,
            name: `${name}${age}`,
            details: details,
            image: profile.image || owner.image 
              ? (profile.image || owner.image).startsWith('http') 
                ? (profile.image || owner.image)
                : `${BASEIMGURL}${profile.image || owner.image}`
              : null,
            userId: owner._id || profile._id,
          };
        });
        setMatrimonyProfiles(profiles);
      }
    } catch (error) {
      console.error("Error fetching matrimony profiles:", error);
      setMatrimonyProfiles([]);
    }
  };

  // Fetch all featured content on mount
  useEffect(() => {
    const fetchAllFeaturedContent = async () => {
      setLoadingFeatured(true);
      try {
        const tasks = [fetchFeaturedTemples(), fetchLatestJewellery()];
        if (token) {
          tasks.push(fetchMatrimonyProfiles());
        }
        await Promise.all(tasks);
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

  const menuItems = [
    { label: "Social", icon: "people", path: "SocialMedia" },
    { label: "Jewellery", icon: "diamond", path: "Jewellery" },
    { label: "Matrimony", icon: "heart", path: "Matrimony" },
    { label: "Temple", icon: "home", path: "Temple" },
  ];

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
        <View style={[styles.topHeader, { paddingTop: insets.top }]}>
          {/* Top Row: Avatar, Name, Icons */}
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() =>
                handleAccountAction(
                  () => navigation.navigate("SettingsScreen"),
                  "Sign in to view your profile and settings."
                )
              }
            >
              <Image
                source={
                  user && user.image
                    ? { uri: user.image }
                    : UserImg
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <Text style={styles.username}>
              {isGuest
                ? "Guest"
                : user && user.firstName &&
                  user.firstName.charAt(0).toUpperCase() +
                    user.firstName.slice(1).toLowerCase()}
            </Text>
            <View style={styles.headerIcons}>
              {isGuest ? (
                <TouchableOpacity
                  onPress={() => signInFromGuest(dispatch)}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>Sign in</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Jewellery", { screen: "BrowseScreen" })
                }
                accessibilityRole="button"
                accessibilityLabel="Search jewellery"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.headerIconHit}
              >
                <Icon name="search" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  handleAccountAction(
                    () => navigation.navigate("ChatHome"),
                    "Sign in to view your messages."
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Messages"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.headerIconHit}
              >
                <Icon
                  name="chatbubble-ellipses"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  handleAccountAction(
                    () =>
                      navigation.navigate("DashboardNotification", {
                        notifications: [
                          ...(notification?.homescreen ?? []),
                          ...notifications,
                        ],
                      }),
                    "Sign in to view notifications."
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.headerIconHit}
              >
                <Icon name="notifications" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.scrollWrapper}>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
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
                    <Image
                      key={banner.id}
                      source={{ uri: banner.uri }}
                      style={styles.bannerImage}
                    />
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

              {/* Menu */}
              <View style={styles.menuRow}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleModuleNavigation(item.path)}
                  >
                    <Icon name={item.icon} size={24} color="#000" />
                    <Text style={styles.menuText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.quickActionsWrapper}>
                {/* Featured Temples */}
                {featuredTemples.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Featured Temples</Text>
                      <TouchableOpacity onPress={() => navigation.navigate("Temple")}>
                        <Text style={styles.seeAll}>see all &gt;</Text>
                      </TouchableOpacity>
                    </View>
                    {loadingFeatured ? (
                      <ActivityIndicator size="small" color={YELLOW_COLOR} style={{ padding: 20 }} />
                    ) : (
                      <FlatList
                        horizontal
                        nestedScrollEnabled={true}
                        data={featuredTemples}
                        keyExtractor={(item, index) => item._id || index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onPress={() => {
                              navigation.navigate("Temple", {
                                screen: "TempleDetails",
                                params: {
                                  templeinfo: item,
                                },
                              });
                            }}
                            style={{ marginRight: 10 }}
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
                              <Text style={styles.cardTitle}>{item.title}</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        showsHorizontalScrollIndicator={false}
                      />
                    )}
                  </View>
                )}

                {/* Latest Jewellery */}
                {latestJewellery.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        Latest Jewellery Designs
                      </Text>
                      <TouchableOpacity onPress={() => navigation.navigate("Jewellery")}>
                        <Text style={styles.seeAll}>see all &gt;</Text>
                      </TouchableOpacity>
                    </View>
                    {loadingFeatured ? (
                      <ActivityIndicator size="small" color={YELLOW_COLOR} style={{ padding: 20 }} />
                    ) : (
                      <FlatList
                        horizontal
                        nestedScrollEnabled={true}
                        data={latestJewellery}
                        keyExtractor={(item, index) => item._id || index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onPress={() => {
                              navigation.navigate("Jewellery", {
                                screen: "EachProduct",
                                params: {
                                  productId: item._id,
                                  product: item,
                                },
                              });
                            }}
                            style={{ marginRight: 10 }}
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
                              <Text style={styles.cardTitle}>{item.title}</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        showsHorizontalScrollIndicator={false}
                      />
                    )}
                  </View>
                )}

                {/* 💌 Slider: Featured Profiles */}
                {matrimonyProfiles.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        Featured Matrimony Profiles
                      </Text>
                      <TouchableOpacity onPress={() => handleModuleNavigation("Matrimony")}>
                        <Text style={styles.seeAll}>Explore &gt;</Text>
                      </TouchableOpacity>
                    </View>
                    {loadingFeatured ? (
                      <ActivityIndicator size="small" color={YELLOW_COLOR} style={{ padding: 20 }} />
                    ) : (
                      <FlatList
                        horizontal
                        nestedScrollEnabled={true}
                        data={matrimonyProfiles}
                        keyExtractor={(item, index) => item._id || index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onPress={() => {
                              handleAccountAction(
                                () =>
                                  navigation.navigate("Matrimony", {
                                    screen: "MatrimonyViewUser",
                                    params: {
                                      userId: item.userId || item._id,
                                    },
                                  }),
                                "Sign in to view matrimony profiles."
                              );
                            }}
                            style={{ marginHorizontal: 6 }}
                          >
                            <View style={styles.profileCard} pointerEvents="box-none">
                              {item.image ? (
                                <Image
                                  source={{ uri: item.image }}
                                  style={styles.profileImage}
                                />
                              ) : (
                                <View style={[styles.profileImage, { backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center" }]}>
                                  <Icon name="person-outline" size={40} color="#999" />
                                </View>
                              )}
                              <Text style={styles.profileName}>{item.name}</Text>
                              <Text style={styles.profileDetails}>
                                {item.details}
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

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  topHeader: {
    backgroundColor: YELLOW_COLOR,
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    position: "absolute",
    // paddingTop: 20,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 8,
    paddingBottom: 18,
    // marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
  },

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  username: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 12,
    flex: 1,
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 32,
  },
  loginButtonText: {
    color: YELLOW_COLOR,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 18,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  headerIconHit: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  scrollWrapper: {
    flex: 1,
    backgroundColor: "#eff0f3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden", // 🔒 THIS is the actual clipper
    marginTop: 95,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#eff0f3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  safeContent: {
    backgroundColor: "transparent",
    overflow: "hidden", // ✅ Prevents internal elements from bleeding out
  },

  bannerImage: {
    width: width - 20,
    height: 125,
    marginHorizontal: 10,
    borderRadius: 10,
    resizeMode: "cover",
    marginTop: 8,
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
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
    marginTop: 25,
    paddingVertical: 20,
    backgroundColor: "#fff",
  },
  menuItem: {
    flex: 1,
    alignItems: "center",
  },
  menuText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },

  quickActionsWrapper: {
    paddingHorizontal: 12,
    marginTop: 5,
  },

  section: {
    padding: 10,
    backgroundColor: "#fff",
    marginVertical: 5,
    borderRadius: 10,
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
    width: 130,
    marginRight: 10,
  },
  cardImage: {
    width: 130,
    height: 100,
    borderRadius: 10,
  },
  cardTitle: {
    textAlign: "center",
    marginTop: 5,
  },
  profileCard: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: 6,
    marginVertical: 6,
    paddingBottom: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileImage: {
    width: "100%",
    height: 110,
    resizeMode: "cover",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    paddingTop: 8,
    paddingHorizontal: 10,
    color: "#212529",
  },
  profileDetails: {
    fontSize: 13,
    color: "#495057",
    paddingHorizontal: 10,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6c757d",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
