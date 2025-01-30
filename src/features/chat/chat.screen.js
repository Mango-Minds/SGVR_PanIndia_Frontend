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
import { IconButton } from "react-native-paper";
import {
  ChatDateLabel,
  ChatTextInput,
  RecieveChatBlock,
  SendChatBlock,
  TopText,
} from "../../styles/social.styles";

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
import update from "react-addons-update";
import CHatBackground from "../../assets/images/general/chatback.png";
import { SOCKETURL } from "../../infrastructure/constants";
import BlockModal from "../../components/modals/Blockuser";
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

  const socket = React.useRef();
  const scrollViewRef = React.useRef();
  const focusref = React.useRef();
  const { toid, toName, index } = route.params;
  const [cindex, setCindex] = useState(index);
  const blockRef = React.useRef(null);
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
            const newChats = update(item, {
              chats: { $set: allChats },
            });
            const updatedData = update(localChats, {
              $splice: [[i, 1, newChats]],
            });
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
            const updatedData = update(localChats, {
              $splice: [[chatindex.current, 1]],
            });
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

          const newdata = update(item, { chats: { $push: [obj] } });
          const ddata = update(localChats, { $splice: [[i, 1]] });
          updatedData = update(ddata, { $splice: [[0, 0, newdata]] });

          if (item.chats.length > 100) {
            item.chats.splice(0, 1);
            const newdata = update(item, { chats: { $splice: [[i, 1]] } });
            updatedData = update(updatedData, { $splice: [[0, 0, newdata]] });
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
          const newdata = update(item, { lastmsg: { $set: obj } });
          const removeData = update(conversations, { $splice: [[i, 1]] });
          updatedconversation = update(removeData, {
            $splice: [[0, 0, newdata]],
          });
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
        const newdata = update([chatindex.current], {
          chats: { $splice: [[0, 1]] },
        });
        updatedData = update(localChats, {
          $splice: [[chatindex.current, 1, newdata]],
        });
      } else {
        const newdata = update(localChats[chatindex.current], {
          chats: { $push: [obj] },
        });
        updatedData = update(localChats, {
          $splice: [[chatindex.current, 1, newdata]],
        });
      }

      const newdata = update(conversations[cindex], { lastmsg: { $set: obj } });
      if (cindex !== 0) {
        const removeData = update(conversations, { $splice: [[cindex, 1]] });
        updatedconversation = update(removeData, {
          $splice: [[0, 0, newdata]],
        });
        setCindex(0);
        chatindex.current = 0;
      } else {
        updatedconversation = update(conversations, {
          $splice: [[0, 1, newdata]],
        });
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
        backgroundColor: "#FAFAFA",
        flex: 1,
      }}
    >
      <RowBetween
        style={{
          paddingTop: 35,
          paddingBottom: 10,

          backgroundColor: "#F8F7F7",
          shadowColor: "#0000001B",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.7,
          shadowRadius: 2,
          elevation: 10,
        }}
      >
        <View style={{ alignItems: "center", marginTop: 0 }}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: 100,
              alignItems: "center",
            }}
          >
            <View>
              {active === true ? (
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: "green",
                    borderRadius: 10,
                    width: 10,
                    height: 10,
                    padding: 0,
                    marginTop: 5,
                  }}
                >
                  <Text style={{ marginLeft: 100 }}></Text>
                </View>
              ) : null}
              <Text
                style={{
                  color: "#000000",
                  fontSize: 18,
                  fontWeight: "600",
                  textTransform: "capitalize",
                  marginTop: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 20,
                }}
              >
                {toName}
              </Text>
            </View>
            <IconButton
              icon="dots-vertical"
              style={{
                marginRight: 10,
                fontSize: 20,
                fontWeight: "600",
                // paddingHorizontal: 10,
              }}
              onPress={() => setMenu(!menu)}
            />
          </View>
        </View>
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
              for (let i = 0; i < socialData.friends.length; i++) {
                const item = socialData.friends[i];
                if (item._id === toid) {
                  navigation.navigate("ViewUserScreen", {
                    username: socialData.friends[i].username,
                    userid: socialData.friends[i]._id,
                  });
                }
              }
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
              blockRef.current.open();
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
              Block User
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
      <View style={{ flex: 1, paddingHorizontal: 0, flexDirection: "column" }}>
        <ImageBackground
          source={CHatBackground}
          resizeMode="cover"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
            onContentSizeChange={() => {
              scrollViewRef.current.scrollToEnd({
                animated: animated.current,
              });
              animated.current = true;
            }}
            backgroundColor="#D4AF371A"
            style={{
              paddingHorizontal: 10,
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
        </ImageBackground>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={true}
      >
        <ChatTextInput
          placeholder="Type your message"
          placeholderTextColor="#78849E"
          selectionColor="#B98C13"
          value={message}
          right={
            <ChatTextInput.Icon
              name="send"
              style={{ marginTop: 15 }}
              onPress={() => {
                if (message !== "") sendMessage();
                scrollViewRef.current.scrollToEnd({ animated: true });
              }}
            />
          }
          activeUnderlineColor="transparent"
          underlineColor="transparent"
          // onSubmitEditing={sendMessage}
          onChangeText={(text) => {
            setMessage(text);
          }}
          onFocus={() => {
            setTimeout(() => {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }, 100);
          }}
          ref={focusref}
        />
      </KeyboardAvoidingView>

      <BlockModal
        slideUpRef={blockRef}
        data={{ id: toid, name: toName }}
        mainRef={blockRef}
      />
      <DeleteModal
        slideUpRef={deleteRef}
        data={{ id: toid, name: toName }}
        mainRef={deleteRef}
      />
    </Container>
    // </TouchableWithoutFeedback>
  );
};

export default ChatScreen;
