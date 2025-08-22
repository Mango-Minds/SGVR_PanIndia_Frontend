import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  PanResponder,
  Animated,
  TextInput,
  FlatList,
  Alert,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Theme from "../../styles/theme";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { useSelector } from "react-redux";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { VideoView, useVideoPlayer } from "expo-video";
import { BASEAPIURL, RENDERMEDIAURL } from "../../infrastructure/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import UserImg from "../../assets/images/general/user.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import {
  sendFollowRequest,
  unfollowUserAPI,
  getFollowStatus,
  deletePost,
  getLikeStatus,
  toggleLikeOnPost,
  getComments,
  addComment,
  deleteComment,
  reportPostApi,
  getUsers,
  } from "./SocialMediaAPIs";
  import { useTranslation } from "react-i18next";
  import { generateShareUrl, generateShareMessage } from "../../utils/shareUtils";
  import * as Clipboard from 'expo-clipboard';

const windowWidth = Dimensions.get("window").width;

const NewSocialCard = ({
  profileImageUri,
  username,
  description,
  jobTitle,
  likes,
  comment,
  reposts,
  sampleData,
  userId,
  posts,
  video,
  post,
  firstName,
  lastName,
  source,
  filteredPosts,
  postId,
  fetchPosts,
  postImages,
  profileImageUrl,
  currentFollowStatus,
  onFollowStatusChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();
  // Determine if photoUri is an array of images or a single image

  const images = Array.isArray(postImages) ? postImages : [postImages];

  // Handle scrolling to update current index
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const slide = Math.floor(contentOffsetX / windowWidth);
    setCurrentIndex(slide);
  };

  const [showFullDescription, setShowFullDescription] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const fromUserId = user?._id;
  const [newCommentText, setNewCommentText] = useState("");
  const [commentsToShow, setCommentsToShow] = useState(10);

  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);

  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isFollowing, setIsFollowing] = useState(null);

  // Use passed follow status if available, otherwise use local state
  const effectiveFollowStatus = currentFollowStatus !== undefined ? currentFollowStatus : isFollowing;
  const setEffectiveFollowStatus = onFollowStatusChange || setIsFollowing;

  // Update local state when prop changes
  useEffect(() => {
    if (currentFollowStatus !== undefined) {
      setIsFollowing(currentFollowStatus);
    }
  }, [currentFollowStatus]);

  // Share modal state
  const [shareUsers, setShareUsers] = useState([]);
  const [shareSearchTerm, setShareSearchTerm] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  // Function to fetch users for sharing
  const fetchShareUsers = async () => {
    try {
      setShareLoading(true);
      const response = await getUsers();
      
      // The unfollowed-users endpoint returns { unfollowedUsers: [...] }
      const users = response.data.unfollowedUsers || [];
      
      // Filter out the current user from the list (though it should already be filtered)
      const filteredUsers = users.filter(user => user._id !== fromUserId);
      setShareUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching share users:", error);
    } finally {
      setShareLoading(false);
    }
  };

  // Fetch users when share modal opens
  useEffect(() => {
    if (isShareModalVisible && shareUsers.length === 0) {
      fetchShareUsers();
    }
  }, [isShareModalVisible]);

  // Handle search functionality - now using client-side filtering
  // No need to make API calls on search change since we filter client-side

  // Filter users based on search term (client-side filtering)
  const filteredShareUsers = shareUsers.filter(user => 
    user.firstName?.toLowerCase().includes(shareSearchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(shareSearchTerm.toLowerCase())
  );

  const handleSendFollowRequest = async (fromUserId, toUserId) => {
    // Check if both users exist before attempting to send follow request
    if (!fromUserId || !toUserId) {
      console.warn("Cannot send follow request: missing user IDs");
      return;
    }
    
    try {
      const response = await sendFollowRequest(toUserId);
      console.log("response of sending req", response);

      if (response.status === 200) {
        setEffectiveFollowStatus("pending");
        Alert.alert("Success", "Connection request sent successfully.");
      }
    } catch (error) {
      const data = error.response?.data;
      if (data?.message === "You are already following this user.") {
        Alert.alert(
          "Already Following",
          "You are already following this user."
        );
      } else if (
        data?.message === "Follow request already sent to this user."
      ) {
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
      console.log("removing", userId);
      const response = await unfollowUserAPI(userId);
      console.log("unfollow res", response);

      if (response.status === 200) {
        setEffectiveFollowStatus("none");
        Alert.alert("Success", "User unfollowed successfully.");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      Alert.alert(
        "Error",
        "An error occurred while trying to send the unfollow request."
      );
    }
  };
  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
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
          console.log("following status", data);
          setEffectiveFollowStatus(data.status);
        } else {
          console.error("Failed to fetch follow status");
        }
      } catch (error) {
        console.error("Error fetching follow status:", error);
      }
    };

    // Only fetch follow status if not provided via props
    if (userId && currentFollowStatus === undefined) {
      fetchFollowStatus();
    }
  }, [userId, currentFollowStatus]);
  const handleDeletePost = async () => {
    // Show confirmation dialog first
    Alert.alert(
      t("confirm_deletion_title") || "Confirm Deletion",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: t("cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deletePost(post._id);
              if (response.status === 200) {
                Alert.alert(
                  "Success",
                  t("post_deleted_successfully") || "Post deleted successfully",
                  [
                    {
                                              text: "OK",
                        onPress: async () => {
                          // Ensure fetchPosts completes before navigation
                          if (fetchPosts) {
                            await fetchPosts(true); // Pass true for refresh
                          }
                          // Navigate to SocialHomeScreen to ensure user stays in social section
                          setTimeout(() => {
                            navigation.navigate("SocialHomeScreen");
                          }, 100);
                        },
                    },
                  ],
                  { cancelable: false }
                );
              }
            } catch (error) {
              console.error("Error deleting post:", error);
              Alert.alert(
                "Error", 
                t("failed_to_delete_post") || "Failed to delete post."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  function formatImageUrls(urls, prefix) {
    return urls.map((url) => prefix + url.replace(/\\/g, "/"));
  }

  const toggleMute = () => {
    setIsMuted((prevMuted) => !prevMuted);
  };

  const renderDescription = () => {
    const descriptionStyle = {
      color: "black",
      marginTop: "2%",
      marginBottom: "2%",
      maxHeight: showFullDescription ? "none" : 50,
      overflow: showFullDescription ? "visible" : "hidden",
    };

    if (showFullDescription) {
      return <Text style={descriptionStyle}>{description}</Text>;
    } else {
      const truncatedDescription =
        description.split(" ").slice(0, 20).join(" ") + "...";

      return <Text style={descriptionStyle}>{truncatedDescription}</Text>;
    }
  };

  const sampleComments = [
    {
      id: "1",
      name: "Neha N",
      role: "Sales Enthusiast | Ex-intern at Younity.in",
      text: "good",
      profileImageUrl:
        "https://plus.unsplash.com/premium_photo-1694557636097-5969bae91ba8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d29tYW58ZW58MHx8MHx8fDA%3D",
    },
    {
      id: "2",
      name: "Sejal Tayal",
      role: "Management Trainee at Younity.in",
      text: "Well said Prafful Garg! In today's fast-paced world, prioritizing relationships and health is more crucial...",
      profileImageUrl:
        "https://plus.unsplash.com/premium_photo-1689551670902-19b441a6afde?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8d29tYW58ZW58MHx8MHx8fDA%3D",
    },
    {
      id: "3",
      name: "Satend Kushwaha",
      role: "MBA Candidate | Aspiring Data Analyst | Past...",
      text: "Your post resonates deeply! 🌱 The message on redefining balance and valuing health and relationships...",
      profileImageUrl:
        "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tYW58ZW58MHx8MHx8fDA%3D",
    },
  ];

  const [isModalVisible, setModalVisible] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);

  const [isLiked, setIsLiked] = useState(false);
  const [heartVisible, setHeartVisible] = useState(false); // For heart animation visibility
  const lastTap = useRef(0); // Store the time of the last tap

  const handleDoubleTap = async () => {
    const now = Date.now();
    if (now - lastTap.current <= 300) {
      toggleLike();
      setHeartVisible(true);
      setTimeout(() => setHeartVisible(false), 600);
    }
    lastTap.current = now;
  };

  const [isCommentsModalVisible, setCommentsModalVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [menuVisibleId, setMenuVisibleId] = useState(null);
  const [isRepostModalVisible, setRepostModalVisible] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  const toggleMenu = (id) => {
    setMenuVisibleId(menuVisibleId === id ? null : id);
  };

  const closeMenu = () => {
    setMenuVisibleId(null);
  };

  const handleMenuPress = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    pan.setValue({ x: 0, y: 0 });
  };

  const closeRepostModal = () => {
    setRepostModalVisible(false);
    pan.setValue({ x: 0, y: 0 });
  };



  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await getLikeStatus(post._id);
        setIsLiked(response.data.isLiked);
      } catch (error) {
        console.error(
          "Error fetching like status:",
          error?.response?.data?.message || error.message
        );
      }
    };

    fetchLikeStatus();
  }, [post._id]);
  const toggleLike = async () => {
    try {
      const response = await toggleLikeOnPost({
        postId: post._id,
        userId: fromUserId,
        isLiked,
      });

      setLikeCount(response.data.likesCount);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error(
        "Error toggling like:",
        error?.response?.data?.message || error.message
      );
    }
  };
  const fetchComments = async () => {
    setLoading(true);

    try {
      const response = await getComments(post._id);
      // Add safety check for response data
      const commentsData = response?.data?.comments || [];
      setComments(commentsData);
      setCommentCount(commentsData.length);
      console.log("Fetched comments data:", response.data);
    } catch (error) {
      console.error(
        "Error fetching comments:",
        error?.response?.data?.message || error.message
      );
      // Set empty array on error to prevent crashes
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post._id]);

  // Initialize comment count when post changes
  useEffect(() => {
    setCommentCount(post.comments?.length || 0);
  }, [post.comments?.length]);

  // Update comment count when post prop changes
  useEffect(() => {
    setCommentCount(post.comments?.length || 0);
  }, [post]);
  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const response = await addComment(post._id, newCommentText);
      

      
      // Add safety check for response data
      if (response?.data?.comment) {
        let commentToAdd = response.data.comment;
        
        // If the comment doesn't have populated user data, populate it with current user data
        if (!commentToAdd.userId || typeof commentToAdd.userId === 'string') {
          commentToAdd = {
            ...commentToAdd,
            userId: {
              _id: fromUserId,
              firstName: user.firstName,
              lastName: user.lastName,
              image: user.image
            }
          };
        }
        
        setComments([commentToAdd, ...(comments || [])]);
        setCommentCount(commentCount + 1);
        setNewCommentText("");
      } else {
        console.error("Invalid response from addComment API");
        Alert.alert(t("error"), "Failed to add comment. Please try again.");
      }
    } catch (error) {
      console.error(
        "Error adding comment:",
        error?.response?.data?.message || error.message
      );
      Alert.alert(t("error"), "Failed to add comment. Please try again.");
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!commentId) {
      console.error('Cannot delete comment: Comment ID is undefined');
      Alert.alert("Error", "Cannot delete comment: Comment ID not found. Please refresh the page and try again.");
      return;
    }

    console.log('Attempting to delete comment:', { postId: post._id, commentId });

    try {
      setLoading(true);
      const response = await deleteComment(post._id, commentId);
      
      console.log('Delete comment response:', response.data);
      
      if (response.status === 200) {
        setComments(response.data.comments);
        setCommentCount(response.data.comments.length);
        setMenuVisibleId(null); // Close the menu
      } else {
        Alert.alert("Error", "Failed to delete comment. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting comment:", error?.response?.data?.message || error.message);
      Alert.alert("Error", error?.response?.data?.message || "Failed to delete comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reportPost = async (postId, reason) => {
    try {
      console.log("Reporting post", postId);
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASEAPIURL}/social/post/report-post/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      console.log("Report post response", response);
      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          "Success",
          "If this post violates our policies, it will be removed within 24 hours."
        );
      } else {
        Alert.alert("Error", "Failed to report post.");
      }
    } catch (error) {
      console.error("Error reporting post:", error);
      Alert.alert(
        "Error",
        "An error occurred while trying to report the post."
      );
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeRepostModal();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const openCommentsModal = () => {
    setCommentsModalVisible(true);
  };

  const openRepostModal = () => {
    setRepostModalVisible(true);
  };



  const closeCommentsModal = () => {
    setCommentsModalVisible(false);
  };

  const flatListRef = useRef(null);

  const openShareModal = () => {
    setShareModalVisible(true);
    // Reset search and fetch users when opening modal
    setShareSearchTerm("");
    if (shareUsers.length === 0) {
      fetchShareUsers();
    }
  };

  const closeShareModal = () => {
    setShareModalVisible(false);
    setSelectedUsers([]);
  };

  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleSelection = (user) => {
    const userId = user._id;
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const renderShareOption = ({ item }) => {
    const isSelected = selectedUsers.includes(item._id);
    const imageUri = item.image || UserImg;

    return (
      <TouchableOpacity
        style={styles.shareItem}
        onPress={() => toggleSelection(item)}
      >
        <Image
          source={typeof imageUri === "string" ? { uri: imageUri } : imageUri}
          style={[
            styles.shareImage,
            {
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? "#007AFF" : "transparent",
            },
          ]}
        />
        {isSelected && (
          <View style={styles.tickOverlay}>
            <Text style={styles.tickText}>✔</Text>
          </View>
        )}
        <Text style={styles.shareText}>
          {item.firstName} {item.lastName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    // Add null checks to prevent rendering errors
    if (!item || !item.userId) {
      console.warn("Invalid comment item:", item);
      return null;
    }



    const imageUri = item?.userId?.image ? `${item.userId?.image}` : UserImg;

    const isCommentOwner = String(item?.userId?._id) === String(fromUserId);
    const isPostOwner = String(post?.createdBy?._id) === String(fromUserId);
    const canDeleteComment = isCommentOwner || isPostOwner;



    return (
      <View style={styles.commentItem}>
        <Image
          source={typeof imageUri === "string" ? { uri: imageUri } : imageUri}
          style={styles.commentProfileImage}
        />
        <View style={styles.commentContent}>
          <Text style={styles.commentName}>
            {item.userId.firstName || "Unknown"} {item.userId.lastName || "User"}
          </Text>
          <Text style={styles.commentText}>{item.content || ""}</Text>
        </View>

        {canDeleteComment && (
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => toggleMenu(item?._id)}
            >
              <Text style={styles.menuText}>⋮</Text>
            </TouchableOpacity>

            {menuVisibleId === item._id && (
              <View style={styles.menuOptions}>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      t("deleteComment"),
                      t("deleteCommentConfirmation"),
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => handleDeleteComment(item._id) }
                      ]
                    );
                  }}
                  style={styles.deleteOption}
                >
                  <Icon name="trash" size={18} color="red" />
                  <Text style={styles.menuOptionText}>
                    {isCommentOwner ? t("delete") : t("deleteComment")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  function formatImageUrls(urls, prefix) {
    return urls.map((url) => prefix + url.replace(/\\/g, "/"));
  }

  const [isMuted, setIsMuted] = useState(true);

  // for 'reels'
  const [reelModalVisible, setReelModalVisible] = useState(false);
  const [isReelMuted, setIsReelMuted] = useState(false);
  const [isReelPlaying, setIsReelPlaying] = useState(true);
  const [showReelFullDescription, setShowReelFullDescription] = useState(false);
  const [showReelModal, setShowReelModal] = useState(false);
  const reelRef = useRef(null);

  const toggleReelMute = () => setIsReelMuted((prevMuted) => !prevMuted);

  const toggleReelPlayPause = () => {
    if (isReelPlaying) {
      reelRef.current.pauseAsync();
    } else {
      reelRef.current.playAsync();
    }
    setIsReelPlaying((prevState) => !prevState);
  };

  const openReelModal = () => setReelModalVisible(true);
  const closeReelModal = () => setReelModalVisible(false);

  const openDescriptionModal = () => setShowReelModal(true);
  const closeDescriptionModal = () => setShowReelModal(false);

  const renderReelDescription = () => {
    const reelDescriptionStyle = {
      color: "white",
      marginTop: "2%",
      marginBottom: "2%",
      maxHeight: showReelFullDescription ? "none" : "100%",
      overflow: showReelFullDescription ? "visible" : "hidden",
      backgroundColor: showReelFullDescription ? "black" : "transparent",
      zIndex: showReelFullDescription ? 999 : 0,
    };

    if (showReelFullDescription) {
      return <Text style={reelDescriptionStyle}>{description}</Text>;
    } else {
      const truncatedReelDescription =
        description.split(" ").slice(0, 10).join(" ") + "...";

      return (
        <Text style={reelDescriptionStyle}>{truncatedReelDescription}</Text>
      );
    }
  };

  const toggleReelDescription = () => {
    setShowReelFullDescription(!showReelFullDescription);
  };

  return (
    <View style={styles.container}>
      {/* Each post card */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Image
            style={styles.profileImage}
            source={
              profileImageUri && profileImageUri.trim() !== ""
                ? { uri: profileImageUri }
                : UserImg
            }
          />

          <View style={styles.headerText}>
            <TouchableOpacity
              onPress={() => {
                // Only navigate if user exists and has a valid ID
                if (userId) {
                  navigation.navigate("EachProfile", {
                    userId: userId,
                  });
                }
              }}
            >
              <Text style={styles.name}>
                {firstName} {lastName}
              </Text>
            </TouchableOpacity>
          </View>

          {/*     {source === "SocialHomeScreen" || source === "EachProfile" ? (
            <TouchableOpacity
              style={[
                styles.followContainer,
                isFollowing && { backgroundColor: "transparent" },
              ]}
              onPress={() => {
                if (!isFollowing && userId) {
                  handleSendFollowRequest(fromUserId, userId);
                }
              }}
              disabled={isFollowing}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name={isFollowing ? "checkmark" : "add"}
                  size={22}
                  style={isFollowing ? styles.checkIcon : styles.plusIcon}
                />
                <Text
                  style={isFollowing ? styles.followingText : styles.followText}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
           */}

          {/* {source === "SocialHomeScreen" || source === "EachProfile" ? (
            <TouchableOpacity
              style={[
                styles.followContainer,
                isFollowing === "approved" && {
                  backgroundColor: "transparent",
                },
              ]}
              onPress={() => {
                if (isFollowing === "none" && userId) {
                  handleSendFollowRequest(fromUserId, userId);
                } else if (isFollowing === "approved") {
                  unFollowUser();
                }
              }}
              disabled={isFollowing === "pending"} // Disable button if follow request is pending
            >
              <View style={styles.iconContainer}>
                <Icon
                  name={
                    isFollowing === "none"
                      ? "add"
                      : isFollowing === "pending"
                      ? "hourglass"
                      : "checkmark"
                  }
                  size={20}
                  style={
                    isFollowing === "none"
                      ? styles.plusIcon
                      : isFollowing === "pending"
                      ? styles.pendingIcon
                      : styles.checkIcon
                  }
                />
                <Text
                  style={
                    isFollowing === "none"
                      ? styles.followText
                      : isFollowing === "pending"
                      ? styles.pendingText
                      : styles.followingText
                  }
                >
                  {isFollowing === "none"
                    ? "Follow"
                    : isFollowing === "pending"
                    ? "Pending"
                    : "Following"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : ( */}

          {source === "SocialHomeScreen" || source === "EachProfile" ? (
            userId && userId !== fromUserId ? (
              <TouchableOpacity
                style={[
                  styles.followContainer,
                  effectiveFollowStatus === "approved" && {
                    backgroundColor: "transparent",
                  },
                ]}
                onPress={() => {
                  if (effectiveFollowStatus === "none" && userId) {
                    handleSendFollowRequest(fromUserId, userId);
                  } else if (effectiveFollowStatus === "approved") {
                    unFollowUser();
                  }
                }}
                disabled={effectiveFollowStatus === "pending"} // Disable button if follow request is pending
              >
                <View style={styles.iconContainer}>
                  <Icon
                    name={
                      effectiveFollowStatus === "none"
                        ? "add"
                        : effectiveFollowStatus === "pending"
                        ? "hourglass"
                        : "checkmark"
                    }
                    size={20}
                    style={
                      effectiveFollowStatus === "none"
                        ? styles.plusIcon
                        : effectiveFollowStatus === "pending"
                        ? styles.pendingIcon
                        : styles.checkIcon
                    }
                  />
                  <Text
                    style={
                      effectiveFollowStatus === "none"
                        ? styles.followText
                        : effectiveFollowStatus === "pending"
                        ? styles.pendingText
                        : styles.followingText
                    }
                  >
                    {effectiveFollowStatus === "none"
                      ? t("Follow")
                      : effectiveFollowStatus === "pending"
                      ? t("Pending")
                      : t("Following")}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null
          ) : null}
          {/* Single unified menu button for all users */}
          <TouchableOpacity
            onPress={() => setReportModalVisible(true)}
            style={[
              styles.moreOptionsButton,
              // Push menu button to the right when there's no follow button
              // This includes: own posts, deleted users (no userId), or screens where follow button isn't shown
              ((source === "SocialHomeScreen" || source === "EachProfile") && 
               (!userId || userId === fromUserId)) ||
              (source !== "SocialHomeScreen" && source !== "EachProfile") ? { marginLeft: "auto" } : {}
            ]}
          >
            <Icon name="ellipsis-vertical" size={22} color="grey" />
          </TouchableOpacity>

          {/* Report Post Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={reportModalVisible}
            onRequestClose={() => setReportModalVisible(false)}
          >
            <Pressable
              style={styles.reportModalOverlay}
              onPress={() => setReportModalVisible(false)}
            >
              <View style={styles.reportModalContainer}>
                <Text style={styles.modalTitle}>{t("postOptions")}</Text>
                
                {/* Show edit and delete options only for post owner */}
                {userId === fromUserId && (
                  <>
                    <TouchableOpacity
                      style={styles.reportModalOption}
                      onPress={() => {
                        setReportModalVisible(false);
                        navigation.navigate("EditPost", {
                          postId: postId,
                          fetchPosts: fetchPosts,
                          posts: posts,
                          post: post,
                          description: description,
                        });
                      }}
                    >
                      <Icon name="pencil-outline" size={22} color="#007AFF" />
                      <Text style={styles.reportModalOptionText}>
                        {t("editPost")}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.reportModalOption}
                      onPress={() => {
                        setReportModalVisible(false);
                        handleDeletePost();
                      }}
                    >
                      <Icon name="trash-outline" size={22} color="red" />
                      <Text style={[styles.reportModalOptionText, { color: "red" }]}>
                        {t("delete")}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {/* Report option for all users */}
                {userId !== fromUserId && (
                  <TouchableOpacity
                    style={styles.reportModalOption}
                    onPress={() => {
                      setReportModalVisible(false);
                      reportPost(post._id, "Inappropriate content"); // Change reason as needed
                    }}
                  >
                    <Icon name="flag-outline" size={22} color="red" />
                    <Text style={styles.reportModalOptionText}>
                      {t("report")}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.optionButton, styles.cancelButton]}
                  onPress={() => setReportModalVisible(false)}
                >
                  <Text style={styles.cancelText}>{t("cancel")}</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        </View>

        {renderDescription()}
        <TouchableOpacity onPress={toggleDescription}>
          <Text style={styles.readMore}>
            {showFullDescription ? t("readLess") : t("readMore")}
          </Text>
        </TouchableOpacity>

        {/* video + reels */}
        {video && (
          <>
            <TouchableOpacity onPress={openReelModal}>
              <View>
                <Video
                  source={{ uri: `${video.replace(/\\/g, "/")}` }}
                  style={styles.chatVideoThumbnail}
                  resizeMode="cover"
                  usePoster
                  shouldPlay={false}
                  isLooping
                  isMuted={isMuted}
                />
                <TouchableOpacity
                  style={styles.muteButton}
                  onPress={toggleMute}
                >
                  {isMuted ? (
                    <Ionicons name="volume-mute" size={15} color="white" />
                  ) : (
                    <Ionicons name="volume-high" size={15} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={false}
              visible={reelModalVisible}
              onRequestClose={closeReelModal}
            >
              <View style={styles.reelModalOverlay}>
                <View style={styles.reelModalContent}>
                  {/* Back Arrow */}
                  <TouchableOpacity
                    onPress={closeReelModal}
                    style={styles.reelBackButton}
                  >
                    <Ionicons name="arrow-back" size={32} color="white" />
                  </TouchableOpacity>

                  {/* Video Player */}

                  <Video
                    ref={reelRef}
                    source={{ uri: `${video.replace(/\\/g, "/")}` }}
                    style={styles.reelVideo}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={isReelPlaying}
                    isLooping
                    isMuted={isReelMuted}
                    useNativeControls
                  />

                  {/* Mute Button */}
                  <TouchableOpacity
                    style={styles.reelMuteButton}
                    onPress={toggleReelMute}
                  >
                    <Ionicons
                      name={isReelMuted ? "volume-mute" : "volume-high"}
                      size={28}
                      color="white"
                    />
                  </TouchableOpacity>

                  {/* Profile Picture, Username, and Follow Button */}
                  <View style={styles.reelProfileContainer}>
                    {/* <Image
                      // source={{
                      //   uri: "https://media.istockphoto.com/id/2143311599/photo/a-cheerful-asian-woman-enjoys-a-walk-during-a-summer-night.webp?a=1&b=1&s=612x612&w=0&k=20&c=D7Yb-GG6xR5vPDF40d5pL8OtDGHbav2AOZmg9q6nEXg=",
                      // }} // Replace with your profile picture URL
                      source={profileImageUri}
                      style={styles.reelProfilePicture}
                    /> */}
                    <Image
                      style={styles.reelProfilePicture}
                      source={
                        profileImageUri && profileImageUri.trim() !== ""
                          ? { uri: profileImageUri }
                          : UserImg
                      }
                    />
                    <Text style={styles.reelUsername}>
                      {post?.createdBy?.firstName} {post?.createdBy?.lastName}
                    </Text>
                    {userId !== fromUserId && (
                      <TouchableOpacity
                        style={[
                          styles.reelFollowButton,
                          effectiveFollowStatus === "approved" && {
                            backgroundColor: "transparent",
                          },
                        ]}
                        onPress={() => {
                          if (effectiveFollowStatus === "none") {
                            handleSendFollowRequest(fromUserId, userId);
                          } else if (effectiveFollowStatus === "approved") {
                            unFollowUser();
                          }
                        }}
                        disabled={effectiveFollowStatus === "pending"}
                      >
                        <View style={styles.buttonContent}>
                          <Icon
                            name={
                              effectiveFollowStatus === "none"
                                ? "add"
                                : effectiveFollowStatus === "pending"
                                ? "hourglass"
                                : "checkmark"
                            }
                            size={18}
                            color="#FF9933"
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={[
                              styles.reelFollowButtonText,
                              effectiveFollowStatus === "approved"
                                ? { color: "#FF9933" }
                                : effectiveFollowStatus === "pending"
                                ? { color: "#FF9933" }
                                : { color: "#FF9933" },
                            ]}
                          >
                            {effectiveFollowStatus === "none"
                              ? "Follow"
                              : effectiveFollowStatus === "pending"
                              ? "Pending"
                              : "Following"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Description in 'reel' */}
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: showReelFullDescription ? 0 : 20,
                    }}
                  >
                    {renderReelDescription()}
                    <TouchableOpacity onPress={openDescriptionModal}>
                      <Text style={{ color: "white", marginBottom: 8 }}>
                        {showReelFullDescription
                          ? t("readLess")
                          : t("readMore")}
                      </Text>
                    </TouchableOpacity>
                    <Modal
                      visible={showReelModal}
                      animationType="slide"
                      transparent={false}
                      onRequestClose={closeDescriptionModal}
                    >
                      <View style={styles.reelDescriptionModalOverlay}>
                        <View style={styles.reelDescriptionModalContent}>
                          {/* Full description text */}
                          <Text
                            style={styles.reelDescriptionModalDescriptionText}
                          >
                            {description}
                          </Text>
                          {/* Read less button */}
                          <TouchableOpacity onPress={closeDescriptionModal}>
                            <Text
                              style={{
                                color: "white",
                                marginVertical: 10,
                                fontWeight: "bold",
                                backgroundColor: "black",
                                borderRadius: 10,
                                width: 90,
                                height: "auto",
                                textAlign: "center",
                              }}
                            >
                              {showReelFullDescription
                                ? t("readLess")
                                : t("readMore")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  </View>

                  {/* Social Action Buttons */}
                  <View style={styles.reelActionButtons}>
                    {/* <TouchableOpacity style={styles.reelIconButton}>
                      <FontAwesome name="heart" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={{ color: "white" }}>{likeCount}</Text> */}
                    <TouchableOpacity
                      onPress={toggleLike}
                      style={styles.reelIconButton}
                    >
                      <FontAwesomeIcon
                        key={isLiked}
                        name={isLiked ? "heart" : "heart-o"}
                        size={28}
                        color={isLiked ? "red" : "white"}
                        style={{
                          textShadowColor: "white",
                          textShadowOffset: { width: 1, height: 1 },
                        }}
                      />
                    </TouchableOpacity>
                    <Text style={{ color: "white" }}>{likeCount}</Text>
                    <TouchableOpacity
                      style={styles.reelIconButton}
                      onPress={openCommentsModal}
                    >
                      <FontAwesome name="comment" size={28} color="white" />
                    </TouchableOpacity>
                                          <Text style={{ color: "white" }}>
                        {commentCount}
                      </Text>
                    <TouchableOpacity style={styles.reelIconButton}>
                      <Ionicons name="repeat" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={{ color: "white" }}>{reposts}</Text>
                    <TouchableOpacity style={styles.reelIconButton}>
                      <Ionicons name="paper-plane" size={28} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}

        {/* Post Image */}

        {/* {images && images.length > 0 && (
          <View style={styles.imageContainer}>
            {images.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                snapToInterval={windowWidth} // Snap to the width of each image
                decelerationRate="fast" // Makes the scrolling smoother
                snapToAlignment="center" // Ensures the image is centered after scroll
              >
                {images.map((image, index) => (
                  <Image
                    key={index}
                    style={styles.bannerImage}
                    source={{ uri: `${image}` }}
                  />
                ))}
              </ScrollView>
            ) : (
              <Image
                style={styles.bannerSingleImage}
                source={{ uri: `${images}` }}
              />
            )}

            {images.length > 1 && (
              <View style={styles.indexContainer}>
                <Text style={styles.indexText}>
                  {currentIndex + 1} / {images.length}
                </Text>
              </View>
            )}
          </View>
        )} */}

        <View style={styles.imageContainer}>
          {images && images.length > 0 ? (
            <>
              {images.length > 1 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  snapToInterval={windowWidth}
                  decelerationRate="fast"
                  snapToAlignment="center"
                >
                  {images.map((image, index) => {
                    const imageUri = `${image}`;
                    console.log("Rendering image:", imageUri);
                    return (
                      <TouchableWithoutFeedback
                        key={index}
                        onPress={handleDoubleTap}
                      >
                        <Image
                          style={styles.bannerImage}
                          source={{ uri: imageUri }}
                        />
                      </TouchableWithoutFeedback>
                    );
                  })}
                </ScrollView>
              ) : (
                <TouchableWithoutFeedback onPress={handleDoubleTap}>
                  <Image
                    style={styles.bannerSingleImage}
                    source={{ uri: `${images[0]}` }}
                  />
                </TouchableWithoutFeedback>
              )}

              {images.length > 1 && (
                <View style={styles.indexContainer}>
                  <Text style={styles.indexText}>
                    {currentIndex + 1} / {images.length}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text>{t("no_images_visible")}</Text> // Fallback message in case there are no images
          )}
        </View>

        {heartVisible && (
          <View style={styles.likeIconContainer}>
            <Icon name="heart" size={50} color="red" style={styles.likeIcon} />
          </View>
        )}

        {/* Social Info Section */}
        <View style={styles.socialInfo}>
          <View style={styles.likeSection}>
            <View style={styles.heartIconContainer}>
              <FontAwesomeIcon name="heart" size={10} color="pink" />
            </View>

            <View style={styles.commentIconContainer}>
              <FontAwesomeIcon name="thumbs-up" size={10} color="lightblue" />
            </View>
            <Text style={styles.socialText}>{likeCount}</Text>
          </View>
                      <Text style={styles.socialText}>
              {commentCount} {t("comments")} • {reposts} {t("reposts")}
            </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={toggleLike} style={styles.likeButton}>
            <FontAwesomeIcon
              key={isLiked}
              name={isLiked ? "heart" : "heart-o"}
              size={24}
              color={isLiked ? "red" : "black"}
              style={{
                textShadowColor: "white",
                textShadowOffset: { width: 1, height: 1 },
              }}
            />
            <Text style={styles.actionText}>{t("like")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openCommentsModal}>
            <FontAwesomeIcon
              name="comment-o"
              size={24}
              marginLeft={10}
              color="black"
            />
            <Text style={styles.actionText}>{t("comment")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openRepostModal}>
            <FontAwesomeIcon name="retweet" size={24} marginLeft={10} />
            <Text style={styles.actionText}>{t("repost")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openShareModal}>
            <FontAwesomeIcon
              name="paper-plane-o"
              size={22}
              marginLeft={10}
              color="#000"
            />
            <Text style={styles.actionText}>{t("send")}</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Likes/Report */}
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  { transform: [{ translateY: pan.y }] },
                ]}
                {...panResponder.panHandlers}
              >
                <View style={styles.swipeBar}>
                  <View style={styles.bar} />
                </View>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={closeModal}
                >
                  <Text style={styles.modalText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={closeModal}
                >
                  <Text style={styles.modalText}>Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={closeModal}
                >
                  <Text style={styles.modalText}>Unfollow User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={closeModal}
                >
                  <Text style={styles.modalText}>Block</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Modal for Comment */}
        <Modal
          visible={isCommentsModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={closeCommentsModal}
        >
          <View style={styles.commentHeaderContainer}>
            <TouchableOpacity
              onPress={closeCommentsModal}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.commentModalContainer}>
            <FlatList
              ref={flatListRef}
              data={comments || []}
              keyExtractor={(item) => item?._id || Math.random().toString()}
              renderItem={renderItem}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 60 }}
              onScrollBeginDrag={closeMenu}
              ListHeaderComponent={() => (
                <View>
                  <View style={styles.header}>
                    <Image
                      style={styles.profileImage}
                      source={
                        profileImageUri && profileImageUri.trim() !== ""
                          ? { uri: profileImageUri }
                          : UserImg
                      }
                    />
                    <View style={styles.headerText}>
                      <Text style={styles.name}>
                        {" "}
                        {post?.createdBy?.firstName} {post?.createdBy?.lastName}
                      </Text>
                    </View>
                  </View>

                  {video && (
                    <>
                      <View>
                        <Video
                          source={{
                            uri: `${video.replace(/\\/g, "/")}`,
                          }}
                          style={styles.chatVideoThumbnail}
                          resizeMode="cover"
                          usePoster
                          shouldPlay={false}
                          isLooping
                          isMuted={isMuted}
                        />
                        <TouchableOpacity
                          style={styles.muteButton}
                          onPress={toggleMute}
                        >
                          {isMuted ? (
                            <Ionicons name="volume-mute" size={15} color="white" />
                          ) : (
                            <Ionicons name="volume-high" size={15} color="white" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {images && images.length > 0 && (
                    <View style={styles.imageContainer}>
                      {images.length > 1 ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          onScroll={handleScroll}
                          scrollEventThrottle={16}
                          snapToInterval={windowWidth}
                          decelerationRate="fast"
                          snapToAlignment="center"
                        >
                          {images.map((image, index) => (
                            <Image
                              key={index}
                              style={styles.bannerImage}
                              source={{ uri: `${image}` }}
                            />
                          ))}
                        </ScrollView>
                      ) : (
                        <Image
                          style={styles.bannerSingleImage}
                          source={{ uri: `${images}` }}
                        />
                      )}

                      {images.length > 1 && (
                        <View style={styles.indexContainer}>
                          <Text style={styles.indexText}>
                            {currentIndex + 1} / {images.length}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  <View style={styles.commentPostContent}>
                    <Text style={styles.commentModalDescription}>
                      {description}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                !loading ? (
                  <Text style={{ textAlign: "center", marginTop: 20 }}>
                    {t("no_comments_yet")}.
                  </Text>
                ) : (
                  <ActivityIndicator
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    size={"large"}
                    color={"#b98c13"}
                  />
                )
              }
            />

            <View style={styles.commentInputContainer}>
              <Image
                style={styles.commentProfileImage}
                source={
                  profileImageUrl && profileImageUrl.trim() !== ""
                    ? { uri: profileImageUrl }
                    : UserImg
                }
              />
              <TextInput
                style={styles.commentInput}
                value={newCommentText}
                onChangeText={setNewCommentText}
                placeholder="Add a comment..."
              />

              <TouchableOpacity
                onPress={handleAddComment}
                style={styles.commentSendButton}
              >
                <Text style={styles.sendButtonText}>{t("send")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal for Share */}
        <Modal
          transparent={true}
          visible={isShareModalVisible}
          animationType="slide"
          onRequestClose={closeShareModal}
        >
          <TouchableWithoutFeedback onPress={closeShareModal}>
            <View style={styles.shareModalOverlay}>
              <View style={styles.shareModalContainer}>
                <View
                  style={{
                    alignItems: "center",
                    marginLeft: 16,
                    marginRight: 16,
                    marginBottom: 10,
                  }}
                >
                  <TextInput
                    style={{
                      width: "100%",
                      height: 40,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      backgroundColor: "#f8f8f8",
                    }}
                    placeholder={t("search")}
                    value={shareSearchTerm}
                    onChangeText={setShareSearchTerm}
                  />
                </View>
                <FlatList
                  data={filteredShareUsers}
                  renderItem={renderShareOption}
                  keyExtractor={(item) => item._id}
                  numColumns={3}
                  contentContainerStyle={styles.flatListContent}
                  ListEmptyComponent={
                    shareLoading ? (
                      <ActivityIndicator size="large" color="#007AFF" />
                    ) : (
                      <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
                        {shareSearchTerm ? "No users found" : "No users available"}
                      </Text>
                    )
                  }
                />

                {selectedUsers.length > 0 && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                      // Here you can implement the actual sharing logic
                      // For now, just show a success message
                      closeShareModal();
                      Alert.alert(
                        "Success", 
                        `Post shared with ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} successfully.`
                      );
                    }}
                  >
                    <Text style={styles.sendButtonText}>
                      {t("send")} to {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          transparent={true}
          visible={isRepostModalVisible}
          animationType="slide"
          onRequestClose={closeRepostModal}
        >
          <TouchableWithoutFeedback onPress={closeRepostModal}>
            <View style={styles.modalOverlay}>
              <Animated.View
                style={[
                  styles.modalContainer,
                  { transform: [{ translateY: pan.y }] },
                ]}
                {...panResponder.panHandlers}
              >
                <View style={styles.swipeBar}>
                  <View style={styles.bar} />
                </View>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    navigation.navigate("RepostWithThoughts", {
                      post: post,
                      userId: userId,
                      fetchPosts: fetchPosts,
                    });
                  }}
                >
                  <View style={styles.iconTextContainer}>
                    <FontAwesomeIcon
                      name="pencil-square-o"
                      size={24}
                      style={styles.icon}
                    />
                    <Text style={styles.modalText}>
                      {t("repostWithThoughts")}
                    </Text>
                  </View>

                  <Text style={styles.modalSubText}>
                    {t("repostWithThoughtsDescription")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={async () => {
                    try {
                      console.log("Creating normal repost for post:", post._id);
                      const repostData = {
                        originalPostId: post._id,
                        thoughts: ""
                      };

                      const response = await apiClient.post("/social/post/create-repost", repostData, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

                      console.log("Normal repost response:", response.data);
                      if (response.data.success) {
                        Alert.alert("Success", "Post reposted successfully!");
                        closeRepostModal();
                        // Refresh posts if needed
                        if (fetchPosts) {
                          fetchPosts(true); // Refresh
                        }
                      } else {
                        Alert.alert("Error", response.data.message || "Failed to repost");
                      }
                    } catch (error) {
                      console.error("Repost error:", error);
                      console.error("Error response:", error.response?.data);
                      Alert.alert("Error", error.response?.data?.message || "Failed to repost. Please try again.");
                    }
                  }}
                >
                  <View style={styles.iconTextContainer}>
                    <FontAwesomeIcon
                      name="retweet"
                      size={24}
                      style={styles.icon}
                    />
                    <Text style={styles.modalText}> {t("repost")}</Text>
                  </View>

                  <Text style={styles.modalSubText}>
                    {t("repostDescription")}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerText: {
    marginLeft: 10,
  },
  commentHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "white",
    elevation: 10,
    shadowColor: "black",
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  backButton: {
    padding: 10,
    marginRight: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 14,
    color: "gray",
  },
  time: {
    fontSize: 12,
    color: "gray",
  },
  followContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  moreOptions: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },

  followContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  plusIcon: {
    fontSize: 20,
    color: Theme.themeColor,
    marginRight: 4,
    fontWeight: "bold",
  },
  followText: {
    color: Theme.themeColor,
    fontSize: 18,
    fontWeight: "bold",
  },
  pendingIcon: {
    fontSize: 20,
    color: "#FFA500", // Orange color for pending state
    marginRight: 4,
    fontWeight: "bold",
  },
  pendingText: {
    color: "#FFA500", // Orange color for pending state
    fontSize: 18,
    fontWeight: "bold",
  },
  checkIcon: {
    fontSize: 20,
    color: "grey",
    marginRight: 4,
    fontWeight: "bold",
  },
  followingText: {
    color: "grey",
    fontSize: 18,
    fontWeight: "bold",
  },
  bannerImage: {
    width: windowWidth,
    height: 400,
    padding: 0,
    marginHorizontal: 0,
    marginVertical: 10,
  },
  imageContainer: {
    width: "100%",
    marginVertical: 10,
  },
  bannerSingleImage: {
    width: "100%",
    height: 400,
    padding: 0,
    marginHorizontal: 0,
    marginVertical: 10,
  },
  readMore: {
    color: "black",
    marginBottom: 8,
  },
  socialInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  likeSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  heartIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 15,
    borderWidth: 1,

    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "red",
  },
  commentIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 15,
    borderWidth: 1,

    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "blue",
    right: 5,
  },
  likeIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  socialText: {
    fontSize: 14,
    color: "darkgrey",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 14,
    color: "black",
  },
  likeButton: {
    marginRight: 10,
  },
  shareModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  shareModalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  flatListContent: {
    paddingHorizontal: 15,
  },
  shareItem: {
    flex: 1,
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  shareImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 5,
  },
  shareText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  tickOverlay: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#007AFF",
    borderRadius: 15,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedIcon: {
    color: "gray",
  },
  followingText: {
    color: "#6c757d", // Gray text when following
  },
  tickText: {
    color: "#fff",
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  commentSendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 0,
    left: 10,
  },

  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalOption: {
    padding: 10,
    width: "100%",
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  modalText: {
    fontSize: 18,
    textAlign: "left",
  },
  postIcon: {
    marginRight: 10,
    color: "red",
  },
  modalPostText: {
    fontSize: 18,
    textAlign: "left",
    color: "red",
  },
  modalSubText: {
    fontSize: 15,
    color: "gray",
    marginTop: 5,
  },
  swipeBar: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  bar: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
  },

  //comment section
  commentModalContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  commentCloseButton: {
    alignSelf: "flex-end",
  },
  commentCloseText: {
    color: "blue",
  },
  commentPostContent: {
    flexDirection: "column",
    marginBottom: 20,
  },
  commentModalProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
  },
  commentModalUsername: {
    fontWeight: "bold",
    fontSize: 18,
  },
  commentModalDescription: {
    marginVertical: 10,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  commentProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentName: {
    fontWeight: "bold",
  },
  commentRole: {
    color: "gray",
    fontSize: 12,
  },
  commentText: {
    marginVertical: 5,
    fontSize: 16,
  },
  reactionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    padding: 5,
  },
  input: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  menuContainer: {
    position: "relative",
    zIndex: 1,
  },
  menuButton: { 
    padding: 8, 
    marginLeft: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    minWidth: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { 
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  menuOptions: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    position: "absolute",
    top: 35,
    right: 0,
    zIndex: 1000,
    minWidth: 120,
  },
  deleteOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  menuOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: "red",
    fontWeight: "500",
  },
  menuContainer: {
    position: "relative",
    zIndex: 1,
  },

  indexContainer: {
    position: "absolute",
    top: 20,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indexText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftButton: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -25 }],
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
  },
  rightButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -25 }],
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
  },
  chatVideoThumbnail: {
    width: "100%",
    height: 300,
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
  muteButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    padding: 8,
  },
  reelModalOverlay: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  reelModalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  reelBackButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  reelMuteButton: {
    position: "absolute",
    top: 40,
    right: 20,
    borderRadius: 20,
    padding: 5,
  },
  reelActionButtons: {
    position: "absolute",
    bottom: 50,
    right: 20,
    alignItems: "center",
    height: "25%",
  },
  reelIconButton: {
    marginVertical: 10,
  },
  reelVideo: {
    width: "100%",
    height: "50%",
  },
  reelProfileContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    flexDirection: "row", // Arrange items in a horizontal line
    alignItems: "center", // Center items vertically within the row
  },
  reelProfilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
    marginRight: 10, // Add spacing between profile picture and username
  },
  reelUsername: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10, // Add spacing between username and follow button
  },
  reelFollowButton: {
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reelFollowButtonText: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
  },
  reelDescriptionModalOverlay: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  reelDescriptionModalContent: {
    width: "95%",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  reelDescriptionCloseButton: {
    position: "absolute",
    top: 0,
    right: 10,
    padding: 5,
  },
  reelDescriptionModalDescriptionText: {
    color: "black",
    fontSize: 16,
  },

  followButton: {
    backgroundColor: "blue",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  followingButton: {
    backgroundColor: "grey", // Change background to grey
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  followButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  seeMoreButton: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 10,
  },
  seeMoreText: {
    color: "blue",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Report Modal Styles
  reportModalButton: {
    padding: 10,
  },
  reportModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  reportModalContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
    alignItems: "center",
  },
  reportModalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  reportModalOptionText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#000",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cancelButton: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
  },
  moreOptionsButton: {
    paddingLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  likeIconContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 10,
  },
  likeIcon: {
    opacity: 0.8,
    animation: "likeAnim 0.6s ease-in-out",
  },
});

export default NewSocialCard;
