import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { SearchField } from "../../styles/common.styles";
import Theme from "../../styles/theme";
import UserImg from "../../assets/images/general/user.png";
import NewSocialCard from "./NewSocialCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";
import {
  fetchFollowStatusAPI,
  followUserAPI,
  unfollowUserAPI,
  fetchProfileAPI,
  fetchPostsAPI,
  cancelRequest,
  sendFriendRequest,
  cancelFriendRequest,
  removeFriend,
} from "./SocialMediaAPIs";
import { useFollowStatus } from "./FollowStatusContext";

const Tab = createBottomTabNavigator();

export default function EachProfile() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;
  const user = useSelector((state) => state.user.user);
  const fromUserId = user?._id;

  // State declarations
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState("not_following");
  const [friendStatus, setFriendStatus] = useState("none"); // none, friends, request_sent, request_received

  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const { getFollowStatus, updateFollowStatus } = useFollowStatus();

  // Fetch follow status - only when viewing another user's profile
  const fetchFollowStatus = async () => {
    // Don't fetch follow status if viewing own profile
    if (fromUserId === userId) {
      setIsFollowing("none");
      setFriendStatus("none");
      return;
    }

    try {
      const response = await fetchFollowStatusAPI(userId);
      if (response.status === 200) {
        const data = response.data;
        // Handle different response structures
        let status;
        if (data.status) {
          status = data.status;
        } else if (data.isFollowing !== undefined) {
          status = data.isFollowing ? "approved" : "none";
        } else {
          status = "none";
        }
        
        setIsFollowing(status);
        // Update global follow status context
        updateFollowStatus(userId, status);

        // Also update friend status if available
        if (data.friendStatus !== undefined) {
          setFriendStatus(data.friendStatus);
        } else {
          setFriendStatus("none");
        }
      } else {
        console.error("Failed to fetch follow status");
        setIsFollowing("none");
        updateFollowStatus(userId, "none");
      }
    } catch (error) {
      console.error("Error fetching follow status:", error);
      setIsFollowing("none");
      updateFollowStatus(userId, "none");
    }
  };

  // Fetch user posts
  const fetchPosts = async (isRefresh = false) => {
    try {
      await fetchPostsAPI(userId, setUserPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Fetch user profile and posts
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const promises = [
        fetchProfileAPI(userId, setProfile, setLoading),
        fetchPosts()
      ];
      
      // Only fetch follow status if viewing another user's profile
      if (fromUserId !== userId) {
        promises.push(fetchFollowStatus());
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Listen for refresh parameter changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh follow status when screen comes into focus (only for other users)
      if (fromUserId !== userId) {
        fetchFollowStatus();
      }
    });

    return unsubscribe;
  }, [navigation, fromUserId, userId]);

  // Handle follow status changes across all posts
  const handleFollowStatusChange = (userId, status) => {
    updateFollowStatus(userId, status);
    // Also update the main follow status for this profile
    if (userId === route.params.userId) {
      setIsFollowing(status);
    }
  };

  // Refresh posts when follow status changes (only for other users)
  useEffect(() => {
    if (fromUserId !== userId && isFollowing !== null) {
      fetchPosts();
    }
  }, [isFollowing, fromUserId, userId]);

  const handleSendFollowRequest = async (fromUserId, toUserId) => {
    try {
      await followUserAPI(fromUserId, toUserId, (status) => {
        setIsFollowing(status);
        // Update global follow status context
        updateFollowStatus(toUserId, status);
      });
    } catch (error) {
      console.error("Error following user:", error);
      // Error handling is done inside followUserAPI
    }
  };

  const handleMessagePress = () => {
    // Generate conversation ID from current user and target user
    const conversationId = [user._id, userId].sort().join('_');
    
    // Navigate to chat screen with the target user's information
    navigation.navigate("ChatScreen", {
      toid: userId,
      toName: `${profile?.user?.firstName} ${profile?.user?.lastName}`,
      index: 0, // Default index for new chat
      conversationId: conversationId, // Pass the conversation ID
    });
  };

  const unFollowUser = async () => {
    try {
      const response = await unfollowUserAPI(userId);
      if (response && response.status === 200) {
        setIsFollowing("none");
        // Update global follow status context
        updateFollowStatus(userId, "none");
        Alert.alert("Success", "User unfollowed successfully.");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      Alert.alert("Error", "Failed to unfollow user.");
    }
  };

  const handleFollowAction = async () => {
    if (isFollowing === "none" || isFollowing === "not_following") {
      // Follow user directly
      await handleSendFollowRequest(fromUserId, userId);
    } else if (isFollowing === "approved") {
      // Unfollow user
      Alert.alert(
        "Unfollow User",
        `Do you want to unfollow ${profile?.user?.firstName} ${profile?.user?.lastName}?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Unfollow", 
            style: "destructive",
            onPress: async () => {
              await unFollowUser();
              // Refresh the follow status to ensure consistency
              setTimeout(() => {
                fetchFollowStatus();
              }, 500);
            }
          }
        ]
      );
    }
  };

  // Friend request handling functions
  const handleSendFriendRequest = async () => {
    try {
      const response = await sendFriendRequest(userId);
      if (response.status === 200) {
        setFriendStatus("request_sent");
        Alert.alert("Success", "Friend request sent successfully.");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      if (error.response?.data?.message) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "Failed to send friend request.");
      }
    }
  };

  const handleCancelFriendRequest = async () => {
    try {
      const response = await cancelFriendRequest(userId);
      if (response.status === 200) {
        setFriendStatus("none");
        Alert.alert("Success", "Friend request cancelled successfully.");
      }
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      Alert.alert("Error", "Failed to cancel friend request.");
    }
  };

  const handleRemoveFriend = async () => {
    Alert.alert(
      "Remove Friend",
      `Do you want to remove ${profile?.user?.firstName} ${profile?.user?.lastName} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              const response = await removeFriend(userId);
              if (response.status === 200) {
                setFriendStatus("none");
                Alert.alert("Success", "Friend removed successfully.");
              }
            } catch (error) {
              console.error("Error removing friend:", error);
              Alert.alert("Error", "Failed to remove friend.");
            }
          }
        }
      ]
    );
  };

  const handleFriendAction = async () => {
    switch (friendStatus) {
      case "none":
        await handleSendFriendRequest();
        break;
      case "request_sent":
        await handleCancelFriendRequest();
        break;
      case "friends":
        await handleRemoveFriend();
        break;
      case "request_received":
        // Navigate to network tab to handle incoming request
        navigation.navigate("MyNetwork");
        break;
      default:
        break;
    }
  };



  const blockUser = (blockedUserId) => {
    // Static frontend-only block functionality
    Alert.alert(
      "Block User",
      `User ${profile?.user?.firstName} ${profile?.user?.lastName} has been blocked successfully.`,
      [
        { text: "OK", onPress: () => setModalVisible(false) }
      ]
    );
  };

  const bannerImageUri = profile?.followData?.bannerImage
    ? `${profile.followData.bannerImage}`
    : null;

  const profileImageUri = profile?.user?.image ? `${profile.user.image}` : null;

  // Function to render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "Posts":
        // Show all posts
        return userPosts?.posts?.map((post) => {
          const createdBy = post.createdBy || {};
          return (
            <NewSocialCard
              key={post._id}
              post={post}
              profileImageUri={createdBy.image ? `${createdBy.image}` : ""}
              description={post.content}
              video={post.video}
              source="EachProfile"
              firstName={createdBy.firstName || "Deleted"}
              lastName={createdBy.lastName || "User"}
              postId={post._id}
              postImages={post.images}
              fetchPosts={fetchPosts}
              userId={userId}
              currentFollowStatus={isFollowing}
              onFollowStatusChange={handleFollowStatusChange}
            />
          );
        }) || <Text>{t("NoPostsAvailable")}</Text>;
      default:
        return null;
    }
  };

  const educationData = profile?.followData?.education || [];
  const followersCount = profile?.followData?.followers?.length || 0;
  const followingCount = profile?.followData?.following?.length || 0;
  const jobExperienceData = profile?.followData?.jobExperience || [];

  const renderHeader = () => (
    <>
      {/* Header with Back Arrow, Search Bar, and Settings Icon */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
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
        {/* Settings Button - Only show if not viewing own profile */}
        {fromUserId !== userId && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="settings" size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {/* Banner Image */}
      <View style={styles.generalInfoContainer}>
        <View style={styles.bannerProfileContainer}>
          <Image source={{ uri: bannerImageUri }} style={styles.bannerImage} />
          <View style={styles.profileImageContainer}>
            <Image
              source={profileImageUri ? { uri: profileImageUri } : UserImg}
              style={styles.profileImage}
            />
          </View>
        </View>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>
            {profile?.user?.firstName} {profile?.user?.lastName}
          </Text>
          <Text style={styles.userLocation}>{profile?.user?.address}</Text>
          <View style={styles.socialContainer}>
            <Text style={styles.statsText}>
              {followersCount} {t("followers")}
            </Text>
            <Text style={styles.statsText}>
              {followingCount} {t("following")}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {/* Follow Button - Only show if not viewing own profile */}
          {fromUserId !== userId && (
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing === "approved" && { backgroundColor: "#28A745" },
                isFollowing === "pending" && { backgroundColor: "#FFC107" },
                isFollowing === "none" || isFollowing === "not_following" 
                  ? { backgroundColor: "#4A90E2" }
                  : {},
              ]}
              onPress={handleFollowAction}
            >
              <View style={styles.buttonContent}>
                <Icon
                  name={
                    isFollowing === "none" || isFollowing === "not_following" 
                      ? "add" 
                      : isFollowing === "pending"
                      ? "time"
                      : "checkmark"
                  }
                  size={16}
                  color="white"
                />
                <Text style={styles.followButtonText}>
                  {isFollowing === "none" || isFollowing === "not_following"
                    ? t("Follow")
                    : isFollowing === "pending"
                    ? t("Pending")
                    : t("Following")}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Friend Request Button - Only show if not viewing own profile */}
          {fromUserId !== userId && (
            <TouchableOpacity
              style={[
                styles.friendButton,
                friendStatus === "friends" && { backgroundColor: "#DC3545" },
                friendStatus === "request_sent" && { backgroundColor: "#FFC107" },
                friendStatus === "request_received" && { backgroundColor: "#28A745" },
                friendStatus === "none" && { backgroundColor: "#6C757D" },
              ]}
              onPress={handleFriendAction}
            >
              <View style={styles.buttonContent}>
                <Icon
                  name={
                    friendStatus === "none" 
                      ? "person-add" 
                      : friendStatus === "request_sent"
                      ? "time"
                      : friendStatus === "request_received"
                      ? "checkmark-circle"
                      : "person-remove"
                  }
                  size={16}
                  color="white"
                />
                <Text style={styles.friendButtonText}>
                  {friendStatus === "none"
                    ? t("Add Friend")
                    : friendStatus === "request_sent"
                    ? t("Sent")
                    : friendStatus === "request_received"
                    ? t("Respond")
                    : t("Remove")}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Message Button - Only show if users are friends */}
          {friendStatus === "friends" && (
            <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
              <View style={styles.buttonContent}>
                <FontAwesomeIcon
                  name="paper-plane-o"
                  size={16}
                  color={Theme.themeColor}
                />
                <Text style={styles.messageButtonText}>{t("Message")}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.aboutMeContainer}>
        <Text style={styles.aboutMeTitle}>{t("about")}</Text>
        {profile?.followData?.about ? (
          <Text style={styles.aboutMeText}>{profile?.followData?.about}</Text>
        ) : (
          <View style={styles.emptyAboutContainer}>
            <Text style={styles.emptyAboutText}>{t("No information available")}</Text>
          </View>
        )}
      </View>

      <View style={styles.activityContainer}>
        <Text style={styles.activityTitle}>{t("activity")}</Text>
        <View style={styles.tabContainer}>
          {["Posts"].map((tab) => (
            <TouchableOpacity
              key="posts"
              style={[styles.tab, activeTab === "posts" && styles.activeTab]}
              onPress={() => setActiveTab("posts")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "posts" && styles.activeTabText,
                ]}
              >
                {t("posts")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </View>

      {educationData.map((education, index) => (
        <View key={index} style={styles.educationSection}>
          <Text style={styles.educationTitle}>{education?.degree}</Text>
          <Text style={styles.institution}>{education?.institution}</Text>
          <Text style={styles.duration}>{education?.duration}</Text>
          <Text style={styles.description}>{education?.description}</Text>
        </View>
      ))}

      {jobExperienceData.map((jobExperience, index) => (
        <View key={index} style={styles.educationSection}>
          <Text style={styles.educationTitle}>{jobExperience?.company}</Text>
          <Text style={styles.institution}>{jobExperience?.role}</Text>
          <Text style={styles.duration}>{jobExperience?.duration}</Text>
          <Text style={styles.description}>{jobExperience?.description}</Text>
        </View>
      ))}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.container}
        data={userPosts?.posts || []}
        renderItem={({ item }) => (
          <NewSocialCard
            post={item}
            profileImageUri={item.createdBy?.image}
            description={item.content}
            video={item.video}
            source="EachProfile"
            firstName={item.createdBy?.firstName}
            lastName={item.createdBy?.lastName}
            postId={item._id}
            postImages={item.images}
            fetchPosts={fetchPosts}
            userId={userId}
            currentFollowStatus={item.followStatus || isFollowing}
            onFollowStatusChange={handleFollowStatusChange}
          />
        )}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("NoPostsAvailable")}</Text>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>User Options</Text>
          <TouchableOpacity
            style={[styles.optionButton, styles.blockButton]}
            onPress={() => {
              blockUser(userId);
            }}
          >
            <Icon name="ban" size={20} color="#DC3545" style={{ marginRight: 8 }} />
            <Text style={[styles.optionButtonText, { color: "#DC3545" }]}>Block User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, styles.reportButton]}
            onPress={() => {
              Alert.alert("Report User", "User reported successfully.");
              setModalVisible(false);
            }}
          >
            <Icon name="flag" size={20} color="#FFC107" style={{ marginRight: 8 }} />
            <Text style={[styles.optionButtonText, { color: "#FFC107" }]}>Report User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, styles.cancelButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.optionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  searchField: {
    height: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  generalInfoContainer: {
    backgroundColor: "#fff",
    paddingBottom: 16,
  },
  bannerProfileContainer: {
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: 200,
  },
  profileImageContainer: {
    position: "absolute",
    bottom: -40,
    left: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  userName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
    fontWeight: "400",
  },
  socialContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  statsText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    gap: 12,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    minWidth: 90,
    maxWidth: 130,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 6,
  },
  friendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C757D",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    minWidth: 90,
    maxWidth: 130,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 6,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Theme.themeColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    minWidth: 90,
    maxWidth: 130,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.themeColor,
    marginLeft: 8,
  },
  aboutMeContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  aboutMeTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1A1A1A",
  },
  aboutMeText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emptyAboutContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  emptyAboutText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 20,
  },
  activityContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1A1A1A",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Theme.themeColor,
    backgroundColor: "#FFFFFF",
  },
  activeTab: {
    backgroundColor: Theme.themeColor,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    color: Theme.themeColor,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  contentContainer: {
    marginTop: 8,
  },
  lineDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },

  educationSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#fff",
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  institution: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  duration: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  optionButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  blockButton: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#DC3545",
  },
  reportButton: {
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  optionButtonText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
});
