import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import VerifiedBadge from '../../components/Jewellery/VerifiedBadge';
import RatingDisplay from '../../components/Jewellery/RatingDisplay';
import SpecificationRow from '../../components/Jewellery/SpecificationRow';
import TrustBadge from '../../components/Jewellery/TrustBadge';
import QRModal from '../../components/Jewellery/QRModal';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params || {};
  const [activeSpecCategory, setActiveSpecCategory] = useState('Diamond Sets');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const scrollViewRef = useRef(null);

  // Mock product data - replace with actual API call
  const productData = {
    id: productId || '1',
    title: 'Jewellery & Shop',
    subtitle: 'Browse & Purchase Jewellery',
    rating: 4.8,
    reviewCount: 125,
    description: 'Exquisite diamond ring featuring a brilliant cut center stone set in 18K white gold. Perfect for engagements or special occasions.',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1603561596112-0a1323c9b1e4?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
    ],
    shop: 'Jewellery Box',
    owner: 'Suresh Patel',
    specifications: {
      metal: '18K White Gold',
      stones: '0.5ct Diamond',
      making: 'Handcrafted',
      dimensions: 'Ring Size 7 (adjustable)',
    },
    contact: {
      location: 'MG Road, Hyderabad',
      phone: '+91 982375923',
      hours: '10:00 AM - 08:00 PM',
    },
    isVerified: true,
  };

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const specCategories = ['Diamond Sets', 'Custom Designs'];

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

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Product Image Carousel */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {productData.images[selectedImageIndex] && !imageErrors[selectedImageIndex] ? (
              <Image 
                source={{ uri: productData.images[selectedImageIndex] }} 
                style={styles.productImage} 
                resizeMode="cover"
                onError={() => setImageErrors(prev => ({ ...prev, [selectedImageIndex]: true }))}
              />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Icon name="image" size={60} color={jewelleryColors.textSecondary} />
              </View>
            )}
            {productData.isVerified && (
              <View style={styles.badgeContainer}>
                <VerifiedBadge />
              </View>
            )}
            {/* Carousel Indicators */}
            <View style={styles.indicators}>
              {productData.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === selectedImageIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          </View>
          
          {/* Image Thumbnails */}
          <View style={styles.thumbnailsContainer}>
            {productData.images.map((image, index) => (
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
        </View>

        {/* Shop Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.shopName}>{productData.shop}</Text>
          {productData.owner && (
            <Text style={styles.owner}>Owned by {productData.owner}</Text>
          )}
          <View style={styles.ratingWrapper}>
            <RatingDisplay rating={productData.rating} reviewCount={productData.reviewCount} />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{productData.description}</Text>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specCategories}>
            {specCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.specCategoryButton,
                  activeSpecCategory === category && styles.activeSpecCategoryButton,
                ]}
                onPress={() => setActiveSpecCategory(category)}
              >
                <Text
                  style={[
                    styles.specCategoryText,
                    activeSpecCategory === category && styles.activeSpecCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.specificationsList}>
            <SpecificationRow label="Metal" value={productData.specifications.metal} />
            <SpecificationRow label="Stones" value={productData.specifications.stones} />
            <SpecificationRow label="Making" value={productData.specifications.making} />
            <SpecificationRow label="Dimensions" value={productData.specifications.dimensions} />
          </View>
        </View>

        {/* Trust Indicators */}
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
          
          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="location-on" size={24} color={jewelleryColors.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Location</Text>
              <Text style={styles.contactValue}>{productData.contact.location}</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="phone" size={24} color={jewelleryColors.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{productData.contact.phone}</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIconContainer}>
              <Icon name="access-time" size={24} color={jewelleryColors.primary} />
            </View>
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactLabel}>Open Hours</Text>
              <Text style={styles.contactValue}>{productData.contact.hours}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => {
              // Handle call action
              console.log('Call:', productData.contact.phone);
            }}
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
      </ScrollView>

      <QRModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        qrValue={`product-${productData.id}`}
        shopName={productData.shop}
        onDownload={() => console.log('Download QR')}
        onShare={() => console.log('Share QR')}
      />

      <BottomTabBar activeTab={activeBottomTab} onTabChange={handleTabBarChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imageSection: {
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: SCREEN_WIDTH * 0.9, // Square-ish aspect ratio
    backgroundColor: '#8B4513', // Dark brown fallback
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
  badgeContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
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
  shopName: {
    ...typography.heading2,
    fontWeight: '700',
    fontSize: 24,
    marginBottom: spacing.xs,
    color: jewelleryColors.text,
  },
  owner: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  ratingWrapper: {
    marginTop: spacing.xs,
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
  specCategories: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  specCategoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: jewelleryColors.bgSecondary,
    minWidth: 120,
    alignItems: 'center',
  },
  activeSpecCategoryButton: {
    backgroundColor: jewelleryColors.primary,
  },
  specCategoryText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: jewelleryColors.textSecondary,
  },
  activeSpecCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
});

export default ProductDetailScreen;

