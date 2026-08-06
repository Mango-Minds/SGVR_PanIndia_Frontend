import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
// Helper to get token
const getToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Unauthorized");
  return token;
};

// Submit/Create a new job
export const submitNewJob = async (jobData) => {
  const token = await getToken();
  const response = await apiClient.post("/social/job/create", jobData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const submitNewPost = async (description, list, hashtags = []) => {
  try {
    const token = await getToken();
    console.log("Token obtained:", token ? "Yes" : "No");

    const formData = new FormData();
    formData.append("content", description);
    console.log("Description appended:", description);

    // Check if there's any media to upload
    if (list && list.length > 0) {
      console.log("Processing media list with", list.length, "items");
      // Handle both DocumentPicker and ImagePicker formats
      const firstItem = list[0];
      const isImage = firstItem.type === "image" || firstItem.mimeType?.startsWith("image");
      const isVideo = firstItem.type === "video" || firstItem.mimeType?.startsWith("video");

      console.log("First item type:", firstItem.type);
      console.log("First item mimeType:", firstItem.mimeType);
      console.log("Is image:", isImage);
      console.log("Is video:", isVideo);

      if (isImage) {
        formData.append("type", "text+image");
        list.forEach((image, index) => {
          const mediaItem = {
            uri: image.uri,
            name: image.name,
            type: image.mimeType || (image.type === "image" ? "image/jpeg" : "video/mp4"),
          };
          formData.append("images", mediaItem);
          console.log(`Appended image ${index}:`, mediaItem);
        });
      } else if (isVideo) {
        formData.append("type", "text+video");
        const videoItem = {
          uri: list[0].uri,
          name: list[0].name,
          type: list[0].mimeType || "video/mp4",
        };
        formData.append("video", videoItem);
        console.log("Appended video:", videoItem);
      }
    } else {
      // Text-only post
      formData.append("type", "text");
      console.log("Text-only post, type set to 'text'");
    }

    // Append hashtags (array) for backend parsing
    if (Array.isArray(hashtags) && hashtags.length > 0) {
      hashtags.forEach((tag) => {
        if (typeof tag === 'string' && tag.trim()) {
          formData.append('hashtags', tag.trim());
        }
      });
    }

    console.log("FormData prepared, making API call...");
    // Note: Don't set Content-Type header - axios interceptor will set it automatically with boundary
    // Authorization is already handled by the interceptor, but including it here for clarity
    const response = await apiClient.post("/social/post/create", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API response received:", response.status);
    return response;
  } catch (error) {
    console.error("Error in submitNewPost:", error);
    console.error("Error response:", error.response?.data);
    throw error;
  }
};

// Moments API
export const uploadMoment = async (caption, media) => {
  const token = await getToken();
  const formData = new FormData();
  if (caption) formData.append("caption", caption);
  formData.append("media", {
    uri: media.uri,
    name: media.name,
    type: media.mimeType || (media.type === "image" ? "image/jpeg" : "video/mp4"),
  });
  return apiClient.post("/social/moments/create", formData, {
    headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
  });
};

export const getMyMoments = async () => {
  const token = await getToken();
  return apiClient.get("/social/moments/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteMoment = async (momentId) => {
  const token = await getToken();
  return apiClient.delete(`/social/moments/delete/${momentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getVisibleMoments = async () => {
  const token = await getToken();
  return apiClient.get(`/social/moments/visible`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Fetch follow status
export const fetchFollowStatusAPI = async (userId) => {
  try {
    const token = await getToken();
    const response = await apiClient.get(
      `/social/check-follow-status/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      console.log("response.data: ", response.data);
      return response;
    } else {
      console.error("Failed to fetch follow status");
      throw new Error("Failed to fetch follow status");
    }
  } catch (error) {
    console.error("Error fetching follow status:", error);
    throw error;
  }
};

// Fetch user posts
// export const fetchPostsAPI = async (userId, setUserPosts) => {
//   try {
//     const token = await getToken();
//     const response = await apiClient.get(`/social/post/user/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.status === 200) {
//       setUserPosts(response.data);
//     } else {
//       throw new Error("Network response was not ok");
//     }
//   } catch (err) {
//     console.error("Error fetching posts:", err);
//   }
// };

export const fetchPostsAPI = async (userId, setUserPosts, options = {}) => {
  try {
    const token = await getToken();
    const selectedLanguage =
      (await AsyncStorage.getItem("user-language")) || "en";
    const { limit = 10, page = 1 } = options;

    const response = await apiClient.get(
      `/social/post/user/${userId}?limit=${limit}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      const postsData = response.data;

      // If language is not English, translate the posts
      if (selectedLanguage !== "en" && Array.isArray(postsData.posts)) {
        const translationResponse = await apiClient.post("/translate", {
          data: postsData.posts, // Only pass the posts
          targetLang: selectedLanguage,
        });

        if (translationResponse?.data?.translatedData?.length) {
          setUserPosts({
            ...postsData,
            posts: translationResponse.data.translatedData,
          });
        } else {
          setUserPosts(postsData);
        }
      } else {
        setUserPosts(postsData);
      }
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (err) {
    console.error("Error fetching posts:", err);
    // Set empty posts array to prevent UI errors
    setUserPosts({ posts: [], message: 'No posts found' });
  }
};

// Fetch user profile
// export const fetchProfileAPI = async (userId, setProfile, setLoading) => {
//   try {
//     const token = await getToken();
//     const response = await apiClient.get(`/user/profile/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (response.status === 200) {
//       setProfile(response.data);
//     } else {
//       throw new Error("Network response was not ok");
//     }
//   } catch (err) {
//     console.error("Error fetching profile:", err);
//   } finally {
//     setLoading(false);
//   }
// };

export const fetchProfileAPI = async (userId, setProfile, setLoading) => {
  try {
    const token = await getToken();
    const selectedLanguage =
      (await AsyncStorage.getItem("user-language")) || "en";

    const response = await apiClient.get(`/user/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const profileData = response.data;

      console.log("ProfileData: ", profileData);
      
      // Translate only if selectedLanguage is not English
      if (selectedLanguage !== "en") {
        const translationResponse = await apiClient.post("/translate", {
          data: [profileData],
          targetLang: selectedLanguage,
        });

        if (translationResponse?.data?.translatedData?.length > 0) {
          setProfile(translationResponse.data.translatedData[0]);
        } else {
          setProfile(profileData); // fallback if translation fails
        }
      } else {
        setProfile(profileData); // English — no translation needed
      }
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
  } finally {
    setLoading(false);
  }
};


export const fetchUserProfileAPI = async (userId, setLoadingAnimation, setUserProfile) => {
  try {
    setLoadingAnimation(true);
    const token = await getToken();
    const selectedLanguage =
      (await AsyncStorage.getItem("user-language")) || "en";

    const response = await apiClient.get(`/user/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const profileData = response.data;
console.log("ProfileData: ", profileData);
      // Translate only if selectedLanguage is not English
      if (selectedLanguage !== "en") {
        const translationResponse = await apiClient.post("/translate", {
          data: [profileData],
          targetLang: selectedLanguage,
        });

        if (translationResponse?.data?.translatedData?.length > 0) {
          setUserProfile(translationResponse.data.translatedData[0]);
        } else {
          setUserProfile(profileData); // fallback if translation fails
        }
      } else {
        setUserProfile(profileData); // English — no translation needed
      }
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
  } finally {
    setLoadingAnimation(false);
  }
};




export const followUserAPI = async (
  fromUserId,
  toUserId,
  setFollowStatus
) => {
  try {
    // Validate inputs
    if (!toUserId) {
      console.error('followUserAPI: toUserId is required');
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    if (!fromUserId) {
      console.error('followUserAPI: fromUserId is required');
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    console.log('followUserAPI called with:', { fromUserId, toUserId });

    const token = await getToken();
    const response = await apiClient.post(
      `social/follow/${toUserId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("response of following user", response);

    // Axios throws on non-2xx status, so if you're here, it's successful
    if (response.status === 200) {
      setFollowStatus("approved");
      Alert.alert("Success", "User followed successfully.");
    }
  } catch (error) {
    console.error("Error following user:", error);

    if (error.response) {
      const message = error.response.data.message;
      if (message === "You are already following this user.") {
        setFollowStatus("approved");
        Alert.alert("Already Following", message);
      } else {
        Alert.alert("Error", message || "Failed to follow user.");
        // Don't update follow status on error
        return;
      }
    } else {
      Alert.alert("Error", "An unexpected error occurred.");
      // Don't update follow status on error
      return;
    }
  }
};

// Legacy function for backward compatibility (now uses direct follow)
export const sendFollowRequestAPI = async (
  fromUserId,
  toUserId,
  setFollowStatus
) => {
  // Use the new direct follow API instead
  return followUserAPI(fromUserId, toUserId, setFollowStatus);
};

// Unfollow user
export const unfollowUserAPI = async (toUserId) => {
  try {
    const token = await getToken();
    const response = await apiClient.patch(
      `/social/unfollow/${toUserId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
};

export const fetchAllPosts = (page = 1, limit = 10, search = '', hashtagsCsv = '', media = '') => {
  const searchParam = search && search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
  const tagsParam = hashtagsCsv && hashtagsCsv.trim() ? `&hashtags=${encodeURIComponent(hashtagsCsv.trim())}` : '';
  const mediaParam = media && media.trim() ? `&media=${encodeURIComponent(media.trim())}` : '';
  return apiClient.get(`/social/post/all?page=${page}&limit=${limit}${searchParam}${tagsParam}${mediaParam}`);
};

export const getPopularHashtags = (limit = 20) => {
  return apiClient.get(`/social/post/hashtags/popular?limit=${limit}`);
};

export const searchHashtags = (q, limit = 20) => {
  const query = (q || '').trim();
  if (!query) return Promise.resolve({ data: { tags: [] } });
  return apiClient.get(`/social/post/hashtags/search?q=${encodeURIComponent(query)}&limit=${limit}`);
};

// Legacy function - use followUserAPI instead
export const sendFollowRequest = (toUserId) => {
  console.warn('sendFollowRequest is deprecated. Use followUserAPI instead.');
  return apiClient.post(`/social/follow/${toUserId}`);
};

export const getFollowStatus = (userId) => {
  return apiClient.get(`/social/check-follow-status/${userId}`);
};

export const deletePost = (postId) => {
  return apiClient.delete(`/social/post/delete/${postId}`);
};

export const getLikeStatus = (postId) => {
  return apiClient.get(`/social/post/like-status/${postId}`);
};

export const toggleLikeOnPost = ({ postId, userId, isLiked }) => {
  return apiClient.post(
    `/social/post/${isLiked ? "unlike" : "like"}/${postId}`
    // Remove the request body since the backend gets userId from the JWT token
  );
};

export const getComments = (postId) => {
  return apiClient.get(`/social/post/comments/${postId}/10`);
};

export const addComment = (postId, content) => {
  return apiClient.post(`/social/post/comment/${postId}`, { content });
};

export const deleteComment = (postId, commentId) => {
  return apiClient.delete(`/social/post/comment/${postId}/${commentId}`);
};

export const likeComment = (postId, commentId) => {
  return apiClient.post(`/social/post/comment/like/${postId}/${commentId}`);
};

export const unlikeComment = (postId, commentId) => {
  return apiClient.post(`/social/post/comment/unlike/${postId}/${commentId}`);
};

export const replyToComment = (postId, commentId, content) => {
  return apiClient.post(`/social/post/comment/reply/${postId}/${commentId}`, { content });
};

export const deleteReply = (postId, commentId, replyId) => {
  return apiClient.delete(`/social/post/comment/reply/${postId}/${commentId}/${replyId}`);
};

export const reportPostApi = (postId, reason) => {
  return apiClient.post(`/social/post/report-post/${postId}`, { reason });
};

export const getGeneralNotifications = () => {
  return apiClient.get("/notifications/");
};

export const getPostCommentNotifications = () => {
  return apiClient.get("/postCommentNotification/");
};

export const getUserProfile = (userId) => {
  return apiClient.get(`/user/profile/${userId}`);
};

// Fetch basic user info
export const getUser = (userId) => {
  return apiClient.get(`/user/${userId}`);
};

// Fetch all jobs (paginated + optional search)
export const getAllJobs = (page, query = "") => {
  return apiClient.get(`/social/job/all?page=${page}&limit=10&search=${query}`);
};

// Fetch jobs by user (paginated + optional search)
export const getUserJobs = (userId, page, query = "") => {
  return apiClient.get(
    `/social/job/all/${userId}?page=${page}&limit=10&search=${query}`
  );
};

// Fetch applied jobs (paginated + optional search)
export const getAppliedJobs = (userId, page, query = "") => {
  return apiClient.get(
    `/social/job/applied/${userId}?page=${page}&limit=10&search=${query}`
  );
};

// Delete a job
export const deleteJobById = (jobId) => {
  return apiClient.delete(`/social/job/delete/${jobId}`);
};

// Get all incoming connection requests
export const getListRequests = () => {
  return apiClient.get("/social/list-requests");
};

// Get all sent connection requests
export const getSentRequests = () => {
  return apiClient.get("/social/sent-requests");
};

// Accept or reject a connection request
export const updateRequestStatus = (requestId, status) => {
  return apiClient.patch(`/social/update-request/${requestId}`, { status });
};

// Withdraw a sent connection request
export const cancelRequest = (toUserId) => {
  return apiClient.delete(`/social/cancel-request/${toUserId}`);
};

// Update job application status (approve/reject/etc.)
export const updateApplicationStatus = (jobId, applicantId, status) => {
  return apiClient.put(`/social/job/applicant/${jobId}/${applicantId}`, {
    status,
  });
};

// Fetch followers for a user
export const getFollowers = (userId, page = 1, query = "") => {
  return apiClient.get(
    `/social/${userId}/followers?page=${page}&limit=10&${query}`
  );
};

// Fetch following for a user
export const getFollowing = (userId, page = 1, query = "") => {
  return apiClient.get(
    `/social/${userId}/following?page=${page}&limit=10&${query}`
  );
};

// Fetch users (unfollowed users only)
export const getUsers = () => {
  return apiClient.get(`/social/unfollowed-users`);
};

// Mark notification as read
export const markNotificationAsRead = (notificationId) => {
  return apiClient.patch(`/notifications/${notificationId}/markAsRead`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = () => {
  return apiClient.patch("/notifications/markAllAsRead");
};

// Delete a notification
export const deleteNotification = (notificationId) => {
  return apiClient.delete(`/notifications/${notificationId}`);
};

// Delete all notifications
export const deleteAllNotifications = () => {
  return apiClient.delete("/notifications/deleteAll");
};

// Get notification count
export const getNotificationCount = () => {
  return apiClient.get("/notifications/count");
};

// Follow user directly (without request)
export const followUser = (userId) => {
  return apiClient.post(`/social/follow/${userId}`);
};

// Unfollow user (renamed to avoid conflict)
export const unfollowUserSimple = (userId) => {
  return apiClient.patch(`/social/unfollow/${userId}`);
};

// Check if user is following another user
export const checkFollowStatus = (userId) => {
  return apiClient.get(`/social/check-follow-status/${userId}`);
};

// Get user's follow statistics
export const getFollowStats = (userId) => {
  return apiClient.get(`/social/follow-stats/${userId}`);
};

// Get mutual connections
export const getMutualConnections = (userId) => {
  return apiClient.get(`/social/mutual-connections/${userId}`);
};

// ========== FRIEND REQUEST SYSTEM ==========

// Send a friend request
export const sendFriendRequest = (toUserId) => {
  return apiClient.post(`/social/send-friend-request/${toUserId}`);
};

// Get incoming friend requests
export const getFriendRequests = () => {
  return apiClient.get("/social/list-friend-requests");
};

// Get sent friend requests
export const getSentFriendRequests = () => {
  return apiClient.get("/social/sent-friend-requests");
};

// Accept or reject a friend request
export const updateFriendRequestStatus = (requestId, status) => {
  return apiClient.patch(`/social/update-friend-request/${requestId}`, { status });
};

// Cancel a sent friend request
export const cancelFriendRequest = (toUserId) => {
  return apiClient.delete(`/social/cancel-friend-request/${toUserId}`);
};

// Remove a friend
export const removeFriend = (toUserId) => {
  return apiClient.patch(`/social/remove-friend/${toUserId}`);
};

// Get user's friends list
export const getUserFriends = (userId) => {
  return apiClient.get(`/social/${userId}/friends`);
};

// Check friend status between two users
export const checkFriendStatus = (userId) => {
  return apiClient.get(`/social/check-friend-status/${userId}`);
};

// Get all users who are not friends with the current user
export const getNonFriends = () => {
  return apiClient.get("/social/non-friends");
};

// Block user
export const blockUser = (userId) => {
  return apiClient.post(`/social/block/${userId}`);
};

// Unblock user
export const unblockUser = (userId) => {
  return apiClient.patch(`/social/unblock/${userId}`);
};

// Get blocked users
export const getBlockedUsers = () => {
  return apiClient.get("/social/blocked-users");
};

// Report user
export const reportUser = (userId, reason) => {
  return apiClient.post(`/social/report/${userId}`, { reason });
};

// Get user suggestions (people you may know)
export const getUserSuggestions = (page = 1, limit = 10) => {
  return apiClient.get(`/social/suggestions?page=${page}&limit=${limit}`);
};

// export const updateUserAboutEducationDetails = async ({
//   about,
//   education,
//   jobExperience,

//   dispatch,
//   setLoadingInBtn,
//   fetchUserProfile,
//   navigation,
//   t
// }) => {
//   try {
//     let token = await AsyncStorage.getItem("token");

//     if (!token) {
//       console.error("Bearer token not found");
//       Alert.alert(t("error"), t("auth_token_missing"));

//       return;
//     }

//     let formData = new FormData();
//     formData.append("about", about);
//     formData.append("education", JSON.stringify(education));
//     formData.append("jobExperience", JSON.stringify(jobExperience));

//     await dispatch(setLoadingInBtn(true));

//     // Set loading state true

//     const fullUrl = `/user/update-follow-data`;

//     const response = await apiClient.patch(fullUrl, formData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     // Set loading state false
//     await dispatch(setLoadingInBtn(false));

//     console.log("API Response:", response.data);

    
//     Alert.alert(t("success"), t("info_updated_successfully"));


//     fetchUserProfile();
//     navigation.goBack();
//   } catch (error) {
//     console.error("Error updating user:", error);
//     // Alert.alert("Error", "Failed to update user information.");
//     Alert.alert(t("error"), t("failed_to_update_user_info"));

//     await dispatch(setLoadingInBtn(false));
//   }
// };





export const updateUserAboutEducationDetails = async ({
  about,
  education,
  jobExperience,
  isOrganization,
  organizationDetails,
  dispatch,
  setLoadingInBtn,
  fetchUserProfile,
  navigation,
  t,
}) => {
  // Set a timeout to prevent loading state from getting stuck
  const timeoutId = setTimeout(async () => {
    await dispatch(setLoadingInBtn(false));
    Alert.alert(t("error"), t("requestTimeout"));
  }, 30000); // 30 seconds timeout

  try {
    const token = await AsyncStorage.getItem("token");
    const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

    if (!token) {
      console.error("Bearer token not found");
      clearTimeout(timeoutId);
      Alert.alert(t("error"), t("auth_token_missing"));
      return;
    }

    let formData = new FormData();
    formData.append("about", about);
    formData.append("isOrganization", String(isOrganization));
    if (isOrganization) {
      formData.append("organizationDetails", JSON.stringify(organizationDetails));
      formData.append("education", JSON.stringify([]));
      formData.append("jobExperience", JSON.stringify([]));
    } else {
      formData.append("education", JSON.stringify(education));
      formData.append("jobExperience", JSON.stringify(jobExperience));
    }

    await dispatch(setLoadingInBtn(true));

    const fullUrl = `/user/update-follow-data`;

    const response = await apiClient.patch(fullUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("API Response:", response.data);

    // Clear timeout and loading state
    clearTimeout(timeoutId);
    await dispatch(setLoadingInBtn(false));

    try {
      // Corrected: send data as an array with a text field to match backend expectation
      const translateResponse = await apiClient.post("/translate", {
        data: [{ text: "Information Updated Successfully" }],
        targetLang: selectedLanguage,
      });

      const translated =
        translateResponse.data?.translatedData?.[0]?.text || t("info_updated_successfully");

      Alert.alert(t("success"), translated);
    } catch (translationError) {
      console.error("Translation error:", translationError);
      Alert.alert(t("success"), t("info_updated_successfully"));
    }

    if (fetchUserProfile) {
      await fetchUserProfile();
    }
    navigation.goBack();
  } catch (error) {
    console.error("Error updating user:", error);

    // Clear timeout and loading state
    clearTimeout(timeoutId);
    await dispatch(setLoadingInBtn(false));

    try {
      const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

      const translateErrorResponse = await apiClient.post("/translate", {
        data: [{ text: "Failed to update user information." }],
        targetLang: selectedLanguage,
      });

      const errorMessage =
        translateErrorResponse.data?.translatedData?.[0]?.text || t("failed_to_update_user_info");

      Alert.alert(t("error"), errorMessage);
    } catch (translationError) {
      console.error("Translation error:", translationError);
      Alert.alert(t("error"), t("failed_to_update_user_info"));
    }
  }
};

// New function to update banner image
export const updateUserBannerImage = async ({
  bannerImage,
  dispatch,
  setLoadingInBtn,
  fetchUserProfile,
  navigation,
  t,
}) => {
  // Set a timeout to prevent loading state from getting stuck
  const timeoutId = setTimeout(async () => {
    await dispatch(setLoadingInBtn(false));
    Alert.alert(t("error"), t("requestTimeout"));
  }, 30000); // 30 seconds timeout

  try {
    const token = await AsyncStorage.getItem("token");
    const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

    if (!token) {
      console.error("Bearer token not found");
      clearTimeout(timeoutId);
      Alert.alert(t("error"), t("auth_token_missing"));
      return;
    }

    let formData = new FormData();

    if (bannerImage && bannerImage.uri) {
      const localUri = bannerImage.uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("bannerImage", {
        uri: localUri,
        name: filename,
        type,
      });
    }

    await dispatch(setLoadingInBtn(true));

    const fullUrl = `/user/update-follow-data`;

    const response = await apiClient.patch(fullUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("API Response:", response.data);

    // Clear timeout and loading state
    clearTimeout(timeoutId);
    await dispatch(setLoadingInBtn(false));

    try {
      // Corrected: send data as an array with a text field to match backend expectation
      const translateResponse = await apiClient.post("/translate", {
        data: [{ text: "Banner image updated successfully" }],
        targetLang: selectedLanguage,
      });

      const translated =
        translateResponse.data?.translatedData?.[0]?.text || t("banner_updated_successfully");

      Alert.alert(t("success"), translated);
    } catch (translationError) {
      console.error("Translation error:", translationError);
      Alert.alert(t("success"), t("banner_updated_successfully"));
    }

    fetchUserProfile();
    navigation.goBack();
  } catch (error) {
    console.error("Error updating banner image:", error);

    // Clear timeout and loading state
    clearTimeout(timeoutId);
    await dispatch(setLoadingInBtn(false));

    try {
      const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

      const translateErrorResponse = await apiClient.post("/translate", {
        data: [{ text: "Failed to update banner image." }],
        targetLang: selectedLanguage,
      });

      const errorMessage =
        translateErrorResponse.data?.translatedData?.[0]?.text || t("failed_to_update_banner");

      Alert.alert(t("error"), errorMessage);
    } catch (translationError) {
      console.error("Translation error:", translationError);
      Alert.alert(t("error"), t("failed_to_update_banner"));
    }
  }
};


// import apiClient from "../../store/apiClient";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Helper to get token
// const getToken = async () => {
//   const token = await AsyncStorage.getItem("token");
//   if (!token) throw new Error("Unauthorized");
//   return token;
// };

// // Submit/Create a new job
// export const submitNewJob = async (jobData) => {
//   const token = await getToken();
//   const response = await apiClient.post("/social/job/create", jobData, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response;
// };

// export const submitNewPost = async (description, list) => {
//     const token = await getToken();

//     const formData = new FormData();
//     formData.append("content", description);

//     if (list[0].mimeType.startsWith("image")) {
//       formData.append("type", "text+image");
//       list.forEach((image) => {
//         formData.append("images", {
//           uri: image.uri,
//           name: image.name,
//           type: image.mimeType,
//         });
//       });
//     } else if (list[0].mimeType.startsWith("video")) {
//       formData.append("type", "text+video");
//       formData.append("video", {
//         uri: list[0].uri,
//         name: list[0].name,
//         type: list[0].mimeType,
//       });
//     }

//     const response = await apiClient.post("/social/post/create", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return response;
//   };

//   // Fetch follow status
// export const fetchFollowStatusAPI = async (userId, setIsFollowing) => {
//     try {
//         const token = await getToken();
//       const response = await apiClient.get(`/social/check-follow-status/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         setIsFollowing(response.data.isFollowing);
//       } else {
//         console.error("Failed to fetch follow status");
//       }
//     } catch (error) {
//       console.error("Error fetching follow status:", error);
//     }
//   };

//   // Fetch user posts
//   export const fetchPostsAPI = async (userId, setUserPosts) => {
//     try {
//         const token = await getToken();
//       const response = await apiClient.get(`/social/post/user/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         setUserPosts(response.data);
//       } else {
//         throw new Error("Network response was not ok");
//       }
//     } catch (err) {
//       console.error("Error fetching posts:", err);
//     }
//   };

//   // Fetch user profile
//   export const fetchProfileAPI = async (userId, setProfile, setLoading) => {
//     try {
//         const token = await getToken();
//       const response = await apiClient.get(`/user/profile/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         setProfile(response.data);
//       } else {
//         throw new Error("Network response was not ok");
//       }
//     } catch (err) {
//       console.error("Error fetching profile:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

// export const sendFollowRequestAPI = async (fromUserId, toUserId) => {
//     try {

//         const token = await getToken();
//       const response = await apiClient.post(
//         `social/send-request/${toUserId}`,
//         {},
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("response of sending req", response);

//       // Axios throws on non-2xx status, so if you're here, it's successful
//       if (response.status === 200) {
//         setIsFollowing(true);
//         Alert.alert("Success", "Connection request sent successfully.");
//       }
//     } catch (error) {
//       console.error("Error connecting to user:", error);

//       if (error.response) {
//         const message = error.response.data.message;
//         if (message === "You are already following this user.") {
//           setIsFollowing(true);
//           Alert.alert("Already Following", message);
//         } else if (message === "Follow request already sent to this user.") {
//           Alert.alert("Request Already Sent", message);
//         } else {
//           Alert.alert("Error", message || "Failed to send connection request.");
//         }
//       } else {
//         Alert.alert("Error", "An unexpected error occurred.");
//       }
//     }
//   };

//   // Unfollow user
//   export const unfollowUserAPI = async (fromUserId, setIsFollowing) => {
//     try {
//         const token = await getToken();
//       const response = await apiClient.patch(`/social/unfollow/${fromUserId}`, null, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         setIsFollowing(false);
//         Alert.alert("Success", response.data.message);
//       } else {
//         Alert.alert("Error", "Failed to send unfollow request.");
//       }
//     } catch (error) {
//       console.error("Error unfollowing user:", error);
//       Alert.alert("Error", "An error occurred while trying to unfollow.");
//     }
//   };
