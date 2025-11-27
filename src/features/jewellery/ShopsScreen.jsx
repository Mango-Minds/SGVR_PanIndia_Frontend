import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ShopCard from '../../components/Jewellery/ShopCard';
import FilterDropdown from '../../components/Jewellery/FilterDropdown';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const ShopsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('home');
  const [locationFilter, setLocationFilter] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);
  const [shopFilter, setShopFilter] = useState(null);

  // Mock shop data - replace with actual API call
  const shops = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
      name: 'Royal Gems',
      owner: 'Suresh Patel',
      rating: 4.8,
      reviewCount: 125,
      address: 'MG Road, Hyderabad',
      hours: '10:00 AM - 07:00 PM',
      isVerified: true,
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      name: 'Krishna Jewellers',
      owner: 'Anil Reddy',
      rating: 4.8,
      reviewCount: 125,
      address: 'MG Road, Hyderabad',
      hours: '10:00 AM - 07:00 PM',
      isVerified: true,
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=400&h=400&fit=crop',
      name: 'Rajshree Jewellers',
      owner: 'Rajesh Kumar',
      rating: 4.9,
      reviewCount: 203,
      address: 'Banjara Hills, Hyderabad',
      hours: '09:30 AM - 08:00 PM',
      isVerified: true,
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
      name: 'KISNA DIAMOND & GOLD JEWELLER',
      owner: 'Vikram Singh',
      rating: 4.7,
      reviewCount: 98,
      address: 'Secunderabad, Hyderabad',
      hours: '10:00 AM - 07:30 PM',
      isVerified: true,
    },
  ];

  const locationOptions = [
    { label: 'Hyderabad', value: 'hyderabad' },
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Delhi', value: 'delhi' },
  ];

  const brandOptions = [
    { label: 'Tanishq', value: 'tanishq' },
    { label: 'Kalyan', value: 'kalyan' },
  ];

  const shopOptions = [
    { label: 'All Shops', value: 'all' },
    { label: 'Verified Only', value: 'verified' },
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
        navigation.navigate('ProfileScreen');
        break;
      default:
        break;
    }
  };

  const renderShop = ({ item }) => (
    <ShopCard
      id={item.id}
      image={item.image}
      name={item.name}
      owner={item.owner}
      rating={item.rating}
      reviewCount={item.reviewCount}
      address={item.address}
      hours={item.hours}
      isVerified={item.isVerified}
      onPress={() => navigation.navigate('ShopDetailScreen', { shopId: item.id })}
    />
  );

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Shops" showNotification showShare />

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
          <TouchableOpacity style={styles.filterButton}>
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
        {shops.map((shop) => (
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
        ))}
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
});

export default ShopsScreen;

