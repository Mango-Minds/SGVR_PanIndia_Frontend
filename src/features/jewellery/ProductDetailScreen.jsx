import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import VerifiedBadge from '../../components/Jewellery/VerifiedBadge';
import SpecificationRow from '../../components/Jewellery/SpecificationRow';
import QRModal from '../../components/Jewellery/QRModal';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import BottomTabBar from '../../components/Jewellery/BottomTabBar';
import { navigateJewelleryAuthTab, requireAuth } from '../../utils/requireAuth';
import {
  getProductDetails,
  getProductRequirementDetails,
  deleteJewelryProduct,
  deleteProductRequirement,
  getCurrentSubscription,
} from '../../services/jewellery.services';
import { mapJewelryProduct, mapProductRequirement } from '../../utils/mapJewelryProduct';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, isGuest, user } = useSelector((state) => state.user);
  const { productId, type } = route.params || {};
  const isRequirement = type === 'requirement';
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const currentUserId = user?._id || user?.id;
  const isOwner = Boolean(
    productData?.createdById &&
      currentUserId &&
      String(productData.createdById) === String(currentUserId)
  );
  const canViewContact = isOwner || isSubscribed;

  const checkSubscription = useCallback(async () => {
    if (!token) {
      setIsSubscribed(false);
      return;
    }
    try {
      setCheckingSubscription(true);
      const sub = await getCurrentSubscription();
      const active = Boolean(
        sub?.isActive ||
          sub?.status === 'active' ||
          sub?.data?.isActive ||
          sub?.data?.status === 'active' ||
          sub?.subscription?.isActive ||
          sub?.subscription?.status === 'active' ||
          sub?.isPremium ||
          sub?.data?.isPremium ||
          (sub?.endDate && new Date(sub.endDate) > new Date()) ||
          (sub?.data?.endDate && new Date(sub.data.endDate) > new Date())
      );
      setIsSubscribed(active);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setIsSubscribed(false);
    } finally {
      setCheckingSubscription(false);
    }
  }, [token]);

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setError(isRequirement ? t('jw_requirement_not_found') : t('jw_product_not_found'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedImageIndex(0);
    setImageErrors({});

    try {
      const response = isRequirement
        ? await getProductRequirementDetails(productId)
        : await getProductDetails(productId);
      const rawProduct =
        response?.data ||
        response?.productRequirement ||
        response?.jewelryProduct ||
        response;
      const mapped = isRequirement
        ? mapProductRequirement(rawProduct)
        : mapJewelryProduct(rawProduct);

      if (!mapped) {
        setError(isRequirement ? t('jw_requirement_not_found') : t('jw_product_not_found'));
        setProductData(null);
        return;
      }

      setProductData(mapped);
    } catch (err) {
      console.error('Error loading product details:', err);
      setError(
        isRequirement
          ? t('jw_load_requirement_error')
          : t('jw_load_product_error')
      );
      setProductData(null);
    } finally {
      setLoading(false);
    }
  }, [productId, isRequirement, t]);

  useFocusEffect(
    useCallback(() => {
      setActiveBottomTab('home');
      checkSubscription();
      loadProduct();
    }, [checkSubscription, loadProduct])
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    navigation.navigate('EditProductScreen', {
      productId,
      shopId: productData?.shopId || undefined,
      type: isRequirement ? 'requirement' : 'product',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      isRequirement ? t('jw_delete_requirement') : t('jw_delete_product'),
      isRequirement
        ? t('jw_delete_requirement_msg')
        : t('jw_delete_product_msg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              if (isRequirement) {
                await deleteProductRequirement(productId);
              } else {
                await deleteJewelryProduct(productId);
              }
              Alert.alert(
                t('jw_deleted'),
                isRequirement
                  ? t('jw_requirement_deleted')
                  : t('jw_product_deleted'),
                [{ text: t('ok'), onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              console.error('Error deleting:', err);
              Alert.alert(
                t('error'),
                err?.response?.data?.msg ||
                  err?.message ||
                  (isRequirement
                    ? t('jw_delete_requirement_error')
                    : t('jw_delete_product_error'))
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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

  const productImages = productData?.images?.length
    ? productData.images
    : productData?.image
      ? [productData.image]
      : [];

  const ownerHeaderActions = isOwner ? (
    <View style={styles.headerActions}>
      <TouchableOpacity
        style={styles.headerActionBtn}
        onPress={handleEdit}
        disabled={deleting}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="edit" size={22} color={jewelleryColors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.headerActionBtn}
        onPress={handleDelete}
        disabled={deleting}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {deleting ? (
          <ActivityIndicator size="small" color={jewelleryColors.error || '#C62828'} />
        ) : (
          <Icon name="delete-outline" size={22} color="#C62828" />
        )}
      </TouchableOpacity>
    </View>
  ) : null;

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar
        showBack
        onBackPress={handleBackPress}
        rightActions={ownerHeaderActions}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
        </View>
      ) : error || !productData ? (
        <View style={styles.centered}>
          <Icon name="error-outline" size={48} color={jewelleryColors.textSecondary} />
          <Text style={styles.errorTitle}>{error || t('jw_product_not_found')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProduct}>
            <Text style={styles.retryButtonText}>{t('jw_try_again')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Product Image Carousel */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {productImages[selectedImageIndex] && !imageErrors[selectedImageIndex] ? (
              <Image 
                source={{ uri: productImages[selectedImageIndex] }} 
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
            {productImages.length > 1 && (
              <View style={styles.indicators}>
                {productImages.map((_, index) => (
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
          {productImages.length > 1 && (
            <View style={styles.thumbnailsContainer}>
              {productImages.map((image, index) => (
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

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.shopName}>{productData.title}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('jw_description')}</Text>
          <Text style={styles.description}>
            {productData.description || t('jw_no_description_product')}
          </Text>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('jw_specifications')}</Text>
          <View style={styles.specificationsList}>
            <SpecificationRow label={t('jw_metal')} value={productData.specifications.metal} />
            <SpecificationRow label={t('jw_category')} value={productData.productCategory ? productData.productCategory.replace(/\b\w/g, (c) => c.toUpperCase()) : t('jw_na')} />
            <SpecificationRow label={t('jw_quality')} value={productData.specifications.stones} />
            <SpecificationRow label={t('jw_condition')} value={productData.specifications.making} />
            <SpecificationRow label={t('jw_weight')} value={productData.specifications.dimensions} />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('jw_contact_info')}</Text>

          {checkingSubscription && !isOwner ? (
            <View style={styles.subscribePrompt}>
              <ActivityIndicator color={jewelleryColors.primary} />
            </View>
          ) : canViewContact ? (
            <>
              {!!productData.shop && (
                <View style={styles.contactItem}>
                  <View style={styles.contactIconContainer}>
                    <Icon name="store" size={24} color={jewelleryColors.primary} />
                  </View>
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>{t('jw_shop_name')}</Text>
                    <Text style={styles.contactValue}>{productData.shop}</Text>
                  </View>
                </View>
              )}

              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Icon name="location-on" size={24} color={jewelleryColors.primary} />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>{t('jw_location')}</Text>
                  <Text style={styles.contactValue}>
                    {productData.contact?.location || t('jw_location_unavailable')}
                  </Text>
                </View>
              </View>

              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Icon name="phone" size={24} color={jewelleryColors.primary} />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>{t('jw_phone')}</Text>
                  <Text style={styles.contactValue}>
                    {productData.contact?.phone || t('jw_phone_unavailable')}
                  </Text>
                </View>
              </View>

              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Icon name="access-time" size={24} color={jewelleryColors.primary} />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>{t('jw_open_hours')}</Text>
                  <Text style={styles.contactValue}>
                    {productData.contact?.hours || t('jw_contact_for_timings')}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => {
                    const raw = productData?.contact?.phone;
                    const digits = raw != null ? String(raw).replace(/\D/g, '') : '';
                    if (digits.length >= 10) {
                      Linking.openURL(`tel:${digits}`);
                    } else {
                      Alert.alert(t('jw_call'), t('jw_phone_number_unavailable'));
                    }
                  }}
                >
                  <Icon name="phone" size={20} color="#FFFFFF" />
                  <Text style={styles.callButtonText}>{t('jw_call_now')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => setQrModalVisible(true)}
                >
                  <Icon name="share" size={20} color={jewelleryColors.text} />
                  <Text style={styles.shareButtonText}>{t('jw_share_qr')}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.subscribePrompt}
              activeOpacity={0.85}
              onPress={() =>
                requireAuth({
                  token,
                  isGuest,
                  dispatch,
                  navigation,
                  message: t('jw_sign_in_subscribe_contact'),
                  onAuthed: () => navigation.navigate('PremiumAccessScreen'),
                })
              }
            >
              <Icon name="lock" size={22} color={jewelleryColors.primary} />
              <Text style={styles.subscribeTitle}>{t('jw_subscribe_view_contact')}</Text>
              <Text style={styles.subscribeSubtitle}>
                {t('jw_unlock_contact_hint')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      )}

      {productData && (
        <QRModal
          visible={qrModalVisible}
          onClose={() => setQrModalVisible(false)}
          qrValue={`product-${productData.id}`}
          shopName={productData.shop}
        />
      )}

      <BottomTabBar activeTab={activeBottomTab} onTabChange={handleTabBarChange} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerActionBtn: {
    padding: spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: jewelleryColors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
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
  specificationsList: {
    gap: spacing.sm,
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
  subscribePrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 12,
    gap: spacing.xs,
  },
  subscribeTitle: {
    ...typography.body,
    fontWeight: '700',
    color: jewelleryColors.primary,
    marginTop: spacing.xs,
  },
  subscribeSubtitle: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
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

