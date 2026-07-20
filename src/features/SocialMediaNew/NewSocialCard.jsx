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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Theme from "../../styles/theme";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { useSelector } from "react-redux";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEventListener } from "expo";
import { setAudioModeAsync } from "expo-audio";
import { BASEAPIURL, RENDERMEDIAURL } from "../../infrastructure/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import UserImg from "../../assets/images/general/user.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import {
  followUserAPI,
  unfollowUserAPI,
  getFollowStatus,
  deletePost,
  getLikeStatus,
  toggleLikeOnPost,
  getComments,
  addComment,
  deleteComment,
  likeComment,
  unlikeComment,
  replyToComment,
  deleteReply,
  reportPostApi,
  getUsers,
  getUserFriends,
  } from "./SocialMediaAPIs";
  import { useTranslation } from "react-i18next";
import { generateShareUrl, generateShareMessage } from "../../utils/shareUtils";
import * as Clipboard from 'expo-clipboard';
import { useFollowStatus } from "./FollowStatusContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import moment from "moment";

const { width: windowWidth } = Dimensions.get("window");
const isCompact = windowWidth < 375;
const CARD_PAD = isCompact ? 10 : 14;
const AVATAR_SIZE = isCompact ? 40 : 46;
const ACTION_ICON = isCompact ? 20 : 22;
const ACTION_FONT = isCompact ? 11 : 12;
const REEL_ACTION_ICON = isCompact ? 26 : 30;
const REEL_ACTION_RAIL_WIDTH = isCompact ? 56 : 64;

const normalizeVideoUri = (video) => {
  if (!video) return null;
  const cleaned = `${String(video).replace(/\\/g, "/")}`;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  const base = (RENDERMEDIAURL || "").replace(/\/$/, "");
  return `${base}/${cleaned.replace(/^\//, "")}`;
};

const androidVideoSurfaceProps =
  Platform.OS === "android" ? { surfaceType: "textureView" } : {};

// Cache audio-session setup so unmute doesn't await / jank the UI every time
let playbackAudioModePromise = null;

/** Android needs an active media audio session or unmuted video stays silent */
const ensurePlaybackAudioMode = () => {
  if (!playbackAudioModePromise) {
    playbackAudioModePromise = setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
      allowsRecording: false,
    }).catch((e) => {
      playbackAudioModePromise = null;
      console.warn("Failed to set playback audio mode:", e);
    });
  }
  return playbackAudioModePromise;
};

const applyPlayerMuteState = (player, muted) => {
  try {
    player.muted = !!muted;
    // Explicit volume helps Android after mute→unmute transitions
    player.volume = muted ? 0 : 1;
    player.audioMixingMode = muted ? "mixWithOthers" : "doNotMix";
  } catch (e) {
    console.warn("Failed to apply mute state:", e);
  }
};

const selectFirstAudioTrack = (player) => {
  try {
    const tracks = player.availableAudioTracks;
    if (Array.isArray(tracks) && tracks.length > 0) {
      player.audioTrack = tracks[0];
    }
  } catch (_) {}
};

/** Single feed ExoPlayer — only mounted for the active/visible card */
const FeedVideoPreviewPlayer = ({ uri, isMuted, paused }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    applyPlayerMuteState(p, isMuted);
    if (!paused) {
      p.play();
    }
  });

  useEffect(() => {
    if (!isMuted && !paused) {
      ensurePlaybackAudioMode();
    }
    applyPlayerMuteState(player, paused ? true : isMuted);
    if (paused) {
      player.pause();
    } else {
      player.play();
    }
  }, [isMuted, paused, player]);

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch (_) {}
    };
  }, [player]);

  useEventListener(player, "statusChange", ({ status, error }) => {
    if (status === "readyToPlay") {
      selectFirstAudioTrack(player);
      applyPlayerMuteState(player, paused ? true : isMuted);
      if (!paused) {
        player.play();
      }
    }
    if (status === "error") {
      console.warn("Feed video error:", error);
    }
  });

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFillObject}
      contentFit="cover"
      nativeControls={false}
      {...androidVideoSurfaceProps}
    />
  );
};

/** Inactive posts show a light placeholder — no ExoPlayer (prevents OOM / crash) */
const FeedVideoPlaceholder = () => (
  <View
    style={[
      StyleSheet.absoluteFillObject,
      { backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
    ]}
  >
    <Ionicons name="play-circle" size={56} color="rgba(255,255,255,0.85)" />
  </View>
);

/**
 * Feed preview: mounts a real player only when `isActive`.
 * Other video cards stay as placeholders so Android doesn't keep N ExoPlayers alive.
 */
const FeedVideoPreview = ({
  uri,
  isMuted,
  onToggleMute,
  onPress,
  paused,
  isActive = false,
  dimension,
}) => {
  const shouldPlay = isActive && !paused;
  const dimensionStyle = dimension
    ? {
        width: dimension,
        height: dimension,
        alignSelf: "center",
        overflow: "hidden",
        borderRadius: 0,
        backgroundColor: "#000",
      }
    : null;

  return (
    <View
      style={[
        styles.squareMediaWrapper,
        dimension ? dimensionStyle : styles.mediaBleed,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.squareMedia}
      >
        {shouldPlay ? (
          <FeedVideoPreviewPlayer
            uri={uri}
            isMuted={isMuted}
            paused={false}
          />
        ) : (
          <FeedVideoPlaceholder />
        )}
      </TouchableOpacity>
      {shouldPlay ? (
        <TouchableOpacity
          style={styles.muteButton}
          onPress={onToggleMute}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isMuted ? (
            <Ionicons name="volume-mute" size={15} color="white" />
          ) : (
            <Ionicons name="volume-high" size={15} color="white" />
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

/** Reel player — mounted only while the modal is open */
const ReelVideoPlayer = ({ uri, isMuted, isPlaying }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    applyPlayerMuteState(p, isMuted);
    p.audioMixingMode = "doNotMix";
    if (isPlaying) {
      p.play();
    }
  });

  useEffect(() => {
    ensurePlaybackAudioMode();
    applyPlayerMuteState(player, isMuted);
    player.audioMixingMode = "doNotMix";
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isMuted, isPlaying, player]);

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch (_) {}
    };
  }, [player]);

  useEventListener(player, "statusChange", ({ status, error }) => {
    if (status === "readyToPlay") {
      selectFirstAudioTrack(player);
      applyPlayerMuteState(player, isMuted);
      player.audioMixingMode = "doNotMix";
      if (isPlaying) {
        player.play();
      }
    }
    if (status === "error") {
      console.warn("Reel video error:", error);
    }
  });

  return (
    <VideoView
      player={player}
      style={styles.reelVideo}
      contentFit="cover"
      nativeControls={false}
      allowsFullscreen
      {...androidVideoSurfaceProps}
    />
  );
};

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
  /** Only the most-visible feed card should be true — avoids N ExoPlayers / OOM */
  isActiveVideo = false,
  mediaSize,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const mediaDimension = mediaSize ?? windowWidth;
  const mediaWrapperOverride = {
    width: mediaDimension,
    height: mediaDimension,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 0,
    backgroundColor: '#000',
  };
  const { t } = useTranslation();
  const tr = (key, fallback) => {
    try {
      const val = t(key);
      return val === key ? fallback : val;
    } catch (e) {
      return fallback;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = moment();
    const time = moment(timestamp);
    const diffMin = now.diff(time, 'minutes');
    const diffHrs = now.diff(time, 'hours');
    const diffDays = now.diff(time, 'days');
    if (diffMin < 1) return tr('just_now', 'Just now');
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHrs < 24) return `${diffHrs}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return time.format('MMM D');
  };
  // Determine if photoUri is an array of images or a single image

  const images = Array.isArray(postImages) ? postImages : [postImages];

  // Handle scrolling to update current index
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const slide = Math.floor(contentOffsetX / mediaDimension);
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
  const { getFollowStatus, updateFollowStatus } = useFollowStatus();

  // Use follow status from post data if available, otherwise use global follow status, local state, or prop
  const effectiveFollowStatus = post?.followStatus || getFollowStatus(userId) || currentFollowStatus || isFollowing;
  
  // Debug logging
  console.log('NewSocialCard follow status debug:', {
    userId,
    postFollowStatus: post?.followStatus,
    globalFollowStatus: getFollowStatus(userId),
    currentFollowStatus,
    isFollowing,
    effectiveFollowStatus
  });
  
  const setEffectiveFollowStatus = (status) => {
    updateFollowStatus(userId, status);
    setIsFollowing(status);
    if (onFollowStatusChange) {
      onFollowStatusChange(userId, status);
    }
  };

  // Update local state when prop changes
  useEffect(() => {
    // Initialize follow status from post data or props if available
    const initialStatus = post?.followStatus || currentFollowStatus;
    if (initialStatus !== undefined) {
      setIsFollowing(initialStatus);
      updateFollowStatus(userId, initialStatus);
    }
  }, [post?.followStatus, currentFollowStatus, userId, updateFollowStatus]);

  // Share modal state - stores friends list for sharing
  const [shareUsers, setShareUsers] = useState([]);
  const [shareSearchTerm, setShareSearchTerm] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  // Function to fetch friends for sharing
  const fetchShareUsers = async () => {
    try {
      setShareLoading(true);
      const response = await getUserFriends(fromUserId);
      
      // The friends endpoint returns { friends: [...] }
      const friends = response.data.friends || [];
      
      // Filter out the current user from the list (though it should already be filtered)
      const filteredFriends = friends.filter(friend => friend._id !== fromUserId);
      setShareUsers(filteredFriends);
      
      // Log the number of friends found for debugging
      console.log(`Found ${filteredFriends.length} friends for sharing`);
    } catch (error) {
      console.error("Error fetching friends for sharing:", error);
      // Set empty array on error
      setShareUsers([]);
    } finally {
      setShareLoading(false);
    }
  };

  // Fetch friends when share modal opens
  useEffect(() => {
    console.log("useEffect triggered - isShareModalVisible:", isShareModalVisible, "shareUsers.length:", shareUsers.length);
    if (isShareModalVisible && shareUsers.length === 0) {
      fetchShareUsers();
    }
  }, [isShareModalVisible]);

  // Monitor reel modal state changes
  useEffect(() => {
    console.log("Reel modal state changed - reelModalVisible:", reelModalVisible);
  }, [reelModalVisible]);

  // Handle search functionality - now using client-side filtering
  // No need to make API calls on search change since we filter client-side

  // Filter friends based on search term (client-side filtering)
  const filteredShareUsers = shareUsers.filter(friend => 
    friend.firstName?.toLowerCase().includes(shareSearchTerm.toLowerCase()) ||
    friend.lastName?.toLowerCase().includes(shareSearchTerm.toLowerCase())
  ); // This contains the filtered list of friends to display in the share modal

  const handleSendFollowRequest = async (fromUserId, toUserId) => {
    console.log('handleSendFollowRequest called with:', { fromUserId, toUserId, userId });
    
    // Check if both users exist before attempting to follow
    if (!fromUserId || !toUserId) {
      console.warn("Cannot follow user: missing user IDs", { fromUserId, toUserId });
      return;
    }
    
    try {
      await followUserAPI(fromUserId, toUserId, (status) => {
        setEffectiveFollowStatus(status);
        
        // Notify parent component to refresh all posts for this user
        if (onFollowStatusChange) {
          onFollowStatusChange(userId, status);
        }
        
        // Trigger a refresh of all posts to update follow status across all posts
        if (fetchPosts) {
          setTimeout(() => {
            fetchPosts(true); // Force refresh
          }, 1000);
        }
      });
      console.log("User followed successfully");
    } catch (error) {
      console.error("Error following user:", error);
      // Error handling is done inside followUserAPI
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
        
        // Notify parent component to refresh all posts for this user
        if (onFollowStatusChange) {
          onFollowStatusChange(userId, "none");
        }
        
        // Force refresh of follow status for this post
        setTimeout(() => {
          fetchFollowStatus();
        }, 500);
        
        // Trigger a refresh of all posts to update follow status across all posts
        if (fetchPosts) {
          setTimeout(() => {
            fetchPosts(true); // Force refresh
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      Alert.alert(
        "Error",
        "An error occurred while trying to send the unfollow request."
      );
    }
  };
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

  useEffect(() => {
    // Only fetch follow status if not provided via post data or props
    if (userId && !post?.followStatus && currentFollowStatus === undefined) {
      fetchFollowStatus();
    }
  }, [userId, post?.followStatus, currentFollowStatus]);
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
    setIsMuted((prevMuted) => {
      const nextMuted = !prevMuted;
      if (!nextMuted) {
        ensurePlaybackAudioMode();
      }
      return nextMuted;
    });
  };

  const renderDescription = () => {
    if (!description) return null;

    if (showFullDescription) {
      return <Text style={styles.descriptionText}>{description}</Text>;
    }

    const wordLimit = isCompact ? 14 : 20;
    const words = String(description).trim().split(/\s+/);
    const needsTruncate = words.length > wordLimit;
    const truncatedDescription = needsTruncate
      ? words.slice(0, wordLimit).join(" ") + "..."
      : description;

    return <Text style={styles.descriptionText}>{truncatedDescription}</Text>;
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
    console.log("openShareModal called - opening friends share modal");
    console.log("Current modal states - reelModalVisible:", reelModalVisible, "isShareModalVisible:", isShareModalVisible);
    
    // Close any other modals that might interfere
    setReelModalVisible(false);
    setCommentsModalVisible(false);
    setRepostModalVisible(false);
    setReportModalVisible(false);
    
    setShareModalVisible(true);
    console.log("Share modal state set to true, isShareModalVisible:", true);
    
    // Reset search and fetch friends when opening modal
    setShareSearchTerm("");
    if (shareUsers.length === 0) {
      fetchShareUsers();
    }
  };

  const closeShareModal = () => {
    console.log("closeShareModal called - closing friends share modal");
    setShareModalVisible(false);
    setSelectedUsers([]);
  };

  const [selectedUsers, setSelectedUsers] = useState([]); // Stores selected friends for sharing

  const toggleSelection = (friend) => {
    const friendId = friend._id;
    if (selectedUsers.includes(friendId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== friendId));
    } else {
      setSelectedUsers([...selectedUsers, friendId]);
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

  const isCommentLikedByMe = (comment) => {
    if (!comment || !Array.isArray(comment.likes)) return false;
    try {
      return comment.likes.some((l) => {
        const id = l?.user?._id || l?.user || l?._id;
        return String(id) === String(fromUserId);
      });
    } catch {
      return false;
    }
  };

  const toggleLikeComment = async (commentId) => {
    const target = comments?.find((c) => c._id === commentId);
    const liked = isCommentLikedByMe(target);
    if (liked) {
      try {
        const res = await unlikeComment(post._id, commentId);
        setComments((prev) => prev.map((c) => c._id === commentId ? {
          ...c,
          likes: Array.isArray(c.likes) ? c.likes.filter((l) => String(l?.user?._id || l?.user || l?._id) !== String(fromUserId)) : [],
          likesCount: res.data?.likesCount ?? Math.max((c.likesCount || 1) - 1, 0),
        } : c));
      } catch (e) {
        console.error('unlikeComment error', e?.response?.data || e.message);
      }
      return;
    }
    try {
      const res = await likeComment(post._id, commentId);
      setComments((prev) => prev.map((c) => c._id === commentId ? {
        ...c,
        likes: Array.isArray(c.likes) ? [...c.likes, { user: fromUserId }] : [{ user: fromUserId }],
        likesCount: res.data?.likesCount ?? (c.likesCount || 0) + 1,
      } : c));
    } catch (e) {
      // If backend says "Already liked", flip to unlike behaviour to satisfy UX
      if (e?.response?.data?.message && String(e.response.data.message).toLowerCase().includes('already liked')) {
        await toggleLikeComment(commentId); // call again, will hit unlike branch
      } else {
        console.error('likeComment error', e?.response?.data || e.message);
      }
    }
  };

  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [openRepliesMap, setOpenRepliesMap] = useState({});
  const submitReply = async () => {
    if (!replyTarget || !replyText.trim()) return;
    try {
      const res = await replyToComment(post._id, replyTarget, replyText.trim());
      const replies = res.data?.replies || [];
      setComments(prev => prev.map(c => c._id === replyTarget ? { ...c, replies } : c));
      setReplyText("");
      setReplyTarget(null);
    } catch (e) {
      console.error('replyToComment error', e?.response?.data || e.message);
    }
  };

  // Always fetch latest comments when comments modal opens
  useEffect(() => {
    if (isCommentsModalVisible) {
      fetchComments();
    }
  }, [isCommentsModalVisible]);

  const renderItem = ({ item }) => {
    // Add null checks to prevent rendering errors
    if (!item || !item.userId) {
      console.warn("Invalid comment item:", item);
      return null;
    }



    const imageUri = item?.userId?.image ? `${item.userId?.image}` : UserImg;

    const isCommentOwner = String(item?.userId?._id) === String(fromUserId);
    // UI requirement: only show menu for comment owner (not post owner)
    const canDeleteComment = isCommentOwner;



    return (
      <View style={styles.commentRowContainer}>
        <TouchableOpacity
          onPress={() => {
            if (item?.userId?._id) {
              navigation.navigate("EachProfile", { userId: item.userId._id });
            }
          }}
        >
          <Image
            source={typeof imageUri === "string" ? { uri: imageUri } : imageUri}
            style={styles.commentProfileImage}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.commentHeaderLine}>
            <Text style={styles.commentName}>
              {item.userId.firstName || "Unknown"} {item.userId.lastName || "User"}
            </Text>
            <Text style={styles.commentTime}> · {formatTime(item.createdAt)}</Text>
          </View>
          <View style={styles.commentBubble}>
            <Text style={styles.commentText}>{item.content || ""}</Text>
          </View>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => toggleLikeComment(item._id)}>
              <FontAwesome
                name={isCommentLikedByMe(item) ? "heart" : "heart-o"}
                size={14}
                color={isCommentLikedByMe(item) ? "red" : "#6B7280"}
              />
              <Text style={styles.actionLabel}>{(item.likesCount || 0)} {tr("likes", "likes")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setReplyTarget(item._id)}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#6B7280" />
              <Text style={styles.actionLabel}>{tr("reply", "Reply")}</Text>
            </TouchableOpacity>
          </View>

          {replyTarget === item._id && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{ flex: 1, backgroundColor: '#F2F2F7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }}>
                <TextInput value={replyText} onChangeText={setReplyText} placeholder={t('reply') || 'Reply...'} />
              </View>
              <TouchableOpacity onPress={submitReply} style={{ paddingHorizontal: 8, marginLeft: 6 }}>
                <Text style={{ color: Theme?.themeColor || '#B98C13', fontWeight: '600' }}>{t('post') || 'Post'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* View replies toggle */}
          {Array.isArray(item.replies) && item.replies.length > 0 && (
            <TouchableOpacity
              onPress={() => setOpenRepliesMap(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
              style={styles.viewRepliesLink}
            >
              <Text style={styles.viewRepliesText}>
                {openRepliesMap[item._id] ? tr('hide_replies', 'Hide replies') : `${tr('view_replies','View replies')} (${item.replies.length})`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Replies list */}
          {openRepliesMap[item._id] && Array.isArray(item.replies) && item.replies.length > 0 && (
            <View style={{ marginTop: 6 }}>
              {item.replies.map((r) => {
                const rImageUri = r?.userId?.image ? `${r.userId.image}` : UserImg;
                return (
                  <View key={r._id} style={styles.replyRow}>
                    <Image source={typeof rImageUri === 'string' ? { uri: rImageUri } : rImageUri} style={styles.replyAvatar} />
                    <View style={styles.replyBubble}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={styles.replyName}>{r?.userId?.firstName || 'User'} {r?.userId?.lastName || ''}</Text>
                        <Text style={styles.replyTime}> · {formatTime(r?.createdAt)}</Text>
                      </View>
                      <Text style={styles.replyText}>{r?.content || ''}</Text>
                    </View>
                    {(() => {
                      const replyOwnerId = r?.userId?._id || r?.userId;
                      const isReplyOwner = String(replyOwnerId) === String(fromUserId);
                      return isReplyOwner;
                    })() && (
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            const res = await deleteReply(post._id, item._id, r._id);
                            const replies = res.data?.replies || [];
                            setComments(prev => prev.map(c => c._id === item._id ? { ...c, replies } : c));
                          } catch (err) {
                            console.error('deleteReply error', err?.response?.data || err.message);
                          }
                        }}
                        style={{ paddingHorizontal: 6, paddingVertical: 4, marginLeft: 6 }}
                      >
                        <Icon name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
        {canDeleteComment && (
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => toggleMenu(item?._id)}
            >
              <Icon name="ellipsis-vertical" size={18} color="#8E8E93" />
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
                    {t("delete")}
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
  const videoUri = normalizeVideoUri(video);

  const toggleReelMute = () =>
    setIsReelMuted((prevMuted) => {
      const nextMuted = !prevMuted;
      if (!nextMuted) {
        ensurePlaybackAudioMode();
      }
      return nextMuted;
    });

  const openReelModal = () => {
    // Unmount feed preview first (via paused/isActive), then play reel with sound
    setIsMuted(true);
    setIsReelMuted(false);
    setIsReelPlaying(true);
    setReelModalVisible(true);
    ensurePlaybackAudioMode();
  };
  const closeReelModal = () => {
    setIsReelPlaying(false);
    setReelModalVisible(false);
  };

  const openDescriptionModal = () => setShowReelModal(true);
  const closeDescriptionModal = () => setShowReelModal(false);

  const renderReelDescription = () => {
    if (!description) return null;

    const reelDescriptionStyle = {
      color: "#fff",
      fontSize: isCompact ? 13 : 14,
      lineHeight: isCompact ? 18 : 20,
      textShadowColor: "rgba(0,0,0,0.55)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    };

    if (showReelFullDescription) {
      return <Text style={reelDescriptionStyle}>{description}</Text>;
    }

    const words = String(description).trim().split(/\s+/);
    const truncated =
      words.length > 12 ? `${words.slice(0, 12).join(" ")}...` : description;

    return (
      <Text style={reelDescriptionStyle} numberOfLines={3}>
        {truncated}
      </Text>
    );
  };

  const toggleReelDescription = () => {
    setShowReelFullDescription(!showReelFullDescription);
  };

  return (
    <View style={styles.container}>
      {/* Each post card */}
      <View style={styles.card}>
        {/* Card header to match clean layout */}
        <View style={styles.header}>
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
            <Image
              style={styles.profileImage}
              source={
                profileImageUri && profileImageUri.trim() !== ""
                  ? { uri: profileImageUri }
                  : UserImg
              }
            />
          </TouchableOpacity>

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
              <Text style={styles.name} numberOfLines={1}>
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
              >
                <View style={styles.iconContainer}>
                  <Icon
                    name={
                      effectiveFollowStatus === "none"
                        ? "add"
                        : "checkmark"
                    }
                    size={isCompact ? 16 : 18}
                    style={
                      effectiveFollowStatus === "none"
                        ? styles.plusIcon
                        : styles.checkIcon
                    }
                  />
                  <Text
                    numberOfLines={1}
                    style={
                      effectiveFollowStatus === "none"
                        ? styles.followText
                        : styles.followingText
                    }
                  >
                    {effectiveFollowStatus === "none"
                      ? t("Follow")
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
            <Icon name="ellipsis-vertical" size={isCompact ? 18 : 20} color="#6B7280" />
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

        {/* video + reels */}
        {videoUri && (
          <>
            <FeedVideoPreview
              uri={videoUri}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              onPress={openReelModal}
              paused={reelModalVisible}
              isActive={isActiveVideo}
              dimension={mediaSize ? mediaDimension : undefined}
            />
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
                    style={[
                      styles.reelBackButton,
                      { top: Math.max(insets.top, 10) },
                    ]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="arrow-back" size={24} color="white" />
                  </TouchableOpacity>

                  {/* Video Player — mount only while modal is open */}
                  {reelModalVisible && (
                    <ReelVideoPlayer
                      uri={videoUri}
                      isMuted={isReelMuted}
                      isPlaying={isReelPlaying}
                    />
                  )}

                  {/* Mute Button */}
                  <TouchableOpacity
                    style={[
                      styles.reelMuteButton,
                      { top: Math.max(insets.top, 10) },
                    ]}
                    onPress={toggleReelMute}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={isReelMuted ? "volume-mute" : "volume-high"}
                      size={22}
                      color="white"
                    />
                  </TouchableOpacity>

                  {/* Bottom-left meta: profile + caption (leaves room for action rail) */}
                  <View
                    style={[
                      styles.reelBottomMeta,
                      {
                        paddingBottom: Math.max(insets.bottom, 12) + 8,
                        paddingRight: REEL_ACTION_RAIL_WIDTH + 16,
                      },
                    ]}
                  >
                    <View style={styles.reelProfileContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          if (userId) {
                            navigation.navigate("EachProfile", {
                              userId: userId,
                            });
                          }
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Image
                          style={styles.reelProfilePicture}
                          source={
                            profileImageUri && profileImageUri.trim() !== ""
                              ? { uri: profileImageUri }
                              : UserImg
                          }
                        />
                      </TouchableOpacity>
                      <Text style={styles.reelUsername} numberOfLines={1}>
                        {post?.createdBy?.firstName} {post?.createdBy?.lastName}
                      </Text>
                      {userId !== fromUserId && (
                        <TouchableOpacity
                          style={[
                            styles.reelFollowButton,
                            effectiveFollowStatus === "approved" && {
                              backgroundColor: "transparent",
                              borderWidth: 1,
                              borderColor: "rgba(255,255,255,0.85)",
                            },
                          ]}
                          onPress={() => {
                            if (effectiveFollowStatus === "none") {
                              handleSendFollowRequest(fromUserId, userId);
                            } else if (effectiveFollowStatus === "approved") {
                              unFollowUser();
                            }
                          }}
                        >
                          <View style={styles.buttonContent}>
                            <Icon
                              name={
                                effectiveFollowStatus === "none"
                                  ? "add"
                                  : "checkmark"
                              }
                              size={isCompact ? 14 : 16}
                              color={
                                effectiveFollowStatus === "approved"
                                  ? "#fff"
                                  : Theme.themeColor
                              }
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              style={[
                                styles.reelFollowButtonText,
                                effectiveFollowStatus === "approved" && {
                                  color: "#fff",
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {effectiveFollowStatus === "none"
                                ? "Follow"
                                : "Following"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.reelCaptionWrap}>
                      {renderReelDescription()}
                      {!!description && (
                        <TouchableOpacity
                          onPress={openDescriptionModal}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Text style={styles.reelReadMore}>
                            {showReelFullDescription
                              ? t("readLess")
                              : t("readMore")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <Modal
                      visible={showReelModal}
                      animationType="slide"
                      transparent={false}
                      onRequestClose={closeDescriptionModal}
                    >
                      <View style={styles.reelDescriptionModalOverlay}>
                        <View style={styles.reelDescriptionModalContent}>
                          <Text
                            style={styles.reelDescriptionModalDescriptionText}
                          >
                            {description}
                          </Text>
                          <TouchableOpacity onPress={closeDescriptionModal}>
                            <Text style={styles.reelDescriptionCloseText}>
                              {t("readLess")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  </View>

                  {/* Right-side social action rail */}
                  <View
                    style={[
                      styles.reelActionButtons,
                      {
                        bottom: Math.max(insets.bottom, 12) + (isCompact ? 96 : 120),
                        right: Math.max(insets.right, isCompact ? 8 : 12),
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={toggleLike}
                      style={styles.reelActionItem}
                      activeOpacity={0.75}
                    >
                      <View style={styles.reelIconHit}>
                        <FontAwesomeIcon
                          key={isLiked}
                          name={isLiked ? "heart" : "heart-o"}
                          size={REEL_ACTION_ICON}
                          color={isLiked ? "#FF2D55" : "#fff"}
                        />
                      </View>
                      <Text style={styles.reelActionCount} numberOfLines={1}>
                        {likeCount}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.reelActionItem}
                      onPress={openCommentsModal}
                      activeOpacity={0.75}
                    >
                      <View style={styles.reelIconHit}>
                        <FontAwesome
                          name="comment"
                          size={REEL_ACTION_ICON}
                          color="#fff"
                        />
                      </View>
                      <Text style={styles.reelActionCount} numberOfLines={1}>
                        {commentCount}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.reelActionItem}
                      onPress={openRepostModal}
                      activeOpacity={0.75}
                    >
                      <View style={styles.reelIconHit}>
                        <Ionicons
                          name="repeat"
                          size={REEL_ACTION_ICON}
                          color="#fff"
                        />
                      </View>
                      <Text style={styles.reelActionCount} numberOfLines={1}>
                        {reposts || 0}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.reelActionItem}
                      onPress={openShareModal}
                      activeOpacity={0.75}
                    >
                      <View style={styles.reelIconHit}>
                        <Ionicons
                          name="paper-plane"
                          size={REEL_ACTION_ICON - 2}
                          color="#fff"
                        />
                      </View>
                      <Text style={styles.reelActionCount} numberOfLines={1}>
                        {tr("share", "Share")}
                      </Text>
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

        {/* Only show image container if there are images and no video */}
        {images && images.length > 0 && !video && (
          <View style={styles.imageContainer}>
            {images.length > 1 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={mediaDimension}
                style={styles.mediaBleed}
                contentContainerStyle={{ paddingHorizontal: 0 }}
              >
                {images.map((image, index) => {
                  const imageUri = `${image}`;
                  return (
                    <TouchableWithoutFeedback
                      key={index}
                      onPress={handleDoubleTap}
                    >
                      <View style={[styles.squareMediaWrapper, mediaWrapperOverride]}>
                        <Image
                          style={styles.squareMedia}
                          source={{ uri: imageUri }}
                          resizeMode="cover"
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </ScrollView>
            ) : (
              <TouchableWithoutFeedback onPress={handleDoubleTap}>
                <View
                  style={[
                    styles.squareMediaWrapper,
                    mediaSize ? mediaWrapperOverride : styles.mediaBleed,
                  ]}
                >
                  <Image
                    style={styles.squareMedia}
                    source={{ uri: `${images[0]}` }}
                    resizeMode="cover"
                  />
                </View>
              </TouchableWithoutFeedback>
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

        {/* For text-only posts (no images, no video), show only the caption section below */}

        {heartVisible && (
          <View style={styles.likeIconContainer}>
            <Icon name="heart" size={50} color="red" style={styles.likeIcon} />
          </View>
        )}

        {/* Caption below media */}
        <View style={styles.captionSection}>
          {renderDescription()}
          {!!description && (
            <TouchableOpacity onPress={toggleDescription} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={styles.readMore}>
                {showFullDescription ? tr("readLess", "Read less") : tr("readMore", "Read more")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Social Info Section */}
        <View style={styles.socialInfo}>
          <View style={styles.likeSection}>
            <View style={styles.heartIconContainer}>
              <FontAwesomeIcon name="heart" size={9} color="#fff" />
            </View>
            <Text style={styles.socialText} numberOfLines={1}>
              {likeCount}
            </Text>
          </View>
          <Text style={[styles.socialText, styles.socialMetaText]} numberOfLines={1}>
            {commentCount} {isCompact ? tr("comments_short", "comments") : tr("comments", "comments")}
            {" · "}
            {reposts} {isCompact ? tr("reposts_short", "reposts") : tr("reposts", "reposts")}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={toggleLike} style={styles.actionItem}>
            <FontAwesomeIcon
              key={isLiked}
              name={isLiked ? "heart" : "heart-o"}
              size={ACTION_ICON}
              color={isLiked ? "#E11D48" : "#374151"}
            />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]} numberOfLines={1}>
              {tr("like", "Like")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openCommentsModal} style={styles.actionItem}>
            <FontAwesomeIcon name="comment-o" size={ACTION_ICON} color="#374151" />
            <Text style={styles.actionText} numberOfLines={1}>
              {tr("comment", "Comment")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openRepostModal} style={styles.actionItem}>
            <FontAwesomeIcon name="retweet" size={ACTION_ICON} color="#374151" />
            <Text style={styles.actionText} numberOfLines={1}>
              {tr("repost", "Repost")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openShareModal} style={styles.actionItem}>
            <FontAwesomeIcon name="paper-plane-o" size={ACTION_ICON - 1} color="#374151" />
            <Text style={styles.actionText} numberOfLines={1}>
              {tr("share", "Share")}
            </Text>
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

        {/* Modal for Comment - Redesigned per mockup */}
        <Modal
          visible={isCommentsModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={closeCommentsModal}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#ECECEC" }}>
              <TouchableOpacity onPress={closeCommentsModal} style={{ padding: 8 }}>
                <Icon name="close" size={20} color="#1A1A1A" />
              </TouchableOpacity>
              <Text style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: "600", color: "#1A1A1A" }}>{t("comments") || "Comments"}</Text>
              {/* Right spacer to center the title */}
              <View style={{ width: 36 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              {/* List */}
              <FlatList
                ref={flatListRef}
                data={comments || []}
                keyExtractor={(item) => item?._id || Math.random().toString()}
                renderItem={renderItem}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 80 }}
                onScrollBeginDrag={closeMenu}
                ListEmptyComponent={
                  !loading ? (
                    <Text style={{ textAlign: "center", marginTop: 20 }}>
                      {t("no_comments_yet")}.
                    </Text>
                  ) : (
                    <ActivityIndicator style={{ marginTop: 32 }} size={"large"} color={Theme?.themeColor || "#B98C13"} />
                  )
                }
              />

              {/* Input bar */}
              <View style={{ flexDirection: "row", alignItems: "center", padding: 8, borderTopWidth: 1, borderTopColor: "#ECECEC", backgroundColor: "#FFF" }}>
                <Image
                  style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                  source={ profileImageUrl && profileImageUrl.trim() !== "" ? { uri: profileImageUrl } : UserImg }
                />
                <View style={{ flex: 1, backgroundColor: "#F2F2F7", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 }}>
                  <TextInput
                    style={{ minHeight: 32 }}
                    value={newCommentText}
                    onChangeText={setNewCommentText}
                    placeholder={(t("say_something_nice") && t("say_something_nice") !== 'say_something_nice') ? t("say_something_nice") : "Say something nice..."}
                  />
                </View>
                <TouchableOpacity onPress={handleAddComment} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: Theme?.themeColor || "#B98C13", fontWeight: "600" }}>{(t("post") && t("post") !== 'post') ? t("post") : "Post"}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>

        {/* Modal for Share */}
        {console.log("Rendering share modal, isShareModalVisible:", isShareModalVisible)}
        {isShareModalVisible && console.log("Share modal should be visible now")}
        <Modal
          transparent={true}
          visible={isShareModalVisible}
          animationType="slide"
          onRequestClose={closeShareModal}
          presentationStyle="overFullScreen"
          statusBarTranslucent={true}
        >
          <TouchableWithoutFeedback onPress={closeShareModal}>
            <View style={styles.shareModalOverlay}>
              <View style={styles.shareModalContainer}>
                <Text style={[styles.modalTitle, { marginBottom: 15, textAlign: "center" }]}>
                  Share with Friends
                </Text>
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
                    placeholder={t("searchFriends") || "Search friends..."}
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
                    ) : shareUsers.length === 0 ? (
                      <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
                        No friends to share with
                      </Text>
                    ) : (
                      <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
                        {shareSearchTerm ? "No friends found" : "No friends to share"}
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
                        `Post shared with ${selectedUsers.length} friend${selectedUsers.length > 1 ? 's' : ''} successfully.`
                      );
                    }}
                  >
                    <Text style={styles.sendButtonText}>
                      {t("send")} to {selectedUsers.length} friend{selectedUsers.length > 1 ? 's' : ''}
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
    backgroundColor: "transparent",
    paddingVertical: isCompact ? 2 : 4,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },

  card: {
    backgroundColor: "#fff",
    paddingLeft: CARD_PAD,
    paddingRight: CARD_PAD,
    paddingBottom: isCompact ? 8 : 10,
    paddingTop: isCompact ? 8 : 10,
    borderRadius: isCompact ? 10 : 14,
    borderWidth: 1,
    borderColor: "#FFE7C2",
    marginHorizontal: isCompact ? 6 : 8,
    marginBottom: isCompact ? 8 : 10,
    overflow: "hidden",
    shadowColor: Theme.themeColor,
    shadowOpacity: isCompact ? 0.1 : 0.14,
    shadowRadius: isCompact ? 6 : 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: isCompact ? 3 : 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: AVATAR_SIZE,
    marginBottom: 6,
  },
  profileImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  headerText: {
    flex: 1,
    marginLeft: isCompact ? 8 : 10,
    marginRight: 6,
    minWidth: 0,
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
    fontSize: isCompact ? 14 : 15,
    fontWeight: "700",
    color: "#111827",
  },
  title: {
    fontSize: 13,
    color: "gray",
  },
  time: {
    fontSize: 12,
    color: "gray",
  },
  moreOptions: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
  followContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    maxWidth: isCompact ? 96 : 110,
    paddingHorizontal: isCompact ? 4 : 6,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  plusIcon: {
    fontSize: isCompact ? 16 : 18,
    color: Theme.themeColor,
    marginRight: 2,
    fontWeight: "bold",
  },
  followText: {
    color: Theme.themeColor,
    fontSize: isCompact ? 13 : 14,
    fontWeight: "700",
  },
  checkIcon: {
    fontSize: isCompact ? 16 : 18,
    color: "grey",
    marginRight: 2,
    fontWeight: "bold",
  },
  followingText: {
    color: "grey",
    fontSize: isCompact ? 13 : 14,
    fontWeight: "700",
  },
  bannerImage: {
    width: "100%",
    aspectRatio: 1,
    padding: 0,
    marginHorizontal: 0,
    marginVertical: 6,
    alignSelf: "center",
    borderRadius: 0,
  },
  imageContainer: {
    width: "100%",
    marginTop: 2,
    marginBottom: 2,
    overflow: "hidden",
  },
  mediaBleed: {
    marginLeft: -CARD_PAD,
    marginRight: -CARD_PAD,
  },
  bannerSingleImage: {
    width: "100%",
    aspectRatio: 1,
    padding: 0,
    marginHorizontal: 0,
    marginVertical: 6,
  },
  squareMediaWrapper: {
    width: windowWidth - (isCompact ? 12 : 16),
    height: windowWidth - (isCompact ? 12 : 16),
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 0,
    backgroundColor: "#000",
  },
  squareMedia: {
    width: "100%",
    height: "100%",
  },
  captionSection: {
    paddingTop: isCompact ? 6 : 8,
    paddingBottom: 2,
  },
  descriptionText: {
    color: "#111827",
    fontSize: isCompact ? 13 : 14,
    lineHeight: isCompact ? 18 : 20,
  },
  readMore: {
    color: "#6B7280",
    fontSize: isCompact ? 12 : 13,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 2,
  },
  socialInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: isCompact ? 6 : 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    gap: 8,
  },
  likeSection: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 5,
  },
  heartIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E11D48",
  },
  likeIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  socialText: {
    fontSize: isCompact ? 12 : 13,
    color: "#6B7280",
  },
  socialMetaText: {
    flexShrink: 1,
    textAlign: "right",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: isCompact ? 6 : 8,
    paddingBottom: 2,
    marginTop: 2,
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isCompact ? 4 : 6,
    minWidth: 0,
  },
  actionText: {
    fontSize: ACTION_FONT,
    color: "#374151",
    marginTop: 3,
    fontWeight: "500",
  },
  actionTextActive: {
    color: "#E11D48",
  },
  likeButton: {
    marginRight: 0,
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
  commentRowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  commentProfileImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#111827",
  },
  commentRole: {
    color: "gray",
    fontSize: 12,
  },
  commentHeaderLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  commentBubble: {
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  commentText: {
    fontSize: 14,
    color: "#111827",
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionLabel: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  viewRepliesLink: {
    marginTop: 4,
  },
  viewRepliesText: {
    fontSize: 12,
    color: Theme?.themeColor || '#B98C13',
    fontWeight: '600',
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 6,
    paddingLeft: 44,
  },
  replyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  replyBubble: {
    backgroundColor: '#F8F8FA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '85%',
  },
  replyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  commentTime: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  replyTime: {
    marginLeft: 6,
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '400',
  },
  replyText: {
    fontSize: 13,
    color: '#111827',
  },
  reactionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  replyInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    height: Dimensions.get("window").width,
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
  muteButton: {
    position: "absolute",
    bottom: isCompact ? 12 : 16,
    right: isCompact ? 12 : 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: isCompact ? 6 : 8,
    zIndex: 2,
    elevation: 2,
  },
  reelModalOverlay: {
    flex: 1,
    backgroundColor: "#000",
  },
  reelModalContent: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  reelBackButton: {
    position: "absolute",
    top: isCompact ? 8 : 12,
    left: isCompact ? 12 : 16,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  reelMuteButton: {
    position: "absolute",
    top: isCompact ? 8 : 12,
    right: isCompact ? 12 : 16,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  reelBottomMeta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
    paddingLeft: isCompact ? 12 : 16,
  },
  reelCaptionWrap: {
    marginTop: 8,
    maxWidth: "100%",
  },
  reelReadMore: {
    color: "rgba(255,255,255,0.9)",
    fontSize: isCompact ? 12 : 13,
    fontWeight: "600",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelActionButtons: {
    position: "absolute",
    zIndex: 20,
    width: REEL_ACTION_RAIL_WIDTH,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  reelActionItem: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isCompact ? 14 : 18,
    width: "100%",
  },
  reelIconHit: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  reelActionCount: {
    color: "#fff",
    fontSize: isCompact ? 11 : 12,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelVideo: {
    width: "100%",
    height: "100%",
  },
  reelProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
  },
  reelProfilePicture: {
    width: isCompact ? 40 : 46,
    height: isCompact ? 40 : 46,
    borderRadius: isCompact ? 20 : 23,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 8,
  },
  reelUsername: {
    color: "#fff",
    fontSize: isCompact ? 14 : 15,
    fontWeight: "700",
    marginRight: 8,
    flexShrink: 1,
    maxWidth: windowWidth * 0.38,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reelFollowButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: isCompact ? 8 : 10,
    paddingVertical: isCompact ? 4 : 5,
    flexShrink: 0,
  },
  reelFollowButtonText: {
    color: Theme.themeColor,
    fontSize: isCompact ? 12 : 13,
    fontWeight: "700",
  },
  reelDescriptionModalOverlay: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  reelDescriptionModalContent: {
    width: "92%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  reelDescriptionCloseButton: {
    position: "absolute",
    top: 0,
    right: 10,
    padding: 5,
  },
  reelDescriptionCloseText: {
    color: "#fff",
    marginVertical: 10,
    fontWeight: "700",
    backgroundColor: "#000",
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 8,
    textAlign: "center",
  },
  reelDescriptionModalDescriptionText: {
    color: "#111",
    fontSize: 16,
    lineHeight: 22,
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
    paddingLeft: 2,
    paddingVertical: 4,
    paddingRight: 2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
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
