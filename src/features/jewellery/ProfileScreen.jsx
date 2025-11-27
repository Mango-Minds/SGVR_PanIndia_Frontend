import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { BASEIMGURL } from '../../infrastructure/constants';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState('profile');

  const menuItems = [
    {
      key: 'wishlist',
      label: 'Saved Items',
      icon: 'favorite-border',
      onPress: () => navigation.navigate('WishlistScreen'),
    },
    {
      key: 'subscription',
      label: 'Subscription Status',
      icon: 'card-membership',
      onPress: () => navigation.navigate('PremiumAccessScreen'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: 'settings',
      onPress: () => navigation.navigate('SettingsScreen'),
    },
    {
      key: 'vendor',
      label: 'Vendor Profile',
      icon: 'store',
      onPress: () => navigation.navigate('VendorProfile'),
    },
    {
      key: 'worker',
      label: 'Worker Profile',
      icon: 'work',
      onPress: () => navigation.navigate('WorkerProfile'),
    },
    {
      key: 'designer',
      label: 'Designer Profile',
      icon: 'star',
      onPress: () => navigation.navigate('DesignerProfile'),
    },
    {
      key: 'gemologist',
      label: 'Gemologist Profile',
      icon: 'diamond',
      onPress: () => navigation.navigate('GemologistProfile'),
    },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        navigation.navigate('HomeScreen');
        break;
      case 'search':
        navigation.navigate('BrowseScreen');
        break;
      case 'profile':
        // Already on profile
        break;
      default:
        break;
    }
  };

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'User';
  const userAvatar = user?.avatar_url || `${BASEIMGURL}${user?.avatar}` || null;

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showNotification />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={40} color={jewelleryColors.textSecondary} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userName}</Text>
          {user?.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Icon name={item.icon} size={24} color={jewelleryColors.text} />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Icon name="chevron-right" size={24} color={jewelleryColors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: jewelleryColors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: jewelleryColors.primary,
  },
  userName: {
    ...typography.heading2,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
  },
  menuContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: jewelleryColors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemLabel: {
    ...typography.body,
  },
});

export default ProfileScreen;

