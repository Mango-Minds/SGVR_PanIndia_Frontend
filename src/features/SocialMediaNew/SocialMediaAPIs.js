import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      const response = await apiClient.get(`/social/check-follow-status/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setIsFollowing(response.data.isFollowing);
      } else {
        console.error("Failed to fetch follow status");
      }
    } catch (error) {
      console.error("Error fetching follow status:", error);
    }
  };
  
  // Fetch user posts
  export const fetchPostsAPI = async (userId, setUserPosts) => {
    try {
        const token = await getToken();
      const response = await apiClient.get(`/social/post/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setUserPosts(response.data);
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };
  
  // Fetch user profile
  export const fetchProfileAPI = async (userId, setProfile, setLoading) => {
    try {
        const token = await getToken();
      const response = await apiClient.get(`/user/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setProfile(response.data);
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };
  
export const sendFollowRequestAPI = async (fromUserId, toUserId) => {
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
      const response = await apiClient.patch(`/social/unfollow/${fromUserId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
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
