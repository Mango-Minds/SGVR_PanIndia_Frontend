import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, spacing } from '../../styles/jewellery.styles';

const BottomTabBar = ({ activeTab, onTabChange }) => {
  const insets = useSafeAreaInsets();
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
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isCenter && styles.centerTab]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              activeTab === tab.key && styles.activeIconContainer,
              isCenter && styles.centerIconContainer
            ]}>
              <Icon
                name={tab.icon}
                size={isCenter ? 28 : 24}
                color={activeTab === tab.key ? jewelleryColors.primary : jewelleryColors.textSecondary}
              />
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
  },
  centerIconContainer: {
    padding: spacing.sm,
  },
  activeIconContainer: {
    backgroundColor: jewelleryColors.primary + '20',
    borderRadius: 8,
  },
});

export default BottomTabBar;

