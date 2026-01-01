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
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const HomeScreen = () => {
  const navigation = useNavigation();
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

  // Category icons configuration
  const categories = [
    {
      key: 'shops',
      name: 'Shops',
      icon: 'store',
      color: jewelleryColors.categoryGold,
      onPress: () => navigation.navigate('ShopsScreen'),
    },
    {
      key: 'vendors',
      name: 'Vendors',
      icon: 'person',
      color: jewelleryColors.categoryBlue,
      onPress: () => navigation.navigate('VendorsScreen'),
    },
    {
      key: 'workers',
      name: 'Workers',
      icon: 'people',
      color: jewelleryColors.categoryOrange,
      onPress: () => navigation.navigate('WorkersScreen'),
    },
    {
      key: 'designers',
      name: 'Designers',
      icon: 'star',
      color: jewelleryColors.categoryPurple,
      onPress: () => navigation.navigate('DesignersScreen'),
    },
    {
      key: 'gemologist',
      name: 'Gemologist',
      icon: 'diamond',
      color: jewelleryColors.categoryTeal,
      onPress: () => navigation.navigate('GemologistScreen'),
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
        // Navigate to main Dashboard from jewelry module home page
        navigation.navigate('Dashboard');
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
                <Text style={styles.spotBannerTitle}>GOLD</Text>
                <Text style={styles.spotBannerPrice}>
                  ₹{spotRates?.gold?.spot?.toLocaleString('en-IN') || '6,500'}
                </Text>
                <Text style={styles.spotBannerSubtext}>per gram</Text>
                <View style={styles.spotBannerRange}>
                  <Text style={styles.spotBannerRangeText} numberOfLines={1} adjustsFontSizeToFit>
                    L: ₹{spotRates?.gold?.low?.toLocaleString('en-IN') || '6,400'} | H: ₹{spotRates?.gold?.high?.toLocaleString('en-IN') || '6,600'}
                  </Text>
                </View>
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
                <Text style={styles.spotBannerTitle}>SILVER</Text>
                <Text style={styles.spotBannerPrice}>
                  ₹{spotRates?.silver?.spot?.toFixed(2) || '85.00'}
                </Text>
                <Text style={styles.spotBannerSubtext}>per gram</Text>
                <View style={styles.spotBannerRange}>
                  <Text style={styles.spotBannerRangeText} numberOfLines={1} adjustsFontSizeToFit>
                    L: ₹{spotRates?.silver?.low?.toFixed(2) || '84.00'} | H: ₹{spotRates?.silver?.high?.toFixed(2) || '86.00'}
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Grid */}
        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesRow}>
            {categories.slice(0, 3).map((category) => (
              <CategoryIcon
                key={category.key}
                name={category.name}
                icon={category.icon}
                color={category.color}
                onPress={category.onPress}
                size={70}
              />
            ))}
          </View>
          <View style={styles.categoriesRow}>
            {categories.slice(3, 5).map((category) => (
              <CategoryIcon
                key={category.key}
                name={category.name}
                icon={category.icon}
                color={category.color}
                onPress={category.onPress}
                size={70}
              />
            ))}
            {/* Empty space to maintain layout */}
            <View style={{ width: 70 }} />
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
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  spotBanner: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  goldBanner: {
    backgroundColor: '#D4AF37', // Darker gold for better text contrast
  },
  silverBanner: {
    backgroundColor: '#8C8C8C', // Darker silver for better text contrast
  },
  spotBannerTitle: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 14,
  },
  spotBannerPrice: {
    ...typography.heading2,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    fontSize: 24,
  },
  spotBannerSubtext: {
    ...typography.caption,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: spacing.sm,
    fontSize: 11,
  },
  spotBannerRange: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    width: '100%',
  },
  spotBannerRangeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    minWidth: 0,
    flexShrink: 1,
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

