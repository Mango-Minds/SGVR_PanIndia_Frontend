import { useEffect } from "react";
import { AppState } from "react-native";
import { useSelector } from "react-redux";
import useMessageUnreadBadge from "./useMessageUnreadBadge";
import useSocialNotificationBadge from "./useSocialNotificationBadge";
import { clearAppIconBadge, setAppIconBadge } from "../Utility/appIconBadge";

/**
 * Keeps the OS app-icon badge in sync with unread messages + notifications.
 * Mount once under the authenticated navigation tree.
 */
export default function useAppIconBadge() {
  const token = useSelector((state) => state?.user?.token);
  const messageUnread = useMessageUnreadBadge();
  const notificationUnread = useSocialNotificationBadge();

  const combined =
    (Number(messageUnread) || 0) + (Number(notificationUnread) || 0);

  useEffect(() => {
    if (!token) {
      clearAppIconBadge();
      return undefined;
    }

    setAppIconBadge(combined);

    const onAppState = (nextState) => {
      if (nextState === "active") {
        setAppIconBadge(combined);
      }
    };
    const sub = AppState.addEventListener("change", onAppState);
    return () => sub.remove();
  }, [token, combined]);

  useEffect(() => {
    return () => {
      clearAppIconBadge();
    };
  }, []);
}
