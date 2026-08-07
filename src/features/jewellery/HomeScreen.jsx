import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CarouselBanner from '../../components/Jewellery/CarouselBanner';
import CategoryIcon from '../../components/Jewellery/CategoryIcon';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import goldSilverRatesService from '../../services/goldSilverRates.service';
import { useSelector, useDispatch } from 'react-redux';
import { requireAuth, navigateJewelleryAuthTab } from '../../utils/requireAuth';
import { jewelleryColors, spacing, commonStyles } from '../../styles/jewellery.styles';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, isGuest } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('home');

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('home');
    }, [])
  );
  const [spotRates, setSpotRates] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);

  // Banner items for carousel
  const bannerItems = [
    {
      title: 'Limited Deals',
      subtitle: 'YOUR SPARKLE, OUR TREAT!',
      offer: 'GET 100% OFF',
      offerSubtext: 'making charges',
      offerSubtext2: 'select Diamond Jewellery',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=400&fit=crop',
    },
    {
      title: 'Premium Collection',
      subtitle: 'EXQUISITE DESIGNS AWAIT',
      offer: 'UP TO 50% OFF',
      offerSubtext: 'on gold jewellery',
      offerSubtext2: 'limited time offer',
      image: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=400&fit=crop',
    },
    {
      title: 'New Arrivals',
      subtitle: 'TRENDING NOW',
      offer: 'FLAT 30% OFF',
      offerSubtext: 'on diamond sets',
      offerSubtext2: 'shop now',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=400&fit=crop',
    },
  ];

  const handleCategoryPress = (screen, message) => {
    requireAuth({
      token,
      isGuest,
      dispatch,
      navigation,
      onAuthed: () => navigation.navigate(screen),
      message,
    });
  };

  // Category icons configuration (MaterialCommunityIcons)
  const categories = [
    {
      key: 'jewellery',
      name: 'Jewellery',
      icon: 'necklace',
      color: jewelleryColors.categoryGold,
      onPress: () => navigation.navigate('JewellerysHomeScreen'),
    },
    {
      key: 'gems',
      name: 'Gems',
      icon: 'diamond-stone',
      color: jewelleryColors.categoryBlue,
      onPress: () => navigation.navigate('GemsHomeScreen'),
    },
    {
      key: 'tools',
      name: 'Tools',
      icon: 'hammer-wrench',
      color: jewelleryColors.categoryOrange,
      onPress: () => navigation.navigate('ToolsScreen'),
    },
    {
      key: 'events',
      name: 'Events',
      icon: 'calendar-star',
      color: jewelleryColors.categoryPurple,
      onPress: () => navigation.navigate('EventsHomeScreen'),
    },
    {
      key: 'bullion',
      name: 'Bullion',
      icon: 'gold',
      color: jewelleryColors.categoryTeal,
      onPress: () => navigation.navigate('BullionScreen'),
    },
    {
      key: 'goldTesting',
      name: 'Gold Testing',
      icon: 'flask-outline',
      color: jewelleryColors.categoryGold,
      onPress: () => navigation.navigate('GoldTestingCentresScreen'),
    },
    {
      key: 'goldRefinery',
      name: 'Gold Refinery',
      icon: 'factory',
      color: jewelleryColors.categoryBlue,
      onPress: () => navigation.navigate('GoldRefineryScreen'),
    },
    {
      key: 'logistics',
      name: 'Logistics',
      icon: 'truck-delivery-outline',
      color: jewelleryColors.categoryOrange,
      onPress: () => navigation.navigate('LogisticsScreen'),
    },
    {
      key: 'jobs',
      name: 'Jobs',
      icon: 'briefcase-outline',
      color: jewelleryColors.categoryPurple,
      onPress: () => navigation.navigate('JobsScreen'),
    },
    {
      key: 'goldAssociations',
      name: 'Gold Association',
      icon: 'handshake-outline',
      color: jewelleryColors.categoryTeal,
      onPress: () => navigation.navigate('GoldAssociationsScreen'),
    },
  ];
  // Fetch spot rates for banners
  useEffect(() => {
    const loadSpotRates = async () => {
      try {
        setLoadingRates(true);
        const data = await goldSilverRatesService.fetchSpotRates();
        setSpotRates(data);
      } catch (error) {
        console.error('Error loading spot rates:', error);
        // Set default values if API fails
        setSpotRates({
          gold: { spot: 6500, high: 6600, low: 6400 },
          silver: { spot: 85, high: 86, low: 84 },
        });
      } finally {
        setLoadingRates(false);
      }
    };

    loadSpotRates();
    
    // Refresh spot rates every 30 seconds
    const interval = setInterval(loadSpotRates, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        // Already on jewellery home — stay here
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
      <HeaderBar 
        showBack 
        showNotification={false}
        showShare={false}
        onBackPress={() => navigation.navigate('Dashboard')}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carousel Banner */}
        <CarouselBanner items={bannerItems} />

        {/* Gold & Silver Spot Price Banners */}
        <View style={styles.spotBannersContainer}>
          <TouchableOpacity
            style={[styles.spotBanner, styles.goldBanner]}
            onPress={() => navigation.navigate('LiveRatesScreen')}
            activeOpacity={0.8}
          >
            {loadingRates ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <View style={styles.spotBannerMainRow}>
                  <Text style={styles.spotBannerTitle}>GOLD</Text>
                  <Text style={styles.spotBannerPrice}>
                    ₹{spotRates?.gold?.spot?.toLocaleString('en-IN') || '6,500'}
                    <Text style={styles.spotBannerSubtext}>/g</Text>
                  </Text>
                </View>
                <Text style={styles.spotBannerRangeText} numberOfLines={1} adjustsFontSizeToFit>
                  L ₹{spotRates?.gold?.low?.toLocaleString('en-IN') || '6,400'} · H ₹{spotRates?.gold?.high?.toLocaleString('en-IN') || '6,600'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.spotBanner, styles.silverBanner]}
            onPress={() => navigation.navigate('LiveRatesScreen')}
            activeOpacity={0.8}
          >
            {loadingRates ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <View style={styles.spotBannerMainRow}>
                  <Text style={styles.spotBannerTitle}>SILVER</Text>
                  <Text style={styles.spotBannerPrice}>
                    ₹{spotRates?.silver?.spot?.toFixed(2) || '85.00'}
                    <Text style={styles.spotBannerSubtext}>/g</Text>
                  </Text>
                </View>
                <Text style={styles.spotBannerRangeText} numberOfLines={1} adjustsFontSizeToFit>
                  L ₹{spotRates?.silver?.low?.toFixed(2) || '84.00'} · H ₹{spotRates?.silver?.high?.toFixed(2) || '86.00'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Grid */}
        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <View key={category.key} style={styles.categoryItem}>
                <CategoryIcon
                  name={category.name}
                  icon={category.icon}
                  color={category.color}
                  onPress={category.onPress}
                  size={70}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Tab Navigation */}
      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  spotBannersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  spotBanner: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 76,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  goldBanner: {
    backgroundColor: '#D4AF37',
  },
  silverBanner: {
    backgroundColor: '#8C8C8C',
  },
  spotBannerMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  spotBannerTitle: {
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontSize: 11,
    lineHeight: 16,
    paddingTop: 2,
    includeFontPadding: true,
  },
  spotBannerPrice: {
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    paddingTop: 2,
    includeFontPadding: true,
  },
  spotBannerSubtext: {
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: 10,
    lineHeight: 15,
    paddingTop: 1,
    includeFontPadding: true,
  },
  spotBannerRangeText: {
    color: '#FFFFFF',
    fontSize: 9,
    lineHeight: 14,
    paddingTop: 2,
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.9,
    minWidth: 0,
    flexShrink: 1,
    includeFontPadding: true,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  categoryItem: {
    width: '25%', // 4 icons per row
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingHorizontal: 0,
  },
  categoriesRowSingle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingHorizontal: 0,
  },
});

export default HomeScreen;

