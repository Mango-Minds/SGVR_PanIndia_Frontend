import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, spacing } from '../../styles/jewellery.styles';

const BottomTabBar = ({ activeTab, onTabChange }) => {
  const insets = useSafeAreaInsets();
  const tabs = [
    { key: 'home', icon: 'home' },
    { key: 'search', icon: 'search' },
    { key: 'media', icon: 'play-circle-outline' },
    { key: 'profile', icon: 'person-outline' },
    { key: 'media2', icon: 'play-circle-outline' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            activeTab === tab.key && styles.activeIconContainer
          ]}>
            <Icon
              name={tab.icon}
              size={24}
              color={activeTab === tab.key ? jewelleryColors.primary : jewelleryColors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      ))}
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
  iconContainer: {
    padding: spacing.xs,
  },
  activeIconContainer: {
    backgroundColor: jewelleryColors.primary + '20',
    borderRadius: 8,
  },
});

export default BottomTabBar;

