import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const getSearchUsers = async ({ searchTerm = "" }) => {
  const res = await axios.get(
    `${BASEAPIURL}/meetup/search-profile/?username=${searchTerm}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const unfollowUser = async ({ userId }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/meetup/unfollow`,
    {
      userid: userId,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const blockuser = async ({ userId }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/meetup/unfollow`,
    {
      userid: userId,
    },
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
  const res = await axios.get(`${BASEAPIURL}/meetup/timeline?page=1`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const likePost = async ({ postId }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/meetup/like`,
    {
      postId: postId,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const unlikePost = async ({ postId }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/meetup/unlike`,
    {
      postId: postId,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getAllLikes = async ({ postId }) => {
  const res = await axios.get(`${BASEAPIURL}/meetup/likes?postId=${postId}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getAllComments = async ({ postId }) => {
  const res = await axios.get(
    `${BASEAPIURL}/meetup/comments?postId=${postId}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const commentOnPost = async ({ postId, content }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/meetup/comment`,
    {
      postId: postId,
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
    `${BASEAPIURL}/meetup/get-profile?userid=${userid}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getSocialMediaProfilePosts = async (batch) => {
  const res = await axios.get(
    `${BASEAPIURL}/meetup/all-post?page=${batch}&limit=10`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const createPost = async (data) => {
  try {
    const res = await axios
      .post(`${BASEAPIURL}/meetup/new-post`, data, {
        headers: await authHeader(),
      })
      .then((res) => {
        return res.data;
      });
  } catch (error) {}
};

export const editSocialMediaProfile = async (data) => {
  const res = await axios.patch(`${BASEAPIURL}/meetup/edit-profile`, data, {
    headers: await authHeader(),
  });
  return res.data;
};

export const unfollowSocialMediaProfile = async ({ username }) => {
  const res = await axios.patch(
    `${BASEAPIURL}/meetup/unfollow`,
    {
      userid: username,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const SendFriendRequest = async ({ userid }) => {
  const editProfileObj = {
    userid,
  };
  const res = await axios.patch(
    `${BASEAPIURL}/meetup/send-request`,
    editProfileObj,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const AcceptFriendRequest = async ({ userid }) => {
  const editProfileObj = {
    userid,
  };
  const res = await axios.patch(
    `${BASEAPIURL}/meetup/accept-request`,
    editProfileObj,
    {
      headers: await authHeader(),
    }
  );
  console.log(res.data);
  return res.data;
};

export const DeleteFriendRequest = async ({ userid }) => {
  const editProfileObj = {
    userid,
  };
  const res = await axios.patch(
    `${BASEAPIURL}/meetup/delete-request`,
    editProfileObj,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const GetAllFriends = async ({ userid }) => {
  const res = await axios.get(`${BASEAPIURL}/meetup/friends/${userid}`, {
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
  const res = await axios.get(`${BASEAPIURL}/meetup/post?id=${id}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getDeletemypost = async (id) => {
  const res = await axios.delete(`${BASEAPIURL}/meetup/post?id=${id.id}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const getTagspeople = async () => {
  const res = await axios.get(`${BASEAPIURL}/meetup/tags`, {
    headers: await authHeader(),
  });
  return res.data;
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
  return await axios.delete(
    `${BASEAPIURL}/api/chat/delete-convo`,
    {
      convoId: id,
    },
    {
      headers: authHeader(),
    }
  );
};
