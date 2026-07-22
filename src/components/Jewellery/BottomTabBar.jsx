import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, spacing } from '../../styles/jewellery.styles';
import useMessageUnreadBadge from '../../hooks/useMessageUnreadBadge';
import useJewelleryNotificationBadge from '../../hooks/useJewelleryNotificationBadge';

const BottomTabBar = ({ activeTab, onTabChange, notificationCount: notificationCountProp }) => {
  const insets = useSafeAreaInsets();
  const liveNotificationCount = useJewelleryNotificationBadge();
  const messageUnreadCount = useMessageUnreadBadge();

  const notificationCount =
    typeof notificationCountProp === 'number' ? notificationCountProp : liveNotificationCount;

  const tabs = [
    { key: 'home', icon: 'home' },
    { key: 'profile', icon: 'person-outline' },
    { key: 'search', icon: 'search' },
    { key: 'message', icon: 'message' },
    { key: 'notifications', icon: 'notifications-none' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {tabs.map((tab, index) => {
        const isCenter = index === 2; // Search is in the center (index 2)
        const showNotificationBadge = tab.key === 'notifications' && notificationCount > 0;
        const showMessageBadge = tab.key === 'message' && messageUnreadCount > 0;
        const showBadge = showNotificationBadge || showMessageBadge;
        const badgeValue = showMessageBadge ? messageUnreadCount : notificationCount;
        const badgeLabel = badgeValue > 99 ? '99+' : String(badgeValue);

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isCenter && styles.centerTab]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                activeTab === tab.key && styles.activeIconContainer,
                isCenter && styles.centerIconContainer,
              ]}
            >
              <Icon
                name={tab.icon}
                size={isCenter ? 28 : 24}
                color={
                  activeTab === tab.key
                    ? jewelleryColors.primary
                    : jewelleryColors.textSecondary
                }
              />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeLabel}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: jewelleryColors.bg,
    borderTopWidth: 1,
    borderTopColor: jewelleryColors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    flex: 1.2,
  },
  iconContainer: {
    padding: spacing.xs,
    position: 'relative',
  },
  centerIconContainer: {
    padding: spacing.sm,
  },
  activeIconContainer: {
    backgroundColor: jewelleryColors.primary + '20',
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: jewelleryColors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: jewelleryColors.bg,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});

export default BottomTabBar;
