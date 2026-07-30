import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import useMessageUnreadBadge from "../../hooks/useMessageUnreadBadge";
import {
  requireAuth,
  isAccountModule,
  navigateToJewellery,
} from "../../utils/requireAuth";
import {
  floatingBottomBarStyles as styles,
  FLOATING_BAR_ICONS,
  FLOATING_BAR_ICON_SIZE,
  FLOATING_BAR_ACTIVE_COLOR,
  FLOATING_BAR_INACTIVE_COLOR,
} from "../../styles/floatingBottomBar.styles";

const showMatrimonyComingSoon = () => {
  Alert.alert(
    "Coming Soon",
    "Matrimony module is coming soon. Stay tuned!"
  );
};

const ITEMS = [
  {
    key: "social",
    label: "Social",
    icon: FLOATING_BAR_ICONS.people,
    action: "module",
    path: "SocialMedia",
  },
  {
    key: "jewellery",
    label: "Jewellery",
    icon: FLOATING_BAR_ICONS.diamond,
    action: "module",
    path: "Jewellery",
  },
  {
    key: "matrimony",
    label: "Matrimony",
    icon: FLOATING_BAR_ICONS.heart,
    action: "comingSoon",
  },
  {
    key: "messages",
    label: "Messages",
    icon: FLOATING_BAR_ICONS.messages,
    action: "messages",
  },
  {
    key: "alerts",
    label: "Alerts",
    icon: FLOATING_BAR_ICONS.alerts,
    action: "notifications",
  },
];

export default function DashboardBottomNavigation({
  navigation,
  currentScreen,
  onLayout,
}) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { token, isGuest, notification } = useSelector((state) => state.user);
  const messageUnreadCount = useMessageUnreadBadge();
  const messageBadgeLabel =
    messageUnreadCount > 99 ? "99+" : String(messageUnreadCount);

  const handleModuleNavigation = (path) => {
    if (path === "Matrimony") {
      showMatrimonyComingSoon();
      return;
    }
    if (!token && isAccountModule(path)) {
      requireAuth({
        token,
        isGuest,
        dispatch,
        navigation,
        message: "Sign in to access this section.",
      });
      return;
    }
    if (path === "Jewellery") {
      navigateToJewellery(navigation);
      return;
    }
    navigation.navigate(path);
  };

  const handlePress = (item) => {
    if (item.action === "module") {
      handleModuleNavigation(item.path);
    } else if (item.action === "comingSoon") {
      showMatrimonyComingSoon();
    } else if (item.action === "messages") {
      if (currentScreen === "messages") return;
      requireAuth({
        token,
        isGuest,
        dispatch,
        navigation,
        onAuthed: () => navigation.navigate("MessageScreen"),
        message: "Sign in to view your messages.",
      });
    } else if (item.action === "notifications") {
      if (currentScreen === "alerts") return;
      requireAuth({
        token,
        isGuest,
        dispatch,
        navigation,
        onAuthed: () =>
          navigation.navigate("DashboardNotification", {
            notifications: notification?.homescreen ?? [],
          }),
        message: "Sign in to view notifications.",
      });
    }
  };

  return (
    <View
      style={[
        styles.floatingBar,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
      onLayout={onLayout}
    >
      {ITEMS.map((item) => {
        const active = currentScreen === item.key;
        const color = active
          ? FLOATING_BAR_ACTIVE_COLOR
          : FLOATING_BAR_INACTIVE_COLOR;
        const showBadge =
          (item.action === "messages" || item.path === "Jewellery") &&
          messageUnreadCount > 0;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.floatingBarItem}
            onPress={() => handlePress(item)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <View style={styles.floatingBarIconWrap}>
              <Ionicons
                name={item.icon}
                size={FLOATING_BAR_ICON_SIZE}
                color={color}
              />
              {showBadge && (
                <View style={styles.messageBadge}>
                  <Text style={styles.messageBadgeText}>{messageBadgeLabel}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.floatingBarText,
                active && styles.floatingBarTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
