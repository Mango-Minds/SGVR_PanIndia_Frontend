

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUpdatedTokens } from "../services/auth.service";
import { BASEAPIURL } from "../infrastructure/constants";

const apiClient = axios.create({
  baseURL: BASEAPIURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios Request Interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios Response Interceptor to Handle Token Expiration

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      
      if (!refreshToken) {
        console.error("No refresh token found, logging out...");
        await AsyncStorage.clear();
        return Promise.reject(error);
      }
      
      try {
        const res = await getUpdatedTokens(refreshToken);

        if (res && res.status === 0) {
          console.log("New Tokens:", res);

          // **STORE NEW TOKENS**
          await AsyncStorage.setItem("token", res.accessToken);
          await AsyncStorage.setItem("refresh_token", res.refreshToken);

          // **UPDATE HEADER & RETRY REQUEST**
          originalRequest.headers.Authorization = `Bearer ${res.accessToken}`;
          return apiClient(originalRequest);
        } else {
          console.error("Token refresh failed, logging out...");
          await AsyncStorage.clear();
          await AsyncStorage.removeItem("loggedIn");
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        await AsyncStorage.clear();
        await AsyncStorage.removeItem("loggedIn");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);


export default apiClient;





