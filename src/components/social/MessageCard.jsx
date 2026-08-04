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
import { useTranslation } from "react-i18next";

export default function MessageCard(props) {
  console.log("MessageCard - props:", props);
  const { t } = useTranslation();
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
    if (minutes < 1) return t("time_now");
    if (minutes < 60) return t("min_ago", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours > 1
        ? t("hrs_ago_plural", { count: hours })
        : t("hrs_ago", { count: hours });
    }
    const days = Math.floor(hours / 24);
    return days > 1
      ? t("days_ago_plural", { count: days })
      : t("days_ago", { count: days });
  };

  const handleDelete = () => {
    const name = `${profile.current?.firstName || profile.current?.fname || ""} ${profile.current?.lastName || profile.current?.lname || ""}`.trim();
    Alert.alert(
      t("delete_chat"),
      t("delete_chat_confirm", { name }),
      [
        {
          text: t("cancel"),
          style: "cancel"
        },
        {
          text: t("delete"),
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
                Alert.alert(t("error"), t("unable_delete_conversation"));
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
                Alert.alert(t("error"), t("failed_delete_conversation"));
              }
            } catch (error) {
              console.error("Error deleting conversation:", error);
              Alert.alert(t("error"), t("failed_delete_conversation"));
            }
          }
        }
      ]
    );
  };

  const handleArchiveToggle = async () => {
    const actionLabel = props.archived ? t("unarchive") : t("archive");
    const title = props.archived ? t("unarchive_chat") : t("archive_chat");
    const message = props.archived
      ? t("unarchive_confirm")
      : t("archive_confirm");

    Alert.alert(
      title,
      message,
      [
        {
          text: t("cancel"),
          style: "cancel"
        },
        {
          text: actionLabel,
          onPress: async () => {
            try {
              let conversationId = props._id;
              if (!conversationId && props.lastmsg && props.lastmsg.conversation) {
                conversationId = props.lastmsg.conversation.sort().join('_');
              }
              if (!conversationId) {
                Alert.alert(t("error"), t("conversation_id_not_found"));
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
                Alert.alert(
                  t("error"),
                  res.message || (props.archived ? t("failed_unarchive_chat") : t("failed_archive_chat"))
                );
              }
            } catch (e) {
              console.error(`archive toggle failed:`, e);
              Alert.alert(t("error"), t("unexpected_error"));
            }
          }
        }
      ]
    );
  };

  const handleLongPress = () => {
    const archiveLabel = props.archived ? t("unarchive") : t("archive");
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t("cancel"), archiveLabel, t("delete")],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleArchiveToggle();
          if (buttonIndex === 2) handleDelete();
        }
      );
    } else {
      Alert.alert(t("chat_options"), "", [
        { text: archiveLabel, onPress: handleArchiveToggle },
        { text: t("delete"), style: "destructive", onPress: handleDelete },
        { text: t("cancel"), style: "cancel" },
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
