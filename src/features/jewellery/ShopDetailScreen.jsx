import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import VerifiedBadge from '../../components/Jewellery/VerifiedBadge';
import RatingDisplay from '../../components/Jewellery/RatingDisplay';
import TabSegment from '../../components/Jewellery/TabSegment';
import QRModal from '../../components/Jewellery/QRModal';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ShopDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { shopId } = route.params || {};
  const [activeTab, setActiveTab] = useState('All');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [viewerState, setViewerState] = useState({
    showViewer: false,
    currentIndex: 0,
    items: [],
  });
  const modalFlatListRef = useRef(null);

  // Mock shop data - replace with actual API call
  const shopData = {
    id: shopId || '1',
    name: 'Jewellery Box',
    owner: 'Suresh Patel',
    rating: 4.8,
    reviewCount: 125,
    description: 'Exquisite diamond ring featuring a brilliant cut center stone set in 18K white gold. Perfect for engagements or special occasions.',
    profileImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop',
    address: 'MG Road, Hyderabad',
    location: 'Hyderabad',
    hours: '10:00 AM - 08:00 PM',
    isVerified: true,
  };

  const tabs = [
    { key: 'All', label: 'All' },
    { key: 'Videos', label: 'Videos' },
    { key: 'Images', label: 'Images' },
    { key: 'Portfolio', label: 'Portfolio' },
  ];

  // Sample gallery items with realistic jewellery images and videos
  // Some items have multiple images to show collection indicator
  const allGalleryItems = [
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

  // Filter gallery items based on active tab
  const getFilteredGalleryItems = () => {
    if (activeTab === 'All') {
      return allGalleryItems.filter(item => item.category === 'All');
    }
    return allGalleryItems.filter(item => item.category === activeTab);
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
    return (
      <TouchableOpacity 
        style={styles.galleryItem} 
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
        navigation.navigate('ProfileScreen');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack showNotification />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Shop Info Section */}
        <View style={styles.infoContainer}>
          {shopData.isVerified && (
            <View style={styles.verifiedBadgeTopRight}>
              <VerifiedBadge />
            </View>
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
              <Text style={styles.shopName}>{shopData.name}</Text>
              <View style={styles.locationContainer}>
                <Icon name="location-on" size={16} color={jewelleryColors.textSecondary} />
                <Text style={styles.location}>{shopData.location}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <RatingDisplay rating={shopData.rating} reviewCount={shopData.reviewCount} />
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{shopData.description}</Text>
        </View>

        {/* View Stock Details Button */}
        <TouchableOpacity style={styles.stockButton}>
          <Icon name="visibility" size={20} color="#FFFFFF" />
          <Text style={styles.stockButtonText}>View Stock Details</Text>
        </TouchableOpacity>

        {/* Tab Navigation */}
        <TabSegment tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Gallery Grid */}
        <View style={styles.galleryContainer}>
          <FlatList
            data={galleryItems}
            renderItem={renderGalleryItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <QRModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        qrValue={`shop-${shopData.id}`}
        shopName={shopData.name}
        onDownload={() => console.log('Download QR')}
        onShare={() => console.log('Share QR')}
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
  galleryItem: {
    flex: 1,
    aspectRatio: 1,
    margin: spacing.xs,
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
});

export default ShopDetailScreen;

