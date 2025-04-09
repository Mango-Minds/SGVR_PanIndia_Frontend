import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector, StyleSheet } from "react-redux";
import {
  Dimensions,
  Linking,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  View,
  Text,
  Image,
  RefreshControl,
} from "react-native";
import { Badge, IconButton } from "react-native-paper";
import { SafeArea } from "../components/utility/safe-area.component";
import { NewsComponent } from "../components/dashboard/NewsComponent";
import HallCard from "../components/dashboard/HallCard";
import matrimonyImg from "../assets/images/homepage/matrimony.png";
import samajImg from "../assets/images/homepage/samaj.png";
import socialImg from "../assets/images/homepage/social.png";
import storeImg from "../assets/images/homepage/store.png";
import b2bImg from "../assets/images/homepage/b2b.png";
import jobImg from "../assets/images/homepage/job.png";
import Ionicons from "react-native-vector-icons/Ionicons";
import Temple from "../assets/images/homepage/temple.png";
import Theme from "../styles/theme";
const windowWidth = Dimensions.get("window").width;
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
import { BASEAPIURL } from "../infrastructure/constants";
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
import { useQuery, useQueryClient } from "react-query";
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
import { log } from "react-native-reanimated";
import { getTempleList } from "../services/Temple.Services";
import { CommonActions } from "@react-navigation/native";
import styled from "styled-components/native";
const exploreData = [
  {
    title: "Social",
    path: "SocialMedia",
    status: false,
    icon: "people", // Icon name from Ionicons
  },
  {
    title: "Matrimony",
    path: "Matrimony",
    status: false,
    icon: "heart", // Icon name from Ionicons
  },
  {
    title: "B2C",
    path: "B2C",
    status: true,
    icon: "business", // Icon name from Ionicons
  },
  
  {
    title: "Temple",
    path: "Temple",
    status: true,
    icon: "temple-hindu", // Icon name from Ionicons
  },
];

const renderHallItem = (item, index) => {
  return <HallCard key={index} {...item.item} />;
};
export default function DashboardScreen({ navigation }) {
  const { user } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.user);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  console.log(decodedPayload);
  const userId = decodedPayload.id;

  const [notifications, setNotifications] = useState([]);
  const [belliconbadge, setBelliconbadge] = useState(1);

  const socket = useMemo(() => {
    const socketConnection = io(BASEIMGURL, {
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
  }, [BASEIMGURL, token]);

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
        if (not.user.dp) udp = await getImageUrl(not.user.dp);
        udp = res.status === 0 ? res.url : null;
        navigation.navigate("ViewUserScreenForNotification", {
          username: not.user.username,
          userid: not.user._id,
          userdp: udp.status === 0 ? udp.url : null,
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

  const { loading, notification, temple } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [adsData, setAdsData] = useState([]);
  const [adsImages, setAdsImages] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [communitiesImage, setCommunitiesImage] = useState([]);
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const [socialBellIcon, setSocialBellIcon] = useState(0);
  const [combellicon, setCombellicon] = useState(0);
  const [homescreenBellIcon, setHomescreenBellIcon] = useState(0);

  const subscribe = React.useRef(true);
  const socialsubs = React.useRef(false);
  const matsubs = React.useRef(false);
  const comsubs = React.useRef(false);

  const queryclient = useQueryClient();
  const OnRefresh = () => {
    setRefresh(true);
    // getDashboardData();
    queryclient.invalidateQueries("homeScreenNotification");
    setRefresh(false);
  };

  const renderItem = ({ item, index }) => {
    try {
      if (item.isActive)
        return (
          <Pressable
            onPress={() => {
              item.link && item.link !== "" ? Linking.openURL(item.link) : null;
            }}
          >
            <BannerContainer
              key={index}
              source={{ uri: adsImages[index] }}
              resizeMode="cover"
              style={{ backgroundColor: "#F7EFD5", borderColor: "#B88B13" }}
            />
          </Pressable>
        );
    } catch (error) {}
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        size={"large"}
        color={"#b98c13"}
      />
    );
  } else
    return (
      <SafeArea>
        <MainContainerDashboard
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={OnRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <TopHeader style={{ marginBottom: 24 }}>
            <HeaderText>Me Maratha</HeaderText>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ChatHome"), { user };
                }}
              >
                <IconButton icon="chat" size={30}></IconButton>
              </TouchableOpacity>

              <Pressable
                onPress={() => {
                  setNotifications(
                    notifications.map((notification) => ({
                      ...notification,
                      isRead: true,
                    }))
                  );
                  socket.emit("markAllNotificationsAsRead", userId),
                    setBelliconbadge(0),
                    navigation.navigate("DashboardNotification", {
                      notifications: notifications,
                    });
                }}
              >
                <Ionicons
                  style={{
                    opacity: 0.75,
                  }}
                  name="notifications"
                  color="black"
                  size={30}
                />
                {belliconbadge > 0 && (
                  <Badge
                    style={{
                      position: "absolute",
                      fontSize: 10,
                      marginTop: 0,
                      marginLeft: 10,
                      fontWeight: "bold",
                      backgroundColor: "#D80808",
                    }}
                    size={15}
                  >
                    {belliconbadge}
                  </Badge>
                )}
              </Pressable>

              <IconButton
                icon="account-circle"
                onPress={() => navigation.navigate("SettingsScreen")}
                size={30}
              ></IconButton>
            </View>
          </TopHeader>

          {/* Advertisment Banners */}
          {adsData &&
            adsImages &&
            adsImages.length > 0 &&
            adsData.length > 0 && (
              <CustomCarousel
                data={adsData}
                renderItem={renderItem}
                itemWidth={windowWidth * 0.9}
              />
            )}

          <DashboardSection>
            <SectionTitle>Explore</SectionTitle>

            {/* <ExploreContainer>
              {exploreData.map((item, index) => {
                return (
                  index < 2 && (
                    <ExploreIconContainer
                      key={index}
                      onPress={() => {
                        navigation.navigate(item.path);
                      }}
                      // disabled={item.status}
                    >
                      <IconWrapper>
                        <Ionicons name={item.icon} size={40} color="#d4af37" />
                      </IconWrapper>
                      <ExploreIconName>{item.title}</ExploreIconName>
                    </ExploreIconContainer>
                    
                  )
                );
              })}
             
            </ExploreContainer> */}

            {/* Using common actions */}
            <ExploreContainer>
              {exploreData.map((item, index) => {
                return (
                  index < 2 && (
                    <ExploreIconContainer
                      key={index}
                      onPress={() => {
                        if (item.path === "SocialMedia") {
                          
                          navigation.dispatch(
                            CommonActions.reset({
                              index: 0, // The starting screen index
                              routes: [{ name: "SocialMedia" }],
                            })
                          );
                        } else {
                          navigation.navigate(item.path);
                        }
                      }}
                      disabled={item.status}
                    >
                      <IconWrapper>
                        <Ionicons name={item.icon} size={40} color={Theme.themeColor} />
                      </IconWrapper>
                      <ExploreIconName>{item.title}</ExploreIconName>
                    </ExploreIconContainer>
                  )
                );
              })}
            </ExploreContainer>

            <ExploreContainer>
              {exploreData.map((item, index) => {
                return (
                  index >= 2 && (
                    <ExploreIconContainer
                      key={index}
                      onPress={() => navigation.navigate(item.path)}
                    >
                      <IconWrapper>
                        <MaterialIcons
                          name={item.icon}
                          size={40}
                          color={Theme.themeColor}
                        />
                      </IconWrapper>
                      <ExploreIconName>{item.title}</ExploreIconName>
                    </ExploreIconContainer>
                  )
                );
              })}
            </ExploreContainer>
          </DashboardSection>
          <View>
            {(events && events.length > 0) ||
            (vendors && vendors.length > 0) ||
            (communities && communities.length > 0) ? (
              <>
                {/* {events && events.length > 0 ? (
                  <DashboardSection>
                    <SectionTitle style={{ marginBottom: 0 }}>
                      Up Coming Events
                    </SectionTitle>
                    <ScrollView style={{ maxHeight: 500 }}>
                      {events.map((item, index) => {
                        return (
                          <NewsComponent
                            navigation={navigation}
                            {...item}
                            key={index}
                          />
                        );
                      })}
                    </ScrollView>
                  </DashboardSection>
                ) : null} */}

                {/* {vendors && vendors.length > 0 ? (
                  <DashboardSection>
                    <SectionTitle style={{ marginBottom: 16 }}>
                      Services For You
                    </SectionTitle>
                    <PopularHalls data={vendors} />
                  </DashboardSection>
                ) : null} */}

                {/* {communities &&
                communities.length > 0 &&
                communitiesImage.length > 0 ? (
                  <DashboardSection>
                    <SectionTitle style={{ marginBottom: 16 }}>
                      Join Our Samaj
                    </SectionTitle>
                    {communities.map((community, idx) => {
                      if (community.isActive === true)
                        return (
                          <TouchableOpacity
                            // activeOpacity={1}
                            onPress={() => {
                              navigation.navigate("CommunityProfile", {
                                communityId: community._id,
                              });
                            }}
                            key={idx}
                          >
                            <CommunityCard
                              {...community}
                              community={communitiesImage}
                              idx={idx}
                              navigation={navigation}
                            />
                          </TouchableOpacity>
                        );
                    })}
                  </DashboardSection>
                ) : null} */}
              </>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: "3%",
                  marginTop: "-6%",
                  width: "100%",
                  height: 500,
                  borderRadius: 10,
                }}
              >
                <Image
                  source={require("../assets/images/homepage/welcome.png")}
                />
                <View>
                  <Text
                    style={{
                      fontSize: 25,
                      fontWeight: "bold",
                      color: Theme.themeColor,
                      marginTop: 10,
                      letterSpacing: 1,
                      textAlign: "center",
                    }}
                  >
                    Welcome To
                  </Text>
                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: "bold",
                      color: Theme.themeColor,
                      marginTop: 10,
                      letterSpacing: 1,
                    }}
                  >
                    Me Maratha
                  </Text>
                </View>
              </View>
            )}
          </View>
        </MainContainerDashboard>
      </SafeArea>
    );
}
