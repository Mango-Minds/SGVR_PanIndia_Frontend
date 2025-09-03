import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        msg: msg.message,
        sender: msg.userId,
        receiver: msg.userId === currentUser._id ? userId : currentUser._id,
        time: msg.timestamp,
        conversation: [currentUser._id, userId],
        isRead: msg.seenBy.includes(currentUser._id)
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
};

export const getAllUserChats = async () => {
  const res = await axios.get(`${BASEAPIURL}/chat/list-convo`, {
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
