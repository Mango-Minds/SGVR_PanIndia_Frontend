import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requireAuth, navigateJewelleryAuthTab } from '../../utils/requireAuth';
import ProductCard from '../../components/Jewellery/ProductCard';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const BrowseScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, isGuest } = useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('search');

  const handleBackPress = () => {
    navigation.navigate('HomeScreen');
  };

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('search');
    }, [])
  );
  const [wishlistedItems, setWishlistedItems] = useState([]);

  const categories = ['All', 'Rings', 'Bracelets', 'Chains', 'Earrings', 'Necklaces'];

  // Mock product data - replace with actual API call
  const products = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=400&h=400&fit=crop',
      title: 'Diamond Ring',
      shop: 'Golden Jewels',
      price: '3K',
      rating: 4.8,
      reviewCount: 125,
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      title: 'Ear Rings',
      shop: 'Golden Jewels',
      price: '3K',
      rating: 4.8,
      reviewCount: 89,
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
      title: 'Necklace',
      shop: 'Golden Jewels',
      price: '3K',
      rating: 4.8,
      reviewCount: 203,
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
      title: 'Gold Bracelet',
      shop: 'Golden Jewels',
      price: '3K',
      rating: 4.8,
      reviewCount: 95,
    },
    {
      id: '5',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
      title: 'Diamond Ring',
      shop: 'Golden Jewels',
      price: '3K',
      rating: 4.8,
      reviewCount: 142,
    },
    {
      id: '6',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
      title: 'Pearl Necklace',
      shop: 'Golden Jewels',
      price: '3K',
      rating: 4.8,
      reviewCount: 178,
    },
    {
      id: '7',
      image: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=400&h=400&fit=crop',
      title: 'Gold Chain',
      shop: 'Golden Jewels',
      price: '3K',
      rating: 4.8,
      reviewCount: 156,
    },
    {
      id: '8',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      title: 'Diamond Earrings',
      shop: 'Golden Jewels',
      price: '3K',
      rating: 4.8,
      reviewCount: 134,
    },
  ];

  const handleWishlist = (productId) => {
    requireAuth({
      token,
      isGuest,
      dispatch,
      navigation,
      message: 'Sign in to save items to your wishlist.',
      onAuthed: () => {
        setWishlistedItems((prev) =>
          prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId]
        );
      },
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        navigation.navigate('HomeScreen');
        break;
      case 'search':
        // Already on search
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

  const renderProduct = ({ item }) => (
    <ProductCard
      id={item.id}
      image={item.image}
      title={item.title}
      shop={item.shop}
      price={item.price}
      rating={item.rating}
      reviewCount={item.reviewCount}
      isWishlisted={wishlistedItems.includes(item.id)}
      onPress={() => navigation.navigate('ProductDetailScreen', { productId: item.id })}
      onWishlist={() => handleWishlist(item.id)}
    />
  );

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Browse" onBackPress={handleBackPress} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color={jewelleryColors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="search Jewelery"
          placeholderTextColor={jewelleryColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filters */}
      <View style={styles.categoryFiltersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                activeCategory === category && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category && styles.activeCategoryText,
                ]}
                allowFontScaling={false}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
        style={styles.productsList}
      />

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 30,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.sm,
  },
  categoryFiltersWrapper: {
    backgroundColor: jewelleryColors.bg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: jewelleryColors.border,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: jewelleryColors.bgSecondary,
    marginRight: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCategoryButton: {
    backgroundColor: jewelleryColors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000', // Black for maximum visibility
    lineHeight: 18,
    textAlign: 'center',
  },
  activeCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  productsList: {
    flex: 1,
  },
  productsContainer: {
    padding: spacing.sm,
    paddingTop: spacing.md,
  },
});

export default BrowseScreen;

