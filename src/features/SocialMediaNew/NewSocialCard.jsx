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
} from "react-native";
import Theme from "../../styles/theme";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { useSelector } from "react-redux";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";
import {
  BASEIMGURL,
  BASEAPIURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import UserImg from "../../assets/images/general/user.png";

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
  ActivityIndicator,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Determine if photoUri is an array of images or a single image

  const images = Array.isArray(postImages) ? postImages : [postImages];
  console.log("images of posts", images);

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
  const fromUserId = user?.roleData?.owner;
  const [newCommentText, setNewCommentText] = useState("");
  const [commentsToShow, setCommentsToShow] = useState(10);

  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isRequestSent, setIsRequestSent] = useState(false);

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

  const handleDeletePost = async () => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/social/post/delete/${post._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      Alert.alert(
        "Success",
        "Post deleted successfully",
        [
          {
            text: "OK",
            onPress: () => {
              fetchPosts();
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  const [isFollowing, setIsFollowing] = useState(false);

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
      text: "Well said Prafful Garg! In today’s fast-paced world, prioritizing relationships and health is more crucial...",
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

  const [isCommentsModalVisible, setCommentsModalVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [menuVisibleId, setMenuVisibleId] = useState(null);
  const [isRepostModalVisible, setRepostModalVisible] = useState(false);
  const [isPostModalVisible, setPostModalVisible] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;

  const toggleMenu = (id) => {
    setMenuVisibleId(menuVisibleId === id ? null : id);
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

  const closePostModal = () => {
    setPostModalVisible(false);
    pan.setValue({ x: 0, y: 0 });
  };

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(
          `${BASEAPIURL}/social/post/like-status/${post._id}`,
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
          setIsLiked(data.isLiked);
        } else {
          const errorData = await response.json();
          console.error("Error fetching like status:", errorData.message);
        }
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };

    fetchLikeStatus();
  }, [post._id]);

  const toggleLike = async () => {
    const url = `${BASEAPIURL}/social/post/${isLiked ? "unlike" : "like"}/${
      post._id
    }`;
    const method = "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: fromUserId,
          postId: post._id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikeCount(data.likesCount);
        setIsLiked(!isLiked);
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData.message);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const fetchComments = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${BASEAPIURL}/social/post/comments/${post._id}/10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        console.log("Fetched comments data: ", data);
      } else {
        console.error("Failed to fetch comments:", response.status);
      }
    } catch (error) {
      console.error("Error fetching comments:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post._id]);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const response = await fetch(
        `${BASEAPIURL}/social/post/comment/${post._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newCommentText }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setNewCommentText("");
        fetchComments();
      } else {
        const errorData = await response.json();
        console.error("Error adding comment:", errorData.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/social/post/comment/${post._id}/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        fetchComments();
      } else {
        const errorData = await response.json();
        console.error("Error deleting comment:", errorData.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error.message);
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

  const openPostModal = () => {
    setPostModalVisible(true);
  };

  const PostModal = () => {
    setPostModalVisible(true);
  };

  const closeCommentsModal = () => {
    setCommentsModalVisible(false);
  };

  const flatListRef = useRef(null);

  const openShareModal = () => {
    setShareModalVisible(true);
  };

  const closeShareModal = () => {
    setShareModalVisible(false);
  };

  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleSelection = (user) => {
    if (selectedUsers.includes(user.name)) {
      setSelectedUsers(selectedUsers.filter((name) => name !== user.name));
    } else {
      setSelectedUsers([...selectedUsers, user.name]);
    }
  };

  const renderShareOption = ({ item }) => {
    const isSelected = selectedUsers.includes(item.name);

    return (
      <TouchableOpacity
        style={styles.shareItem}
        onPress={() => toggleSelection(item)}
      >
        <Image
          source={{ uri: item.imageUri }}
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
        <Text style={styles.shareText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };



  const renderItem = ({ item }) => {
    const imageUri = item?.userId?.image
      ? `${item.userId?.image}`
      : UserImg;

    const isCommentOwner = item?.userId?._id === fromUserId;

    return (
      <View style={styles.commentItem}>
        {/* <Image source={{ uri: imageUri }} style={styles.commentProfileImage} /> */}
        <Image
          source={typeof imageUri === "string" ? { uri: imageUri } : imageUri}
          style={styles.commentProfileImage}
        />
        <View style={styles.commentContent}>
          <Text style={styles.commentName}>
            {item.userId.firstName} {item.userId.lastName}
          </Text>
          <Text style={styles.commentRole}>
            Sales Enthusiast | Ex-intern at Younity.in
          </Text>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>

        {isCommentOwner && (
          <>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => toggleMenu(item?._id)}
            >
              <Text style={styles.menuText}>⋮</Text>
            </TouchableOpacity>

            {menuVisibleId === item._id && (
              <View style={styles.menuOptions}>
                <TouchableOpacity
                  onPress={() => handleDeleteComment(item._id)}
                  style={styles.deleteOption}
                >
                  <Icon name="trash" size={18} color="red" />
                  <Text style={styles.menuOptionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
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
              onPress={() =>
                navigation.navigate("EachProfile", { 
                  userId: userId,
                })
              }
            >
              <Text style={styles.name}>
                {firstName} {lastName}
              </Text>
            </TouchableOpacity>
            <Text style={styles.title}>Software Engineer</Text>
            {/* <Text style={styles.time}>1w • Edited</Text> */}
          </View>

          {source === "SocialHomeScreen" || source === "EachProfile" ? (
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
            <TouchableOpacity
              style={styles.followContainer}
              onPress={openPostModal}
            >
              <Text style={styles.moreOptions}>...</Text>
            </TouchableOpacity>
          )}
        </View>

        {renderDescription()}
        <TouchableOpacity onPress={toggleDescription}>
          <Text style={styles.readMore}>
            {showFullDescription ? "Read Less" : "Read More"}
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
                    <TouchableOpacity style={styles.reelFollowButton}>
                      {/* <Text style={styles.reelFollowButtonText}>Follow</Text> */}
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
                          <Text
                            style={
                              isFollowing
                                ? styles.reelFollowButtonText
                                : styles.reelFollowButtonText
                            }
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </TouchableOpacity>
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
                        {showReelFullDescription ? "Read Less" : "Read More"}
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
                                ? "Read More"
                                : "Read Less"}
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
                      {post.comments.length}
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
        {/* <Image style={styles.bannerImage} source={photoUri} /> */}
        {images && images.length > 0 && (
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
            {post.comments.length} comments • {reposts} reposts
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
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openCommentsModal}>
            <FontAwesomeIcon
              name="comment-o"
              size={24}
              marginLeft={10}
              color="black"
            />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openRepostModal}>
            <FontAwesomeIcon name="retweet" size={24} marginLeft={10} />
            <Text style={styles.actionText}>Repost</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openShareModal}>
            <FontAwesomeIcon
              name="paper-plane-o"
              size={22}
              marginLeft={10}
              color="#000"
            />
            <Text style={styles.actionText}>Send</Text>
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
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
            >
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
                  <Text style={styles.title}>"Software Engineer"</Text>
                  {/* <Text style={styles.time}>1w • Edited</Text> */}
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
              )}
              <View style={styles.commentPostContent}>
                <Text style={styles.commentModalDescription}>
                  {description}
                </Text>
              </View>

              {loadingAnimation === true ? (
                <ActivityIndicator
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  size={"large"}
                  color={"#b98c13"}
                />
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={comments}
                  keyExtractor={(item) => item._id}
                  renderItem={renderItem}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 60 }}
                  ListEmptyComponent={
                    !loading && (
                      <Text style={{ textAlign: "center", marginTop: 20 }}>
                        No comments yet.
                      </Text>
                    )
                  }
                />
              )}
            </ScrollView>

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
                <Text style={styles.sendButtonText}>Send</Text>
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
                  <SearchField placeholder="Search" />
                </View>
                <FlatList
                  data={[
                    {
                      imageUri:
                        "https://media.istockphoto.com/id/2026162051/photo/portrait-of-a-young-latin-female-student-using-laptop-on-the-bench-on-campus.webp?a=1&b=1&s=612x612&w=0&k=20&c=DPqe5WZ7zuP7ndh-WwnVjNRBXP50Bgptn_wvGUP8zjE=",
                      name: "Pragya",
                    },
                    {
                      imageUri:
                        "https://images.unsplash.com/photo-1632923946112-637c9167403f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWFsZSUyMGZlbWFsZXxlbnwwfHwwfHx8MA%3D%3D",
                      name: "Abhi",
                    },
                    {
                      imageUri:
                        "https://media.istockphoto.com/id/1352888268/photo/close-up-portrait-of-japanese-mature-businessman-in-the-office.webp?a=1&b=1&s=612x612&w=0&k=20&c=kOUOoguCfhNuSwcUUc77oX5L0LzbjP87lGes2Txrw8k=",
                      name: "Yukta Chopra",
                    },
                    {
                      imageUri:
                        "https://plus.unsplash.com/premium_photo-1708271595672-57b4a6a2d3cd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHdvbWFufGVufDB8fDB8fHww",
                      name: "Tisha",
                    },
                    {
                      imageUri:
                        "https://media.istockphoto.com/id/1413765604/photo/successful-mid-adult-business-man-looking-away.jpg?s=612x612&w=0&k=20&c=XClX9oiRN6gcqOQLIgcqkcdLzhhqPW1uSSMjUB3hc7Q=",
                      name: "Karan Nanda",
                    },
                    {
                      imageUri:
                        "https://media.istockphoto.com/id/2029600847/photo/confident-indian-businessman-smiling-in-modern-office-environment.jpg?s=612x612&w=0&k=20&c=2zze6qilDV8yw4-neMq_ksh94yAFm_j1ISBnW--WmMg=",
                      name: "Sumit Tiwari",
                    },
                  ]}
                  renderItem={renderShareOption}
                  keyExtractor={(item, index) => index.toString()}
                  numColumns={3}
                  contentContainerStyle={styles.flatListContent}
                />

                {selectedUsers.length > 0 && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                      closeShareModal();
                      Alert.alert("Sent", "Post has been sent successfully.");
                    }}
                  >
                    <Text style={styles.sendButtonText}>Send</Text>
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
                      post: sampleData,
                      userId: userId,
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
                      Repost with your thoughts
                    </Text>
                  </View>

                  <Text style={styles.modalSubText}>
                    Create a new post with this post attached
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={closeRepostModal}
                >
                  <View style={styles.iconTextContainer}>
                    <FontAwesomeIcon
                      name="retweet"
                      size={24}
                      style={styles.icon}
                    />
                    <Text style={styles.modalText}>Repost</Text>
                  </View>

                  <Text style={styles.modalSubText}>
                    Instantly bring this post to other's feed
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          transparent={true}
          visible={isPostModalVisible}
          animationType="slide"
          onRequestClose={closePostModal}
        >
          <TouchableWithoutFeedback onPress={closePostModal}>
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
                    navigation.navigate("EditPost", {
                      postId: postId,
                      fetchPosts: fetchPosts,
                      posts: posts,
                      post: post,
                      description: description,
                    });
                  }}
                >
                  <View style={styles.iconTextContainer}>
                    <FontAwesomeIcon
                      name="pencil-square-o"
                      size={24}
                      style={styles.icon}
                    />
                    <Text style={styles.modalText}>Edit Post</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleDeletePost}
                >
                  <View style={styles.iconTextContainer}>
                    <FontAwesomeIcon
                      name="trash"
                      size={24}
                      style={styles.postIcon}
                    />
                    <Text style={styles.modalPostText}>Delete</Text>
                  </View>
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
    alignItems: "center",
    paddingVertical: 8,
  },
  commentProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    // marginRight: 10,
  },
  commentText: {
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    // borderColor: "#ddd",
    paddingVertical: 10,
    borderColor: "#ccc",
    backgroundColor: "white",
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },

  commentItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  commentProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  menuButton: { padding: 5, marginLeft: 10 },
  menuText: { fontSize: 20 },
  // menuOptions: {
  //   position: "absolute",
  //   top: 30,
  //   right: 10,
  //   backgroundColor: "white",
  //   borderRadius: 5,
  //   padding: 5,
  //   shadowColor: "#000",
  //   shadowOpacity: 0.2,
  //   shadowOffset: { width: 1, height: 1 },
  // },
  // menuOptionText: { padding: 5 },
  menuOptions: {
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    position: "absolute",
    top: 30,
    right: 10,
    zIndex: 1,
  },
  deleteOption: {
    flexDirection: "row", // Align icon and text in a row
    alignItems: "center", // Center vertically
    paddingVertical: 5,
  },
  menuOptionText: {
    marginLeft: 5, // Add space between icon and text
    fontSize: 14,
    color: "red",
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
});

export default NewSocialCard;
