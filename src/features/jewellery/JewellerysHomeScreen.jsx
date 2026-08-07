import React, { useState, useEffect, useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';
import CarouselBanner from '../../components/Jewellery/CarouselBanner';
import CategoryIcon from '../../components/Jewellery/CategoryIcon';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import goldSilverRatesService from '../../services/goldSilverRates.service';
import { useSelector, useDispatch } from 'react-redux';
import { requireAuth, navigateJewelleryAuthTab } from '../../utils/requireAuth';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const JewellerysHomeScreen = () => {
  const { t } = useTranslation();
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
  const bannerItems = useMemo(
    () => [
      {
        title: t('jw_banner_limited_deals'),
        subtitle: t('jw_banner_sparkle'),
        offer: t('jw_banner_100_off'),
        offerSubtext: t('jw_banner_making_charges'),
        offerSubtext2: t('jw_banner_select_diamond'),
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=400&fit=crop',
      },
      {
        title: t('jw_banner_premium'),
        subtitle: t('jw_banner_exquisite'),
        offer: t('jw_banner_50_off'),
        offerSubtext: t('jw_banner_gold_jewellery'),
        offerSubtext2: t('jw_banner_limited_offer'),
        image: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=400&fit=crop',
      },
      {
        title: t('jw_banner_new_arrivals'),
        subtitle: t('jw_banner_trending'),
        offer: t('jw_banner_30_off'),
        offerSubtext: t('jw_banner_diamond_sets'),
        offerSubtext2: t('jw_banner_shop_now'),
        image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=400&fit=crop',
      },
    ],
    [t]
  );

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
      key: 'shops',
      name: t('jw_shops'),
      icon: 'storefront-outline',
      color: jewelleryColors.categoryGold,
      onPress: () => navigation.navigate('JewellerysScreen'),
    },
    {
      key: 'vendors',
      name: t('jw_vendors'),
      icon: 'account-tie-outline',
      color: jewelleryColors.categoryBlue,
      onPress: () => handleCategoryPress('VendorsScreen', t('jw_sign_in_vendors')),
    },
    {
      key: 'manufacture',
      name: t('jw_manufacture'),
      icon: 'palette-swatch-outline',
      color: jewelleryColors.categoryPurple,
      onPress: () => handleCategoryPress('DesignersScreen', t('jw_sign_in_manufacture')),
    },
    {
      key: 'karegars',
      name: t('jw_karegars'),
      icon: 'account-hard-hat',
      color: jewelleryColors.categoryOrange,
      onPress: () => handleCategoryPress('WorkersScreen', t('jw_sign_in_workers')),
    },{
      key: 'product requirement',
      name: t('jw_product_requirement'),
      icon: 'clipboard-list-outline',
      color: jewelleryColors.categoryTeal,
      onPress: () => navigation.navigate('ProductRequirementsScreen'),
    }
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
        navigation.navigate('Dashboard');
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
        onBackPress={() => navigation.navigate('HomeScreen')}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carousel Banner */}
        <CarouselBanner items={bannerItems} />

        <View style={styles.screenTitleContainer}>
          <Text style={styles.screenTitle}>{t('jw_jewellery_home')}</Text>
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
  screenTitleContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  screenTitle: {
    ...typography.heading2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: jewelleryColors.text,
    paddingTop: 4,
    includeFontPadding: true,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 68,
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
    color: '#8C8C8C',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontSize: 11,
    justifyContent: 'center',
    textAlign: 'center',
  },
  spotBannerPrice: {
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 16,
  },
  spotBannerSubtext: {
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: 10,
  },
  spotBannerRangeText: {
    color: '#FFFFFF',
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.9,
    minWidth: 0,
    flexShrink: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  categoryItem: {
    width: '25%', // 4 icons per row
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 2,
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

export default JewellerysHomeScreen;

