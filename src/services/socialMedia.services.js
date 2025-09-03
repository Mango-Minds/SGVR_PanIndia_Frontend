import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const getSearchUsers = async ({ searchTerm = "" }) => {
  const res = await axios.get(
    `${BASEAPIURL}/social/search-users?search=${searchTerm}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const unfollowUser = async ({ userId }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/social/unfollow/${userId}`,
    {},
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const blockuser = async ({ userId }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/social/unfollow/${userId}`,
    {},
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getalluserprofile = async () => {
  const res = await axios.get(`${BASEAPIURL}/admin/userlist`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getSearchUsersMatrimony = async ({
  searchTerm,
  matrimonySection,
}) => {
  if (matrimonySection === "vendor") {
    const res = await axios.get(
      `${BASEAPIURL}/vendor/vendor?keyword=${searchTerm}&module=matrimony`,
      {
        headers: await authHeader(),
      }
    );
    return res.data.data;
  } else {
    const res = await axios.get(
      `${BASEAPIURL}/matrimony/search?keyword=${searchTerm}&gender=${matrimonySection}`,
      {
        headers: await authHeader(),
      }
    );
    return res.data.data;
  }
};

export const getSocialMediaTimeline = async () => {
  const res = await axios.get(`${BASEAPIURL}/social/post/all?page=1&limit=10`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const likePost = async ({ postId }) => {
  const res = await axios.post(
    `${BASEAPIURL}/social/post/like/${postId}`,
    {},
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const unlikePost = async ({ postId }) => {
  const res = await axios.post(
    `${BASEAPIURL}/social/post/unlike/${postId}`,
    {},
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getAllLikes = async ({ postId }) => {
  const res = await axios.get(`${BASEAPIURL}/social/post/like-status/${postId}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getAllComments = async ({ postId }) => {
  try {
    const res = await axios.get(
      `${BASEAPIURL}/social/post/comments/${postId}/10`,
      {
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error('getAllComments API error:', error.response?.data || error.message);
    throw error;
  }
};

export const commentOnPost = async ({ postId, content }) => {
  const res = await axios.post(
    `${BASEAPIURL}/social/post/comment/${postId}`,
    {
      content: content,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getSocialMediaProfile = async (userid) => {
  const res = await axios.get(
    `${BASEAPIURL}/user/profile/${userid}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getSocialMediaProfilePosts = async (batch) => {
  const res = await axios.get(
    `${BASEAPIURL}/social/post/user/${batch}?page=1&limit=10`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const createPost = async (data) => {
  try {
    const res = await axios
      .post(`${BASEAPIURL}/social/post/create`, data, {
        headers: await authHeader(),
      })
      .then((res) => {
        return res.data;
      });
  } catch (error) {}
};

export const editSocialMediaProfile = async (data) => {
  const res = await axios.patch(`${BASEAPIURL}/user/profile/${data.userId}`, data, {
    headers: await authHeader(),
  });
  return res.data;
};

export const unfollowSocialMediaProfile = async ({ username }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/social/unfollow/${username}`,
    {},
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const sendRequest = async ({ toUserId }) => {
  const res = await axios.post(
    `${BASEAPIURL}/social/send-request/${toUserId}`,
    {},
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const acceptRequest = async ({ requestId }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/social/update-request/${requestId}`,
    { status: 'approved' },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const deleteRequest = async ({ requestId }) => {
  const res = await axios.delete(
    `${BASEAPIURL}/social/delete-request/${requestId}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const GetAllFriends = async ({ userid }) => {
  const res = await axios.get(`${BASEAPIURL}/social/${userid}/friends`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getImageUrl = async (id) => {
  const res = await axios.get(`${BASEAPIURL}/get-image-url?key=${id}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getSinglePost = async (id) => {
  const res = await axios.get(`${BASEAPIURL}/social/post/${id}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const deletePost = async (id) => {
  const res = await axios.delete(`${BASEAPIURL}/social/post/delete/${id}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const deleteComment = async (postId, commentId) => {
  const res = await axios.delete(`${BASEAPIURL}/social/post/comment/${postId}/${commentId}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getTagspeople = async () => {
  // Tags endpoint not available in social routes, return empty array
  return { data: [] };
};

export const getAllNotifications = async (module) => {
  const res = await axios.get(
    `${BASEAPIURL}/notifications/notifications?module=${module}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const deleteChat = async (id) => {
  try {
    const res = await axios.delete(
      `${BASEAPIURL}/chat/delete-convo`,
      {
        data: { convoId: id },
        headers: await authHeader(),
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { success: false, message: 'Failed to delete chat' };
  }
};
