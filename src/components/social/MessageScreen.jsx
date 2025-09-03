import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
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

export default function MessageScreen({ navigation }) {
  const { conversations, localChats, user } = useSelector(
    (state) => state.user
  );
  const [chatsUser, setChatsUser] = useState([]);
  const dispatch = useDispatch();
  const socket = useRef();

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

  const getChatUsers = async () => {
    try {
      console.log("MessageScreen - Fetching conversations...");
      const data = await getAllUserChats();
      console.log("MessageScreen - API response:", data);
      if (data && data.length > 0) {
        await dispatch(updateConversation(data));
        // setChatsUser(conversations);
      } else {
        await dispatch(updateConversation([]));
        // setChatsUser(conversations);
      }
    } catch (error) {
      console.error("MessageScreen - Error fetching conversations:", error);
    }
  };

  useEffect(() => {
    console.log("MessageScreen - conversations updated:", conversations);
    setChatsUser(conversations);
  }, [conversations]);

  useEffect(() => {
    const initializeScreen = async () => {
      // setChatsUser(conversations);
      if (!socket.current) {
        socket.current = io(SOCKETURL);
      } else {
        socket.current.emit("join", { userId: user._id });
      }
      await updateStorageConvo();
      await getChatUsers();
    };
    
    initializeScreen();
  }, []);
  // useEffect(() => {
  // }, [chatsUser]);

  useFocusEffect(
    React.useCallback(() => {
      const initializeScreen = async () => {
        if (!socket.current) {
          socket.current = io(SOCKETURL);
        } else {
          socket.current.emit("join", { userId: user._id });
        }
        await updateStorageConvo();
        await getChatUsers();
      };
      
      initializeScreen();
    }, [socket])
  );

  useEffect(() => {
    if (socket.current) {
      socket.current.on("newMsg", (data) => {
        for (let i = 0; i < conversations.length; i++) {
          const item = conversations[i];
          if (data.userid[0].id in item.user && data.userid[1].id in item.user) {
            conversations.splice(i, 1);
            conversations.splice(0, 0, {
              user: item.user,
              unreadCount:
                data.isRead === false ? item.unreadCount + 1 : item.unreadCount,
              lastmsg: data,
            });
          }
        }
        // dispatch(updateChatUsers(conversations));
      });
    }
  }, [socket.current, conversations]);

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <TopText
            style={{ color: "#000000", fontSize: 22, fontWeight: "bold" }}
          >
            Message
          </TopText>
        </View>
      </RowBetween>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="Search" />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <TouchableOpacity>
            <Icon name="magnify" size={24} />
          </TouchableOpacity>
        </View>
      </Row>

      {chatsUser && chatsUser.length > 0 && (
        <FlatList
          data={chatsUser}
          renderItem={({ item, index }) => {
            return <MessageCard {...item} key={item._id} index={index} />;
          }}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={async () => {
                await getChatUsers();
              }}
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
            No Messages
          </Text>
        </View>
      )}
    </Container>
  );
}
