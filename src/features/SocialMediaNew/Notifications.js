import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Theme from "../../styles/theme";
import { BASEAPIURL } from "../../infrastructure/constants";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";
import { getGeneralNotifications, getPostCommentNotifications } from "./SocialMediaAPIs";
import BottomNavigation from "../../components/social/BottomNavigation";
import { useFocusEffect } from "@react-navigation/native";
import {
  setSocialUnreadCount,
  useSocialNotificationLive,
} from "../../hooks/useSocialNotificationBadge";

const POST_NOTIFICATION_TYPES = [
  "postCreated",
  "postLiked",
  "postUnliked",
  "postCommented",
  "postDeleted",
];

const NotificationsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const syncBellCount = (list) => {
    const unread = (list || []).filter((n) => !n.read).length;
    setSocialUnreadCount(unread);
  };

  const normalizeList = (list, source) =>
    (list || []).map((item) => ({
      ...item,
      source,
      // Keep a stable id string for keys
      _id: item._id,
    }));

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

      const [generalRes, postRes] = await Promise.allSettled([
        getGeneralNotifications(),
        getPostCommentNotifications(),
      ]);

      const general =
        generalRes.status === "fulfilled" && generalRes.value?.status === 200
          ? normalizeList(generalRes.value.data?.notifications, "social")
          : [];
      const posts =
        postRes.status === "fulfilled" && postRes.value?.status === 200
          ? normalizeList(postRes.value.data?.notifications, "post")
          : [];

      let notificationsData = [...general, ...posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // If language is not English, translate the notifications
      if (selectedLanguage !== "en" && Array.isArray(notificationsData) && notificationsData.length) {
        try {
          const translationResponse = await apiClient.post("/translate", {
            data: notificationsData,
            targetLang: selectedLanguage,
          });

          if (translationResponse?.data?.translatedData?.length) {
            notificationsData = translationResponse.data.translatedData;
          }
        } catch (translationError) {
          console.log("Translation failed, using original data:", translationError);
        }
      }

      setNotifications(notificationsData);
      syncBellCount(notificationsData);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Unable to fetch notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const isPostNotification = (notification) =>
    notification?.source === "post" ||
    POST_NOTIFICATION_TYPES.includes(notification?.type);

  const markNotificationAsRead = async (notification) => {
    const notificationId = notification?._id;
    if (!notificationId) return;

    try {
      const token = await AsyncStorage.getItem("token");
      const path = isPostNotification(notification)
        ? `/postCommentNotification/${notificationId}/markAsRead`
        : `/notifications/${notificationId}/markAsRead`;

      await apiClient.patch(
        `${BASEAPIURL}${path}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) => {
        const next = prev.map((item) =>
          item._id === notificationId ? { ...item, read: true } : item
        );
        // Defer: publishing the badge count updates BottomNavigation;
        // must not run during NotificationsScreen's state updater/render.
        queueMicrotask(() => syncBellCount(next));
        return next;
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notification) => {
    const notificationId = notification?._id;
    if (!notificationId) return;

    try {
      const token = await AsyncStorage.getItem("token");
      const path = isPostNotification(notification)
        ? `/postCommentNotification/${notificationId}`
        : `/notifications/${notificationId}`;

      await apiClient.delete(`${BASEAPIURL}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => {
        const next = prev.filter((item) => item._id !== notificationId);
        queueMicrotask(() => syncBellCount(next));
        return next;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // Live prepend when follow / event / other social notifications arrive
  const handleLiveNotification = useCallback((data) => {
    if (!data || !data._id) return;
    if (POST_NOTIFICATION_TYPES.includes(data.type)) return;

    setNotifications((prev) => {
      if (prev.some((n) => String(n._id) === String(data._id))) {
        return prev;
      }
      const next = [
        {
          ...data,
          source: "social",
          read: data.read ?? false,
          createdAt: data.createdAt || new Date().toISOString(),
        },
        ...prev,
      ];
      queueMicrotask(() => syncBellCount(next));
      return next;
    });
  }, []);

  useSocialNotificationLive(handleLiveNotification);

  const trLabel = (key, fallback) => {
    try {
      const val = t(key);
      return !val || val === key ? fallback : val;
    } catch {
      return fallback;
    }
  };

  const getNotificationType = (type) => {
    switch (type) {
      case "followRequest":
        return trLabel("follow_request", "Follow Request");
      case "followRequestApproved":
        return trLabel("follow_request_approved", "Follow Accepted");
      case "followRequestRejected":
        return trLabel("follow_request_rejected", "Follow Declined");
      case "followRequestCancelled":
        return trLabel("follow_request_cancelled", "Follow Cancelled");
      case "followRequestDeleted":
        return trLabel("follow_request_deleted", "Follow Request Removed");
      case "userFollowed":
        return trLabel("user_followed", "New Follower");
      case "userUnfollowed":
        return trLabel("user_unfollowed", "Unfollowed");
      case "closeFriendRequest":
        return trLabel("close_friend_request", "Close Friend Request");
      case "closeFriendRequestApproved":
        return trLabel("close_friend_request_approved", "Close Friend Accepted");
      case "closeFriendRequestRejected":
        return trLabel("close_friend_request_rejected", "Close Friend Declined");
      case "closeFriendRequestDeleted":
        return trLabel("close_friend_request_deleted", "Close Friend Request Removed");
      case "closeFriendRemoved":
        return trLabel("close_friend_removed", "Close Friend Removed");
      case "friendRequest":
        return trLabel("friend_request", "Friend Request");
      case "friendRequestApproved":
        return trLabel("friend_request_approved", "Friend Request Accepted");
      case "friendRequestRejected":
        return trLabel("friend_request_rejected", "Friend Request Declined");
      case "friendRequestCancelled":
        return trLabel("friend_request_cancelled", "Friend Request Cancelled");
      case "friendRemoved":
        return trLabel("friend_removed", "Friend Removed");
      case "postLiked":
        return trLabel("post_liked", "Post Liked");
      case "postCommented":
        return trLabel("post_commented", "New Comment");
      case "postCreated":
        return trLabel("post_created", "New Post");
      case "postDeleted":
        return trLabel("post_deleted", "Post Deleted");
      case "jobApplied":
        return trLabel("job_applied", "Job Application");
      case "stockItemCreated":
        return trLabel("stock_item_created", "New Stock Item");
      case "stockItemUpdated":
        return trLabel("stock_item_updated", "Stock Updated");
      case "shopEventCreated":
        return trLabel("shop_event_created", "Shop Event");
      case "eventCreated":
        return trLabel("event_created", "New Event");
      case "eventInterest":
        return trLabel("event_interest", "Event Interest");
      default:
        return trLabel("notification", "Notification");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "followRequest":
      case "userFollowed":
        return "person-add";
      case "followRequestApproved":
      case "friendRequestApproved":
      case "closeFriendRequestApproved":
        return "checkmark-circle";
      case "followRequestRejected":
      case "friendRequestRejected":
      case "closeFriendRequestRejected":
        return "close-circle";
      case "followRequestCancelled":
      case "followRequestDeleted":
      case "friendRequestCancelled":
      case "friendRemoved":
      case "userUnfollowed":
      case "closeFriendRemoved":
      case "closeFriendRequestDeleted":
        return "person-remove";
      case "friendRequest":
      case "closeFriendRequest":
        return "people";
      case "postLiked":
        return "heart";
      case "postCommented":
        return "chatbubble";
      case "postCreated":
        return "create";
      case "postDeleted":
        return "trash";
      case "jobApplied":
        return "briefcase";
      case "stockItemCreated":
      case "stockItemUpdated":
        return "cube";
      case "shopEventCreated":
      case "eventCreated":
      case "eventInterest":
        return "calendar";
      default:
        return "notifications";
    }
  };

  const getTimeAgo = (createdAt) => {
    return moment(createdAt).fromNow();
  };

  const filterNotifications = () => {
    if (activeTab === "All") {
      return notifications;
    } else if (activeTab === "Connects") {
      return notifications.filter(
        (notification) =>
          notification.type?.includes("follow") ||
          notification.type?.includes("Friend") ||
          notification.type?.includes("friend") ||
          notification.type?.includes("connect")
      );
    }
    return notifications;
  };

  const renderNotificationItem = ({ item }) => {
    const isUnread = !item.read;
    
    return (
      <TouchableOpacity 
        style={[styles.notificationItem, isUnread && styles.unreadNotification]}
        onPress={() => {
          if (!item.read) {
            markNotificationAsRead(item);
          }
          handleNotificationPress(item);
        }}
      >
        <View style={styles.notificationIconContainer}>
          <Icon
            name={getNotificationIcon(item.type)}
            size={24}
            color={Theme.themeColor}
          />
          {isUnread && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.notificationTextContainer}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationSource}>
              {getNotificationType(item.type)}
            </Text>
            <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          {item.sender && (
            <Text style={styles.senderName}>
              {item.sender.firstName} {item.sender.lastName}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item)}
        >
          <Icon name="close" size={16} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const resolveId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value._id || value.id || null;
  };

  const openSenderProfile = (notification) => {
    const userId = resolveId(notification.sender);
    if (!userId) {
      Alert.alert("Profile", "User profile is not available.");
      return;
    }
    navigation.navigate("EachProfile", { userId: String(userId) });
  };

  const openPost = (notification) => {
    const postId = resolveId(notification.postId);
    if (!postId) {
      Alert.alert("Post", "This post is no longer available.");
      return;
    }
    navigation.navigate("CommentScreen", { postId: String(postId) });
  };

  const openEvent = (notification) => {
    const eventId = resolveId(notification.eventId);
    if (!eventId) {
      Alert.alert("Event", "This event is no longer available.");
      return;
    }
    const rootNav = navigation.getParent?.() || navigation;
    rootNav.navigate("Jewellery", {
      screen: "EventDetailScreen",
      params: { eventId: String(eventId) },
    });
  };

  const handleNotificationPress = (notification) => {
    if (!notification?.type) return;

    switch (notification.type) {
      case "followRequest":
      case "friendRequest":
      case "closeFriendRequest":
        // Requests are managed in My Network
        navigation.navigate("MyNetwork");
        break;

      case "followRequestApproved":
      case "followRequestRejected":
      case "followRequestCancelled":
      case "followRequestDeleted":
      case "userFollowed":
      case "userUnfollowed":
      case "friendRequestApproved":
      case "friendRequestRejected":
      case "friendRequestCancelled":
      case "friendRemoved":
      case "closeFriendRequestApproved":
      case "closeFriendRequestRejected":
      case "closeFriendRequestDeleted":
      case "closeFriendRemoved":
        openSenderProfile(notification);
        break;

      case "postLiked":
      case "postCommented":
      case "postCreated":
      case "postUnliked":
        openPost(notification);
        break;

      case "postDeleted":
        Alert.alert("Post", "This post was deleted.");
        break;

      case "jobApplied": {
        const jobId = resolveId(notification.jobId);
        if (jobId) {
          navigation.navigate("ViewJobPost", { jobId: String(jobId) });
        } else {
          navigation.navigate("SocialJobs");
        }
        break;
      }

      case "eventInterest":
      case "eventCreated":
      case "shopEventCreated":
        openEvent(notification);
        break;

      case "stockItemCreated":
      case "stockItemUpdated": {
        const rootNav = navigation.getParent?.() || navigation;
        rootNav.navigate("Jewellery", {
          screen: "JewelleryNotifications",
        });
        break;
      }

      default:
        // Fallback: open sender profile when available
        if (notification.sender) {
          openSenderProfile(notification);
        }
        break;
    }
  };

  const renderEmptyMessage = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="notifications-off" size={64} color="#ccc" />
        <Text style={styles.emptyMessage}>
          {activeTab === "All" 
            ? "No notifications yet" 
            : `No ${activeTab.toLowerCase()} notifications`}
        </Text>
      </View>
    );
  };

  const tabs = [t("all"), t("connects")];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.themeColor} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow and Search */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SearchResults")}
        >
          <Icon name="search" size={18} color="#888" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>{t("search")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.notificationContainer}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={activeTab === tab ? styles.tabActive : styles.tab}
            >
              <Text
                style={
                  activeTab === tab ? styles.tabTextActive : styles.tabText
                }
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        <FlatList
          data={filterNotifications()}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={renderEmptyMessage}
          style={styles.notificationsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Theme.themeColor]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
      <BottomNavigation navigation={navigation} currentScreen="notifications" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f0f0f0",
    marginTop: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f0f0f0",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Theme.themeColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f8f8f8",
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    height: 40,
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#eeeeee",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: "#888",
  },
  notificationContainer: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  tabActive: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Theme.themeColor,
  },
  tabText: {
    fontSize: 14,
    color: "#333",
  },
  tabTextActive: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  notificationsList: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 1,
    alignItems: "center",
  },
  unreadNotification: {
    backgroundColor: "#f8f9ff",
    borderLeftWidth: 3,
    borderLeftColor: Theme.themeColor,
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.themeColor,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationSource: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 14,
  },
  timeAgo: {
    color: "#888",
    fontSize: 12,
  },
  notificationMessage: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  senderName: {
    color: Theme.themeColor,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyMessage: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 16,
  },
});

export default NotificationsScreen;
