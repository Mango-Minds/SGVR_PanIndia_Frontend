import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import CarouselBanner from '../../components/Jewellery/CarouselBanner';
import CategoryIcon from '../../components/Jewellery/CategoryIcon';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('home');

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        // Already on home
        break;
      case 'search':
        navigation.navigate('BrowseScreen');
        break;
      case 'profile':
        navigation.navigate('ProfileScreen');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar 
        showBack 
        showNotification 
        showShare 
        onBackPress={() => navigation.navigate('Dashboard')}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carousel Banner */}
        <CarouselBanner items={bannerItems} />

        {/* Category Grid */}
        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesRow}>
            {categories.slice(0, 4).map((category) => (
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
          <View style={styles.categoriesRowSingle}>
            <CategoryIcon
              key={categories[4].key}
              name={categories[4].name}
              icon={categories[4].icon}
              color={categories[4].color}
              onPress={categories[4].onPress}
              size={70}
            />
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

