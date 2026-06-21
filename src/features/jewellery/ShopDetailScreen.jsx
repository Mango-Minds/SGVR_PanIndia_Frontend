import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { requireAuth, navigateJewelleryAuthTab } from '../../utils/requireAuth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import VerifiedBadge from '../../components/Jewellery/VerifiedBadge';
import RatingDisplay from '../../components/Jewellery/RatingDisplay';
import TabSegment from '../../components/Jewellery/TabSegment';
import QRModal from '../../components/Jewellery/QRModal';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import SpecificationRow from '../../components/Jewellery/SpecificationRow';
import TrustBadge from '../../components/Jewellery/TrustBadge';
import FollowButton from '../../components/Jewellery/FollowButton';
import ReviewForm from '../../components/Jewellery/ReviewForm';
import ReviewList from '../../components/Jewellery/ReviewList';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { getShopDetails, followUser, unfollowUser, checkFollowStatus, createShopReview, getShopReviews } from '../../services/jewellery.services';
import { BASEAPIURL, BASEIMGURL } from '../../infrastructure/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ShopDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { shopId } = route.params || {};
  const dispatch = useDispatch();
  const { token, user, isGuest } = useSelector((state) => state.user);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [viewerState, setViewerState] = useState({
    showViewer: false,
    currentIndex: 0,
    items: [],
  });
  const modalFlatListRef = useRef(null);
  const [followStatus, setFollowStatus] = useState('none');
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Check if user has permission to view stock details
  // Restricted to vendors, shops, manufacturers, and wholesalers (not basic users)
  const canViewStockDetails = () => {
    if (!user || !user.userType) return false;
    
    const allowedRoles = ['vendor', 'shop', 'manufacturer', 'wholesaler'];
    const userRoles = Array.isArray(user.userType) ? user.userType : [user.userType];
    
    return userRoles.some(role => allowedRoles.includes(role?.toLowerCase()));
  };

  // Handle View Stock Details button press
  const handleViewStockDetails = () => {
    navigation.navigate('StockDetailsScreen', { shopId });
  };

  // Update active tab when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setActiveBottomTab('home');
      if (shopId) {
        fetchShopDetails();
      }
    }, [shopId])
  );

  // Fetch shop details from API
  const fetchShopDetails = useCallback(async () => {
    if (!shopId) return;
    
    try {
      setLoading(true);
      const response = await getShopDetails(shopId);
      
      if (response) {
        // Format the response data
        const formattedData = {
          ...response,
          id: response._id || shopId,
          name: response.name || response.shopName || '',
          owner: response.owner?.name || `${response.owner?.firstName || ''} ${response.owner?.lastName || ''}`.trim() || 'Owner',
          ownerId: response.owner?._id || response.owner?.id || null,
          rating: response.rating || 0,
          reviewCount: response.reviewCount || 0,
          description: response.description || '',
          profileImage: response.image || response.profileImage || (response.owner?.image ? `${BASEIMGURL}${response.owner.image}` : ''),
          address: response.address || '',
          location: response.city || response.location || '',
          hours: response.hours || '',
          isVerified: response.isVerified || response.verified || false,
          isOwner: response.isOwner || false,
          products: response.products || [],
          galleryItems: response.galleryItems || [],
        };
        
        setShopData(formattedData);
        
        // Fetch follow status if owner ID is available and user is logged in
        if (formattedData.ownerId && user && user._id && formattedData.ownerId !== user._id) {
          try {
            const statusResponse = await checkFollowStatus(formattedData.ownerId);
            setFollowStatus(statusResponse.status || 'none');
          } catch (error) {
            console.error('Error checking follow status:', error);
            setFollowStatus('none');
          }
        }

        // Check if user has already reviewed this shop
        if (user && user._id && formattedData.ownerId && formattedData.ownerId !== user._id) {
          try {
            const reviewsResponse = await getShopReviews(shopId, { page: 1, limit: 100 });
            if (reviewsResponse && reviewsResponse.reviews) {
              const hasReviewed = reviewsResponse.reviews.some(
                review => review.user?._id === user._id || review.user?.id === user._id
              );
              setUserHasReviewed(hasReviewed);
            }
          } catch (error) {
            console.error('Error checking if user has reviewed:', error);
            // Don't set userHasReviewed on error, let it default to false
          }
        }
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
      Alert.alert('Error', 'Failed to load shop details');
    } finally {
      setLoading(false);
    }
  }, [shopId, user]);

  const tabs = [
    { key: 'All', label: 'All' },
    { key: 'Videos', label: 'Videos' },
    { key: 'Images', label: 'Images' },
    { key: 'Portfolio', label: 'Portfolio' },
  ];

  // Get gallery items from shop data or use empty array
  const allGalleryItems = shopData?.galleryItems || [
    { 
      id: '1', 
      type: 'image', 
      uri: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=400&h=400&fit=crop', 
      images: [
        'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop',
      ],
      category: 'All' 
    },
    { 
      id: '2', 
      type: 'image', 
      uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', 
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop',
      ],
      category: 'All' 
    },
    { 
      id: '3', 
      type: 'video', 
      uri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', 
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop'],
      category: 'All' 
    },
    { 
      id: '4', 
      type: 'video', 
      uri: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', 
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop'],
      category: 'All' 
    },
    { 
      id: '5', 
      type: 'image', 
      uri: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', 
      images: [
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
      ],
      category: 'All' 
    },
    { 
      id: '6', 
      type: 'video', 
      uri: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', 
      images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop'],
      category: 'All' 
    },
    { 
      id: '7', 
      type: 'image', 
      uri: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=400&h=400&fit=crop', 
      images: ['https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop'],
      category: 'All' 
    },
    { 
      id: '8', 
      type: 'image', 
      uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', 
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop',
      ],
      category: 'All' 
    },
    { 
      id: '9', 
      type: 'video', 
      uri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', 
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop'],
      category: 'All' 
    },
    // Videos
    { id: 'v1', type: 'video', uri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop'], category: 'Videos' },
    { id: 'v2', type: 'video', uri: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop'], category: 'Videos' },
    { id: 'v3', type: 'video', uri: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop'], category: 'Videos' },
    { id: 'v4', type: 'video', uri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop'], category: 'Videos' },
    { id: 'v5', type: 'video', uri: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop'], category: 'Videos' },
    { id: 'v6', type: 'video', uri: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop'], category: 'Videos' },
    // Images
    { id: 'i1', type: 'image', uri: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop'], category: 'Images' },
    { id: 'i2', type: 'image', uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'], category: 'Images' },
    { id: 'i3', type: 'image', uri: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop'], category: 'Images' },
    { id: 'i4', type: 'image', uri: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop'], category: 'Images' },
    { id: 'i5', type: 'image', uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'], category: 'Images' },
    { id: 'i6', type: 'image', uri: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop'], category: 'Images' },
    // Portfolio
    { id: 'p1', type: 'image', uri: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop'], category: 'Portfolio' },
    { id: 'p2', type: 'image', uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'], category: 'Portfolio' },
    { id: 'p3', type: 'image', uri: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop'], category: 'Portfolio' },
    { id: 'p4', type: 'image', uri: 'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=400&h=400&fit=crop', images: ['https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop'], category: 'Portfolio' },
  ];

  // Handle add product for shop owners
  const handleAddProduct = () => {
    navigation.navigate('AddProductScreen', { shopId });
  };

  // Handle edit product
  const handleEditProduct = (productId) => {
    navigation.navigate('EditProductScreen', { productId, shopId });
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BASEAPIURL}/jewelry-products/${productId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Product deleted successfully');
                fetchShopDetails(); // Refresh shop data
              } else {
                throw new Error('Failed to delete product');
              }
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  // Filter gallery items based on active tab
  const getFilteredGalleryItems = () => {
    if (activeTab === 'All') {
      // Show all items - no filter needed
      return allGalleryItems;
    }
    if (activeTab === 'Images') {
      // Filter by type === 'image' or category === 'Images'
      return allGalleryItems.filter(item => 
        item.type === 'image' || item.category === 'Images'
      );
    }
    if (activeTab === 'Videos') {
      // Filter by type === 'video' or category === 'Videos'
      return allGalleryItems.filter(item => 
        item.type === 'video' || item.category === 'Videos'
      );
    }
    if (activeTab === 'Portfolio') {
      // Filter by category === 'Portfolio'
      return allGalleryItems.filter(item => item.category === 'Portfolio');
    }
    return allGalleryItems;
  };

  const galleryItems = getFilteredGalleryItems();

  const openViewer = (item, index) => {
    // Get all items from current filtered list for navigation
    const allItems = galleryItems;
    const itemIndex = allItems.findIndex(i => i.id === item.id);
    
    // Flatten all images from all items
    const allImages = allItems.flatMap(i => i.images || [i.uri]);
    
    // Calculate starting index based on previous items
    let startIndex = 0;
    for (let i = 0; i < itemIndex; i++) {
      startIndex += (allItems[i].images?.length || 1);
    }
    
    setViewerState({
      showViewer: true,
      currentIndex: startIndex,
      items: allImages,
    });
  };

  const closeViewer = () => {
    setViewerState({
      showViewer: false,
      currentIndex: 0,
      items: [],
    });
  };

  const goToPreviousImage = () => {
    const newIndex =
      viewerState.currentIndex > 0
        ? viewerState.currentIndex - 1
        : viewerState.items.length - 1;
    setViewerState((prev) => ({ ...prev, currentIndex: newIndex }));
    if (modalFlatListRef.current) {
      modalFlatListRef.current.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const goToNextImage = () => {
    const newIndex = (viewerState.currentIndex + 1) % viewerState.items.length;
    setViewerState((prev) => ({ ...prev, currentIndex: newIndex }));
    if (modalFlatListRef.current) {
      modalFlatListRef.current.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const GalleryItem = ({ item, index }) => {
    const [imageError, setImageError] = useState(false);
    const hasMultipleImages = item.images && item.images.length > 1;
    
    // Calculate item width for 3-column grid with spacing
    // Container padding: spacing.md * 2 (left + right)
    // Item margins: spacing.xs / 2 on each side = spacing.xs per item
    // Gaps between items: spacing.xs * 2 (for 2 gaps between 3 items)
    // Total margin space: spacing.xs * 3 (left margin + 2 gaps + right margin)
    const itemSize = (screenWidth - (spacing.md * 2) - (spacing.xs * 3)) / 3;
    
    return (
      <TouchableOpacity 
        style={[styles.galleryItem, { width: itemSize, height: itemSize }]} 
        activeOpacity={0.8}
        onPress={() => openViewer(item, index)}
      >
        {!imageError && item.uri ? (
          <Image 
            source={{ uri: item.uri }} 
            style={styles.galleryImage}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.galleryImagePlaceholder}>
            <Icon name="image" size={24} color={jewelleryColors.textSecondary} />
          </View>
        )}
        {item.type === 'video' && (
          <View style={styles.videoIndicator}>
            <Icon name="play-circle-filled" size={32} color="#FFFFFF" />
          </View>
        )}
        {hasMultipleImages && (
          <View style={styles.collectionIndicator}>
            <Icon name="collections" size={16} color="#FFFFFF" />
            <Text style={styles.collectionCount}>{item.images.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderGalleryItem = ({ item, index }) => (
    <GalleryItem item={item} index={index} />
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCall = (phone) => {
    if (phone) {
      const phoneNumber = phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`).catch(err => {
        console.error('Error opening phone:', err);
        Alert.alert('Error', 'Unable to make phone call');
      });
    }
  };

  // Handle follow/unfollow actions
  const handleFollowAction = async () => {
    if (!token) {
      requireAuth({
        token,
        isGuest,
        dispatch,
        navigation,
        message: 'Sign in to follow shops.',
      });
      return;
    }

    if (!shopData?.ownerId || !user) return;
    
    // Don't allow following yourself
    if (shopData.ownerId === user._id) {
      Alert.alert('Info', 'You cannot follow yourself');
      return;
    }

    setIsLoadingFollow(true);
    try {
      if (followStatus === 'approved' || followStatus === 'following') {
        // Unfollow
        await unfollowUser(shopData.ownerId);
        setFollowStatus('none');
        Alert.alert('Success', 'Unfollowed successfully');
      } else {
        // Follow
        await followUser(shopData.ownerId);
        setFollowStatus('approved');
        Alert.alert('Success', 'Followed successfully');
      }
    } catch (error) {
      console.error('Error performing follow action:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to perform action';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const renderPortfolioView = () => {
    if (!shopData) return null;

    // Get store image - use profileImage or first gallery item
    const storeImage = shopData.profileImage || 
      (shopData.galleryItems && shopData.galleryItems.length > 0 
        ? shopData.galleryItems[0].uri || shopData.galleryItems[0].images?.[0]
        : null);

    // Get phone number from shop data
    const phoneNumber = shopData.phone || shopData.contact?.phone || shopData.owner?.phone || '';

    return (
      <View>
        {/* Store Image Section */}
        <View style={styles.portfolioImageSection}>
          <View style={styles.portfolioImageContainer}>
            {storeImage ? (
              <Image 
                source={{ uri: storeImage }} 
                style={styles.portfolioStoreImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.portfolioImagePlaceholder}>
                <Icon name="store" size={60} color={jewelleryColors.textSecondary} />
              </View>
            )}
            {shopData.isVerified && (
              <View style={styles.portfolioBadgeContainer}>
                <VerifiedBadge />
              </View>
            )}
          </View>
        </View>

        {/* Shop Info */}
        <View style={styles.portfolioInfoContainer}>
          <View style={styles.portfolioHeaderRow}>
            <View style={styles.portfolioHeaderLeft}>
              <Text style={styles.portfolioShopName}>{shopData.name}</Text>
              {shopData.owner && (
                <Text style={styles.portfolioOwner}>Owned by {shopData.owner}</Text>
              )}
            </View>
            {shopData.ownerId && user && shopData.ownerId !== user._id && (
              <FollowButton
                followStatus={followStatus}
                onPress={handleFollowAction}
                isLoading={isLoadingFollow}
              />
            )}
          </View>
          <View style={styles.portfolioRatingWrapper}>
            <RatingDisplay rating={shopData.rating} reviewCount={shopData.reviewCount} />
          </View>
        </View>

        {/* Owner Actions - CRUD buttons for shop owners */}
        {shopData.isOwner && (
          <View style={styles.ownerActionsContainer}>
            <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct}>
              <Icon name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addProductButtonText}>Add Product to Album</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {shopData.description || 'No description available'}
          </Text>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {shopData.ownerId && (!user || shopData.ownerId !== user._id) && !userHasReviewed && (
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() =>
                  requireAuth({
                    token,
                    isGuest,
                    dispatch,
                    navigation,
                    message: 'Sign in to submit a review.',
                    onAuthed: () => setReviewFormVisible(true),
                  })
                }
              >
                <Icon name="edit" size={16} color={jewelleryColors.primary} />
                <Text style={styles.writeReviewButtonText}>Write Review</Text>
              </TouchableOpacity>
            )}
          </View>
          <ReviewList 
            shopId={shopId} 
            onReviewAdded={reviewRefreshTrigger}
          />
        </View>

        {/* Specifications - Show if available */}
        {(shopData.specifications || shopData.metal || shopData.stones) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specificationsList}>
              {shopData.specifications?.metal && (
                <SpecificationRow label="Metal" value={shopData.specifications.metal} />
              )}
              {shopData.metal && !shopData.specifications?.metal && (
                <SpecificationRow label="Metal" value={shopData.metal} />
              )}
              {shopData.specifications?.stones && (
                <SpecificationRow label="Stones" value={shopData.specifications.stones} />
              )}
              {shopData.stones && !shopData.specifications?.stones && (
                <SpecificationRow label="Stones" value={shopData.stones} />
              )}
              {shopData.specifications?.making && (
                <SpecificationRow label="Making" value={shopData.specifications.making} />
              )}
              {shopData.specifications?.dimensions && (
                <SpecificationRow label="Dimensions" value={shopData.specifications.dimensions} />
              )}
            </View>
          </View>
        )}

        {/* Service Guarantees */}
        <View style={styles.trustContainer}>
          <View style={styles.trustBadgeWrapper}>
            <TrustBadge type="certified" />
          </View>
          <View style={styles.trustBadgeWrapper}>
            <TrustBadge type="shipping" />
          </View>
          <View style={styles.trustBadgeWrapper}>
            <TrustBadge type="return" />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {(shopData.address || shopData.location) && (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Icon name="location-on" size={24} color={jewelleryColors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>
                  {shopData.address || shopData.location || 'Location not available'}
                </Text>
              </View>
            </View>
          )}

          {phoneNumber && (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Icon name="phone" size={24} color={jewelleryColors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{phoneNumber}</Text>
              </View>
            </View>
          )}

          {shopData.hours && (
            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
                <Icon name="access-time" size={24} color={jewelleryColors.primary} />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Open Hours</Text>
                <Text style={styles.contactValue}>{shopData.hours}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.callButton, !phoneNumber && styles.callButtonDisabled]}
            onPress={() => handleCall(phoneNumber)}
            disabled={!phoneNumber}
          >
            <Icon name="phone" size={20} color="#FFFFFF" />
            <Text style={styles.callButtonText}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setQrModalVisible(true)}
          >
            <Icon name="share" size={20} color={jewelleryColors.text} />
            <Text style={styles.shareButtonText}>Share QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleBackPress = () => {
    navigation.navigate('ShopsScreen');
  };

  // Handle review submission
  const handleSubmitReview = async (rating, comment) => {
    if (!shopId || !user || !token) {
      requireAuth({
        token,
        isGuest,
        dispatch,
        navigation,
        message: 'Sign in to submit a review.',
      });
      return;
    }

    try {
      setIsSubmittingReview(true);
      const response = await createShopReview(shopId, rating, comment);
      
      if (response && response.status === 0) {
        Alert.alert('Success', 'Review submitted successfully');
        setReviewFormVisible(false);
        setUserHasReviewed(true);
        
        // Refresh shop details to get updated rating
        await fetchShopDetails();
        
        // Trigger review list refresh
        setReviewRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(response?.msg || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Check if error is due to duplicate review
      const errorMessage = error.response?.data?.msg || error.message || 'Failed to submit review';
      const isDuplicateReview = errorMessage.toLowerCase().includes('already reviewed') || 
                                 errorMessage.toLowerCase().includes('already reviewed this shop');
      
      if (isDuplicateReview) {
        // User has already reviewed - set flag and show friendly message
        setUserHasReviewed(true);
        setReviewFormVisible(false);
        Alert.alert(
          'Review Already Submitted',
          'You have already submitted a review for this shop. Thank you for your feedback!',
          [{ text: 'OK' }]
        );
      } else {
        // Other errors
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmittingReview(false);
    }
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
          <Text style={styles.loadingText}>Loading shop details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!shopData) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar showBack onBackPress={handleBackPress} />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={jewelleryColors.textSecondary} />
          <Text style={styles.errorText}>Shop not found</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleBackPress}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack onBackPress={handleBackPress} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Shop Info Section */}
        <View style={styles.infoContainer}>
          {shopData.isVerified && (
            <View style={styles.verifiedBadgeTopRight}>
              <VerifiedBadge />
            </View>
          )}
          {shopData.isOwner && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditShopScreen', { shopId })}
            >
              <Icon name="edit" size={20} color={jewelleryColors.primary} />
            </TouchableOpacity>
          )}
          <View style={styles.profileSection}>
            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
              {shopData.profileImage ? (
                <Image 
                  source={{ uri: shopData.profileImage }} 
                  style={styles.profileImage}
                  onError={() => {}}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Icon name="store" size={32} color={jewelleryColors.textSecondary} />
                </View>
              )}
            </View>

            {/* Shop Details */}
            <View style={styles.shopDetailsContainer}>
              <View style={styles.shopHeaderRow}>
                <View style={styles.shopHeaderLeft}>
                  <Text style={styles.shopName}>{shopData.name}</Text>
                </View>
                {shopData.ownerId && user && shopData.ownerId !== user._id && (
                  <FollowButton
                    followStatus={followStatus}
                    onPress={handleFollowAction}
                    isLoading={isLoadingFollow}
                  />
                )}
              </View>
              <View style={styles.locationContainer}>
                <Icon name="location-on" size={16} color={jewelleryColors.textSecondary} />
                <Text style={styles.location}>{shopData.location || shopData.city || 'Location not available'}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <RatingDisplay rating={shopData.rating} reviewCount={shopData.reviewCount} />
              </View>
            </View>
          </View>
        </View>


        {/* Stock for Sale Button - Restricted to vendors, shops, manufacturers, and wholesalers */}
        {canViewStockDetails() && (
          <TouchableOpacity 
            style={styles.stockButton}
            onPress={handleViewStockDetails}
          >
            <Icon name="visibility" size={20} color="#FFFFFF" />
            <Text style={styles.stockButtonText}>Stock for Sale</Text>
          </TouchableOpacity>
        )}

        {/* Tab Navigation */}
        <TabSegment tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Portfolio View or Gallery Grid */}
        {activeTab === 'Portfolio' ? (
          renderPortfolioView()
        ) : (
          <View style={styles.galleryContainer}>
            <FlatList
              data={galleryItems}
              renderItem={renderGalleryItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.galleryRow}
            />
          </View>
        )}
      </ScrollView>

      <QRModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        qrValue={`shop-${shopData.id}`}
        shopName={shopData.name}
      />

      <ReviewForm
        visible={reviewFormVisible}
        onClose={() => setReviewFormVisible(false)}
        onSubmit={handleSubmitReview}
        isLoading={isSubmittingReview}
      />

      {/* Image/Video Viewer Modal */}
      <Modal
        visible={viewerState.showViewer}
        transparent={true}
        onRequestClose={closeViewer}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <FlatList
            ref={modalFlatListRef}
            data={viewerState.items}
            renderItem={({ item }) => (
              <View style={styles.modalImageContainer}>
                <Image source={{ uri: item }} style={styles.modalImage} resizeMode="contain" />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerState.currentIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onScroll={({ nativeEvent }) => {
              const { contentOffset, layoutMeasurement } = nativeEvent;
              const index = Math.floor(contentOffset.x / layoutMeasurement.width);
              setViewerState((prev) => ({ ...prev, currentIndex: index }));
            }}
            scrollEventThrottle={16}
          />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={closeViewer}>
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Navigation Buttons */}
          {viewerState.items.length > 1 && (
            <>
              <TouchableOpacity style={styles.navButtonLeft} onPress={goToPreviousImage}>
                <Icon name="chevron-left" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButtonRight} onPress={goToNextImage}>
                <Icon name="chevron-right" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}

          {/* Image Counter */}
          {viewerState.items.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {viewerState.currentIndex + 1} / {viewerState.items.length}
              </Text>
            </View>
          )}
        </View>
      </Modal>

      <BottomTabBar activeTab={activeBottomTab} onTabChange={handleTabBarChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    position: 'relative',
  },
  verifiedBadgeTopRight: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    zIndex: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  profileImageContainer: {
    marginRight: spacing.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: jewelleryColors.primary,
    backgroundColor: jewelleryColors.bgSecondary,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: jewelleryColors.primary,
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopDetailsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
  },
  shopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  shopHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  shopName: {
    ...typography.heading1,
    fontSize: 24,
    fontWeight: '700',
    color: jewelleryColors.text,
    marginBottom: spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  location: {
    ...typography.body,
    fontSize: 15,
    color: jewelleryColors.textSecondary,
    marginLeft: spacing.xs,
  },
  ratingContainer: {
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: jewelleryColors.text,
  },
  description: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: jewelleryColors.textSecondary,
  },
  galleryContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  galleryRow: {
    justifyContent: 'flex-start',
  },
  galleryItem: {
    margin: spacing.xs / 2,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: jewelleryColors.bgSecondary,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
  },
  galleryImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  collectionIndicator: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    gap: 4,
  },
  collectionCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: screenWidth,
    height: screenHeight,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl + 20,
    right: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navButtonLeft: {
    position: 'absolute',
    left: spacing.lg,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navButtonRight: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageCounter: {
    position: 'absolute',
    bottom: spacing.xl + 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  stockButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    marginTop: spacing.md,
    color: jewelleryColors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: jewelleryColors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg + 40,
    zIndex: 10,
    padding: spacing.xs,
  },
  ownerActionsContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  addProductButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  productThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: jewelleryColors.bgTertiary,
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  productName: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.body,
    color: jewelleryColors.primary,
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  productActionButton: {
    padding: spacing.xs,
  },
  portfolioImageSection: {
    marginBottom: spacing.md,
  },
  portfolioImageContainer: {
    position: 'relative',
    width: '100%',
    height: screenWidth * 0.6,
    backgroundColor: jewelleryColors.bgSecondary,
  },
  portfolioStoreImage: {
    width: '100%',
    height: '100%',
  },
  portfolioImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioBadgeContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  portfolioInfoContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  portfolioHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  portfolioHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  portfolioShopName: {
    ...typography.heading2,
    fontWeight: '700',
    fontSize: 24,
    marginBottom: spacing.xs,
    color: jewelleryColors.text,
  },
  portfolioOwner: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  portfolioRatingWrapper: {
    marginTop: spacing.xs,
  },
  specificationsList: {
    gap: spacing.sm,
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: jewelleryColors.bg,
  },
  trustBadgeWrapper: {
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: jewelleryColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  contactValue: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  callButtonDisabled: {
    opacity: 0.5,
  },
  callButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 16,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: jewelleryColors.bg,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  shareButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
    fontSize: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: jewelleryColors.primary,
    gap: spacing.xs,
  },
  writeReviewButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: jewelleryColors.primary,
  },
});

export default ShopDetailScreen;

