import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import useMessageUnreadBadge from "../../hooks/useMessageUnreadBadge";
import {
  floatingBottomBarStyles as styles,
  FLOATING_BAR_ICONS,
  FLOATING_BAR_ICON_SIZE,
  FLOATING_BAR_ACTIVE_COLOR,
  FLOATING_BAR_INACTIVE_COLOR,
} from "../../styles/floatingBottomBar.styles";

export default function BottomNavigation({ navigation, currentScreen = "home" }) {
  const insets = useSafeAreaInsets();
  const messageUnreadCount = useMessageUnreadBadge();
  const messageBadgeLabel =
    messageUnreadCount > 99 ? "99+" : String(messageUnreadCount);

  const items = [
    {
      key: "home",
      label: "Home",
      icon: FLOATING_BAR_ICONS.home,
      onPress: () => navigation.navigate("HomeScreen"),
    },
    {
      key: "profile",
      label: "Profile",
      icon: FLOATING_BAR_ICONS.person,
      onPress: () => navigation.navigate("MyProfile"),
    },
    {
      key: "search",
      label: "Search",
      icon: FLOATING_BAR_ICONS.search,
      onPress: () => navigation.navigate("BrowseScreen"),
    },
    {
      key: "messages",
      label: "Messages",
      icon: FLOATING_BAR_ICONS.messages,
      badgeCount: messageUnreadCount,
      badgeLabel: messageBadgeLabel,
      onPress: () => navigation.navigate("MessageScreen"),
    },
    {
      key: "notifications",
      label: "Alerts",
      icon: FLOATING_BAR_ICONS.alerts,
      onPress: () =>
        navigation.navigate("JewelleryNotifications", {
          shops: [],
          shopId: null,
        }),
    },
  ];

  return (
    <View
      style={[
        styles.floatingBar,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {items.map((item) => {
        const active = currentScreen === item.key;
        const color = active
          ? FLOATING_BAR_ACTIVE_COLOR
          : FLOATING_BAR_INACTIVE_COLOR;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.floatingBarItem}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <View style={styles.floatingBarIconWrap}>
              <Ionicons
                name={item.icon}
                size={FLOATING_BAR_ICON_SIZE}
                color={color}
              />
              {item.badgeCount > 0 && (
                <View style={styles.messageBadge}>
                  <Text style={styles.messageBadgeText}>{item.badgeLabel}</Text>
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
