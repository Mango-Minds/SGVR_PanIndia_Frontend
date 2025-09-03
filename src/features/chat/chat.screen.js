import React, { useRef, useState } from "react";
import { Container, RowBetween, View } from "../../styles/common.styles";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { IconButton, TextInput } from "react-native-paper";
import {
  ChatDateLabel,
  RecieveChatBlock,
  SendChatBlock,
  TopText,
} from "../../styles/social.styles";
import Theme from "../../styles/theme";
import io from "socket.io-client";
import {
  getAllChats,
  saveChats,
  saveSingleChat,
} from "../../services/chat.services";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCloudChats,
  updateConversation,
  updateLocalChats,
} from "../../store/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cloneDeep } from "lodash";
import { SOCKETURL } from "../../infrastructure/constants";
import { BASEAPIURL } from "../../infrastructure/constants";
import DeleteModal from "../../components/modals/DeleteChat";

const ChatScreen = ({ navigation, route }) => {
  const [chattings, setChattings] = React.useState([]);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(false);
  const dispatch = useDispatch();
  const animated = useRef(false);
  const [menu, setMenu] = useState(false);
  const { user, localChats, cloudChats, conversations, socialData } =
    useSelector((state) => state.user);
  const token = useSelector((state) => state.user.token);

  const socket = React.useRef();
  const scrollViewRef = React.useRef();
  const focusref = React.useRef();
  const { toid, toName, index } = route.params;
  const [cindex, setCindex] = useState(index);
  const deleteRef = React.useRef(null);
  const chatindex = useRef(null);

  // if(socialData.friends.indexOf(toid) !== -1){
  //   console.log("got it")
  //   }else(
  //   console.log("not worked")
  // )

  React.useEffect(() => {
    if (!socket.current) {
      socket.current = io(SOCKETURL);
    }
    if (socket.current) {
      socket.current.emit("join", { userId: user._id });
    }
    const chatFun = async () => {
      if (localChats && localChats.length > 0) {
        for (let i = 0; i < localChats.length; i++) {
          const item = localChats[i];
          if (item.userid.includes(user._id) && item.userid.includes(toid)) {
            chatindex.current = i;
            localChats[chatindex.current];
            setChattings(item.chats);
            setCindex(i);
          }
        }
      }

      const allChats = await getAllChats(toid, page);
      if (allChats && allChats.length > 0) {
        setChattings(allChats);
        let updatechatflag = false;
        for (let i = 0; i < localChats.length; i++) {
          const item = localChats[i];
          if (item.userid.includes(user._id) && item.userid.includes(toid)) {
            const newChats = { ...item, chats: allChats };
            const updatedData = [...localChats.slice(0, i), newChats, ...localChats.slice(i + 1)];
            dispatch(updateLocalChats(updatedData));
            setCindex(i);
            updatechatflag = true;
            return;
          }
        }
        if (!updatechatflag) {
          dispatch(
            updateLocalChats([
              ...localChats,
              {
                userid: [user._id, toid],
                chats: [allChats],
              },
            ])
          );
        }
      } else {
        setChattings([]);
        if (chatindex.current) {
          for (let i = 0; i < localChats.length; i++) {
            const updatedData = [...localChats.slice(0, chatindex.current), ...localChats.slice(chatindex.current + 1)];
            dispatch(updateLocalChats(updatedData));
          }
        }
      }
    };
    chatFun();
  }, []);

  if (socket.current) {
    socket.current.on("connectedUsers", ({ active }) => {
      if (active && active.length > 0) {
        for (let i = 0; i < active.length; i++) {
          const item = active[i];
          if (item.userId === toid) {
            setActive(true);
            return;
          }
        }
      }
    });
    socket.current.on("newMsgReceived", ({ obj }) => {
      setChattings([...chattings, obj]);
      let flag = false;
      let updatedData;

      for (let i = 0; i < localChats.length; i++) {
        let item = localChats[i];
        if (item.userid.includes(user._id) && item.userid.includes(toid)) {
          flag = true;

          const newdata = { ...item, chats: [...item.chats, obj] };
          const ddata = [...localChats.slice(0, i), ...localChats.slice(i + 1)];
          updatedData = [newdata, ...ddata];

          if (item.chats.length > 100) {
            item.chats.splice(0, 1);
            const newdata = { ...item, chats: [...item.chats.slice(1)] };
            updatedData = [newdata, ...updatedData.slice(1)];
          }
        }
      }
      let updatedconversation;
      for (let i = 0; i < conversations.length; i++) {
        const item = conversations[i];
        let ucount = 0;
        for (let j = 0; j < item.user.length; j++) {
          const val = item.user[j];
          if (val._id === toid || val._id === user._id) {
            ucount++;
          }
        }

        if (ucount === 2) {
          const newdata = { ...item, lastmsg: obj };
          const removeData = [...conversations.slice(0, i), ...conversations.slice(i + 1)];
          updatedconversation = [newdata, ...removeData];
        }
      }

      if (flag == false) {
        dispatch(
          updateLocalChats([
            ...localChats,
            {
              userid: [user._id, toid],
              chats: [obj],
            },
          ])
        );
        dispatch(
          updateConversation([
            ...conversations,
            { user: [user._id, toid], lastmsg: obj },
          ])
        );
      } else {
        dispatch(updateLocalChats(updatedData));
        dispatch(updateConversation(updatedconversation));
      }
    });
  }

  const sendMessage = async (e) => {
    console.log("sendMessage function called with message:", message);
    
    // Create chat room if it doesn't exist
    try {
      const roomResponse = await fetch(`${BASEAPIURL}/chat/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds: [user._id, toid]
        })
      });
      
      if (roomResponse.ok) {
        const roomData = await roomResponse.json();
        console.log("Chat room created/retrieved:", roomData.roomId);
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
    
    const obj = {
      msg: message,
      sender: user._id,
      receiver: toid,
      time: `${new Date()}`,
      conversation: [user._id, toid],
    };

    saveSingleChat({
      msg: message,
      sender: user._id,
      receiver: toid,
      time: new Date(),
    });

    if (socket.current) {
      socket.current.emit("sendNewMsg", {
        obj,
      });
    }
    setChattings([...chattings, obj]);
    setMessage("");

    // let flag = false;
    let updatedData;
    let updatedconversation;

    if (cindex !== undefined) {
      if (localChats[chatindex.current].chats.length + 1 > 100) {
        const currentChat = localChats[chatindex.current];
        const newdata = { ...currentChat, chats: currentChat.chats.slice(1) };
        updatedData = [...localChats.slice(0, chatindex.current), newdata, ...localChats.slice(chatindex.current + 1)];
      } else {
        const currentChat = localChats[chatindex.current];
        const newdata = { ...currentChat, chats: [...currentChat.chats, obj] };
        updatedData = [...localChats.slice(0, chatindex.current), newdata, ...localChats.slice(chatindex.current + 1)];
      }

      const newdata = { ...conversations[cindex], lastmsg: obj };
      if (cindex !== 0) {
        const removeData = [...conversations.slice(0, cindex), ...conversations.slice(cindex + 1)];
        updatedconversation = [newdata, ...removeData];
        setCindex(0);
        chatindex.current = 0;
      } else {
        updatedconversation = [newdata, ...conversations.slice(1)];
      }
    }

    if (cindex === undefined) {
      chatindex.current = localChats.length + 1;
      dispatch(
        updateLocalChats([
          ...localChats,
          {
            userid: [user._id, toid],
            chats: [obj],
          },
        ])
      );
      dispatch(
        updateConversation([
          { user: [user._id, toid], lastmsg: obj },
          ...conversations,
        ])
      );
      setCindex(0);
      chatindex.current = 0;
    } else {
      dispatch(updateLocalChats(updatedData));
      dispatch(updateConversation(updatedconversation));
    }
  };

  return (
    // <TouchableWithoutFeedback
    //   onPressIn={() => setMenu(false)}
    //   style={{ zIndex: 0 }}
    // >
    <Container
      style={{
        margin: 0,
        marginTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        backgroundColor: "#FFFFFF",
        flex: 1,
      }}
    >
      <RowBetween
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E8ECF2",
          paddingBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <Text
            style={{
              color: "#000000",
              fontSize: 20,
              fontWeight: "bold",
              textTransform: "capitalize",
              marginLeft: 8,
            }}
          >
            {toName}
          </Text>
          {active === true && (
            <View
              style={{
                backgroundColor: "green",
                borderRadius: 10,
                width: 10,
                height: 10,
                marginLeft: 8,
              }}
            />
          )}
        </View>
        <IconButton
          icon="dots-vertical"
          onPress={() => setMenu(!menu)}
        />
      </RowBetween>
      {menu && (
        <View
          style={{
            position: "absolute",
            flexDirection: "column",
            backgroundColor: "white",
            zIndex: 5,
            opacity: 1,
            right: 0,
            marginRight: 20,
            shadowColor: "#0000001B",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 1,
            shadowRadius: 2,
            elevation: 10,
            borderRadius: 10,
            // padding: 5,
            marginTop: 100,
            paddingVertical: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setMenu(false);
              // Navigate to the user's profile
              navigation.navigate("EachProfile", {
                userId: toid,
              });
            }}
          >
            <Text
              style={{
                fontSize: Platform.OS === "android" ? 14 : 20,
                color: "grey",
                textTransform: "capitalize",
                marginTop: 0,
                backgroundColor: "white",
                paddingVertical: Platform.OS === "android" ? 8 : 10,
                letterSpacing: 0.5,
                width: Platform.OS === "android" ? 170 : 200,
                paddingLeft: 30,
              }}
            >
              View User
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPressIn={() => {
              setMenu(false);
              deleteRef.current.open();
            }}
          >
            <Text
              style={{
                fontSize: Platform.OS === "android" ? 14 : 20,
                color: "grey",
                textTransform: "capitalize",
                marginTop: 0,
                backgroundColor: "white",
                paddingVertical: Platform.OS === "android" ? 8 : 10,
                letterSpacing: 0.5,
                width: Platform.OS === "android" ? 170 : 200,
                paddingLeft: 30,
              }}
            >
              Delete Chat
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flex: 1, paddingHorizontal: 0, flexDirection: "column", backgroundColor: "#FFFFFF" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            scrollViewRef.current.scrollToEnd({
              animated: animated.current,
            });
            animated.current = true;
          }}
          style={{
            paddingHorizontal: 10,
            backgroundColor: "#FFFFFF",
          }}
        >
            {chattings &&
              chattings.length > 0 &&
              chattings.map((chat, index) => {
                return (
                  <React.Fragment key={index}>
                    {/* <ChatDateLabel>YESTERDAY, 2:30 PM</ChatDateLabel> */}
                    {chat.sender === user._id ? (
                      <View
                        key={index}
                        style={{
                          alignItems: "flex-end",
                          flex: 1,
                          justifyContent: "flex-end",
                          BorderRadius: 10,
                        }}
                      >
                        <SendChatBlock>
                          <Text>{chat.msg}</Text>
                        </SendChatBlock>
                      </View>
                    ) : (
                      <RecieveChatBlock key={index}>
                        <Text>{chat.msg}</Text>
                      </RecieveChatBlock>
                    )}
                  </React.Fragment>
                );
              })}
          </ScrollView>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={true}
      >
        <TextInput
          placeholder="Type your message"
          placeholderTextColor="#78849E"
          selectionColor="#B98C13"
          value={message}
          right={
            <TextInput.Icon
              icon="send"
              style={{ marginTop: 15 }}
              onPress={() => {
                console.log("Send button pressed, message:", message);
                if (message !== "") {
                  sendMessage();
                  scrollViewRef.current.scrollToEnd({ animated: true });
                } else {
                  console.log("Message is empty, cannot send");
                }
              }}
            />
          }
          activeUnderlineColor="transparent"
          underlineColor="transparent"
          mode="outlined"
          outlineColor="transparent"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 26,
            height: 40,
            marginTop: 10,
            marginBottom: 10,
            marginLeft: 15,
            marginRight: 15,
            borderWidth: 1,
            borderColor: "#E8ECF2",
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}
          onChangeText={(text) => {
            setMessage(text);
          }}
          onSubmitEditing={() => {
            if (message !== "") sendMessage();
            scrollViewRef.current.scrollToEnd({ animated: true });
          }}
          onFocus={() => {
            setTimeout(() => {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }, 100);
          }}
          ref={focusref}
        />
      </KeyboardAvoidingView>

      <DeleteModal
        slideUpRef={deleteRef}
        data={{ 
          _id: route.params.conversationId || route.params._id,
          conversation: [user._id, toid], // Pass conversation array for ID generation
          name: toName 
        }}
        mainRef={deleteRef}
      />
    </Container>
    // </TouchableWithoutFeedback>
  );
};

export default ChatScreen;
