import React, { useRef, useState } from "react";
import { Container, RowBetween, View, SearchField } from "../../styles/common.styles";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Image,
  Linking,
  View as RNView,
  Alert,
  ActionSheetIOS,
  FlatList,
  Modal as RNModal,
} from "react-native";
import { IconButton, TextInput, Button, Checkbox } from "react-native-paper";
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
import { BASEAPIURL, BASEIMGURL, RENDERMEDIAURL, SOCKETURL } from "../../infrastructure/constants";
import * as ImagePicker from 'expo-image-picker';
import { uploadChatMedia, saveSingleChat as saveSingleChatApi, editMessage as editMessageApi, deleteMessage as deleteMessageApi, getRoomMessages, getRoomMembers, addRoomMembers, removeRoomMember } from '../../services/chat.services';
import { GetAllFriends } from "../../services/socialMedia.services";
import DeleteModal from "../../components/modals/DeleteChat";
import { clearConversationUnread } from "../../hooks/useMessageUnreadBadge";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ChatScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
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
  const flatListRef = React.useRef(null);
  const focusref = React.useRef();
  const { toid, toName, index, isGroup, roomId: routeRoomId } = route.params;
  const [cindex, setCindex] = useState(index);
  const deleteRef = React.useRef(null);
  const chatindex = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const suppressAutoScrollRef = useRef(false);
  const [membersVisible, setMembersVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [friendsForAdd, setFriendsForAdd] = useState([]);
  const [selectedAdd, setSelectedAdd] = useState([]);
  const [searchAdd, setSearchAdd] = useState("");
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [creatorId, setCreatorId] = useState(null);

  const loadFriendsForAdd = async () => {
    try {
      const res = await GetAllFriends({ userid: user?._id });
      const list = Array.isArray(res?.friends)
        ? res.friends.map((u) => ({ _id: u._id, firstName: u.firstName || "", lastName: u.lastName || "", email: u.email || "" }))
        : [];
      const memberIds = new Set((members || []).map((m) => String(m._id)));
      memberIds.add(String(user?._id));
      const filtered = list.filter((f) => !memberIds.has(String(f._id)));
      setFriendsForAdd(filtered);
    } catch (e) {
      setFriendsForAdd([]);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (String(memberId) === String(user._id)) return; // safety guard
    Alert.alert(
      'Remove member',
      'Are you sure you want to remove this member from the group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
            try {
              setRemovingMemberId(memberId);
              await removeRoomMember(getRoomId(), memberId);
              const res = await getRoomMembers(getRoomId());
              if (res && res.success) setMembers(res.members || []);
            } catch (e) {
            } finally {
              setRemovingMemberId(null);
            }
        }}
      ]
    );
  };

  // Function to format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Use local timezone for comparison
    const messageDateStr = messageDate.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    
    if (messageDateStr === todayStr) {
      return 'TODAY';
    } else if (messageDateStr === yesterdayStr) {
      return 'YESTERDAY';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }).toUpperCase();
    }
  };

  // Function to format time for display
  const formatTime = (date) => {
    if (!date) return '';
    
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  };

  // Function to group messages by date
  const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const grouped = [];
    let currentDate = null;
    
    messages.forEach((message, index) => {
      if (!message.time) return; // Skip messages without time
      
      const messageDate = new Date(message.time);
      const dateStr = messageDate.toDateString();
      
      if (currentDate !== dateStr) {
        currentDate = dateStr;
        grouped.push({
          type: 'dateHeader',
          date: messageDate,
          id: `date-${dateStr}`,
        });
      }
      
      grouped.push({
        ...message,
        type: 'message',
        originalIndex: index,
      });
    });
    
    return grouped;
  };

  const isOutgoing = (chat) => {
    try {
      if (chat.sender) return chat.sender === user._id;
      if (chat.userId) return chat.userId === user._id;
      if (typeof chat.receiver !== 'undefined') return chat.receiver !== user._id;
      if (Array.isArray(chat.conversation)) {
        const [first] = chat.conversation;
        if (first) return first === user._id;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const getRoomId = () => (isGroup && routeRoomId ? routeRoomId : [user._id, toid].sort().join('_'));

  const startEditingMessage = (chat) => {
    setIsEditing(true);
    setEditingMessageId(chat._id);
    setMessage(chat.msg || "");
    suppressAutoScrollRef.current = true;
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingMessageId(null);
    setMessage("");
    // Re-enable autoscroll shortly after edit mode exits
    setTimeout(() => { suppressAutoScrollRef.current = false; }, 300);
  };

  const saveEditedMessage = async () => {
    if (!isEditing || !editingMessageId) return;
    try {
      await editMessageApi({ roomId: getRoomId(), messageId: editingMessageId, newMessage: message });
      const updated = chattings.map((c) => (c._id === editingMessageId ? { ...c, msg: message } : c));
      setChattings(updated);
      cancelEditing();
    } catch (e) {
      console.error('Failed to edit message', e);
    }
  };

  const confirmDeleteMessage = (chat, opts = {}) => {
    const { skipConfirm = false } = opts;
    const performDelete = async () => {
      try {
        suppressAutoScrollRef.current = true; // Prevent auto-scroll during delete
        await deleteMessageApi({ roomId: getRoomId(), messageId: chat._id });
        setChattings(chattings.filter((c) => c._id !== chat._id));
        // Re-enable autoscroll after delete
        setTimeout(() => { suppressAutoScrollRef.current = false; }, 300);
      } catch (e) {
        console.error('Failed to delete message', e);
        suppressAutoScrollRef.current = false; // Reset on error
      }
    };

    if (skipConfirm) {
      performDelete();
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) performDelete();
        }
      );
    } else {
      Alert.alert('Delete', 'Delete this message?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  const showMessageOptions = (chat) => {
    if (!isOutgoing(chat)) return;
    const hasText = !!chat.msg;
    const options = hasText ? ['Cancel', 'Edit', 'Delete'] : ['Cancel', 'Delete'];
    const cancelIndex = 0;
    const destructiveIndex = hasText ? 2 : 1;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: cancelIndex,
          destructiveButtonIndex: destructiveIndex,
        },
        (index) => {
          if (hasText) {
            if (index === 1) startEditingMessage(chat);
            if (index === 2) confirmDeleteMessage(chat, { skipConfirm: true });
          } else if (index === 1) {
            confirmDeleteMessage(chat, { skipConfirm: true });
          }
        }
      );
    } else {
      if (hasText) {
        Alert.alert('Message options', '', [
          { text: 'Edit', onPress: () => startEditingMessage(chat) },
          { text: 'Delete', style: 'destructive', onPress: () => confirmDeleteMessage(chat, { skipConfirm: true }) },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } else {
        Alert.alert('Delete media?', '', [
          { text: 'Delete', style: 'destructive', onPress: () => confirmDeleteMessage(chat, { skipConfirm: true }) },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    }
  };

  // if(socialData.friends.indexOf(toid) !== -1){
  //   console.log("got it")
  //   }else(
  //   console.log("not worked")
  // )

  React.useEffect(() => {
    if (!socket.current) {
      socket.current = io(SOCKETURL);
    }
    const roomId = isGroup && routeRoomId ? routeRoomId : [user._id, toid].sort().join("_");
    if (socket.current) {
      socket.current.emit("joinUserRoom", user._id);
      socket.current.emit("join", { userId: user._id, roomId });
      socket.current.emit("joinRoom", { roomId, userId: user._id });
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

      const allChats = isGroup && routeRoomId ? await getRoomMessages(routeRoomId) : await getAllChats(toid, page);

      // Opening the chat marks messages as seen on the server — clear local badge count
      dispatch(
        clearConversationUnread({
          roomId,
          otherUserId: isGroup ? null : toid,
          conversationId: route.params?.conversationId,
        })
      );

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

    return () => {
      // Re-clear on leave so Back doesn't restore a stale badge before server sync
      dispatch(
        clearConversationUnread({
          roomId,
          otherUserId: isGroup ? null : toid,
          conversationId: route.params?.conversationId,
        })
      );
      if (socket.current && roomId) {
        socket.current.emit("leaveRoom", { roomId, userId: user._id });
      }
    };
  }, []);

  // Scroll to bottom when chat data is initially loaded
  React.useEffect(() => {
    if (chattings && chattings.length > 0 && flatListRef.current) {
      // Use a small delay to ensure the FlatList has rendered
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false });
        animated.current = true;
      }, 100);
    }
  }, [chattings.length > 0 ? chattings[0] : null]); // Trigger when first message is loaded

  // Live incoming messages — backend emits "message" / "newChatMessage" to the room
  React.useEffect(() => {
    if (!user?._id) return undefined;

    if (!socket.current) {
      socket.current = io(SOCKETURL, { transports: ["websocket"] });
    }

    const roomId = isGroup && routeRoomId ? routeRoomId : [user._id, toid].sort().join("_");

    const joinRooms = () => {
      socket.current.emit("joinUserRoom", user._id);
      socket.current.emit("join", { userId: user._id, roomId });
      socket.current.emit("joinRoom", { roomId, userId: user._id });
    };

    joinRooms();
    socket.current.on("connect", joinRooms);

    const normalizeIncoming = (raw) => {
      if (!raw) return null;
      // Legacy shape used by older clients
      if (raw.obj) {
        return {
          _id: raw.obj._id,
          msg: raw.obj.msg || raw.obj.message || "",
          sender: raw.obj.sender || raw.obj.userId,
          receiver: isGroup ? null : toid,
          time: raw.obj.time || raw.obj.timestamp || new Date().toISOString(),
          media: raw.obj.media || null,
        };
      }
      return {
        _id: raw._id || raw.messageId,
        msg: raw.msg || raw.message || raw.messageBody || "",
        sender: raw.sender || raw.userId || raw.senderId,
        receiver: isGroup ? null : toid,
        time: raw.time || raw.timestamp || new Date().toISOString(),
        media: raw.media || null,
      };
    };

    const appendIncoming = (raw) => {
      const obj = normalizeIncoming(raw);
      if (!obj) return;

      // Ignore own echoes (already added optimistically on send)
      if (obj.sender && String(obj.sender) === String(user._id)) {
        // Still merge server _id if we only have a local copy
        setChattings((prev) => {
          const withoutId = prev.findIndex(
            (m) =>
              !m._id &&
              String(m.sender) === String(obj.sender) &&
              String(m.msg || "") === String(obj.msg || "")
          );
          if (withoutId >= 0 && obj._id) {
            const next = [...prev];
            next[withoutId] = { ...next[withoutId], _id: obj._id };
            return next;
          }
          return prev;
        });
        return;
      }

      setChattings((prev) => {
        if (obj._id && prev.some((m) => String(m._id) === String(obj._id))) {
          return prev;
        }
        return [...prev, obj];
      });

      setTimeout(() => {
        if (flatListRef.current && !suppressAutoScrollRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    };

    const onMessage = (payload) => appendIncoming(payload);
    const onLegacyNewMsg = (payload) => appendIncoming(payload);
    const onConnectedUsers = ({ active }) => {
      if (active && active.length > 0) {
        for (let i = 0; i < active.length; i++) {
          if (active[i].userId === toid) {
            setActive(true);
            return;
          }
        }
      }
    };

    // Backend emitNewChatMessage sends "message" to the room (primary live path)
    socket.current.on("message", onMessage);
    socket.current.on("newMsgReceived", onLegacyNewMsg);
    socket.current.on("connectedUsers", onConnectedUsers);

    return () => {
      socket.current?.off("connect", joinRooms);
      socket.current?.off("message", onMessage);
      socket.current?.off("newMsgReceived", onLegacyNewMsg);
      socket.current?.off("connectedUsers", onConnectedUsers);
    };
  }, [user?._id, toid, isGroup, routeRoomId]);

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
        body: JSON.stringify(isGroup && routeRoomId ? { userIds: [user._id], groupName: toName } : { userIds: [user._id, toid] })
      });
      
      if (roomResponse.ok) {
        const roomData = await roomResponse.json();
        console.log("Chat room created/retrieved:", roomData.roomId);
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
    
    const currentTime = new Date().toISOString();
    
    const obj = {
      msg: message,
      sender: user._id,
      receiver: isGroup ? null : toid,
      time: currentTime,
      conversation: isGroup ? [getRoomId()] : [user._id, toid],
    };

    const saveRes = await saveSingleChat({
      msg: message,
      sender: user._id,
      receiver: isGroup ? null : toid,
      time: currentTime,
      roomId: getRoomId(),
    });
    if (saveRes && saveRes.messageId) {
      obj._id = saveRes.messageId;
    }

    if (socket.current) {
      socket.current.emit("sendNewMsg", {
        obj,
      });
    }
    setChattings([...chattings, obj]);
    setMessage("");
    // Scroll to bottom after sending message
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);

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

  const pickAndSendFile = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled) return;
      const assets = (result.assets || []).slice(0, 5);
      if (!assets.length) return;

      // Ensure chat room exists
      await fetch(`${BASEAPIURL}/chat/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(isGroup && routeRoomId ? { userIds: [user._id], groupName: toName } : { userIds: [user._id, toid] })
      });

      const roomId = getRoomId();
      const newMessages = [];
      for (const file of assets) {
        const name = file.fileName || (file.uri ? file.uri.split('/').pop() : 'media');
        const mimeFromAsset = file.mimeType || file.type || '';
        const type = mimeFromAsset || (name.match(/\.(\w+)$/)?.[1] ? `image/${name.split('.').pop()}` : 'application/octet-stream');

        const uploaded = await uploadChatMedia(roomId, {
          uri: file.uri,
          name,
          type,
        });

        if (uploaded && uploaded.uri) {
          const currentTime = new Date().toISOString();
          
          const saveRes = await saveSingleChatApi({
            msg: '',
            sender: user._id,
            receiver: isGroup ? null : toid,
            time: currentTime,
            roomId: getRoomId(),
            media: {
              mimeType: type || null,
              name: uploaded.name,
              size: uploaded.size || null,
              uri: uploaded.uri,
            }
          });

          newMessages.push({
            _id: saveRes && saveRes.messageId ? saveRes.messageId : undefined,
            msg: '',
            sender: user._id,
            receiver: isGroup ? null : toid,
            time: currentTime,
            conversation: isGroup ? [getRoomId()] : [user._id, toid],
            media: {
              mimeType: type || null,
              name: uploaded.name,
              size: uploaded.size || null,
              uri: uploaded.uri,
            }
          });
        }
      }

      if (newMessages.length) setChattings([...chattings, ...newMessages]);
    } catch (err) {
      console.error('File send failed', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -10}
    >
      <Container
        style={{
          paddingRight: 0,
          paddingLeft: 0,
          paddingBottom: 0,
          backgroundColor: "white",
          flex: 1,
        }}
      >
      <RowBetween
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 24,
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E8ECF2",
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
          onPress={async () => {
            if (isGroup) {
              try {
                const res = await getRoomMembers(getRoomId());
                if (res && res.success) {
                  setMembers(res.members || []);
                  setCreatorId(res.creator || null);
                }
              } catch {}
            }
            setMenu(!menu)
          }}
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
          {isGroup ? (
            <TouchableOpacity
              onPress={() => {
                setMenu(false);
                setMembersVisible(true);
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
                View group members
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setMenu(false);
                navigation.navigate("EachProfile", { userId: toid });
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
          )}
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
      {isGroup && (
        <RNModal visible={membersVisible} transparent animationType="fade" onRequestClose={() => setMembersVisible(false)}>
          <RNView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}>
          <RNView style={{ width: '90%', maxHeight: '80%', backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 16 }}>
            {!addMode ? (
              <>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Group members</Text>
                <FlatList
                  data={members}
                  keyExtractor={(m) => m._id}
                  renderItem={({ item }) => (
                    <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
                      <Text style={{ fontSize: 15 }}>
                        {(item.firstName || '') + ' ' + (item.lastName || '')}
                        {creatorId && String(item._id) === String(creatorId) ? ' (Admin)' : ''}
                      </Text>
                      {creatorId && String(item._id) === String(creatorId) ? null : (
                    <TouchableOpacity disabled={removingMemberId === item._id} onPress={() => handleRemoveMember(item._id)}>
                      <Text style={{ color: removingMemberId === item._id ? '#999' : '#d11' }}>{removingMemberId === item._id ? 'Removing...' : 'Remove'}</Text>
                        </TouchableOpacity>
                      )}
                    </RNView>
                  )}
                />
                <RowBetween style={{ marginTop: 12 }}>
                  <Button onPress={() => setMembersVisible(false)}>Close</Button>
                  <Button onPress={async () => { setAddMode(true); setSelectedAdd([]); await loadFriendsForAdd(); }}>Add members</Button>
                </RowBetween>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Add members</Text>
                <SearchField placeholder="Search" value={searchAdd} onChangeText={setSearchAdd} />
                <FlatList
                  style={{ marginTop: 8 }}
                  data={friendsForAdd.filter((f) => {
                    const q = (searchAdd || '').trim().toLowerCase();
                    if (!q) return true;
                    return (
                      (f.firstName || '').toLowerCase().includes(q) ||
                      (f.lastName || '').toLowerCase().includes(q) ||
                      (f.email || '').toLowerCase().includes(q)
                    );
                  })}
                  keyExtractor={(m) => m._id}
                  renderItem={({ item }) => {
                    const checked = selectedAdd.includes(item._id);
                    return (
                      <TouchableOpacity
                        onPress={() => setSelectedAdd((prev) => (prev.includes(item._id) ? prev.filter((id) => id !== item._id) : [...prev, item._id]))}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}
                      >
                        <Text style={{ fontSize: 15 }}>{(item.firstName || '') + ' ' + (item.lastName || '')}</Text>
                        <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setSelectedAdd((prev) => (prev.includes(item._id) ? prev.filter((id) => id !== item._id) : [...prev, item._id]))} />
                      </TouchableOpacity>
                    );
                  }}
                />
                <RowBetween style={{ marginTop: 12 }}>
                  <Button onPress={() => { setAddMode(false); }}>Back</Button>
                  <Button
                    mode="contained"
                    disabled={selectedAdd.length === 0}
                    onPress={async () => {
                      try {
                        await addRoomMembers(getRoomId(), selectedAdd);
                        const res = await getRoomMembers(getRoomId());
                        if (res && res.success) setMembers(res.members || []);
                        setAddMode(false);
                      } catch (e) {}
                    }}
                  >
                    Add
                  </Button>
                </RowBetween>
              </>
            )}
          </RNView>
          </RNView>
        </RNModal>
      )}
      <View style={{ flex: 1, paddingHorizontal: 0, flexDirection: "column", backgroundColor: "#FFFFFF" }}>
        <FlatList
          ref={flatListRef}
          data={groupMessagesByDate(chattings)}
          keyExtractor={(item, index) => item.id || item._id || `${item.sender || item.userId || 'u'}-${(item.time && new Date(item.time).getTime()) || index}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 10, backgroundColor: '#FFFFFF', paddingBottom: 12 }}
          onContentSizeChange={() => {
            if (!isEditing && !suppressAutoScrollRef.current && flatListRef.current && chattings && chattings.length) {
              // Use a small delay to ensure the content has been rendered
              setTimeout(() => {
                if (flatListRef.current) {
                  flatListRef.current.scrollToEnd({ animated: animated.current });
                  animated.current = true;
                }
              }, 50);
            }
          }}
          renderItem={({ item, index }) => {
            // Render date header
            if (item.type === 'dateHeader') {
              return (
                <ChatDateLabel style={{ marginVertical: 8, textAlign: 'center' }}>
                  {formatDate(item.date)}
                </ChatDateLabel>
              );
            }
            
            // Render message
            const chat = item;
            const isMe = isOutgoing(chat);
            return (
              <React.Fragment>
                    {isMe ? (
                      <RNView
                        style={{
                          alignItems: "flex-end",
                          flex: 1,
                          width: '100%',
                          justifyContent: "flex-end",
                          BorderRadius: 10,
                        }}
                      >
                        {(() => {
                          const media = chat.media;
                          if (media && media.uri) {
                            const mime = (media.mimeType || '').toLowerCase();
                            const uri = media.uri;
                            const isImage = mime.startsWith('image') || /\.(png|jpe?g|gif|webp)$/i.test(uri);
                            const isVideo = mime.startsWith('video') || /\.(mp4|mov|m4v|3gp|avi)$/i.test(uri);
                            const url = uri.startsWith('http') ? uri : `${BASEIMGURL}${uri.replace(/^\//, '')}`;

                            if (isImage) {
                              return (
                                <RNView style={{ alignItems: 'flex-end', marginVertical: 5, alignSelf: 'flex-end' }}>
                                  <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <IconButton icon="dots-vertical" size={18} onPress={() => showMessageOptions(chat)} />
                                    <RNView style={{ alignSelf: 'flex-end' }}>
                                      <Image
                                        source={{ uri: url }}
                                        style={{ width: 200, height: 200, borderRadius: 12 }}
                                        resizeMode="cover"
                                      />
                                    </RNView>
                                  </RNView>
                                  <Text style={{ 
                                    fontSize: 11, 
                                    color: '#78849e', 
                                    marginTop: 2, 
                                    marginRight: 8,
                                    opacity: 0.7 
                                  }}>
                                    {formatTime(chat.time)}
                                  </Text>
                                </RNView>
                              );
                            }
                            if (isVideo) {
                              return (
                                <RNView style={{ alignItems: 'flex-end', marginVertical: 5, alignSelf: 'flex-end' }}>
                                  <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <IconButton icon="dots-vertical" size={18} onPress={() => showMessageOptions(chat)} />
                                    <RNView style={{ alignSelf: 'flex-end' }}>
                                      <TouchableOpacity
                                        onPress={() => Linking.openURL(url)}
                                        style={{ width: 220, height: 140, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', borderRadius: 12 }}
                                      >
                                        <Text style={{ color: '#fff' }}>Tap to play video</Text>
                                      </TouchableOpacity>
                                    </RNView>
                                  </RNView>
                                  <Text style={{ 
                                    fontSize: 11, 
                                    color: '#78849e', 
                                    marginTop: 2, 
                                    marginRight: 8,
                                    opacity: 0.7 
                                  }}>
                                    {formatTime(chat.time)}
                                  </Text>
                                </RNView>
                              );
                            }
                          }
                          return (
                            <RNView style={{ alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                              <RNView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <IconButton icon="dots-vertical" size={18} onPress={() => showMessageOptions(chat)} />
                                <SendChatBlock>{chat.msg}</SendChatBlock>
                              </RNView>
                              <Text style={{ 
                                fontSize: 11, 
                                color: '#78849e', 
                                marginTop: 2, 
                                marginRight: 8,
                                opacity: 0.7 
                              }}>
                                {formatTime(chat.time)}
                              </Text>
                            </RNView>
                          );
                        })()}
                      </RNView>
                    ) : (
                      <RNView style={{ width: '100%', alignItems: 'flex-start' }}>
                      {(() => {
                        const media = chat.media;
                        if (media && media.uri) {
                          const mime = (media.mimeType || '').toLowerCase();
                          const uri = media.uri;
                          const isImage = mime.startsWith('image') || /\.(png|jpe?g|gif|webp)$/i.test(uri);
                          const isVideo = mime.startsWith('video') || /\.(mp4|mov|m4v|3gp|avi)$/i.test(uri);
                          const url = uri.startsWith('http') ? uri : `${BASEIMGURL}${uri.replace(/^\//, '')}`;

                          if (isImage) {
                              return (
                              <RNView style={{ alignItems: 'flex-start', marginVertical: 5, alignSelf: 'flex-start', marginRight: 'auto' }}>
                                <Image
                                  source={{ uri: url }}
                                  style={{ width: 200, height: 200, borderRadius: 12 }}
                                  resizeMode="cover"
                                />
                                <Text style={{ 
                                  fontSize: 11, 
                                  color: '#78849e', 
                                  marginTop: 2, 
                                  marginLeft: 8,
                                  opacity: 0.7 
                                }}>
                                  {formatTime(chat.time)}
                                </Text>
                              </RNView>
                            );
                          }
                          if (isVideo) {
                            return (
                              <RNView style={{ alignItems: 'flex-start', marginVertical: 5, alignSelf: 'flex-start', marginRight: 'auto' }}>
                                <TouchableOpacity
                                  onPress={() => Linking.openURL(url)}
                                  style={{ width: 220, height: 140, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', borderRadius: 12 }}
                                >
                                  <Text style={{ color: '#fff' }}>Tap to play video</Text>
                                </TouchableOpacity>
                                <Text style={{ 
                                  fontSize: 11, 
                                  color: '#78849e', 
                                  marginTop: 2, 
                                  marginLeft: 8,
                                  opacity: 0.7 
                                }}>
                                  {formatTime(chat.time)}
                                </Text>
                              </RNView>
                            );
                          }
                        }
                        return (
                          <RNView style={{ alignItems: 'flex-start' }}>
                            <RecieveChatBlock>{chat.msg}</RecieveChatBlock>
                            <Text style={{ 
                              fontSize: 11, 
                              color: '#78849e', 
                              marginTop: 2, 
                              marginLeft: 8,
                              opacity: 0.7 
                            }}>
                              {formatTime(chat.time)}
                            </Text>
                          </RNView>
                        );
                      })()}
                      </RNView>
                    )}
              </React.Fragment>
            );
          }}
        />
      </View>
      <TextInput
          placeholder="Type your message"
          placeholderTextColor="#78849E"
          selectionColor="#B98C13"
          value={message}
          left={
            <TextInput.Icon
              icon="paperclip"
              style={{ marginTop: 15 }}
              onPress={pickAndSendFile}
            />
          }
          right={
            <TextInput.Icon
              icon={isEditing ? 'content-save' : 'send'}
              style={{ marginTop: 15 }}
              onPress={() => {
                if (message === "") return;
                if (isEditing) {
                  saveEditedMessage();
                } else {
                  sendMessage();
                  if (flatListRef.current && flatListRef.current.scrollToEnd) {
                    flatListRef.current.scrollToEnd({ animated: true });
                  }
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
             marginBottom: Math.max(insets.bottom - 10, 0),
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
            if (message === "") return;
            if (isEditing) {
              saveEditedMessage();
            } else {
              sendMessage();
              if (flatListRef.current && flatListRef.current.scrollToEnd) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }
          }}
          onFocus={() => {
            if (isEditing || suppressAutoScrollRef.current) return; // preserve position while editing/saving
            setTimeout(() => {
              if (flatListRef.current && flatListRef.current.scrollToEnd) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }, 100);
          }}
          ref={focusref}
        />
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
      </KeyboardAvoidingView>
  );
};

export default ChatScreen;
