import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProductCard from '../../components/Jewellery/ProductCard';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { navigateJewelleryAuthTab, requireAuth } from '../../utils/requireAuth';
import {
  getWishlistItems,
  removeWishlistItem,
} from '../../utils/jewelleryWishlist';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const NUM_COLUMNS = 2;
const GRID_PADDING = spacing.md;
const GRID_GAP = spacing.sm;
const CARD_WIDTH = Math.floor(
  (Dimensions.get('window').width - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS
);

const WishlistScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, isGuest } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('profile');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWishlist = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const wishlistItems = await getWishlistItems();
      setItems(wishlistItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      Alert.alert(t('error'), t('jw_load_wishlist_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('profile');

      if (!token) {
        setLoading(false);
        setItems([]);
        requireAuth({
          token,
          isGuest,
          dispatch,
          navigation,
          message: t('jw_sign_in_saved'),
        });
        return;
      }

      loadWishlist();
    }, [token, isGuest, dispatch, navigation, loadWishlist, t])
  );

  const gridItems = useMemo(() => {
    const padCount = (NUM_COLUMNS - (items.length % NUM_COLUMNS)) % NUM_COLUMNS;
    if (padCount === 0) return items;
    return [
      ...items,
      ...Array.from({ length: padCount }, (_, i) => ({
        id: `wishlist-pad-${i}`,
        empty: true,
      })),
    ];
  }, [items]);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('ProfileScreen');
  };

  const handleRemove = (product) => {
    Alert.alert(
      t('jw_remove_wishlist_title'),
      t('jw_remove_wishlist_msg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              const nextItems = await removeWishlistItem(product.id);
              setItems(nextItems);
            } catch (error) {
              console.error('Error removing wishlist item:', error);
              Alert.alert(t('error'), t('jw_wishlist_remove_error'));
            }
          },
        },
      ]
    );
  };

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
        navigation.navigate('ProfileScreen');
        break;
      case 'message':
      case 'notifications':
        navigateJewelleryAuthTab(tab, { token, isGuest, dispatch, navigation });
        break;
      default:
        break;
    }
  };

  const renderItem = ({ item }) => {
    if (item.empty) {
      return <View style={styles.gridSpacer} />;
    }

    return (
      <View style={styles.gridItem}>
        <ProductCard
          id={item.id}
          image={item.image}
          title={item.title}
          shop={item.shop}
          price={item.price}
          rating={item.rating}
          reviewCount={item.reviewCount}
          isWishlisted
          onPress={() =>
            navigation.navigate('ProductDetailScreen', { productId: item.id })
          }
          onWishlist={() => handleRemove(item)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title={t('jw_saved_items')} onBackPress={handleBackPress} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
        </View>
      ) : (
        <FlatList
          data={gridItems}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && styles.emptyListContent,
          ]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadWishlist(true)}
              tintColor={jewelleryColors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="favorite-border" size={56} color={jewelleryColors.textSecondary} />
              <Text style={styles.emptyTitle}>{t('jw_no_saved_yet')}</Text>
              <Text style={styles.emptySubtitle}>
                {t('jw_wishlist_empty_hint')}
              </Text>
            </View>
          }
        />
      )}

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  gridItem: {
    width: CARD_WIDTH,
  },
  gridSpacer: {
    width: CARD_WIDTH,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.heading3,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
});

export default WishlistScreen;
