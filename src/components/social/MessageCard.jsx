import React, { useRef } from "react";
import { Card, Button, Divider } from "react-native-paper";
import { ActivityIndicator, Image, Text, Alert, View, StyleSheet, Platform, ActionSheetIOS } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { getImageUrl, getSocialMediaProfile } from "../../services/socialMedia.services";
import { deleteChat } from "../../services/socialMedia.services";
import { archiveChat, unarchiveChat } from "../../services/chat.services";
import { updateConversation } from "../../store/user";
import Icons from "react-native-vector-icons/Ionicons";
import { clearConversationUnread } from "../../hooks/useMessageUnreadBadge";

export default function MessageCard(props) {
  console.log("MessageCard - props:", props);
  const { user } = useSelector((state) => state.user);
  const { conversations } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [dp, setDp] = React.useState();
  const profile = useRef();
  
  const formatRelativeTime = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete chat with ${(profile.current?.firstName || profile.current?.fname) + " " + (profile.current?.lastName || profile.current?.lname)}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Generate conversation ID from the conversation array if _id is not available
              let conversationId = props._id;
              
              if (!conversationId && props.lastmsg && props.lastmsg.conversation) {
                // Generate room ID from conversation array (sorted user IDs joined with underscore)
                conversationId = props.lastmsg.conversation.sort().join('_');
              }
              
              if (!conversationId) {
                console.error("No conversation ID available for deletion");
                Alert.alert("Error", "Unable to delete conversation");
                return;
              }
              
              console.log("Deleting conversation:", conversationId);
              const res = await deleteChat(conversationId);
              
              if (res.success) {
                console.log("Conversation deleted successfully");
                
                // Call the refresh function to update the UI
                if (props.onRefresh) {
                  props.onRefresh();
                } else {
                  // Fallback: Remove the conversation from Redux state
                  const updatedConversations = conversations.filter(conv => {
                    // Check if this conversation matches the deleted one
                    if (conv._id === conversationId) return false;
                    if (conv.lastmsg && conv.lastmsg.conversation && conv.lastmsg.conversation.sort().join('_') === conversationId) return false;
                    return true;
                  });
                  dispatch(updateConversation(updatedConversations));
                }
                
                // Navigate back to previous page
                navigation.goBack();
              } else {
                console.error("Failed to delete conversation:", res.message);
                Alert.alert("Error", "Failed to delete conversation");
              }
            } catch (error) {
              console.error("Error deleting conversation:", error);
              Alert.alert("Error", "Failed to delete conversation");
            }
          }
        }
      ]
    );
  };

  const handleArchiveToggle = async () => {
    const action = props.archived ? "Unarchive" : "Archive";
    const message = props.archived
      ? "Are you sure you want to unarchive this conversation?"
      : "Are you sure you want to archive this conversation?";

    Alert.alert(
      `${action} Chat`,
      message,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: action,
          onPress: async () => {
            try {
              let conversationId = props._id;
              if (!conversationId && props.lastmsg && props.lastmsg.conversation) {
                conversationId = props.lastmsg.conversation.sort().join('_');
              }
              if (!conversationId) {
                Alert.alert("Error", "Conversation ID not found.");
                return;
              }

              let res;
              if (props.archived) {
                res = await unarchiveChat(conversationId);
              } else {
                res = await archiveChat(conversationId);
              }

              if (res.success) {
                // Call the refresh function to update the UI
                if (props.onRefresh) {
                  props.onRefresh();
                } else {
                  // Fallback: Update the conversation list based on the action
                  if (props.archived) {
                    // Unarchiving: add back to active conversations
                    const updated = conversations.map((c) =>
                      c._id === props._id ? { ...c, archived: false } : c
                    );
                    dispatch(updateConversation(updated));
                  } else {
                    // Archiving: remove from active conversations
                    const updated = conversations.filter((c) => c._id !== props._id);
                    dispatch(updateConversation(updated));
                  }
                }
              } else {
                Alert.alert("Error", res.message || `Failed to ${action.toLowerCase()} chat.`);
              }
            } catch (e) {
              console.error(`${action} failed:`, e);
              Alert.alert("Error", "An unexpected error occurred.");
            }
          }
        }
      ]
    );
  };

  const handleLongPress = () => {
    const archiveLabel = props.archived ? "Unarchive" : "Archive";
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", archiveLabel, "Delete"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleArchiveToggle();
          if (buttonIndex === 2) handleDelete();
        }
      );
    } else {
      Alert.alert("Chat options", "", [
        { text: archiveLabel, onPress: handleArchiveToggle },
        { text: "Delete", style: "destructive", onPress: handleDelete },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  React.useEffect(() => {
    const loadProfile = async () => {
      // Handle both array and single object formats
      const userData = Array.isArray(props.user) ? props.user : [props.user];
      
      for (let i = 0; i < userData.length; i++) {
        const item = userData[i];
        if (item._id === user._id) {
          // Skip current user
        } else {
          profile.current = item;
          try {
            // Try direct value from conversation object first
            const directCandidate = item.dp || item.image;
            if (directCandidate) {
              if (typeof directCandidate === 'string' && /^(http|https):\/\//i.test(directCandidate)) {
                setDp(directCandidate);
                return;
              } else {
                const res = await getImageUrl(directCandidate);
                if (res.status === 0 && res.url) {
                  setDp(res.url);
                  return;
                }
              }
            }
            // Fallback: fetch social profile to get dp like posts
            const prof = await getSocialMediaProfile(item._id);
            if (prof && prof.result) {
              const profCandidate = prof.result.dp || prof.result.image;
              if (profCandidate) {
                if (typeof profCandidate === 'string' && /^(http|https):\/\//i.test(profCandidate)) {
                  setDp(profCandidate);
                  return;
                } else {
                  const img = await getImageUrl(profCandidate);
                  if (img.status === 0 && img.url) {
                    setDp(img.url);
                    return;
                  }
                }
              }
            }
          } catch (e) {
            // ignore; will use placeholder
          }
          return;
        }
      }
    };
    
    loadProfile();
  }, []);

  // If groupName is present on props, render group card instead of single profile
  if (props.groupName) {
    return (
      <Card
        style={{
          marginVertical: 0,
          shadowColor: "#00000014",
          backgroundColor: "white",
        }}
        onPress={() => {
          // Navigate to the new socket-based chat screen
          dispatch(
            clearConversationUnread({
              roomId: props.roomId,
              conversationId: props._id,
            })
          );
          const room = { roomId: props.roomId, groupName: props.groupName };
          navigation.navigate("ChatScreen", {
            toid: room.roomId, // pass roomId in toid for uniform param
            toName: props.groupName,
            roomId: room.roomId,
            isGroup: true,
          });
        }}
        onLongPress={handleLongPress}
      >
        <View style={styles.row}>
          <Image
            source={require("../../assets/images/general/user.png")}
            style={styles.avatar}
          />
          <View style={styles.centerContent}>
            <Text numberOfLines={1} style={styles.title}>
              {props.groupName}
            </Text>
            <View style={styles.previewRow}>
              {props?.lastmsg?.sender === user._id.toString() && (
                <Icons name="checkmark-done" size={16} color="#78849E" style={{ marginRight: 4 }} />
              )}
              <Text numberOfLines={1} style={styles.subtitle}>
                {props?.lastmsg?.msg || ""}
              </Text>
            </View>
          </View>
          <View style={styles.rightContent}>
            <Text style={styles.time}>{formatRelativeTime(props?.lastmsg?.time)}</Text>
            {props?.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{props.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        <Divider style={{ marginTop: 0 }} />
      </Card>
    );
  }

  if (profile.current)
    return (
      <Card
        style={{
          marginVertical: 0,
          shadowColor: "#00000014",
          backgroundColor: "white",
        }}
        onPress={() => {
          dispatch(
            clearConversationUnread({
              roomId: props.roomId,
              otherUserId: profile.current._id,
              conversationId: props._id,
            })
          );
          navigation.navigate("ChatScreen", {
            toid: profile.current._id,
            toName: (profile.current.firstName || profile.current.fname) + " " + (profile.current.lastName || profile.current.lname),
            index: props.index,
            conversationId: props._id, // Pass the conversation ID
          });
        }}
        onLongPress={handleLongPress}
      >
        <View style={styles.row}>
          <Image
            source={dp ? { uri: dp } : require("../../assets/images/general/user.png")}
            style={styles.avatar}
          />
          <View style={styles.centerContent}>
            <Text numberOfLines={1} style={styles.title}>
              {(profile.current?.firstName || profile.current?.fname) + " " + (profile.current?.lastName || profile.current?.lname)}
            </Text>
            <View style={styles.previewRow}>
              {props?.lastmsg?.sender === user._id.toString() && (
                <Icons name="checkmark-done" size={16} color="#78849E" style={{ marginRight: 4 }} />
              )}
              <Text numberOfLines={1} style={styles.subtitle}>
                {props?.lastmsg?.msg || ""}
              </Text>
            </View>
          </View>
          <View style={styles.rightContent}>
            <Text style={styles.time}>{formatRelativeTime(props?.lastmsg?.time)}</Text>
            {props?.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{props.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        <Divider style={{ marginTop: 0 }} />
      </Card>
    );
  else
    return (
      <ActivityIndicator
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
        size={"large"}
        color={"#b98c13"}
      />
    );
}

const styles = StyleSheet.create({
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  centerContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  rightContent: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 12,
    color: "#1E2022",
    textTransform: "capitalize",
  },
  subtitle: {
    fontSize: 12,
    color: "#7C8A9A",
    marginLeft: 0,
    fontWeight: "500",
  },
  time: {
    fontSize: 11,
    color: "#7C8A9A",
    marginTop: 4,
  },
  badge: {
    alignSelf: "flex-end",
    backgroundColor: "#FF4D4F",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
