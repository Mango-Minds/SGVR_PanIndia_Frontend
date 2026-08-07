import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import io from "socket.io-client";
import { Divider, IconButton } from "react-native-paper";
import {
  Container,
  InputField,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import MessageCard from "./MessageCard";
import BottomNavigation from "./BottomNavigation";
import JewelleryBottomTabBar from "../Jewellery/BottomTabBar";
import DashboardBottomNavigation from "../dashboard/DashboardBottomNavigation";
import { getImageUrl, getSocialMediaProfile } from "../../services/socialMedia.services";
import { listUsers } from "../../Backup/queries";
import { useDispatch, useSelector } from "react-redux";
import { getAllUserChats } from "../../services/chat.services";
import {
  updateChatUsers,
  updateConversation,
  updateLocalChats,
  updateSocket,
} from "../../store/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { SOCKETURL } from "../../infrastructure/constants";
import { useTranslation } from "react-i18next";
import { navigateJewelleryAuthTab, JEWELLERY_HOME_SCREEN } from "../../utils/requireAuth";

export default function MessageScreen({ navigation, route, hideBottomNav = false, module }) {
  const { t } = useTranslation();
  const { conversations, localChats, user, token, isGuest } = useSelector(
    (state) => state.user
  );
  const [chatsUser, setChatsUser] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [allChats, setAllChats] = useState([]);
  const dispatch = useDispatch();
  const socket = useRef();
  const [userDp, setUserDp] = useState(null);
  const isJewellery =
    module === "jewellery" || route?.params?.module === "jewellery";
  const isDashboard =
    module === "dashboard" || route?.params?.module === "dashboard";
  const hideSocialNav =
    hideBottomNav ||
    route?.params?.hideBottomNav ||
    isJewellery ||
    isDashboard;

  const updateStorageConvo = async () => {
    const convodata = await AsyncStorage.getItem("conversation");
    if (convodata) {
      await dispatch(updateConversation(JSON.parse(convodata)));
      // setChatsUser(conversations);
    }
    
    // Clean up old typo data
    const oldConvoData = await AsyncStorage.getItem("coversation");
    if (oldConvoData) {
      await AsyncStorage.removeItem("coversation");
    }
    
    const chats = await AsyncStorage.getItem("localChats");
    if (chats) {
      const localchats = JSON.parse(chats);
      dispatch(updateLocalChats(localchats));
    }
  };

  const getChatUsers = async (includeArchived = false) => {
    try {
      console.log("MessageScreen - Fetching conversations...");
      const data = await getAllUserChats(includeArchived);
      console.log("MessageScreen - API response:", data);
      setAllChats(data || []);
      if (!includeArchived) {
        if (data && data.length > 0) {
          await dispatch(updateConversation(data));
        } else {
          await dispatch(updateConversation([]));
        }
      } else {
        // When showing archived, update chatsUser directly
        setChatsUser(data || []);
      }
    } catch (error) {
      console.error("MessageScreen - Error fetching conversations:", error);
    }
  };

  const refreshChats = async () => {
    await getChatUsers(showArchived);
  };

  useEffect(() => {
    console.log("MessageScreen - conversations updated:", conversations);
    if (showArchived) {
      setChatsUser(allChats);
    } else {
      setChatsUser(conversations);
    }
  }, [conversations, allChats, showArchived]);

  useEffect(() => {
    const initializeScreen = async () => {
      if (!socket.current) {
        socket.current = io(SOCKETURL);
      }
      if (user?._id) {
        socket.current.emit("joinUserRoom", user._id);
        socket.current.emit("join", { userId: user._id });
      }
      // load header avatar (supports direct URLs and storage keys)
      try {
        const dpCandidate = user?.dp || user?.image;
        if (dpCandidate) {
          if (typeof dpCandidate === 'string' && /^(http|https):\/\//i.test(dpCandidate)) {
            setUserDp(dpCandidate);
          } else {
            const res = await getImageUrl(dpCandidate);
            if (res.status === 0 && res.url) setUserDp(res.url);
          }
        } else {
          // Fallback: fetch profile like social posts
          const prof = await getSocialMediaProfile(user?._id);
          const profCandidate = prof?.result?.dp || prof?.result?.image;
          if (profCandidate) {
            if (typeof profCandidate === 'string' && /^(http|https):\/\//i.test(profCandidate)) {
              setUserDp(profCandidate);
            } else {
              const img = await getImageUrl(profCandidate);
              if (img.status === 0 && img.url) setUserDp(img.url);
            }
          }
        }
      } catch (e) {
        // ignore avatar load errors
      }
      await updateStorageConvo();
      await getChatUsers();
    };
    
    initializeScreen();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const initializeScreen = async () => {
        if (!socket.current) {
          socket.current = io(SOCKETURL);
        }
        if (user?._id) {
          socket.current.emit("joinUserRoom", user._id);
          socket.current.emit("join", { userId: user._id });
        }
        await updateStorageConvo();
        await getChatUsers(showArchived);
      };
      
      initializeScreen();
    }, [showArchived, user?._id])
  );

  useEffect(() => {
    if (!user?._id) return undefined;

    if (!socket.current) {
      socket.current = io(SOCKETURL, { transports: ["websocket"] });
    }

    const join = () => {
      socket.current.emit("joinUserRoom", user._id);
      socket.current.emit("join", { userId: user._id });
    };
    join();
    socket.current.on("connect", join);

    const refreshList = (data) => {
      // Only refresh for live events; ignore reconnect replays
      if (!data?.roomId || data.isReplay || data.live !== true) return;
      getChatUsers(showArchived);
    };

    socket.current.on("chatUnread", refreshList);
    socket.current.on("notification", refreshList);
    socket.current.on("newChatMessage", refreshList);

    return () => {
      socket.current?.off("connect", join);
      socket.current?.off("chatUnread", refreshList);
      socket.current?.off("notification", refreshList);
      socket.current?.off("newChatMessage", refreshList);
    };
  }, [user?._id, showArchived]);

  const handleJewelleryTabChange = (tab) => {
    switch (tab) {
      case "home":
        navigation.navigate(JEWELLERY_HOME_SCREEN);
        break;
      case "search":
        navigation.navigate("BrowseScreen");
        break;
      case "profile":
      case "notifications":
        navigateJewelleryAuthTab(tab, { token, isGuest, dispatch, navigation });
        break;
      case "message":
      default:
        break;
    }
  };

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, paddingBottom: 0, backgroundColor: "white" }}
    >
      {/* Header - replicate mock: avatar, name, status and actions */}
      <RowBetween style={{ paddingTop: 24, paddingHorizontal: 12, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <Image
            source={userDp ? { uri: userDp } : require("../../assets/images/general/user.png")}
            style={styles.headerAvatar}
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1} ellipsizeMode="tail">
              {(user?.firstName || user?.fname || "") + (user?.lastName || user?.lname ? " " + (user?.lastName || user?.lname) : "")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="ellipse" size={10} color="#2AC769" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto", justifyContent: "flex-end" }}>
          <Ionicons
            name="create-outline"
            size={22}
            color="#000"
            style={{ marginHorizontal: 8 }}
            onPress={() => navigation.navigate("NewMessageScreen")}
          />
          <TouchableOpacity
            onPress={() => {
              setShowArchived(!showArchived);
              getChatUsers(!showArchived);
            }}
            style={{ padding: 4, marginLeft: 4 }}
          >
            <Icon
              name={showArchived ? "archive-arrow-up" : "archive-arrow-down"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </RowBetween>

      {chatsUser && chatsUser.length > 0 && (
        <FlatList
          data={chatsUser}
          renderItem={({ item, index }) => {
            return <MessageCard {...item} key={item._id} index={index} onRefresh={refreshChats} />;
          }}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refreshChats}
            />
          }
        />
      )}
      {chatsUser && chatsUser.length === 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginTop: 200,
          }}
        >
          <Ionicons name="chatbubbles-outline" size={100} color="#0000001A" />
          <Text
            style={{
              fontSize: 25,
              fontWeight: "800",
              color: "#0000001A",
            }}
          >
            {showArchived ? t("no_archived_chats") : t("no_messages")}
          </Text>
        </View>
      )}
      {isJewellery ? (
        <JewelleryBottomTabBar
          activeTab="message"
          onTabChange={handleJewelleryTabChange}
        />
      ) : isDashboard ? (
        <DashboardBottomNavigation
          navigation={navigation}
          currentScreen="messages"
        />
      ) : !hideSocialNav ? (
        <BottomNavigation navigation={navigation} currentScreen="messages" />
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 6,
  },
  headerName: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  headerStatus: {
    marginLeft: 6,
    color: "#7C8A9A",
    fontSize: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2AC769",
  },
});
