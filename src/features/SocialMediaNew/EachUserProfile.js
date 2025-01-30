import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Button, TextInput } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import UserImg from "../../assets/images/general/user.png";
import BottomNavigation from "../../components/social/BottomNavigation";
import { useSelector } from "react-redux";

import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { SearchField } from "../../styles/common.styles";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import NewSocialCard from "./NewSocialCard";

const Tab = createBottomTabNavigator();

export default function EachProfile() {
  const token = useSelector((state) => state.user.token);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const route = useRoute();

  const { userId } = route.params;

  const user = useSelector((state) => state.user.user);

  // const {userId} = route.params;
  const [allLoaded, setAllLoaded] = useState(false);
  const [userposts, setUserPosts] = useState([]);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const fromUserId = user?._id;

  const handleSeeAllClick = () => {
    setShowAllPosts((prev) => !prev);
  };

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const response = await fetch(
          `${BASEAPIURL}/social/check-follow-status/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        } else {
          console.error("Failed to fetch follow status");
        }
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    };

    if (userId) {
      fetchFollowStatus();
    }
  }, [userId]);

  const fetchPosts = async () => {
    if (allLoaded) return;
    try {
      const response = await fetch(`${BASEAPIURL}/social/post/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setUserPosts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendFollowRequest = async (fromUserId, toUserId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/social/send-request/${toUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response of sending req", response);
      if (response.ok) {
        setIsFollowing(true);
        Alert.alert("Success", "Connection request sent successfully.");
      } else {
        const data = await response.json();
        if (data.message === "You are already following this user.") {
          setIsFollowing(true);
          Alert.alert(
            "Already Following",
            "You are already following this user."
          );
        } else if (
          data.message === "Follow request already sent to this user."
        ) {
          Alert.alert(
            "Request Already Sent",
            "You have already sent a connection request to this user."
          );
        } else {
          Alert.alert("Error", "Failed to send connection request.");
        }
      }
    } catch (error) {
      console.error("Error connecting to user:", error);
      Alert.alert(
        "Error",
        "An error occurred while trying to send the follow request."
      );
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/user/profile/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("profile data", data);
      setProfile(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // unfollow a user
  const unFollowUser = async ({ fromUserId, userId }) => {
    console.log(`removing ${profile.user._id}`);
    try {
      const response = await fetch(
        `${BASEAPIURL}/social/unfollow/${fromUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(false);
        Alert.alert("Success", `${data.message}`);
      } else {
        Alert.alert("Error", "Failed to send unfollow request.");
      }
    } catch (error) {
      console.error("Error connecting to user:", error);
      Alert.alert(
        "Error",
        "An error occurred while trying to send the follow request."
      );
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const [isRequestSent, setIsRequestSent] = useState(false);

  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState("Posts");
  const bannerImageUri = profile?.followData?.bannerImage
    ? `${BASEIMGURL}${profile.followData.bannerImage}`
    : null;

  const profileImageUri = profile?.user?.image
    ? `${BASEIMGURL}${profile.user.image}`
    : null;

  const postsContent = [
    "This is my first post!",
    "Loving the new features in React Native!",
    "Just completed a project on full-stack development.",
  ];

  const articlesContent = [
    "How to build a simple React Native app.",
    "Understanding state management in React.",
    "Best practices for web development.",
  ];

  const documentsContent = [
    "Resume.pdf",
    "Project Portfolio.pdf",
    "Technical Report.docx",
  ];

  // Function to render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "Posts":
        if (showAllPosts) {
          // Show all posts
          return userposts?.posts?.map((post) => (
            <NewSocialCard
              key={post._id}
              post={post}
              profileImageUri={`${BASEIMGURL}${post.createdBy.image}`}
              description={post.content}
              video={post.video}
              source="EachProfile"
              firstName={post.createdBy.firstName}
              lastName={post.createdBy.lastName}
              postId={post._id}
              postImages={post.images}
              fetchPosts={fetchPosts}
              userId={userId}
            />
          ));
        } else {
          // Show only the first post
          const firstPost = userposts?.posts?.[0];

          return firstPost ? (
            <NewSocialCard
              key={firstPost._id}
              post={firstPost}
              profileImageUri={`${BASEIMGURL}${firstPost.createdBy.image}`}
              description={firstPost.content}
              video={firstPost.video}
              source="EachProfile"
              firstName={firstPost.createdBy.firstName}
              lastName={firstPost.createdBy.lastName}
              postId={firstPost._id}
              postImages={firstPost.images}
              fetchPosts={fetchPosts}
              userId={userId}
            />
          ) : (
            <Text>No posts available</Text>
          );
        }
      // case "Articles":
      //   return articlesContent.map((article, index) => (
      //     <Text key={index} style={styles.activityText}>
      //       {article}
      //     </Text>
      //   ));
      // case "Documents":
      //   return documentsContent.map((doc, index) => (
      //     <Text key={index} style={styles.activityText}>
      //       {doc}
      //     </Text>
      //   ));
      default:
        return null;
    }
  };

  const educationData = profile?.followData?.education || [];
  const followersCount = profile?.followData?.followers?.length || 0;
  const jobExperienceData = profile?.followData?.jobExperience || [];
  return (
    <ScrollView style={styles.container}>
      {/* Header with Back Arrow, Search Bar, and Settings Icon */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon
            name="arrow-back"
            size={24}
            color="#000"
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchField placeholder="Search" style={styles.searchField} />
        </View>

        <TouchableOpacity style={styles.iconButton}>
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

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>
            {profile?.user?.firstName} {profile?.user?.lastName}
          </Text>
          <Text style={styles.userTitle}>Software Engineer</Text>
          <Text style={styles.userLocation}>{profile?.user?.address}</Text>
          <View style={styles.socialContainer}>
            <Text style={styles.statsText}>{followersCount} followers</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && { backgroundColor: "grey" },
            ]}
            onPress={() => {
              isFollowing
                ? unFollowUser(fromUserId, userId)
                : handleSendFollowRequest(fromUserId, userId);
            }}
            disabled={isFollowing}
          >
            <View style={styles.buttonContent}>
              <Icon
                name={isFollowing ? "" : "add"}
                size={22}
                color={isFollowing ? "white" : "white"}
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  ...styles.followButtonText,
                  color: isFollowing ? "white" : "#fff", // Change text color dynamically
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.messageButton}>
            <View style={styles.buttonContent}>
              <FontAwesomeIcon
                name="paper-plane-o"
                size={22}
                color="#d4af37"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.messageButtonText}>Message</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.aboutMeContainer}>
        <Text style={styles.aboutMeTitle}>About</Text>
        <Text style={styles.aboutMeText}>{profile?.followData?.about}</Text>
      </View>
      <View style={styles.activityContainer}>
        <Text style={styles.activityTitle}>Activity</Text>
        <View style={styles.tabContainer}>
          {["Posts"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView style={styles.contentContainer}>
          {renderContent()}
        </ScrollView>
        <View style={styles.lineDivider} />
        <Text style={styles.seeAllText} onPress={handleSeeAllClick}>
          {showAllPosts ? "Show Less" : `See All ${activeTab}`}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 30,
  },
  generalInfoContainer: {
    backgroundColor: "white",
    paddingBottom: 10,
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
  bannerProfileContainer: {
    height: 120,
    backgroundColor: "#eeeeee",
    alignItems: "center",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileImageContainer: {
    position: "absolute",
    bottom: -30,
    left: 20,
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 50,
    overflow: "hidden",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userInfoContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },
  userTitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 3,
  },
  userLocation: {
    fontSize: 14,
    color: "#888888",
  },
  socialContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
  },
  statsText: {
    fontSize: 14,
    color: "gray",
    fontWeight: "bold",
  },
  linkText: {
    fontSize: 15,
    color: "#d4af37",
  },
  divider: {
    marginHorizontal: 5,
    color: "#888888",
  },
  aboutMeContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "white",
  },
  aboutMeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  aboutMeText: {
    fontSize: 14,
    color: "#333",
    textAlign: "left",
    lineHeight: 20,
  },

  activityContainer: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "white",
  },

  tabContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 6,
    alignItems: "center",
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: "#d4af37",
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  activeTab: {
    backgroundColor: "#d4af37",
    elevation: 2,
    borderBottomWidth: 4,
    borderBottomColor: "#d4af37",
  },
  tabText: {
    fontSize: 16,
    color: "#d4af37",
    textAlign: "center",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "white",
  },

  contentContainer: {
    padding: 10,
  },
  activityText: {
    fontSize: 14,
    marginVertical: 5,
    color: "#333",
  },
  lineDivider: {
    height: 1,
    backgroundColor: "#e1e9ee",
  },
  seeAllText: {
    marginTop: 10,

    color: "#d4af37",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18,
    padding: 10,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 10,
  },

  EducationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  educationSection: {
    padding: 12,
    marginVertical: 10,
    shadowColor: "#000",
    marginTop: 20,
    width: "100%",
    backgroundColor: "white",
  },
  educationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  institution: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 5,
  },
  duration: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },

  suggestedPeopleSection: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 25,
    marginRight: 15,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  personTitle: {
    fontSize: 14,
    color: "#666666",
  },
  connectButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginTop: 4,
    width: 100,
    borderColor: "black",
    borderWidth: 1,
  },

  connectButtonText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },

  actionsContainer: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  followButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#d4af37",
    borderRadius: 20,
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageButton: {
    flex: 1,
    paddingVertical: 10,
    borderColor: "#d4af37",
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
  messageButtonText: {
    color: "#d4af37",
    fontWeight: "bold",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    fontSize: 14,
    color: "gray",
    marginHorizontal: 4,
    fontWeight: "bold",
  },
});
