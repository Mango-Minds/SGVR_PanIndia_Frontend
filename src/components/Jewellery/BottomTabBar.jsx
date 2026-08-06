import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useMessageUnreadBadge from '../../hooks/useMessageUnreadBadge';
import useJewelleryNotificationBadge from '../../hooks/useJewelleryNotificationBadge';
import {
  floatingBottomBarStyles as styles,
  FLOATING_BAR_ICONS,
  FLOATING_BAR_ICON_SIZE,
  FLOATING_BAR_ACTIVE_COLOR,
  FLOATING_BAR_INACTIVE_COLOR,
} from '../../styles/floatingBottomBar.styles';

const BottomTabBar = ({ activeTab, onTabChange, notificationCount: notificationCountProp }) => {
  const insets = useSafeAreaInsets();
  const liveNotificationCount = useJewelleryNotificationBadge();
  const messageUnreadCount = useMessageUnreadBadge();

  const notificationCount =
    typeof notificationCountProp === 'number' ? notificationCountProp : liveNotificationCount;

  const tabs = [
    { key: 'home', icon: FLOATING_BAR_ICONS.home, label: 'Home' },
    { key: 'profile', icon: FLOATING_BAR_ICONS.person, label: 'Profile' },
    { key: 'search', icon: FLOATING_BAR_ICONS.search, label: 'Search' },
    { key: 'message', icon: FLOATING_BAR_ICONS.messages, label: 'Messages' },
    { key: 'notifications', icon: FLOATING_BAR_ICONS.alerts, label: 'Alerts' },
  ];

  return (
    <View
      style={[
        styles.floatingBar,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const color = active ? FLOATING_BAR_ACTIVE_COLOR : FLOATING_BAR_INACTIVE_COLOR;
        const showNotificationBadge = tab.key === 'notifications' && notificationCount > 0;
        const showMessageBadge = tab.key === 'message' && messageUnreadCount > 0;
        const showBadge = showNotificationBadge || showMessageBadge;
        const badgeValue = showMessageBadge ? messageUnreadCount : notificationCount;
        const badgeLabel = badgeValue > 99 ? '99+' : String(badgeValue);

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.floatingBarItem}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <View style={styles.floatingBarIconWrap}>
              <Ionicons name={tab.icon} size={FLOATING_BAR_ICON_SIZE} color={color} />
              {showBadge && (
                <View style={styles.messageBadge}>
                  <Text style={styles.messageBadgeText}>{badgeLabel}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.floatingBarText,
                active && styles.floatingBarTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomTabBar;
