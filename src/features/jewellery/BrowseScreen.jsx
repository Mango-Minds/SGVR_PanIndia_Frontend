import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requireAuth, navigateJewelleryAuthTab } from '../../utils/requireAuth';
import ProductCard from '../../components/Jewellery/ProductCard';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import {
  getWishlistIds,
  addWishlistItem,
  removeWishlistItem,
} from '../../utils/jewelleryWishlist';
import { getProducts } from '../../services/jewellery.services';
import { mapJewelryProduct } from '../../utils/mapJewelryProduct';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const NUM_COLUMNS = 3;
const GRID_PADDING = spacing.sm;
const GRID_GAP = spacing.xs;
const CARD_WIDTH = Math.floor(
  (Dimensions.get('window').width - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS
);
const PAGE_LIMIT = 30;

const CATEGORIES = [
  { label: 'All', value: null },
  { label: 'Rings', value: 'ring' },
  { label: 'Bracelets', value: 'bracelet' },
  { label: 'Chains', value: 'chain' },
  { label: 'Earrings', value: 'earrings' },
  { label: 'Necklaces', value: 'necklace' },
];

const BrowseScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, isGuest } = useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('search');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [wishlistedItems, setWishlistedItems] = useState([]);
  const requestIdRef = useRef(0);

  const activeProductCategory = useMemo(
    () => CATEGORIES.find((item) => item.label === activeCategory)?.value || null,
    [activeCategory]
  );

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('HomeScreen');
  };

  const loadWishlistIds = useCallback(async () => {
    if (!token) {
      setWishlistedItems([]);
      return;
    }
    try {
      const ids = await getWishlistIds();
      setWishlistedItems(ids);
    } catch (error) {
      console.error('Error loading wishlist ids:', error);
    }
  }, [token]);

  const fetchProducts = useCallback(
    async ({ pageNum = 1, isRefresh = false, append = false } = {}) => {
      const requestId = ++requestIdRef.current;

      if (isRefresh) {
        setRefreshing(true);
      } else if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await getProducts({
          page: pageNum,
          limit: PAGE_LIMIT,
          search: debouncedSearch || undefined,
          productCategory: activeProductCategory || undefined,
        });

        if (requestId !== requestIdRef.current) return;

        const mapped = (response?.data || [])
          .map(mapJewelryProduct)
          .filter(Boolean);

        setProducts((prev) => (append ? [...prev, ...mapped] : mapped));
        setPage(pageNum);

        const pagination = response?.pagination;
        if (pagination?.pages != null) {
          setHasMore(pageNum < pagination.pages);
        } else {
          setHasMore(mapped.length >= PAGE_LIMIT);
        }
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        console.error('Error fetching products:', error);
        if (!append) {
          setProducts([]);
          setHasMore(false);
        }
        Alert.alert('Error', 'Failed to load jewellery products');
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedSearch, activeProductCategory]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts({ pageNum: 1 });
  }, [fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('search');
      loadWishlistIds();
    }, [loadWishlistIds])
  );

  const gridProducts = useMemo(() => {
    const padCount = (NUM_COLUMNS - (products.length % NUM_COLUMNS)) % NUM_COLUMNS;
    if (padCount === 0) return products;
    return [
      ...products,
      ...Array.from({ length: padCount }, (_, i) => ({
        id: `grid-pad-${i}`,
        empty: true,
      })),
    ];
  }, [products]);

  const handleWishlist = (product) => {
    requireAuth({
      token,
      isGuest,
      dispatch,
      navigation,
      message: 'Sign in to save items to your wishlist.',
      onAuthed: async () => {
        const productId = String(product.id);
        const isWishlisted = wishlistedItems.includes(productId);

        if (isWishlisted) {
          Alert.alert(
            'Remove from Wishlist',
            'Are you sure you want to remove this item from your wishlist?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const nextItems = await removeWishlistItem(productId);
                    setWishlistedItems(nextItems.map((item) => item.id));
                  } catch (error) {
                    console.error('Error removing wishlist item:', error);
                    Alert.alert('Error', 'Failed to remove item from wishlist');
                  }
                },
              },
            ]
          );
          return;
        }

        try {
          const nextItems = await addWishlistItem(product);
          setWishlistedItems(nextItems.map((item) => item.id));
        } catch (error) {
          console.error('Error adding wishlist item:', error);
          Alert.alert('Error', 'Failed to save item to wishlist');
        }
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

  const handleLoadMore = () => {
    if (loading || refreshing || loadingMore || !hasMore || products.length === 0) {
      return;
    }
    fetchProducts({ pageNum: page + 1, append: true });
  };

  const renderProduct = ({ item }) => {
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
          price={item.priceLabel || item.price}
          rating={item.rating}
          reviewCount={item.reviewCount}
          isWishlisted={wishlistedItems.includes(String(item.id))}
          onPress={() => navigation.navigate('ProductDetailScreen', { productId: item.id })}
          onWishlist={() => handleWishlist(item)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Gallery" onBackPress={handleBackPress} />

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

      <View style={styles.categoryFiltersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.label}
              style={[
                styles.categoryButton,
                activeCategory === category.label && styles.activeCategoryButton,
              ]}
              onPress={() => setActiveCategory(category.label)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category.label && styles.activeCategoryText,
                ]}
                allowFontScaling={false}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
        </View>
      ) : (
        <FlatList
          data={gridProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => String(item.id)}
          key="gallery-grid-3"
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={products.length > 0 ? styles.columnWrapper : undefined}
          contentContainerStyle={[
            styles.productsContainer,
            products.length === 0 && styles.emptyProductsContainer,
          ]}
          showsVerticalScrollIndicator={false}
          style={styles.productsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchProducts({ pageNum: 1, isRefresh: true })}
              tintColor={jewelleryColors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={jewelleryColors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="search-off" size={48} color={jewelleryColors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No products found</Text>
              <Text style={styles.emptyStateText}>
                {debouncedSearch
                  ? `No results for "${debouncedSearch}"`
                  : `No products in ${activeCategory}`}
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
    color: '#000000',
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
    paddingHorizontal: GRID_PADDING,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  emptyProductsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  emptyStateTitle: {
    ...typography.heading3,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});

export default BrowseScreen;
