import React, { useState } from "react";
import { Card, IconButton, Menu, Divider } from "react-native-paper";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import { RowBetween, View as StyledView } from "../../styles/common.styles";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../services/socialMedia.services";
import { useNavigation } from "@react-navigation/native";
import { deleteComment } from "../../services/socialMedia.services";
import moment from "moment";
import { useTranslation } from "react-i18next";

export default function CommentCard(props) {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const { comment, postId, onCommentDeleted } = props;
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Add safety checks
  if (!comment) {
    console.warn("CommentCard: No comment data provided");
    return null;
  }

  const { userId, content, createdAt, _id: commentId } = comment;

  console.log("Comment data:", comment);
  const navigation = useNavigation();

  const [dp, setDp] = React.useState();

  React.useEffect(() => {
    const fetchUserImage = async () => {
      if (userId && userId.image) {
        try {
          const res = await getImageUrl(userId.image);
          if (res.status === 0 && userId.image) {
            setDp(res.url);
          }
        } catch (error) {
          console.error("Error fetching user image:", error);
        }
      }
    };
    
    fetchUserImage();
  }, [userId]);

  const handleUserPress = () => {
    if (userId && userId._id) {
      navigation.navigate(
        user._id === userId._id ? "Profile" : "ViewUserScreen",
        user._id !== userId._id && {
          username: userId.firstName,
          userid: userId._id,
          userprofile: userId,
          userdp: dp,
        }
      );
    }
  };

  const isCommentOwner = user?._id === userId?._id;

  const handleDeleteComment = async () => {
    if (!postId || !commentId) {
      Alert.alert(t("error"), t("comment_missing_data"));
      return;
    }

    Alert.alert(
      t("deleteComment"),
      t("deleteCommentConfirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              const response = await deleteComment(postId, commentId);
              if (response.status === 0) {
                onCommentDeleted && onCommentDeleted(commentId);
              } else {
                Alert.alert(t("error"), response.message || t("failed_delete_comment"));
              }
            } catch (error) {
              console.error("Error deleting comment:", error);
              Alert.alert(t("error"), t("failed_delete_comment"));
            } finally {
              setDeleting(false);
              setMenuVisible(false);
            }
          },
        },
      ]
    );
  };

  // Safety check for required data
  if (!userId || !content) {
    console.warn("CommentCard: Missing required data", { userId, content });
    return null;
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = moment();
    const commentTime = moment(timestamp);
    const diffMinutes = now.diff(commentTime, 'minutes');
    const diffHours = now.diff(commentTime, 'hours');
    const diffDays = now.diff(commentTime, 'days');

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return commentTime.format('MMM D, YYYY');
  };

  return (
    <Card
      style={{
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
      }}
    >
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* Profile Image */}
          <TouchableOpacity onPress={handleUserPress} style={{ marginRight: 12 }}>
            <Image
              source={
                dp
                  ? { uri: dp }
                  : require("../../assets/images/general/user.png")
              }
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#E0E0E0"
              }}
            />
          </TouchableOpacity>

          {/* Comment Content */}
          <View style={{ flex: 1, marginRight: 8 }}>
            {/* User Name and Time */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#1A1A1A",
                  fontWeight: "600",
                  marginRight: 8,
                }}
              >
                {userId.firstName === user?.firstName ? "You" : `${userId.firstName || "Unknown"} ${userId.lastName || ""}`}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#8E8E93",
                  fontWeight: "400",
                }}
              >
                {formatTime(createdAt)}
              </Text>
            </View>

            {/* Comment Text */}
            <Text
              style={{
                fontSize: 15,
                color: "#2C2C2E",
                fontWeight: "400",
                lineHeight: 20,
                marginBottom: 8,
              }}
            >
              {content}
            </Text>
          </View>

          {/* Menu Button - Only visible to comment owner */}
          {isCommentOwner && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  style={{
                    padding: 8,
                    borderRadius: 16,
                    backgroundColor: menuVisible ? '#F2F2F7' : 'transparent',
                  }}
                  activeOpacity={0.7}
                >
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    iconColor="#8E8E93"
                    style={{ margin: 0, padding: 0 }}
                  />
                </TouchableOpacity>
              }
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                elevation: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Menu.Item
                onPress={handleDeleteComment}
                title="Delete Comment"
                titleStyle={{ color: "#FF3B30", fontSize: 14 }}
                leadingIcon="delete"
                leadingIconColor="#FF3B30"
                disabled={deleting}
              />
            </Menu>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
