import React, { useCallback, useEffect, useState, useRef } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity } from "react-native";
import io from "socket.io-client";
import { Divider, IconButton } from "react-native-paper";
import { Container, RowBetween, SearchField, View } from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import MessageCard from "../../components/social/MessageCard";
import { useDispatch, useSelector } from "react-redux";
import { getAllUserChats } from "../../services/chat.services";
import { updateConversation, updateLocalChats } from "../../store/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { SOCKETURL } from "../../infrastructure/constants";

export default function MessageScreenNew({ navigation }) {
  const { conversations, user } = useSelector((state) => state.user);
  const [chatsUser, setChatsUser] = useState([]);
  const dispatch = useDispatch();
  const socket = useRef();

  // const updateStorageConvo = async () => {
  //   const convoData = await AsyncStorage.getItem("conversation");
  //   if (convoData) {
  //     dispatch(updateConversation(JSON.parse(convoData)));
  //   }
  //   const chats = await AsyncStorage.getItem("localChats");
  //   if (chats) {
  //     dispatch(updateLocalChats(JSON.parse(chats)));
  //   }
  // };

  // const getChatUsers = async () => {
  //   try {
  //     const data = await getAllUserChats();
  //     dispatch(updateConversation(data || []));
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   setChatsUser(conversations);
  // }, [conversations]);

  // useEffect(() => {
  //   if (!socket.current) {
  //     socket.current = io(SOCKETURL);
  //   } else {
  //     socket.current.emit("join", { userId: user._id });
  //   }
  //   updateStorageConvo();
  //   getChatUsers();
  // }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     if (!socket.current) {
  //       socket.current = io(SOCKETURL);
  //     } else if (user && user._id) {
  //       socket.current.emit("join", { userId: user._id });
  //     }
  //     updateStorageConvo();
  //     getChatUsers();
  //   }, [user])
  // );

  // useEffect(() => {
  //   if (socket.current) {
  //     socket.current.on("newMsg", (data) => {
  //       const updatedConversations = conversations.map((item) => {
  //         if (data.userid.some((id) => id.id === item.user._id)) {
  //           return {
  //             ...item,
  //             unreadCount: data.isRead ? item.unreadCount : item.unreadCount + 1,
  //             lastmsg: data,
  //           };
  //         }
  //         return item;
  //       });
  //       dispatch(updateConversation(updatedConversations));
  //     });
  //   }
  // }, [conversations]);

  return (
    <Container style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}>
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText style={{ color: "#000000", fontSize: 22, fontWeight: "bold" }}>Message</TopText>
        </View>
        <TouchableOpacity style={{ marginRight: 32 }} onPress={() => navigation.navigate("NewMessageScreen")}>
          <Icon name="circle-edit-outline" size={24} />
        </TouchableOpacity>
      </RowBetween>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="NewSearch" />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <TouchableOpacity>
            <Icon name="magnify" size={24} />
          </TouchableOpacity>
        </View>
      </Row>

      {chatsUser.length > 0 ? (
        <FlatList
          data={chatsUser}
          renderItem={({ item, index }) => <MessageCard {...item} key={item._id} index={index} />}
          keyExtractor={(item) => item._id}
          // refreshControl={<RefreshControl refreshing={false} onRefresh={getChatUsers} />}
        />
      ) : (
        <View style={styles.noMessages}>
          <Ionicons name="chatbubbles" size={100} color="#0000001A" />
          <Text style={styles.noMessagesText}>No Messages</Text>
        </View>
      )}
    </Container>
  );
}

const styles = {
  noMessages: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 200,
  },
  noMessagesText: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0000001A",
  },
};
