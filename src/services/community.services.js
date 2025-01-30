import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "./auth.header";

export const searchCommunity = async ({ searchTerm }) => {
  const res = await axios.get(
    `${BASEAPIURL}/community/search-community?keyword=${searchTerm}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getMyCommunities = async () => {
  const res = await axios.get(`${BASEAPIURL}/community/my-community`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const createCommunity = async ({ data }) => {
  const res = await axios.post(`${BASEAPIURL}/community/community`, data, {
    headers: await authHeader(),
  });
  return res.data;
};

export const viewCommunity = async ({ page, limit }) => {
  const res = await axios.get(
    `${BASEAPIURL}/community/community?page=${page}&limit=${limit}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const viewCommunityById = async (id) => {
  const res = await axios.get(`${BASEAPIURL}/community/community-id?id=${id}`, {
    headers: await authHeader(),
  });
  return res.data;
};

export const joinCommunity = async (data) => {
  const res = await axios.post(
    `${BASEAPIURL}/community/joinrequest-community`,
    {
      data,
    },
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const viewMembers = async (id) => {
  const res = await axios.get(
    `${BASEAPIURL}/community/viewmembers?communityId=${id}`,
    {
      headers: await authHeader(),
    }
  );
  return res.data;
};

export const getImage = async (id) => {
  const res = await axios.get(`${BASEAPIURL}/get-images?key=${id}`, {
    headers: await authHeader(),
  });
  return res.data;
};
