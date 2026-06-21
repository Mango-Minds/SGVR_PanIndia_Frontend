

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUpdatedTokens } from "../services/auth.service";
import { BASEAPIURL } from "../infrastructure/constants";
import store from "./index";
import { logout } from "./user";

const apiClient = axios.create({
  baseURL: BASEAPIURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if a token refresh is in progress
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Axios Request Interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData - axios will set it automatically with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Axios Response Interceptor to Handle Token Expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and avoid retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      
      if (!refreshToken) {
        const storedToken = await AsyncStorage.getItem("token");
        isRefreshing = false;
        processQueue(error, null);
        // Guests browsing without a session should not be logged out on 401
        if (storedToken) {
          store.dispatch(logout());
        }
        return Promise.reject(error);
      }
      
      try {
        const res = await getUpdatedTokens(refreshToken);

        if (res && res.status === 0 && res.accessToken) {
          console.log("Token refreshed successfully");

          // **STORE NEW TOKENS** (getUpdatedTokens already stores them, but ensure consistency)
          await AsyncStorage.setItem("token", res.accessToken);
          if (res.refreshToken) {
            await AsyncStorage.setItem("refresh_token", res.refreshToken);
          }

          // Process queued requests
          isRefreshing = false;
          processQueue(null, res.accessToken);

          // **UPDATE HEADER & RETRY REQUEST**
          originalRequest.headers.Authorization = `Bearer ${res.accessToken}`;
          return apiClient(originalRequest);
        } else {
          console.error("Token refresh failed - invalid response:", res);
          isRefreshing = false;
          processQueue(error, null);
          // Dispatch logout action to clear Redux state and navigate to login screen
          store.dispatch(logout());
          return Promise.reject(new Error("Session expired. Please login again."));
        }
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        isRefreshing = false;
        processQueue(refreshError, null);
        // Dispatch logout action to clear Redux state and navigate to login screen
        store.dispatch(logout());
        return Promise.reject(new Error("Session expired. Please login again."));
      }
    }

    return Promise.reject(error);
  }
);


export default apiClient;





