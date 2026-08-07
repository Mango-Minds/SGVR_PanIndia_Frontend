import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import useMessageUnreadBadge from "../../hooks/useMessageUnreadBadge";
import useSocialNotificationBadge from "../../hooks/useSocialNotificationBadge";
import {
  floatingBottomBarStyles as styles,
  FLOATING_BAR_ICONS,
  FLOATING_BAR_ICON_SIZE,
  FLOATING_BAR_ACTIVE_COLOR,
  FLOATING_BAR_INACTIVE_COLOR,
} from "../../styles/floatingBottomBar.styles";

export default function BottomNavigation({ navigation, currentScreen }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const messageUnreadCount = useMessageUnreadBadge();
  const messageBadgeLabel =
    messageUnreadCount > 99 ? "99+" : String(messageUnreadCount);
  const alertsUnreadCount = useSocialNotificationBadge();
  const alertsBadgeLabel =
    alertsUnreadCount > 99 ? "99+" : String(alertsUnreadCount);

  const getIconName = (screen) => {
    switch (screen) {
      case "home":
        return FLOATING_BAR_ICONS.home;
      case "myNetwork":
        return FLOATING_BAR_ICONS.people;
      case "search":
        return FLOATING_BAR_ICONS.search;
      case "messages":
        return FLOATING_BAR_ICONS.messages;
      case "notifications":
        return FLOATING_BAR_ICONS.alerts;
      default:
        return FLOATING_BAR_ICONS.home;
    }
  };

  const isActive = (screen) => currentScreen === screen;

  const items = [
    {
      key: "home",
      label: t("home"),
      onPress: () => {
        if (currentScreen === "home") {
          const parent = navigation.getParent();
          if (parent) {
            parent.navigate("Main");
          } else {
            navigation.navigate("MainHome");
          }
        } else {
          navigation.navigate("SocialHomeScreen");
        }
      },
    },
    {
      key: "myNetwork",
      label: t("myNetwork"),
      onPress: () => navigation.navigate("MyNetwork"),
    },
    {
      key: "search",
      label: t("search"),
      onPress: () => {
        if (currentScreen === "search") return;
        navigation.navigate("SearchResults");
      },
    },
    {
      key: "messages",
      label: t("messages"),
      badgeCount: messageUnreadCount,
      badgeLabel: messageBadgeLabel,
      onPress: () => navigation.navigate("MessageScreen"),
    },
    {
      key: "notifications",
      label: t("alerts"),
      badgeCount: alertsUnreadCount,
      badgeLabel: alertsBadgeLabel,
      onPress: () => {
        if (currentScreen === "notifications") return;
        navigation.navigate("NotificationsScreen");
      },
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
        const active = isActive(item.key);
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
                name={getIconName(item.key)}
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
