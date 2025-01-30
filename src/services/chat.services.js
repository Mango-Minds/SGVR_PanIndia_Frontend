import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const getAllChats = async (userId, page) => {
  const res = await axios.get(
    `${BASEAPIURL}/chat/all-chats?messageWith=${userId}&page=${page}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
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
  const res = await axios.post(`${BASEAPIURL}/chat/send-msg`, chats, {
    headers: await authHeader(),
  });
  return res.data;
};
