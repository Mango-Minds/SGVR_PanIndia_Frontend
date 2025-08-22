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
  sendFollowRequest,
  unfollowUserAPI,
  fetchProfileAPI,
  fetchPostsAPI,
  cancelRequest,
} from "./SocialMediaAPIs";

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
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch follow status
  const fetchFollowStatus = async () => {
    try {
      const response = await fetchFollowStatusAPI(userId);
      if (response.status === 200) {
        const data = response.data;
        console.log("following status", data);
        // Handle different response structures
        if (data.status) {
          setIsFollowing(data.status);
        } else if (data.isFollowing !== undefined) {
          setIsFollowing(data.isFollowing ? "approved" : "none");
        } else {
          setIsFollowing("none");
        }
      } else {
        console.error("Failed to fetch follow status");
        setIsFollowing("none");
      }
    } catch (error) {
      console.error("Error fetching follow status:", error);
      setIsFollowing("none");
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
      await Promise.all([
        fetchProfileAPI(userId, setProfile, setLoading),
        fetchPosts(),
        fetchFollowStatus()
      ]);
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
      // Refresh follow status when screen comes into focus
      fetchFollowStatus();
    });

    return unsubscribe;
  }, [navigation]);

  // Refresh posts when follow status changes
  useEffect(() => {
    if (isFollowing !== null) {
      fetchPosts();
    }
  }, [isFollowing]);

  const handleSendFollowRequest = async (fromUserId, toUserId) => {
    try {
      const response = await sendFollowRequest(toUserId);
      console.log("response of sending req", response);

      if (response.status === 200) {
        setIsFollowing("pending");
        Alert.alert("Success", "Connection request sent successfully.");
      }
    } catch (error) {
      const data = error.response?.data;
      if (data?.message === "You are already following this user.") {
        setIsFollowing("approved");
        Alert.alert(
          "Already Following",
          "You are already following this user."
        );
      } else if (
        data?.message === "Follow request already sent to this user."
      ) {
        setIsFollowing("pending");
        Alert.alert(
          "Request Already Sent",
          "You have already sent a connection request to this user."
        );
      } else {
        console.error("Error connecting to user:", error);
        Alert.alert(
          "Error",
          "An error occurred while trying to send the follow request."
        );
      }
    }
  };

  const unFollowUser = async () => {
    try {
      const response = await unfollowUserAPI(userId);
      if (response && response.status === 200) {
        setIsFollowing("none");
        Alert.alert("Success", "User unfollowed successfully.");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      Alert.alert("Error", "Failed to unfollow user.");
    }
  };

  const handleFollowAction = async () => {
    if (isFollowing === "none" || isFollowing === "not_following") {
      // Send follow request
      await handleSendFollowRequest(fromUserId, userId);
    } else if (isFollowing === "pending") {
      // Show option to withdraw request
      Alert.alert(
        "Withdraw Request",
        "Do you want to withdraw your follow request?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Withdraw", 
            style: "destructive",
            onPress: async () => {
              try {
                const response = await cancelRequest(userId);
                if (response.status === 200) {
                  setIsFollowing("none");
                  Alert.alert("Success", "Request withdrawn successfully.");
                  // Refresh the follow status to ensure consistency
                  setTimeout(() => {
                    fetchFollowStatus();
                  }, 500);
                }
              } catch (error) {
                console.error("Error withdrawing request:", error);
                Alert.alert("Error", "Failed to withdraw request");
              }
            }
          }
        ]
      );
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

  const handleSeeAllClick = () => {
    setShowAllPosts((prev) => !prev);
  };

  const blockUser = async (blockedUserId) => {
    try {
      console.log("Blocking user", blockedUserId);
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASEAPIURL}/social/post/block-user/${blockedUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Block user response", response);
      if (response.ok) {
        const data = await response.json();
        Alert.alert("Success", data.message);
      } else {
        Alert.alert("Error", "Failed to block user.");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      Alert.alert("Error", "An error occurred while trying to block the user.");
    }
  };

  const bannerImageUri = profile?.followData?.bannerImage
    ? `${profile.followData.bannerImage}`
    : null;

  const profileImageUri = profile?.user?.image ? `${profile.user.image}` : null;

  // Function to render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "Posts":
        if (showAllPosts) {
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
                onFollowStatusChange={setIsFollowing}
              />
            );
          });
        } else {
          // Show only the first post
          const firstPost = userPosts?.posts?.[0];

          if (firstPost) {
            const createdBy = firstPost.createdBy || {};
            return (
              <NewSocialCard
                key={firstPost._id}
                post={firstPost}
                profileImageUri={createdBy.image ? `${createdBy.image}` : ""}
                description={firstPost.content}
                video={firstPost.video}
                source="EachProfile"
                firstName={createdBy.firstName || "Deleted"}
                lastName={createdBy.lastName || "User"}
                postId={firstPost._id}
                postImages={firstPost.images}
                fetchPosts={fetchPosts}
                userId={userId}
                currentFollowStatus={isFollowing}
                onFollowStatusChange={setIsFollowing}
              />
            );
          } else {
            return <Text>{t("NoPostsAvailable")}</Text>;
          }
        }
      default:
        return null;
    }
  };

  const educationData = profile?.followData?.education || [];
  const followersCount = profile?.followData?.followers?.length || 0;
  const jobExperienceData = profile?.followData?.jobExperience || [];

  const renderHeader = () => (
    <>
      {/* Header with Back Arrow, Search Bar, and Settings Icon */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchField placeholder={t("search")} style={styles.searchField} />
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="settings" size={24} color="#000" />
        </TouchableOpacity>
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
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing === "approved" && { backgroundColor: "#666" },
              isFollowing === "pending" && { backgroundColor: "#ffa500" },
              isFollowing === "none" || isFollowing === "not_following" 
                ? { backgroundColor: Theme.themeColor }
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
                size={18}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={{ ...styles.followButtonText, color: "white" }}>
                {isFollowing === "none" || isFollowing === "not_following"
                  ? t("Follow")
                  : isFollowing === "pending"
                  ? t("Pending")
                  : t("Following")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.messageButton}>
            <View style={styles.buttonContent}>
              <FontAwesomeIcon
                name="paper-plane-o"
                size={22}
                color={Theme.themeColor}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.messageButtonText}>{t("Message")}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.aboutMeContainer}>
        <Text style={styles.aboutMeTitle}>{t("about")}</Text>
        <Text style={styles.aboutMeText}>{profile?.followData?.about}</Text>
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
        <View style={styles.lineDivider} />
        <Text style={styles.seeAllText} onPress={handleSeeAllClick}>
          {showAllPosts
            ? t("showLess")
            : `${t("seeAll")} ${t(activeTab.toLowerCase())}`}
        </Text>
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
    <>
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
            style={styles.optionButton}
            onPress={() => {
              blockUser(userId);
              setModalVisible(false);
            }}
          >
            <Text style={styles.optionButtonText}>Block User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.optionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 16,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
  },
  userInfoContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  userLocation: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  socialContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  statsText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 16,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.themeColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Theme.themeColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.themeColor,
  },
  aboutMeContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#fff",
  },
  aboutMeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  aboutMeText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  activityContainer: {
    marginTop: 16,
    backgroundColor: "#fff",
    padding: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.themeColor,
  },
  activeTab: {
    backgroundColor: Theme.themeColor,
  },
  tabText: {
    fontSize: 14,
    color: Theme.themeColor,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  contentContainer: {
    marginTop: 8,
  },
  lineDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: Theme.themeColor,
    textAlign: "center",
    fontWeight: "600",
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
  },
  optionButtonText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});
