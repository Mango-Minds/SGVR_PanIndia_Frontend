import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector, useStore } from "react-redux";
import io from "socket.io-client";
import { getAllUserChats } from "../services/chat.services";
import { updateConversation } from "../store/user";
import { SOCKETURL } from "../infrastructure/constants";

let sharedSocket = null;
let sharedSocketUserId = null;
let storeDispatch = null;
let getStoreState = () => ({});
let refreshChats = async () => {};
let listenersBound = false;
let refreshTimer = null;
/** Rooms the user just opened — ignore stale socket replays until server refresh lands */
const recentlyClearedRooms = new Set();

function scheduleRefreshConversations(delayMs = 400) {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    refreshChats();
  }, delayMs);
}

function bumpUnreadForRoom(roomId, messageBody, timestamp) {
  if (!roomId || !storeDispatch) return;

  if (recentlyClearedRooms.has(String(roomId))) {
    return;
  }

  const state = getStoreState();
  const current = state?.user?.conversations || [];
  const matchIndex = current.findIndex(
    (convo) => String(convo?.roomId) === String(roomId)
  );

  if (matchIndex >= 0) {
    const updated = current.map((convo, index) =>
      index === matchIndex
        ? {
            ...convo,
            unreadCount: (Number(convo.unreadCount) || 0) + 1,
            lastmsg: {
              ...(convo.lastmsg || {}),
              msg: messageBody || convo.lastmsg?.msg || "",
              time: timestamp || new Date().toISOString(),
              isRead: false,
            },
          }
        : convo
    );
    storeDispatch(updateConversation(updated));
  } else {
    // Unknown conversation — pull fresh list
    scheduleRefreshConversations(100);
  }
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

    const onLiveUnread = (data) => {
      if (!data?.roomId) return;
      // Only real-time sends include live: true. Replays / focus refreshes must not bump.
      if (data.isReplay || data.live !== true) {
        scheduleRefreshConversations(200);
        return;
      }
      bumpUnreadForRoom(data.roomId, data.messageBody, data.timestamp);
      scheduleRefreshConversations(800);
    };

    sharedSocket.on("chatUnread", onLiveUnread);
    sharedSocket.on("notification", (data) => {
      // Only treat chat notifications with roomId as message unread events
      if (!data?.roomId) return;
      onLiveUnread(data);
    });
  }

  return sharedSocket;
}

/**
 * Keeps Redux conversations fresh and returns total unread message count
 * for bottom-nav badges (Social + Jewellery + Dashboard).
 * Returns 0 when there are no unread messages (no badge should show).
 */
export default function useMessageUnreadBadge() {
  const dispatch = useDispatch();
  const store = useStore();
  const { token, user, conversations } = useSelector((state) => state.user);
  const refreshingRef = useRef(false);

  storeDispatch = dispatch;
  getStoreState = () => store.getState();

  const unreadTotal = useMemo(() => {
    const total = (conversations || []).reduce(
      (sum, convo) => sum + (Number(convo?.unreadCount) || 0),
      0
    );
    return total > 0 ? total : 0;
  }, [conversations]);

  const refreshConversations = useCallback(async () => {
    if (!token) {
      dispatch(updateConversation([]));
      return;
    }

    if (refreshingRef.current) return;
    refreshingRef.current = true;

    try {
      const data = await getAllUserChats(false);
      const next = Array.isArray(data) ? data : [];

      // Keep locally-cleared rooms at 0 until the server confirms unread is gone.
      // Prevents badge flashing back when navigating Back right after opening a chat.
      const merged = next.map((convo) => {
        const id = convo?.roomId ? String(convo.roomId) : null;
        if (id && recentlyClearedRooms.has(id) && Number(convo.unreadCount) > 0) {
          return { ...convo, unreadCount: 0 };
        }
        return convo;
      });

      dispatch(updateConversation(merged));

      for (const roomId of [...recentlyClearedRooms]) {
        const convo = merged.find((c) => String(c?.roomId) === String(roomId));
        // Only release the clear lock once server (or merge) shows 0 unread
        if (!convo || !(Number(convo.unreadCount) > 0)) {
          // If server already has 0, drop the lock; if we forced 0 locally, keep lock a bit longer
          const serverConvo = next.find((c) => String(c?.roomId) === String(roomId));
          if (!serverConvo || !(Number(serverConvo.unreadCount) > 0)) {
            recentlyClearedRooms.delete(roomId);
          }
        }
      }
    } catch (error) {
      console.error("useMessageUnreadBadge - Error fetching chats:", error);
    } finally {
      refreshingRef.current = false;
    }
  }, [token, dispatch]);

  refreshChats = refreshConversations;

  useFocusEffect(
    useCallback(() => {
      refreshConversations();
    }, [refreshConversations])
  );

  useEffect(() => {
    if (!token || !user?._id) {
      return undefined;
    }
    ensureSharedSocket(user._id);
    return undefined;
  }, [token, user?._id]);

  return unreadTotal;
}

/** Zero unreadCount for a conversation after the user opens/reads it. */
export function clearConversationUnread({
  roomId,
  otherUserId,
  conversationId,
}) {
  return (dispatch, getState) => {
    const state = getState();
    const conversations = state?.user?.conversations || [];
    const myId = state?.user?.user?._id;

    const resolvedRoomId =
      roomId ||
      (otherUserId && myId
        ? [myId, otherUserId].map(String).sort().join("_")
        : null);

    if (resolvedRoomId) {
      recentlyClearedRooms.add(String(resolvedRoomId));
    }

    if (!Array.isArray(conversations) || conversations.length === 0) {
      scheduleRefreshConversations(600);
      return;
    }

    let changed = false;
    const updated = conversations.map((convo) => {
      const users = Array.isArray(convo?.user)
        ? convo.user
        : convo?.user
          ? [convo.user]
          : [];
      const matches =
        (roomId && String(convo?.roomId) === String(roomId)) ||
        (resolvedRoomId && String(convo?.roomId) === String(resolvedRoomId)) ||
        (conversationId && String(convo?._id) === String(conversationId)) ||
        (otherUserId &&
          users.some((u) => String(u?._id) === String(otherUserId)));

      if (!matches) {
        return convo;
      }

      if (convo?.roomId) {
        recentlyClearedRooms.add(String(convo.roomId));
      }

      if (!(Number(convo?.unreadCount) > 0)) {
        return {
          ...convo,
          lastmsg: convo.lastmsg
            ? { ...convo.lastmsg, isRead: true }
            : convo.lastmsg,
        };
      }

      changed = true;
      return {
        ...convo,
        unreadCount: 0,
        lastmsg: convo.lastmsg
          ? { ...convo.lastmsg, isRead: true }
          : convo.lastmsg,
      };
    });

    if (changed) {
      dispatch(updateConversation(updated));
    }

    // Confirm with server after seenBy has time to persist
    scheduleRefreshConversations(800);
  };
}
