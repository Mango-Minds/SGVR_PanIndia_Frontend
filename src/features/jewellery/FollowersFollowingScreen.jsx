import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { getFollowers, getFollowing, unfollowUser, getShopByOwner } from '../../services/jewellery.services';
import { BASEIMGURL } from '../../infrastructure/constants';

const FollowersFollowingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { type, userId } = route.params; // 'Followers' or 'Following', and userId
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = { page: pageNum, limit: 20 };
      let response;
      
      if (type === 'Followers') {
        response = await getFollowers(userId, params);
      } else {
        response = await getFollowing(userId, params);
      }

      const newData = response.followers || response.following || [];
      const total = response.totalFollowers || response.totalFollowing || 0;
      
      setTotalCount(total);

      if (isRefresh || pageNum === 1) {
        setData(newData);
        setPage(2);
      } else {
        setData(prev => [...prev, ...newData]);
        setPage(prev => prev + 1);
      }

      // Check if there's more data
      const totalPages = response.totalPages || 1;
      setHasMore(pageNum < totalPages);
    } catch (error) {
      console.error(`Error fetching ${type.toLowerCase()}:`, error);
      Alert.alert('Error', `Failed to load ${type.toLowerCase()}`);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type, userId]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setHasMore(true);
      fetchData(1, false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, userId])
  );

  const handleRefresh = () => {
    setHasMore(true);
    fetchData(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && data.length > 0) {
      fetchData(page, false);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    Alert.alert(
      'Unfollow User',
      'Are you sure you want to unfollow this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            try {
              await unfollowUser(targetUserId);
              setData(prev => prev.filter(user => user._id !== targetUserId));
              setTotalCount(prev => Math.max(0, prev - 1));
              Alert.alert('Success', 'Unfollowed successfully');
            } catch (error) {
              console.error('Error unfollowing user:', error);
              Alert.alert('Error', 'Failed to unfollow user');
            }
          },
        },
      ]
    );
  };

  const handleUserPress = async (user) => {
    try {
      // Check if user has 'shop' in their userType
      const userTypes = Array.isArray(user.userType) ? user.userType : (user.userType ? [user.userType] : []);
      const hasShopRole = userTypes.some(type => 
        typeof type === 'string' && type.toLowerCase() === 'shop'
      );
      
      if (hasShopRole) {
        // User has shop role, try to get their shop
        const shop = await getShopByOwner(user._id);
        
        if (shop && shop._id) {
          // User has a shop, navigate to shop details
          navigation.navigate('ShopDetailScreen', { shopId: shop._id });
          return;
        }
      }
      
      // User doesn't have a shop or shop not found, navigate to profile
      navigation.navigate('ProfileScreen', { userId: user._id });
    } catch (error) {
      console.error('Error fetching shop for user:', error);
      // Fallback to profile screen if there's an error
      navigation.navigate('ProfileScreen', { userId: user._id });
    }
  };

  const renderItem = ({ item }) => {
    const userName = item.firstName && item.lastName
      ? `${item.firstName} ${item.lastName}`
      : item.email || 'User';
    
    const userImage = item.image
      ? `${BASEIMGURL}${item.image}`
      : null;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.userItemLeft}>
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={24} color={jewelleryColors.textSecondary} />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            {item.email && (
              <Text style={styles.userEmail}>{item.email}</Text>
            )}
          </View>
        </View>
        {type === 'Following' && (
          <TouchableOpacity
            style={styles.unfollowButton}
            onPress={() => handleUnfollow(item._id)}
          >
            <Text style={styles.unfollowText}>Unfollow</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={64} color={jewelleryColors.textSecondary} />
      <Text style={styles.emptyText}>
        {type === 'Followers'
          ? 'No followers yet'
          : 'Not following anyone yet'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={jewelleryColors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{type}</Text>
          {totalCount > 0 && (
            <Text style={styles.headerSubtitle}>{totalCount} {type.toLowerCase()}</Text>
          )}
        </View>
        <View style={styles.headerRight} />
      </View>

      {loading && data.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.loadingText}>Loading {type.toLowerCase()}...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[jewelleryColors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && data.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={jewelleryColors.primary} />
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: jewelleryColors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.heading2,
    color: jewelleryColors.text,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.xs,
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    paddingVertical: spacing.sm,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: jewelleryColors.border,
  },
  userItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
  },
  unfollowButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: jewelleryColors.error,
  },
  unfollowText: {
    ...typography.bodySmall,
    color: jewelleryColors.error,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.md,
  },
});

export default FollowersFollowingScreen;

