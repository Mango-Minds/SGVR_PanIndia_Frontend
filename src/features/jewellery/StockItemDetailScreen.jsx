import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { decode } from 'base-64';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { navigateJewelleryAuthTab } from '../../utils/requireAuth';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { getStockItemDetails, getShopDetails } from '../../services/jewellery.services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const StockItemDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { stockItemId, shopId } = route.params || {};
  const { token, isGuest } = useSelector((state) => state.user);
  const [stockItem, setStockItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [isOwnShop, setIsOwnShop] = useState(false);
  const scrollViewRef = useRef(null);

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveBottomTab('home');
    }, [])
  );

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

  useEffect(() => {
    if (stockItemId) {
      fetchStockItemDetails();
    }
    if (shopId) {
      checkShopOwnership();
    }
  }, [stockItemId, shopId, checkShopOwnership]);

  const fetchStockItemDetails = async () => {
    try {
      setLoading(true);
      const response = await getStockItemDetails(stockItemId);
      const item = response.stockItem || response.data || response;
      setStockItem(item);
    } catch (error) {
      console.error('Error fetching stock item details:', error);
      Alert.alert('Error', 'Failed to load stock item details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (shopId) {
      navigation.navigate('StockDetailsScreen', { shopId });
    } else {
      navigation.goBack();
    }
  };

  const handleEditPress = () => {
    navigation.navigate('EditStockItemScreen', { stockItemId, shopId });
  };

  const handleTabBarChange = (tab) => {
    setActiveBottomTab(tab);
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

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar showBack onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.loadingText}>Loading stock item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stockItem) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar showBack onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <Icon name="inventory-2" size={64} color={jewelleryColors.textSecondary} />
          <Text style={styles.emptyText}>Stock item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const images = stockItem.images && stockItem.images.length > 0 
    ? stockItem.images.filter(img => img && typeof img === 'string' && img.trim().length > 0)
    : [];
  const displayPrice = stockItem.price ? `₹${stockItem.price.toLocaleString('en-IN')}` : 'Price on request';
  const quantity = stockItem.quantity || 0;
  const weight = stockItem.weightPerProduct ? `${stockItem.weightPerProduct}g` : 'N/A';
  const purity = stockItem.goldAvailable || stockItem.purity || 'N/A';
  const category = stockItem.productCategory 
    ? stockItem.productCategory.charAt(0).toUpperCase() + stockItem.productCategory.slice(1)
    : 'N/A';

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack onBackPress={handleBackPress} />

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Stock Item Image Carousel */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {images.length > 0 && images[selectedImageIndex] && !imageErrors[selectedImageIndex] ? (
              <Image 
                source={{ uri: images[selectedImageIndex] }} 
                style={styles.productImage} 
                resizeMode="cover"
                onError={() => setImageErrors(prev => ({ ...prev, [selectedImageIndex]: true }))}
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Icon name="inventory" size={60} color={jewelleryColors.textSecondary} />
              </View>
            )}
            {/* Carousel Indicators */}
            {images.length > 1 && (
              <View style={styles.indicators}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === selectedImageIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
          
          {/* Image Thumbnails */}
          {images.length > 1 && (
            <View style={styles.thumbnailsContainer}>
              {images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    index === selectedImageIndex && styles.activeThumbnail,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  {image && !imageErrors[index] ? (
                    <Image 
                      source={{ uri: image }} 
                      style={styles.thumbnailImage} 
                      resizeMode="cover"
                      onError={() => setImageErrors(prev => ({ ...prev, [index]: true }))}
                    />
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <Icon name="image" size={20} color={jewelleryColors.textSecondary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Stock Item Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.itemName}>{stockItem.name || 'Stock Item'}</Text>
          <Text style={styles.price}>{displayPrice}</Text>
        </View>

        {/* Description */}
        {stockItem.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{stockItem.description}</Text>
          </View>
        )}

        {/* Stock Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Details</Text>
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name="inventory-2" size={20} color={jewelleryColors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>{quantity}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name="scale" size={20} color={jewelleryColors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Weight per Product</Text>
                <Text style={styles.detailValue}>{weight}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name="diamond" size={20} color={jewelleryColors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Purity / Gold Available</Text>
                <Text style={styles.detailValue}>{purity}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name="category" size={20} color={jewelleryColors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{category}</Text>
              </View>
            </View>
            
            {stockItem.gemstones && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="style" size={20} color={jewelleryColors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Gemstones</Text>
                  <Text style={styles.detailValue}>{stockItem.gemstones}</Text>
                </View>
              </View>
            )}
            
            {stockItem.paymentTerms && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="payment" size={20} color={jewelleryColors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Payment Terms</Text>
                  <Text style={styles.detailValue}>{stockItem.paymentTerms}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Button - Only show if user owns the shop */}
        {isOwnShop && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditPress}
            >
              <Icon name="edit" size={20} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Stock Item</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomTabBar activeTab={activeBottomTab} onTabChange={handleTabBarChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  imageSection: {
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: SCREEN_WIDTH * 0.9,
    backgroundColor: jewelleryColors.bgSecondary,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicators: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: jewelleryColors.bg,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: jewelleryColors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  itemName: {
    ...typography.heading2,
    fontWeight: '700',
    fontSize: 24,
    marginBottom: spacing.sm,
    color: jewelleryColors.text,
  },
  price: {
    ...typography.heading3,
    fontWeight: '700',
    color: jewelleryColors.primary,
    fontSize: 20,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: jewelleryColors.text,
  },
  description: {
    ...typography.body,
    color: jewelleryColors.text,
    lineHeight: 22,
  },
  detailsList: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: jewelleryColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
    fontSize: 16,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  editButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default StockItemDetailScreen;

