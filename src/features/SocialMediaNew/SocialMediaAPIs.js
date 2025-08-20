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

export const submitNewPost = async (description, list) => {
  const token = await getToken();

  const formData = new FormData();
  formData.append("content", description);

  if (list[0].mimeType.startsWith("image")) {
    formData.append("type", "text+image");
    list.forEach((image) => {
      formData.append("images", {
        uri: image.uri,
        name: image.name,
        type: image.mimeType,
      });
    });
  } else if (list[0].mimeType.startsWith("video")) {
    formData.append("type", "text+video");
    formData.append("video", {
      uri: list[0].uri,
      name: list[0].name,
      type: list[0].mimeType,
    });
  }

  const response = await apiClient.post("/social/post/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
};

// Fetch follow status
export const fetchFollowStatusAPI = async (userId, setIsFollowing) => {
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
      setIsFollowing(response.data.isFollowing);
      console.log("response.data.isFollowing: ", response.data.isFollowing);
    } else {
      console.error("Failed to fetch follow status");
    }
  } catch (error) {
    console.error("Error fetching follow status:", error);
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

export const fetchPostsAPI = async (userId, setUserPosts) => {
  try {
    const token = await getToken();
    const selectedLanguage =
      (await AsyncStorage.getItem("user-language")) || "en";

    const response = await apiClient.get(`/social/post/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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




export const sendFollowRequestAPI = async (
  fromUserId,
  toUserId,
  setIsFollowing
) => {
  try {
    const token = await getToken();
    const response = await apiClient.post(
      `social/send-request/${toUserId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("response of sending req", response);

    // Axios throws on non-2xx status, so if you're here, it's successful
    if (response.status === 200) {
      setIsFollowing(true);
      Alert.alert("Success", "Connection request sent successfully.");
    }
  } catch (error) {
    console.error("Error connecting to user:", error);

    if (error.response) {
      const message = error.response.data.message;
      if (message === "You are already following this user.") {
        setIsFollowing(true);
        Alert.alert("Already Following", message);
      } else if (message === "Follow request already sent to this user.") {
        Alert.alert("Request Already Sent", message);
      } else {
        Alert.alert("Error", message || "Failed to send connection request.");
      }
    } else {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  }
};

// Unfollow user
export const unfollowUserAPI = async (fromUserId, setIsFollowing) => {
  try {
    const token = await getToken();
    const response = await apiClient.patch(
      `/social/unfollow/${fromUserId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      setIsFollowing(false);
      Alert.alert("Success", response.data.message);
    } else {
      Alert.alert("Error", "Failed to send unfollow request.");
    }
  } catch (error) {
    console.error("Error unfollowing user:", error);
    Alert.alert("Error", "An error occurred while trying to unfollow.");
  }
};

export const fetchAllPosts = (page = 1, limit = 10) => {
  return apiClient.get(`/social/post/all?page=${page}&limit=${limit}`);
};

export const sendFollowRequest = (toUserId) => {
  return apiClient.post(`/social/send-request/${toUserId}`);
};

export const unfollowUser = (userId) => {
  return apiClient.patch(`/social/unfollow/${userId}`);
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

// Fetch users with optional search term
export const getUsers = (searchTerm = "") => {
  return apiClient.get(`/social/unfollowed-users`);
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
  dispatch,
  setLoadingInBtn,
  fetchUserProfile,
  navigation,
  t,
}) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

    if (!token) {
      console.error("Bearer token not found");
      Alert.alert(t("error"), t("auth_token_missing"));
      return;
    }

    let formData = new FormData();
    formData.append("about", about);
    formData.append("education", JSON.stringify(education));
    formData.append("jobExperience", JSON.stringify(jobExperience));

    await dispatch(setLoadingInBtn(true));

    const fullUrl = `/user/update-follow-data`;

    const response = await apiClient.patch(fullUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("API Response:", response.data);

    // Corrected: send data as an array with a text field to match backend expectation
    const translateResponse = await apiClient.post("/translate", {
      data: [{ text: "Information Updated Successfully" }],
      targetLang: selectedLanguage,
    });

    const translated =
      translateResponse.data?.translatedData?.[0]?.text || t("info_updated_successfully");

    Alert.alert(t("success"), translated);

    fetchUserProfile();
    navigation.goBack();
  } catch (error) {
    console.error("Error updating user:", error);

    const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

    const translateErrorResponse = await apiClient.post("/translate", {
      data: [{ text: "Failed to update user information." }],
      targetLang: selectedLanguage,
    });

    const errorMessage =
      translateErrorResponse.data?.translatedData?.[0]?.text || t("failed_to_update_user_info");

    Alert.alert(t("error"), errorMessage);

    await dispatch(setLoadingInBtn(false));
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
