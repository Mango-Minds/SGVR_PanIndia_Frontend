import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { decode } from 'base-64';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { BASEAPIURL, BASEIMGURL } from '../../infrastructure/constants';
import { getShopStockItems, deleteStockItem, getShopDetails } from '../../services/jewellery.services';

const StockDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { shopId } = route.params || {};
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('home');
  const [isOwnShop, setIsOwnShop] = useState(false);

  const categories = ['All', 'Rings', 'Bracelets', 'Chains', 'Earrings', 'Necklaces'];

  // Check if current user owns the shop
  const checkShopOwnership = useCallback(async () => {
    if (!shopId || !token) {
      setIsOwnShop(false);
      return;
    }

    try {
      // Get current user ID from token
      let currentUserId = null;
      try {
        const tokenPayload = token.split(".")[1];
        const decodedPayload = JSON.parse(decode(tokenPayload));
        currentUserId = decodedPayload.id;
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsOwnShop(false);
        return;
      }

      // Fetch shop details to get owner information
      const shopDetails = await getShopDetails(shopId);
      
      if (shopDetails && shopDetails.owner) {
        // Check if current user is the owner
        const ownerId = shopDetails.owner._id || shopDetails.owner.id || shopDetails.owner;
        const isOwner = ownerId === currentUserId || ownerId?.toString() === currentUserId?.toString();
        setIsOwnShop(isOwner);
      } else {
        setIsOwnShop(false);
      }
    } catch (error) {
      console.error('Error checking shop ownership:', error);
      setIsOwnShop(false);
    }
  }, [shopId, token]);

  // Normalize category from frontend format (plural) to backend format (singular)
  const normalizeCategory = (category) => {
    if (!category || category === 'All') return null;
    
    const categoryLower = category.toLowerCase().trim();
    const categoryMap = {
      'rings': 'ring',
      'bracelets': 'bracelet',
      'chains': 'chain',
      'earrings': 'earrings', // Already correct
      'necklaces': 'necklace',
      'ring': 'ring',
      'bracelet': 'bracelet',
      'chain': 'chain',
      'necklace': 'necklace',
    };
    
    return categoryMap[categoryLower] || categoryLower;
  };

  const handleBackPress = () => {
    if (shopId) {
      navigation.navigate('ShopDetailScreen', { shopId });
    } else {
      navigation.goBack();
    }
  };

  // Fetch stock items
  const fetchStockItems = useCallback(async () => {
    if (!shopId) return;

    try {
      setLoading(true);
      const normalizedCategory = normalizeCategory(activeCategory);
      const params = {
        shop: shopId,
        ...(normalizedCategory && { productCategory: normalizedCategory }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await getShopStockItems(shopId, params);
      
      // Handle response structure
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response.stockItems && Array.isArray(response.stockItems)) {
        items = response.stockItems;
      }
      
      setStockItems(items);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      setStockItems([]); // Ensure it's always an array even on error
      Alert.alert('Error', 'Failed to load stock items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shopId, activeCategory, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      setActiveTab('home');
      fetchStockItems();
      checkShopOwnership();
    }, [fetchStockItems, checkShopOwnership])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStockItems();
  }, [fetchStockItems]);

  // Handle delete stock item
  const handleDeleteStockItem = (itemId) => {
    Alert.alert(
      'Delete Stock Item',
      'Are you sure you want to delete this stock item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStockItem(itemId);
              Alert.alert('Success', 'Stock item deleted successfully');
              fetchStockItems();
            } catch (error) {
              console.error('Error deleting stock item:', error);
              Alert.alert('Error', error.message || 'Failed to delete stock item');
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
        navigation.navigate('ChatScreen');
        break;
      case 'notifications':
        navigation.navigate('JewelleryNotifications');
        break;
      default:
        break;
    }
  };

  const renderStockItem = ({ item }) => {
    const imageUri = item.images?.[0] || item.image || null;
    const displayPrice = item.price ? `₹${item.price.toLocaleString()}` : 'Price on request';
    const quantity = item.quantity || 0;
    const weight = item.weightPerProduct ? `${item.weightPerProduct}g` : 'N/A';
    const purity = item.goldAvailable || item.purity || 'N/A';

    return (
      <TouchableOpacity
        style={styles.stockCard}
        onPress={() => navigation.navigate('StockItemDetailScreen', { stockItemId: item._id, shopId })}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="inventory" size={40} color={jewelleryColors.textSecondary} />
            </View>
          )}
          {isOwnShop && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteStockItem(item._id);
              }}
            >
              <Icon name="delete" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {item.name || 'Stock Item'}
          </Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="inventory-2" size={14} color={jewelleryColors.textSecondary} />
              <Text style={styles.detailText}>Qty: {quantity}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="scale" size={14} color={jewelleryColors.textSecondary} />
              <Text style={styles.detailText}>{weight}</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="diamond" size={14} color={jewelleryColors.textSecondary} />
              <Text style={styles.detailText}>{purity}</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.price}>{displayPrice}</Text>
            {isOwnShop && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('EditStockItemScreen', { stockItemId: item._id, shopId });
                }}
              >
                <Icon name="edit" size={16} color={jewelleryColors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Safely filter stock items - ensure stockItems is always an array
  // Note: This is a fallback filter. The main filtering should happen via API.
  // This ensures consistency if API filtering doesn't work perfectly.
  const filteredStockItems = Array.isArray(stockItems) ? stockItems.filter((item) => {
    if (activeCategory !== 'All') {
      const normalizedCategory = normalizeCategory(activeCategory);
      // Check both productCategory (correct field) and category (fallback)
      const categoryMatch = 
        item.productCategory?.toLowerCase() === normalizedCategory?.toLowerCase() ||
        item.category?.toLowerCase() === normalizedCategory?.toLowerCase();
      if (!categoryMatch) return false;
    }
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) : [];

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Stock Details" onBackPress={handleBackPress} />

      {/* Add Stock Item Button - Only show if user owns the shop */}
      {isOwnShop && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddStockItemScreen', { shopId })}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Stock Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color={jewelleryColors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stock items..."
          placeholderTextColor={jewelleryColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color={jewelleryColors.textSecondary} />
          </TouchableOpacity>
        )}
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

      {/* Stock Items Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.loadingText}>Loading stock items...</Text>
        </View>
      ) : filteredStockItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="inventory-2" size={64} color={jewelleryColors.textSecondary} />
          <Text style={styles.emptyText}>No stock items found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || activeCategory !== 'All'
              ? 'Try adjusting your filters'
              : 'Add your first stock item to get started'}
          </Text>
          {!searchQuery && activeCategory === 'All' && isOwnShop && (
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => navigation.navigate('AddStockItemScreen', { shopId })}
            >
              <Text style={styles.emptyAddButtonText}>Add Stock Item</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredStockItems}
          renderItem={renderStockItem}
          keyExtractor={(item) => item._id || item.id}
          numColumns={2}
          contentContainerStyle={styles.stockItemsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  addButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
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
  stockItemsContainer: {
    padding: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  stockCard: {
    flex: 1,
    margin: spacing.sm,
    backgroundColor: jewelleryColors.bg,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: jewelleryColors.bgSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  detailText: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  price: {
    ...typography.body,
    fontWeight: '700',
    color: jewelleryColors.primary,
    flex: 1,
  },
  editButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
    color: jewelleryColors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.heading3,
    marginTop: spacing.lg,
    color: jewelleryColors.text,
  },
  emptySubtext: {
    ...typography.body,
    marginTop: spacing.sm,
    color: jewelleryColors.textSecondary,
    textAlign: 'center',
  },
  emptyAddButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: jewelleryColors.primary,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default StockDetailsScreen;

