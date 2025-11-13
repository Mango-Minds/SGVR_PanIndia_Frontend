import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create or fetch a room for a set of participants (supports groups)
export const createOrGetRoom = async (userIds, groupName) => {
  const res = await axios.post(
    `${BASEAPIURL}/chat/room`,
    { userIds, groupName },
    { headers: await authHeader() }
  );
  return res.data; // { roomId }
};

// Fetch rooms for the current user (roomId + participants[])
export const getRooms = async () => {
  const res = await axios.get(`${BASEAPIURL}/chat/rooms`, {
    headers: await authHeader(),
  });
  return res.data; // { status, message, rooms }
};

export const getAllChats = async (userId, page) => {
  try {
    // Generate room ID for the conversation
    const currentUser = JSON.parse(await AsyncStorage.getItem('user'));
    const roomId = [currentUser._id, userId].sort().join('_');
    
    const res = await axios.get(
      `${BASEAPIURL}/chat/messages/${roomId}`,
      {
        headers: await authHeader(),
      }
    );
    
    if (res.data.success) {
      // Transform the messages to match the expected format
      return res.data.messages.map(msg => ({
        _id: msg._id,
        msg: msg.message || (msg.media ? '' : ''),
        sender: msg.userId,
        receiver: msg.userId === currentUser._id ? userId : currentUser._id,
        time: msg.timestamp,
        conversation: [currentUser._id, userId],
        isRead: msg.seenBy.includes(currentUser._id),
        media: msg.media || null
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
};

// Fetch messages for a given roomId directly (for group chats)
export const getRoomMessages = async (roomId) => {
  try {
    const currentUser = JSON.parse(await AsyncStorage.getItem('user'));
    const res = await axios.get(
      `${BASEAPIURL}/chat/messages/${roomId}`,
      { headers: await authHeader() }
    );
    if (res.data.success) {
      return res.data.messages.map(msg => ({
        _id: msg._id,
        msg: msg.message || (msg.media ? '' : ''),
        sender: msg.userId,
        receiver: null,
        time: msg.timestamp,
        conversation: [roomId],
        isRead: msg.seenBy.includes(currentUser._id),
        media: msg.media || null,
      }));
    }
    return [];
  } catch (e) {
    console.error('Error fetching room messages:', e);
    return [];
  }
};

export const getAllUserChats = async (includeArchived = false) => {
  const res = await axios.get(`${BASEAPIURL}/chat/list-convo?includeArchived=${includeArchived}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const saveChats = async (chats) => {
  const res = await axios.post(`${BASEAPIURL}/chat/save`, chats, {
    headers: await authHeader(),
  });
  return res.data;
};

export const saveSingleChat = async (chats) => {
  try {
    const res = await axios.post(`${BASEAPIURL}/chat/send-msg`, chats, {
      headers: await authHeader(),
    });
    return res.data;
  } catch (error) {
    console.error("Error saving chat message:", error);
    return { success: false, message: 'Failed to save message' };
  }
};

export const archiveChat = async (convoId) => {
  const res = await axios.post(`${BASEAPIURL}/chat/archive`, { convoId }, {
    headers: await authHeader(),
  });
  return res.data;
};

export const unarchiveChat = async (convoId) => {
  const res = await axios.post(`${BASEAPIURL}/chat/unarchive`, { convoId }, {
    headers: await authHeader(),
  });
  return res.data;
};

// Helper to upload media to chat uploads (already supported on backend)
export const uploadChatMedia = async (roomId, file) => {
  const formData = new FormData();
  formData.append('media', file);
  const res = await axios.post(`${BASEAPIURL}/upload/${roomId}`, formData, {
    headers: { ...(await authHeader()), 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const editMessage = async ({ roomId, messageId, newMessage }) => {
  const res = await axios.put(`${BASEAPIURL}/chat/message/${roomId}/${messageId}`, { newMessage }, {
    headers: await authHeader(),
  });
  return res.data;
};

export const deleteMessage = async ({ roomId, messageId }) => {
  const res = await axios.delete(`${BASEAPIURL}/chat/message/${roomId}/${messageId}`, {
    headers: await authHeader(),
  });
  return res.data;
};

// Group members
export const getRoomMembers = async (roomId) => {
  const res = await axios.get(`${BASEAPIURL}/chat/members/${roomId}`, { headers: await authHeader() });
  return res.data;
};

export const addRoomMembers = async (roomId, memberIds) => {
  const res = await axios.post(`${BASEAPIURL}/chat/members/${roomId}/add`, { memberIds }, { headers: await authHeader() });
  return res.data;
};

export const removeRoomMember = async (roomId, memberId) => {
  const res = await axios.post(`${BASEAPIURL}/chat/members/${roomId}/remove`, { memberId }, { headers: await authHeader() });
  return res.data;
};
