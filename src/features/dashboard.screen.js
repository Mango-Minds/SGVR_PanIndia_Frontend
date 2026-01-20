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
import storeImg from "../assets/images/homepage/store.png";
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
  {
    title: "B2C",
    path: "B2C",
    status: true,
    icon: "business",
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
  const { user, token } = useSelector((state) => state.user);
  const { loading, notification, temple } = useSelector((state) => state.user);
  
  // CRITICAL FIX: Return null if token is null (user is logged out)
  // This prevents showing loading spinner after logout, especially from jewelry module
  // The Navigation component will handle showing PreLoginNavigator
  if (!token) {
    return null;
  }
  
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const userId = decodedPayload.id;

  const [notifications, setNotifications] = useState([]);
  const [belliconbadge, setBelliconbadge] = useState(1);
  const [index, setIndex] = useState(0);

  const socket = useMemo(() => {
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
    if (!socket) {
      console.log("Socket not available.");
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
    LastNotification();
  }, [lastNotificationResponse]);

  const dispatch = useDispatch();

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

  const menuItems = [
    { label: "Social", icon: "people", path: "SocialMedia" },
    { label: "Jewellery", icon: "diamond", path: "Jewellery" },
    { label: "Matrimony", icon: "heart", path: "Matrimony" },
    { label: "Temple", icon: "home", path: "Temple" },
    { label: "B2C", icon: "storefront", path: "B2C" },
  ];

  const featuredTemples = [
    {
      title: "Ram Temple",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuKSBjjoCcb-oZka78TFtqF81woAFMyrOHyfcWc0dXIgBt5_3JNpg0dB_Z1KHWQdphCHc&usqp=CAU",
    },
    {
      title: "Meena Temple",
      image:
        "https://static.toiimg.com/thumb/99336488/Temples-in-Bhubaneswar.jpg?width=1200&height=900",
    },
    {
      title: "Shiva temple",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHNGeJyic3985opFDHlPfPewygj5-MUvzEJFPJ30XJuIOOT0kKtYh9AjqAo747pXbMoFU&usqp=CAU",
    },
    {
      title: "Hanuman Temple",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNkcztfm8Wl33GIkcfd287pUJFeTk0IvemoBj7XRM5t0EAxYU7-r4PE6i6ihelw5BKdP4&usqp=CAU",
    },
  ];

  const latestJewellery = [
    {
      title: "Gold Neclace",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGAlYz-kv2d288DhTpJZ5hsIBKhsixKM-hOA&s",
    },
    {
      title: "Earrings",
      image:
        "https://media.gettyimages.com/id/1157433618/video/dolly-right-camera-of-ancient-golden-jewelry-and-accessories-with-gemstones-of-traditional.jpg?s=640x640&k=20&c=ntQVCtXuIOOcRkC5rRncBk-_e2GCBSfY7nYuJ153OXg=",
    },
    {
      title: "Gold Bangles",
      image:
        "https://static.toiimg.com/thumb/msid-106209377,width-1070,height-580,imgsize-1187465,resizemode-75,overlay-toi_sw,pt-32,y_pad-40/photo.jpg",
    },
    {
      title: "Gold Earrings",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_ry2EtGBvbKs_WNCF21_sAV5YsrkUT9dBcX2WMpS2Kix17X-zLn89w2NFPGEHUMIuj9U&usqp=CAU",
    },
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
  const matrimonyProfiles = [
    {
      name: "Anjali, 29",
      details: "Doctor, Delhi",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTq5d1KlFgqDB4M7nNkPMTEE1jHd1CXxHVPqlN3Ot_zFHx9fY2kxN5AVkWIjGDdQe5FpI&usqp=CAU",
    },
    {
      name: "Sneha, 27",
      details: "Architect, Chennai",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWW1zJPvLQMhRlVOKOnf52RnaHh-eZGUR8HdycNsNcbTqM-cLoEJBGJjFj7Wc1hEAFjug&usqp=CAU",
    },
    {
      name: "Jyoti, 25",
      details: "Engineer, Jind",
      image:
        "https://media.istockphoto.com/id/1457293775/photo/portrait-of-cheerful-young-university-student.jpg?s=612x612&w=0&k=20&c=TW0wcrCBtwflvWd7dRt1eGQsg6wP4-rD5D0saU3eB3I=",
    },
    {
      name: "Neha, 23",
      details: "Analyst, Hisar",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqreMciVWo5iBvv77t3E15AfCWfUmrx6p_b3cIi6C9XNdahDe4Gf2VD_u2mJQLpz5Xki4&usqp=CAU",
    },
    {
      name: "Amrita, 29",
      details: "Lawyer, Rohtak",
      image:
        "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
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

  if (loading) {
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
              onPress={() => navigation.navigate("SettingsScreen")}
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
              {user && user.firstName &&
                user.firstName.charAt(0).toUpperCase() +
                  user.firstName.slice(1).toLowerCase()}
            </Text>
            <View style={styles.headerIcons}>
              <Icon name="search" size={24} color="#fff" style={styles.icon} />
              <Icon
                name="chatbubble-ellipses"
                size={24}
                color="#fff"
                style={styles.icon}
              />
              <Icon
                name="notifications"
                size={24}
                color="#fff"
                style={styles.icon}
              />
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
                    onPress={() => navigation.navigate(item.path)}
                  >
                    <Icon name={item.icon} size={24} color="#000" />
                    <Text style={styles.menuText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.quickActionsWrapper}>
                {/* Row 1 */}
                <View style={styles.quickActionRow}>
                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionContent}>
                      <Icon
                        name="chatbubble-ellipses"
                        size={20}
                        color="#FF6B00" // Orange
                      />
                      <Text style={styles.quickActionText}>
                        Ask astrologers anything
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionContent}>
                      <Icon
                        name="leaf"
                        size={20}
                        color="#28A745" // Green
                      />
                      <Text style={styles.quickActionText}>
                        Spiritual services, sorted
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Featured Temples */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Temples</Text>
                    <Text style={styles.seeAll}>see all &gt;</Text>
                  </View>
                  <FlatList
                    horizontal
                    data={featuredTemples}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.card}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.cardImage}
                        />
                        <Text style={styles.cardTitle}>{item.title}</Text>
                      </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>

                {/* Row 2 */}
                <View style={styles.quickActionRow}>
                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionContent}>
                      <Icon
                        name="card-outline"
                        size={20}
                        color="#007AFF" // Blue
                      />
                      <Text style={styles.quickActionText}>
                        Explore EMI options
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionContent}>
                      <Icon
                        name="pricetag-outline"
                        size={20}
                        color="#D63384" // Pink/Purple
                      />
                      <Text style={styles.quickActionText}>
                        List and sell fast
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                {/* Latest Jewellery */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      Latest Jewellery Designs
                    </Text>
                    <Text style={styles.seeAll}>see all &gt;</Text>
                  </View>
                  <FlatList
                    horizontal
                    data={latestJewellery}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.card}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.cardImage}
                        />
                        <Text style={styles.cardTitle}>{item.title}</Text>
                      </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>

                {/* ❤️ Matrimony Capsules */}
                <View style={styles.quickActionRow}>
                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionContent}>
                      <Icon name="heart" size={20} color="#dc3545" />
                      <Text style={styles.quickActionText}>Find Matches</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionContent}>
                      <Icon name="person-add" size={18} color="#17a2b8" />
                      <Text style={styles.quickActionText}>
                        Create Matrimony Profile
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* 💌 Slider: Featured Profiles */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      Featured Matrimony Profiles
                    </Text>
                    <Text style={styles.seeAll}>Explore &gt;</Text>
                  </View>
                  <FlatList
                    horizontal
                    data={matrimonyProfiles}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.profileCard}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.profileImage}
                        />
                        <Text style={styles.profileName}>{item.name}</Text>
                        <Text style={styles.profileDetails}>
                          {item.details}
                        </Text>
                      </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>

                {/* --- B2C Quick Actions --- */}
                <View style={styles.quickActionRow}>
                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionContent}>
                      <Icon name="bag-check" size={20} color="#0D6EFD" />
                      <Text style={styles.quickActionText}>
                        Verified Sellers
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.quickAction}>
                    <View style={styles.quickActionContent}>
                      <Icon name="flash-outline" size={20} color="#DC3545" />
                      <Text style={styles.quickActionText}>Today's Offers</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* --- Featured B2C Products Slider --- */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top B2C Picks</Text>
                    <Text style={styles.seeAll}>see all &gt;</Text>
                  </View>
                  <FlatList
                    horizontal
                    data={[
                      {
                        image: "https://i.imgur.com/UYiroysl.jpg",
                        title: "Handcrafted Lamp",
                        subtitle: "₹799 | Handmade",
                      },
                      {
                        image: "https://i.imgur.com/UPrs1EWl.jpg",
                        title: "Eco Diya Set",
                        subtitle: "₹299 | Bestseller",
                      },
                      {
                        image: "https://i.imgur.com/MABUbpDl.jpg",
                        title: "Home Decor Pack",
                        subtitle: "₹999 | Combo",
                      },
                    ]}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.card}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.cardImage}
                        />
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                      </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
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
    zIndex: 0,
    elevation: 4,
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
    fontSize: 20,
  },
  headerIcons: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  icon: {
    marginHorizontal: 10,
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

  quickActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 10,
  },

  quickAction: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 30,
    width: "49%",
  },

  quickActionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    flexWrap: "nowrap",
  },

  quickActionText: {
    fontSize: 14,
    marginLeft: 2,
    color: "#000",
    flexShrink: 1,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
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
