import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ShopCard from '../../components/Jewellery/ShopCard';
import FilterDropdown from '../../components/Jewellery/FilterDropdown';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { getShops } from '../../services/jewellery.services';
import { requireAuth, navigateJewelleryAuthTab } from '../../utils/requireAuth';
import { resolveImageUrl } from '../../utils/mapJewelryProduct';

const getShopImageUri = (shop) => {
  const candidates = [
    shop?.image,
    shop?.profileImage,
    shop?.shopImage,
    shop?.owner?.image,
    Array.isArray(shop?.images) && shop.images.length > 0 ? shop.images[0] : null,
  ];
  for (const candidate of candidates) {
    const uri = resolveImageUrl(candidate);
    if (uri) return uri;
  }
  return null;
};

const JewellerysScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, isGuest } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('home');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationFilter, setLocationFilter] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);
  const [shopFilter, setShopFilter] = useState(null);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('JewellerysHomeScreen');
  };

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('home');
    }, [])
  );

  // Fetch shops from API
  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for API
      const params = {};
      if (locationFilter) {
        params.location = locationFilter;
      }
      if (brandFilter) {
        params.brand = brandFilter;
      }
      
      // Use getShops service function which supports filters
      const response = await getShops(params);
      
      console.log('Shops API Response:', JSON.stringify(response, null, 2));
      
      // Handle different response structures
      let shopsData = [];
      if (Array.isArray(response)) {
        shopsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        shopsData = response.data;
      } else if (response?.shops && Array.isArray(response.shops)) {
        shopsData = response.shops;
      } else {
        shopsData = [];
      }
      
      console.log('Extracted shops data:', shopsData.length, 'shops');
      
      // Apply brand filter client-side if API doesn't support it
      if (brandFilter && !params.brand) {
        shopsData = shopsData.filter(shop => {
          const shopBrand = (shop.brand || shop.shopName || shop.name || '').toLowerCase();
          return shopBrand.includes(brandFilter.toLowerCase());
        });
      }

      // Filter verified shops if needed
      let filteredShops = shopsData;
      if (shopFilter === 'verified') {
        filteredShops = shopsData.filter(shop => shop.isVerified || shop.verified);
      }

      // Map API response to ShopCard props
      const mappedShops = filteredShops.map((shop) => {
        // Get owner name
        let ownerName = t('jw_owner');
        if (shop.owner) {
          if (typeof shop.owner === 'object') {
            ownerName = shop.owner.firstName && shop.owner.lastName
              ? `${shop.owner.firstName} ${shop.owner.lastName}`
              : shop.owner.name || shop.owner.firstName || t('jw_owner');
          } else {
            ownerName = shop.owner;
          }
        }

        // Get shop image (API may use image, profileImage, images[], or owner.image)
        const shopImage = getShopImageUri(shop);

        // Get address
        const address = shop.address || 
          (shop.city && shop.state ? `${shop.city}, ${shop.state}` : '') ||
          shop.location ||
          t('jw_address_unavailable');

        // Get hours
        const hours = shop.hours || 
          shop.timing || 
          shop.openingHours ||
          (shop.openTime && shop.closeTime ? `${shop.openTime} - ${shop.closeTime}` : t('jw_hours_unavailable'));

        // Get rating and reviews
        const rating = shop.rating || shop.averageRating || 0;
        const reviewCount = shop.reviewCount || shop.reviewsCount || shop.totalReviews || 0;

        return {
          id: shop._id || shop.id,
          image: shopImage,
          name: shop.shopName || shop.name || t('jw_shop'),
          owner: ownerName,
          rating: typeof rating === 'number' ? rating : parseFloat(rating) || 0,
          reviewCount: typeof reviewCount === 'number' ? reviewCount : parseInt(reviewCount) || 0,
          address: address,
          hours: hours,
          isVerified: shop.isVerified || shop.verified || false,
        };
      });

      console.log('Mapped shops:', mappedShops.length, 'shops');
      setShops(mappedShops);
    } catch (err) {
      console.error('Error fetching shops:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(t('jw_load_shops_error'));
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, [locationFilter, brandFilter, shopFilter, t]);

  // Fetch shops on mount and when filters change
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Filter options - can be populated from API if needed
  // Note: Backend uses regex matching, so these values will match variations
  // e.g., 'mumbai' matches "Mumbai", "Greater Mumbai", "Navi Mumbai"
  // e.g., 'delhi' matches "Delhi", "New Delhi"
  // e.g., 'bengaluru' matches "Bengaluru" (not "Bangalore" - use 'bengaluru' for consistency)
  const locationOptions = useMemo(() => [
    { label: t('jw_all_locations'), value: null },
    { label: 'Hyderabad', value: 'hyderabad' },
    { label: 'Greater Mumbai', value: 'mumbai' }, // Matches "Mumbai", "Greater Mumbai", "Navi Mumbai"
    { label: 'Delhi', value: 'delhi' }, // Matches "Delhi", "New Delhi"
    { label: 'Bengaluru', value: 'bengaluru' }, // Matches "Bengaluru" (standard spelling)
  ], [t]);

  const brandOptions = useMemo(() => [
    { label: t('jw_all_brands'), value: null },
    { label: 'Tanishq', value: 'tanishq' },
    { label: 'Kalyan', value: 'kalyan' },
  ], [t]);

  const shopOptions = useMemo(() => [
    { label: t('jw_all_shops'), value: 'all' },
    { label: t('jw_verified_only'), value: 'verified' },
  ], [t]);

  // Handle filter button press
  const handleFilterPress = () => {
    fetchShops();
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
      case 'message':
      case 'notifications':
        navigateJewelleryAuthTab(tab, { token, isGuest, dispatch, navigation });
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title={t('jw_jewellery_shops')} onBackPress={handleBackPress} />

      {/* Filter Bar */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <FilterDropdown
            label={t('jw_location')}
            options={locationOptions}
            selectedValue={locationFilter}
            onSelect={setLocationFilter}
          />
          <FilterDropdown
            label={t('jw_brand')}
            options={brandOptions}
            selectedValue={brandFilter}
            onSelect={setBrandFilter}
          />
          <FilterDropdown
            label={t('jw_shop')}
            options={shopOptions}
            selectedValue={shopFilter}
            onSelect={setShopFilter}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <Text style={styles.filterButtonText}>{t('jw_filter')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Shop List */}
      <ScrollView 
        style={styles.shopsScrollView}
        contentContainerStyle={styles.shopsContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={jewelleryColors.primary} />
            <Text style={styles.loadingText}>{t('jw_loading_shops')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color={jewelleryColors.textSecondary} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchShops}
            >
              <Text style={styles.retryButtonText}>{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : shops.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="store" size={48} color={jewelleryColors.textSecondary} />
            <Text style={styles.emptyText}>{t('jw_no_shops')}</Text>
            <Text style={styles.emptySubtext}>{t('jw_adjust_filters')}</Text>
          </View>
        ) : (
          shops.map((shop) => (
          <ShopCard
            key={shop.id}
            id={shop.id}
            image={shop.image}
            name={shop.name}
            owner={shop.owner}
            rating={shop.rating}
            reviewCount={shop.reviewCount}
            address={shop.address}
            hours={shop.hours}
            isVerified={shop.isVerified}
            onPress={() => navigation.navigate('ShopDetailScreen', { shopId: shop.id })}
          />
          ))
        )}
      </ScrollView>

      {/* View More Button */}
      <TouchableOpacity 
        style={styles.viewMoreButton}
        onPress={() =>
          requireAuth({
            token,
            isGuest,
            dispatch,
            navigation,
            onAuthed: () => navigation.navigate('PremiumAccessScreen'),
            message: t('jw_sign_in_premium_shops'),
          })
        }
      >
        <Icon name="visibility" size={20} color="#FFFFFF" />
        <Text style={styles.viewMoreText}>{t('jw_view_more_shops')}</Text>
      </TouchableOpacity>

      {/* Subscription Prompt */}
      <View style={styles.subscriptionPrompt}>
        <Text style={styles.subscriptionText}>
          {t('jw_subscribe_verified_shops')}
        </Text>
      </View>

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  filterWrapper: {
    backgroundColor: jewelleryColors.bg,
    borderBottomWidth: 1,
    borderBottomColor: jewelleryColors.border,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: jewelleryColors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    height: 36,
    alignItems: 'center',
  },
  filterButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shopsScrollView: {
    flex: 1,
  },
  shopsContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.md,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  viewMoreText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subscriptionPrompt: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  subscriptionText: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    minHeight: 200,
  },
  loadingText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    minHeight: 200,
  },
  errorText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: jewelleryColors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    minHeight: 200,
  },
  emptyText: {
    ...typography.body,
    color: jewelleryColors.text,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default JewellerysScreen;

