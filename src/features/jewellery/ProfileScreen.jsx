import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import FollowButton from '../../components/Jewellery/FollowButton';
import { navigateJewelleryAuthTab, requireAuth } from '../../utils/requireAuth';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import axios from 'axios';
import { BASEIMGURL, BASEAPIURL } from '../../infrastructure/constants';
import { checkFollowStatus, followUser, unfollowUser, getFollowers, getFollowing, getShopByOwner, getCurrentSubscription } from '../../services/jewellery.services';
import authHeader from '../../services/auth.header';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { token, isGuest, user: currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileUser, setProfileUser] = useState(null);
  const [followStatus, setFollowStatus] = useState('none');
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [isLoadingShop, setIsLoadingShop] = useState(false);
  const [subscriptionLabel, setSubscriptionLabel] = useState(null);
  
  // Check if viewing another user's profile
  const viewingUserId = route.params?.userId;
  const isViewingOtherProfile = viewingUserId && currentUser && viewingUserId !== currentUser._id;
  const user = isViewingOtherProfile ? profileUser : currentUser;
  const displayUserId = isViewingOtherProfile ? viewingUserId : currentUser?._id;

  // Fetch follower/following counts
  const fetchFollowCounts = useCallback(async (userId) => {
    if (!userId) return;

    setIsLoadingCounts(true);
    try {
      const [followersResponse, followingResponse] = await Promise.all([
        getFollowers(userId, { page: 1, limit: 1 }),
        getFollowing(userId, { page: 1, limit: 1 }),
      ]);

      setFollowersCount(followersResponse.totalFollowers || 0);
      setFollowingCount(followingResponse.totalFollowing || 0);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
      // Don't show alert for counts, just set to 0
      setFollowersCount(0);
      setFollowingCount(0);
    } finally {
      setIsLoadingCounts(false);
    }
  }, []);


  // Fetch shop data for shop owners
  const fetchShopData = useCallback(async (userId) => {
    if (!userId) return;
    
    setIsLoadingShop(true);
    try {
      const shop = await getShopByOwner(userId);
      if (shop) {
        setShopData(shop);
      } else {
        setShopData(null);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
      setShopData(null);
    } finally {
      setIsLoadingShop(false);
    }
  }, []);

  const formatPlanName = (planName) => {
    if (!planName) return t('jw_premium');
    return String(planName)
      .replace(/^Jewellery\s+/i, '')
      .trim();
  };

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!token || isGuest || isViewingOtherProfile) {
      setSubscriptionLabel(null);
      return;
    }
    try {
      const sub = await getCurrentSubscription();
      const active = Boolean(
        sub?.isActive ||
          sub?.isPremium ||
          sub?.data?.isActive ||
          sub?.data?.isPremium
      );
      if (!active) {
        setSubscriptionLabel(null);
        return;
      }
      const planName =
        sub?.subscription?.planName ||
        sub?.data?.subscription?.planName ||
        sub?.planName ||
        t('jw_premium');
      setSubscriptionLabel(formatPlanName(planName));
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionLabel(null);
    }
  }, [token, isGuest, isViewingOtherProfile, t]);

  // Fetch other user's profile if viewing another user
  const fetchUserProfile = useCallback(async () => {
    if (!viewingUserId || !isViewingOtherProfile) {
      setProfileUser(null);
      return;
    }

    setIsLoadingProfile(true);
    try {
      const headers = await authHeader();
      const response = await axios.get(`${BASEAPIURL}/user/${viewingUserId}`, {
        headers,
      });
      
      if (response.data) {
        const data = response.data;
        const fetchedUser = data.user || data;
        setProfileUser(fetchedUser);
        
        // Fetch shop data if user is a shop owner
        const userIsShopOwner = fetchedUser?.userType && (
          Array.isArray(fetchedUser.userType) 
            ? fetchedUser.userType.includes('shop') || fetchedUser.userType.includes('Shop')
            : fetchedUser.userType === 'shop' || fetchedUser.userType === 'Shop'
        );
        if (userIsShopOwner) {
          fetchShopData(viewingUserId);
        } else {
          setShopData(null);
        }
        
        // Fetch follow status
        try {
          const statusResponse = await checkFollowStatus(viewingUserId);
          setFollowStatus(statusResponse.status || 'none');
        } catch (error) {
          console.error('Error checking follow status:', error);
          setFollowStatus('none');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert(t('error'), t('jw_load_profile_error'));
    } finally {
      setIsLoadingProfile(false);
    }
  }, [viewingUserId, isViewingOtherProfile, fetchShopData]);

  // Handle follow/unfollow actions
  const handleFollowAction = async () => {
    if (!viewingUserId || !isViewingOtherProfile) return;

    setIsLoadingFollow(true);
    try {
      if (followStatus === 'approved' || followStatus === 'following') {
        // Unfollow
        await unfollowUser(viewingUserId);
        setFollowStatus('none');
        Alert.alert(t('success'), t('jw_unfollowed_success'));
      } else {
        // Follow
        await followUser(viewingUserId);
        setFollowStatus('approved');
        Alert.alert(t('success'), t('jw_followed_success'));
      }
    } catch (error) {
      console.error('Error performing follow action:', error);
      const errorMessage = error.response?.data?.message || error.message || t('jw_action_failed');
      Alert.alert(t('error'), errorMessage);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('profile');
      if (isViewingOtherProfile) {
        fetchUserProfile();
      } else {
        // For own profile, fetch shop data if user is a shop owner
        if (currentUser?._id) {
          const userIsShopOwner = currentUser?.userType && (
            Array.isArray(currentUser.userType) 
              ? currentUser.userType.includes('shop') || currentUser.userType.includes('Shop')
              : currentUser.userType === 'shop' || currentUser.userType === 'Shop'
          );
          if (userIsShopOwner) {
            fetchShopData(currentUser._id);
          } else {
            setShopData(null);
          }
        }
        fetchSubscriptionStatus();
      }
      // Fetch follow counts for the displayed user
      if (displayUserId) {
        fetchFollowCounts(displayUserId);
      }
    }, [isViewingOtherProfile, fetchUserProfile, displayUserId, fetchFollowCounts, fetchShopData, fetchSubscriptionStatus, currentUser])
  );

  // Check if user is a shop owner
  const isShopOwner = user?.userType && (
    Array.isArray(user.userType) 
      ? user.userType.includes('shop') || user.userType.includes('Shop')
      : user.userType === 'shop' || user.userType === 'Shop'
  );

  // My Page is only for shop owners
  const canSeeMyPage = !isViewingOtherProfile && isShopOwner;

  // Check if user can manage stock (shop owners and vendors)
  const canManageStock = user?.userType && (
    Array.isArray(user.userType) 
      ? user.userType.includes('shop') || user.userType.includes('Shop') || user.userType.includes('vendor') || user.userType.includes('Vendor')
      : user.userType === 'shop' || user.userType === 'Shop' || user.userType === 'vendor' || user.userType === 'Vendor'
  );

  const handleMyPagePress = async () => {
    if (!user?._id) return;

    try {
      const shop = shopData || (await getShopByOwner(user._id));
      if (shop?._id) {
        navigation.navigate('ShopDetailScreen', { shopId: shop._id });
        return;
      }
      Alert.alert(t('jw_my_page'), t('jw_no_shop_page'));
    } catch (error) {
      console.error('Error opening my page:', error);
      Alert.alert(t('error'), t('jw_open_page_error'));
    }
  };

  // Handle Stock for Sale menu item press
  const handleStockForSalePress = async () => {
    if (!canManageStock || !user?._id) {
      Alert.alert(t('error'), t('jw_shop_info_error'));
      return;
    }

    try {
      const shop = await getShopByOwner(user._id);
      if (shop && shop._id) {
        navigation.navigate('StockDetailsScreen', { shopId: shop._id });
      } else {
        Alert.alert(t('error'), t('jw_no_shop_account'));
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      Alert.alert(t('error'), t('jw_load_shop_error'));
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('HomeScreen');
  };

  const menuItems = [
    ...(!isViewingOtherProfile && currentUser && !currentUser.isJewelryOnboarded ? [{
      key: 'complete-profile',
      label: t('jw_complete_jewellery_profile'),
      icon: 'person-add',
      onPress: () => navigation.navigate('OnboardModuleForm'),
    }] : []),
    ...(!isViewingOtherProfile ? [
      {
        key: 'subscription',
        label: t('jw_subscription_status'),
        icon: 'card-membership',
        onPress: () => navigation.navigate('PremiumAccessScreen'),
      },
      {
        key: 'wishlist',
        label: t('jw_saved_items'),
        icon: 'favorite-border',
        onPress: () => {
          requireAuth({
            token,
            isGuest,
            dispatch,
            navigation,
            message: t('jw_sign_in_saved'),
            onAuthed: () => navigation.navigate('WishlistScreen'),
          });
        },
      },
      {
        key: 'my-events',
        label: t('jw_my_events'),
        icon: 'event',
        onPress: () => {
          requireAuth({
            token,
            isGuest,
            dispatch,
            navigation,
            message: t('jw_sign_in_events'),
            onAuthed: () =>
              navigation.navigate('EventsHomeScreen', { mineOnly: true }),
          });
        },
      },
      {
        key: 'customers',
        label: t('jw_my_customers'),
        icon: 'people',
        onPress: () => navigation.navigate('MyCustomersScreen'),
      },
      {
        key: 'karegars',
        label: t('jw_my_karegars'),
        icon: 'handyman',
        onPress: () => navigation.navigate('WorkersScreen'),
      },
      {
        key: 'vendors',
        label: t('jw_my_vendors'),
        icon: 'store',
        onPress: () => navigation.navigate('VendorsScreen'),
      },
      {
        key: 'manufacturers',
        label: t('jw_my_manufacturers'),
        icon: 'precision-manufacturing',
        onPress: () => navigation.navigate('DesignersScreen'),
      },
      {
        key: 'orders',
        label: t('jw_my_orders'),
        icon: 'receipt-long',
        onPress: () => navigation.navigate('MyOrdersScreen'),
      },
      {
        key: 'payments',
        label: t('jw_my_payments'),
        icon: 'payments',
        onPress: () => navigation.navigate('MyPaymentsScreen'),
      },
      {
        key: 'staff',
        label: t('jw_my_staff'),
        icon: 'badge',
        onPress: () => navigation.navigate('MyStaffScreen'),
      },
      {
        key: 'gold-price',
        label: t('jw_my_gold_price'),
        icon: 'trending-up',
        onPress: () => navigation.navigate('LiveRatesScreen'),
      },
    ] : []),
    ...(canManageStock ? [{
      key: 'stock-for-sale',
      label: t('jw_stock_for_sale'),
      icon: 'inventory',
      onPress: handleStockForSalePress,
    }] : []),
    {
      key: 'settings',
      label: t('settings'),
      icon: 'settings',
      onPress: () => navigation.navigate('SettingsScreen'),
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
      case 'message':
      case 'notifications':
        navigateJewelleryAuthTab(tab, { token, isGuest, dispatch, navigation });
        break;
      default:
        break;
    }
  };

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email || t('jw_user');
  
  // Get avatar - prioritize shop image for shop owners, then user avatar
  let userAvatar = null;
  const shopImage = shopData?.image || shopData?.profileImage;
  if (shopImage && shopImage.trim() !== '') {
    userAvatar = shopImage.startsWith('http') ? shopImage : `${BASEIMGURL}${shopImage}`;
  } else if (user?.avatar_url && user.avatar_url.trim() !== '') {
    userAvatar = user.avatar_url;
  } else if (user?.avatar && user.avatar.trim() !== '') {
    userAvatar = `${BASEIMGURL}${user.avatar}`;
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar
        showBack
        title={isViewingOtherProfile ? t('profile') : t('jw_my_profile')}
        onBackPress={handleBackPress}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {canSeeMyPage && (
            <TouchableOpacity
              style={styles.myPageButton}
              onPress={handleMyPagePress}
              activeOpacity={0.8}
            >
              <Icon name="storefront" size={16} color="#FFFFFF" />
              <Text style={styles.myPageButtonText}>{t('jw_my_page')}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={40} color={jewelleryColors.textSecondary} />
              </View>
            )}
          </View>
          {!isViewingOtherProfile && (
            <View style={styles.subscriptionStatusRow}>
              {subscriptionLabel ? (
                <View style={styles.subscriptionBadge}>
                  <Icon name="workspace-premium" size={16} color={jewelleryColors.primary} />
                  <Text style={styles.subscriptionStatusText}>
                    {t('jw_subscribed_plan', { plan: subscriptionLabel })}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.subscriptionBadgeMuted}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('PremiumAccessScreen')}
                >
                  <Icon name="lock" size={14} color={jewelleryColors.textSecondary} />
                  <Text style={styles.subscriptionStatusMuted}>{t('jw_not_subscribed')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        
          <View style={styles.profileHeaderRow}>
            <View style={styles.profileHeaderLeft}>
              <Text style={styles.userName}>{userName}</Text>
              {user?.email && (
                <Text style={styles.userEmail}>{user.email}</Text>
              )}
              {(() => {
                // Filter out basicUser and only show jewelry-related roles
                const jewelryRoles = user?.userType 
                  ? user.userType.filter(role => role !== 'basicUser' && role !== 'Basic User')
                  : [];
                
                if (jewelryRoles.length === 0) return null;
                
                return (
                  <View style={styles.userRoleContainer}>
                    <Icon name="badge" size={16} color={jewelleryColors.primary} />
                    <Text style={styles.userRole}>
                      {jewelryRoles.map((role) => {
                        // Format role names for display
                        const formattedRole = String(role)
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .trim();
                        return formattedRole;
                      }).filter(Boolean).join(', ')}
                    </Text>
                  </View>
                );
              })()}
            </View>
            {isViewingOtherProfile && (
              <FollowButton
                followStatus={followStatus}
                onPress={handleFollowAction}
                isLoading={isLoadingFollow}
              />
            )}
          </View>

          {/* Followers/Following Stats */}
          {displayUserId && (
            <View style={styles.statsContainer}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('FollowersFollowingScreen', {
                  type: 'Followers',
                  userId: displayUserId,
                })}
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>
                  {isLoadingCounts ? '...' : followersCount}
                </Text>
                <Text style={styles.statLabel}>{t('followers')}</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('FollowersFollowingScreen', {
                  type: 'Following',
                  userId: displayUserId,
                })}
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>
                  {isLoadingCounts ? '...' : followingCount}
                </Text>
                <Text style={styles.statLabel}>{t('following')}</Text>
              </TouchableOpacity>
            </View>
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
    position: 'relative',
  },
  myPageButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: jewelleryColors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  myPageButtonText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subscriptionStatusRow: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: jewelleryColors.primary,
  },
  subscriptionStatusText: {
    ...typography.bodySmall,
    color: jewelleryColors.primary,
    fontWeight: '600',
  },
  subscriptionBadgeMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  subscriptionStatusMuted: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
  },
  profileHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  profileHeaderLeft: {
    flex: 1,
    alignItems: 'center',
    marginRight: spacing.md,
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
  userRoleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  userRole: {
    ...typography.bodySmall,
    color: jewelleryColors.primary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: jewelleryColors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statNumber: {
    ...typography.heading3,
    color: jewelleryColors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: jewelleryColors.border,
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

