import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { getGeneralNotifications, getPostCommentNotifications } from "../features/SocialMediaNew/SocialMediaAPIs";
import { SOCKETURL } from "../infrastructure/constants";

let sharedSocket = null;
let sharedSocketUserId = null;
let listenersBound = false;
let cachedUnreadCount = 0;
const countSubscribers = new Set();
const feedSubscribers = new Set();

function publishCount(count) {
  cachedUnreadCount = Math.max(0, count);
  countSubscribers.forEach((cb) => {
    try {
      cb(cachedUnreadCount);
    } catch (error) {
      console.error("social notification count subscriber error:", error);
    }
  });
}

function publishFeedItem(item) {
  feedSubscribers.forEach((cb) => {
    try {
      cb(item);
    } catch (error) {
      console.error("social notification feed subscriber error:", error);
    }
  });
}

export async function fetchSocialUnreadCount() {
  try {
    const [generalRes, postRes] = await Promise.allSettled([
      getGeneralNotifications(),
      getPostCommentNotifications(),
    ]);

    let unread = 0;
    if (generalRes.status === "fulfilled" && generalRes.value?.status === 200) {
      const notifications = generalRes.value.data?.notifications || [];
      unread += notifications.filter((n) => !n.read).length;
    }
    if (postRes.status === "fulfilled" && postRes.value?.status === 200) {
      const notifications = postRes.value.data?.notifications || [];
      unread += notifications.filter((n) => !n.read).length;
    }

    publishCount(unread);
    return unread;
  } catch (error) {
    console.error("Error fetching social notification badge count:", error);
  }
  return cachedUnreadCount;
}

export function setSocialUnreadCount(count) {
  publishCount(count);
}

export function bumpSocialUnreadCount(by = 1) {
  publishCount(cachedUnreadCount + by);
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

  if (!listenersBound) {
    listenersBound = true;
    sharedSocket.on("socialNotification", (data) => {
      if (!data) return;
      if (data.read) return;
      publishCount(cachedUnreadCount + 1);
      publishFeedItem(data);
    });
  }

  return sharedSocket;
}

/**
 * Unread social (follow/network/etc.) notification count for the header bell.
 */
export default function useSocialNotificationBadge() {
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
      if (!token) {
        publishCount(0);
        return;
      }
      fetchSocialUnreadCount();
    }, [token])
  );

  return count;
}

/**
 * Subscribe to live social notifications (follow, event create, etc.).
 * Callback receives the notification payload from the socket.
 */
export function useSocialNotificationLive(onLiveNotification) {
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
