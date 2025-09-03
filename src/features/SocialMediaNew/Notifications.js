import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Theme from "../../styles/theme";
import { SearchField } from "../../styles/common.styles";
import { useSelector } from "react-redux";
import { BASEAPIURL } from "../../infrastructure/constants";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";
import { getGeneralNotifications } from "./SocialMediaAPIs";
import BottomNavigation from "../../components/social/BottomNavigation";

const NotificationsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

      const response = await getGeneralNotifications();
      
      if (response.status === 200) {
        const notificationsData = response.data.notifications || [];

        // If language is not English, translate the notifications
        if (selectedLanguage !== "en" && Array.isArray(notificationsData)) {
          try {
            const translationResponse = await apiClient.post("/translate", {
              data: notificationsData,
              targetLang: selectedLanguage,
            });

            if (translationResponse?.data?.translatedData?.length) {
              setNotifications(translationResponse.data.translatedData);
            } else {
              setNotifications(notificationsData);
            }
          } catch (translationError) {
            console.log("Translation failed, using original data:", translationError);
            setNotifications(notificationsData);
          }
        } else {
          setNotifications(notificationsData);
        }
      } else {
        throw new Error("Network response was not ok");
      }
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

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await apiClient.patch(
        `${BASEAPIURL}/notifications/${notificationId}/markAsRead`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state to mark as read
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await apiClient.delete(`${BASEAPIURL}/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationType = (type) => {
    switch (type) {
      case "followRequest":
        return t("follow_request");
      case "followRequestApproved":
        return t("follow_request_approved");
      case "followRequestRejected":
        return t("follow_request_rejected");
      case "followRequestCancelled":
        return t("follow_request_cancelled");
      case "userUnfollowed":
        return t("user_unfollowed");
      case "postLiked":
        return t("post_liked");
      case "postCommented":
        return t("post_commented");
      case "jobApplied":
        return t("job_applied");
      default:
        return t("unknown_notification");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "followRequest":
        return "person-add";
      case "followRequestApproved":
        return "checkmark-circle";
      case "followRequestRejected":
        return "close-circle";
      case "postLiked":
        return "heart";
      case "postCommented":
        return "chatbubble";
      case "jobApplied":
        return "briefcase";
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
      return notifications.filter(notification => 
        notification.type.includes("follow") || notification.type.includes("connect")
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
            markNotificationAsRead(item._id);
          }
          // Handle navigation based on notification type
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
          onPress={() => deleteNotification(item._id)}
        >
          <Icon name="close" size={16} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const handleNotificationPress = (notification) => {
    switch (notification.type) {
      case "followRequest":
        // Navigate to user profile
        if (notification.sender) {
          navigation.navigate("EachProfile", { userId: notification.sender._id });
        }
        break;
      case "postLiked":
      case "postCommented":
        // Navigate to post
        if (notification.postId) {
          navigation.navigate("PostDetail", { postId: notification.postId });
        }
        break;
      case "jobApplied":
        // Navigate to job details
        if (notification.jobId) {
          navigation.navigate("JobDetail", { jobId: notification.jobId });
        }
        break;
      default:
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
      {/* Header with Back Arrow and Search Bar */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchField
            placeholder={t("search")}
            style={styles.searchField}
            onFocus={() => navigation.navigate("SearchResults")}
          />
        </View>
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
    width: "80%",
    marginHorizontal: 5,
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    borderRadius: 0,
  },
  searchField: {
    height: 40,
    width: "100%",
    backgroundColor: "#eeeeee",
    paddingHorizontal: 15,
    marginHorizontal: 10,
    fontSize: 16,
    borderRadius: 0,
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
