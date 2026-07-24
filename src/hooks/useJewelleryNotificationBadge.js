import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import apiClient from "../store/apiClient";
import { SOCKETURL } from "../infrastructure/constants";

export const JEWELLERY_NOTIFICATION_TYPES = [
  "stockItemCreated",
  "stockItemUpdated",
  "shopEventCreated",
  "eventCreated",
  "eventInterest",
];

let sharedSocket = null;
let sharedSocketUserId = null;
let jewelleryListenersBound = false;
let cachedUnreadCount = 0;

const countSubscribers = new Set();
const feedSubscribers = new Set();

function isJewelleryNotification(type) {
  return JEWELLERY_NOTIFICATION_TYPES.includes(type);
}

function publishCount(count) {
  cachedUnreadCount = Math.max(0, count);
  countSubscribers.forEach((cb) => {
    try {
      cb(cachedUnreadCount);
    } catch (error) {
      console.error("jewellery notification count subscriber error:", error);
    }
  });
}

function publishFeedItem(item) {
  feedSubscribers.forEach((cb) => {
    try {
      cb(item);
    } catch (error) {
      console.error("jewellery notification feed subscriber error:", error);
    }
  });
}

export async function fetchJewelleryUnreadCount(token) {
  if (!token) {
    publishCount(0);
    return 0;
  }

  try {
    const response = await apiClient.get("/notifications/");
    if (response.status === 200) {
      const allNotifications = response.data.notifications || [];
      const unread = allNotifications.filter(
        (notif) => isJewelleryNotification(notif.type) && !notif.read
      ).length;
      publishCount(unread);
      return unread;
    }
  } catch (error) {
    console.error("Error fetching jewellery notification badge count:", error);
  }

  return cachedUnreadCount;
}

export function bumpJewelleryUnreadCount(by = 1) {
  publishCount(cachedUnreadCount + by);
}

export function setJewelleryUnreadCount(count) {
  publishCount(count);
}

function ensureSharedSocket(userId) {
  if (!userId) return null;

  if (!sharedSocket) {
    sharedSocket = io(SOCKETURL, { transports: ["websocket"] });
  }

  const join = () => {
    sharedSocket.emit("joinUserRoom", userId);
    sharedSocket.emit("join", { userId });
  };

  if (sharedSocketUserId !== userId) {
    sharedSocketUserId = userId;
    sharedSocket.off("connect", join);
    if (sharedSocket.connected) {
      join();
    }
    sharedSocket.on("connect", join);
  } else if (sharedSocket.connected) {
    join();
  } else {
    sharedSocket.off("connect", join);
    sharedSocket.on("connect", join);
  }

  if (!jewelleryListenersBound) {
    jewelleryListenersBound = true;
    sharedSocket.on("socialNotification", (data) => {
      if (!isJewelleryNotification(data?.type)) return;
      // Live bump for badge + notify any open notifications screen
      publishCount(cachedUnreadCount + 1);
      publishFeedItem(data);
    });
  }

  return sharedSocket;
}

/**
 * Unread jewellery notification count for bottom-tab badge.
 * Updates immediately when a socialNotification socket event arrives.
 */
export default function useJewelleryNotificationBadge() {
  const { token, user } = useSelector((state) => state.user);
  const [count, setCount] = useState(cachedUnreadCount);

  useEffect(() => {
    const onCount = (next) => setCount(next);
    countSubscribers.add(onCount);
    setCount(cachedUnreadCount);
    return () => {
      countSubscribers.delete(onCount);
    };
  }, []);

  useEffect(() => {
    if (!token || !user?._id) return undefined;
    ensureSharedSocket(String(user._id));
    return undefined;
  }, [token, user?._id]);

  useFocusEffect(
    useCallback(() => {
      fetchJewelleryUnreadCount(token);
    }, [token])
  );

  return count;
}

/**
 * Subscribe to live jewellery notifications (e.g. eventInterest).
 * Callback receives the notification payload from the socket.
 */
export function useJewelleryNotificationLive(onLiveNotification) {
  const { token, user } = useSelector((state) => state.user);

  useEffect(() => {
    if (!token || !user?._id) return undefined;
    ensureSharedSocket(String(user._id));
    return undefined;
  }, [token, user?._id]);

  useEffect(() => {
    if (typeof onLiveNotification !== "function") return undefined;
    feedSubscribers.add(onLiveNotification);
    return () => {
      feedSubscribers.delete(onLiveNotification);
    };
  }, [onLiveNotification]);
}
