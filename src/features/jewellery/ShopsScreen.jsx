import React, { useState, useEffect, useCallback } from 'react';
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
import ShopCard from '../../components/Jewellery/ShopCard';
import FilterDropdown from '../../components/Jewellery/FilterDropdown';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { getShopData } from '../../services/jewellery.services';
import { BASEIMGURL } from '../../infrastructure/constants';

const ShopsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('home');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationFilter, setLocationFilter] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);
  const [shopFilter, setShopFilter] = useState(null);

  const handleBackPress = () => {
    navigation.navigate('HomeScreen');
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
      
      // Use getShopData service function
      const response = await getShopData();
      
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
      
      // Apply location filter if needed
      if (locationFilter) {
        shopsData = shopsData.filter(shop => {
          const shopLocation = (shop.city || '').toLowerCase() || 
                              (shop.state || '').toLowerCase() ||
                              (shop.address || '').toLowerCase();
          return shopLocation.includes(locationFilter.toLowerCase());
        });
      }
      
      // Apply brand filter if needed
      if (brandFilter) {
        shopsData = shopsData.filter(shop => {
          const shopBrand = (shop.brand || shop.shopName || '').toLowerCase();
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
        let ownerName = 'Owner';
        if (shop.owner) {
          if (typeof shop.owner === 'object') {
            ownerName = shop.owner.firstName && shop.owner.lastName
              ? `${shop.owner.firstName} ${shop.owner.lastName}`
              : shop.owner.name || shop.owner.firstName || 'Owner';
          } else {
            ownerName = shop.owner;
          }
        }

        // Get shop image
        let shopImage = null;
        if (shop.image) {
          shopImage = shop.image.startsWith('http') 
            ? shop.image 
            : `${BASEIMGURL}${shop.image}`;
        } else if (shop.owner?.image) {
          shopImage = shop.owner.image.startsWith('http')
            ? shop.owner.image
            : `${BASEIMGURL}${shop.owner.image}`;
        } else if (shop.shopImage) {
          shopImage = shop.shopImage.startsWith('http')
            ? shop.shopImage
            : `${BASEIMGURL}${shop.shopImage}`;
        }

        // Get address
        const address = shop.address || 
          (shop.city && shop.state ? `${shop.city}, ${shop.state}` : '') ||
          shop.location ||
          'Address not available';

        // Get hours
        const hours = shop.hours || 
          shop.timing || 
          shop.openingHours ||
          (shop.openTime && shop.closeTime ? `${shop.openTime} - ${shop.closeTime}` : 'Hours not available');

        // Get rating and reviews
        const rating = shop.rating || shop.averageRating || 0;
        const reviewCount = shop.reviewCount || shop.reviewsCount || shop.totalReviews || 0;

        return {
          id: shop._id || shop.id,
          image: shopImage,
          name: shop.shopName || shop.name || 'Shop',
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
      setError('Failed to load shops. Please try again.');
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, [locationFilter, brandFilter, shopFilter]);

  // Fetch shops on mount and when filters change
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Filter options - can be populated from API if needed
  const locationOptions = [
    { label: 'All Locations', value: null },
    { label: 'Hyderabad', value: 'hyderabad' },
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Bangalore', value: 'bangalore' },
  ];

  const brandOptions = [
    { label: 'All Brands', value: null },
    { label: 'Tanishq', value: 'tanishq' },
    { label: 'Kalyan', value: 'kalyan' },
  ];

  const shopOptions = [
    { label: 'All Shops', value: 'all' },
    { label: 'Verified Only', value: 'verified' },
  ];

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
        navigation.navigate('ProfileScreen');
        break;
      case 'message':
        navigation.navigate('ChatScreen');
        break;
      case 'notifications':
        navigation.navigate('JewelleryNotifications');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Shops" onBackPress={handleBackPress} />

      {/* Filter Bar */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <FilterDropdown
            label="Location"
            options={locationOptions}
            selectedValue={locationFilter}
            onSelect={setLocationFilter}
          />
          <FilterDropdown
            label="Brand"
            options={brandOptions}
            selectedValue={brandFilter}
            onSelect={setBrandFilter}
          />
          <FilterDropdown
            label="Shop"
            options={shopOptions}
            selectedValue={shopFilter}
            onSelect={setShopFilter}
          />
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <Text style={styles.filterButtonText}>Filter</Text>
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
            <Text style={styles.loadingText}>Loading shops...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color={jewelleryColors.textSecondary} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchShops}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : shops.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="store" size={48} color={jewelleryColors.textSecondary} />
            <Text style={styles.emptyText}>No shops found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
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
        onPress={() => navigation.navigate('PremiumAccessScreen')}
      >
        <Icon name="visibility" size={20} color="#FFFFFF" />
        <Text style={styles.viewMoreText}>View More Shops</Text>
      </TouchableOpacity>

      {/* Subscription Prompt */}
      <View style={styles.subscriptionPrompt}>
        <Text style={styles.subscriptionText}>
          Subscribe to access 100 + Verified Jewellery stores
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

export default ShopsScreen;

