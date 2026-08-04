import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Provider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { setLoadingInBtn } from '../../store/user';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { BASEAPIURL } from '../../infrastructure/constants';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import { getShopDetails } from '../../services/jewellery.services';
import { resolveImageUrl } from '../../utils/mapJewelryProduct';
import { statesData } from '../../assets/data/statesAndCities';
import SelectDropdown from 'react-native-select-dropdown';

const buildImageFormPart = (asset, fallbackName = 'image.jpg') => {
  const uri = asset?.uri;
  if (!uri) return null;

  const rawName =
    asset.fileName ||
    asset.name ||
    uri.split('/').pop() ||
    fallbackName;
  const safeName = rawName.includes('.') ? rawName : fallbackName;
  const extMatch = /\.(\w+)$/.exec(safeName);
  const ext = (extMatch ? extMatch[1] : 'jpg').toLowerCase();
  const normalizedExt = ext === 'jpg' ? 'jpeg' : ext;
  const type =
    asset.mimeType ||
    asset.type ||
    (normalizedExt ? `image/${normalizedExt}` : 'image/jpeg');

  return {
    uri,
    name: safeName.replace(/\s+/g, '_'),
    type: type === 'image/jpg' ? 'image/jpeg' : type,
  };
};

const EditShopScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { shopId } = route.params || {};
  const token = useSelector((state) => state.user.token);
  const { loadingInBtn } = useSelector((state) => state.user);

  const handleBackPress = () => {
    navigation.navigate('ShopDetailScreen', { shopId });
  };

  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [shopDetails, setShopDetails] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [existingProfileImage, setExistingProfileImage] = useState(null);

  const statesList = Object.keys(statesData || {});

  const getCitiesForState = () => {
    if (!shopDetails.state || !statesData) return [];
    return statesData[shopDetails.state] || [];
  };

  useEffect(() => {
    if (shopId) {
      fetchShopDetails();
    }
  }, [shopId]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const shop = await getShopDetails(shopId);

      setShopDetails({
        name: shop.name || shop.shopName || '',
        description: shop.description || '',
        address: shop.address || '',
        city: shop.city || '',
        state: shop.state || '',
        pincode: shop.pincode || '',
      });

      const profileCandidate =
        shop.image ||
        shop.profileImage ||
        shop.owner?.image ||
        (Array.isArray(shop.images) && shop.images.length > 0 ? shop.images[0] : null);

      const profileUri = resolveImageUrl(profileCandidate);
      setExistingProfileImage(profileUri);

      if (Array.isArray(shop.images) && shop.images.length > 0) {
        setExistingImages(
          shop.images
            .filter(Boolean)
            .map((img) => ({
              // Keep original path/URL for saving back to API
              originalUri: img,
              uri: resolveImageUrl(img),
              isExisting: true,
            }))
            .filter((img) => img.uri)
        );
      } else {
        setExistingImages([]);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      Alert.alert(t('error'), t('jw_load_shop_error'));
    } finally {
      setLoading(false);
    }
  };

  const ensureMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('jw_permission_needed'), t('jw_photo_library_permission'));
      return false;
    }
    return true;
  };

  const pickProfileImage = async () => {
    if (!(await ensureMediaPermission())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]) {
      setProfileImage(result.assets[0]);
    }
  };

  const pickGalleryImage = async () => {
    if (!(await ensureMediaPermission())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImages((prev) => [...prev, result.assets[0]]);
    }
  };

  const removeGalleryImage = (image) => {
    if (image.isExisting) {
      setExistingImages((prev) => prev.filter((img) => img.originalUri !== image.originalUri));
    } else {
      setSelectedImages((prev) => prev.filter((img) => img.uri !== image.uri));
    }
  };

  const handleUpdateShop = async () => {
    if (!shopDetails.name || !shopDetails.address || !shopDetails.city || !shopDetails.state) {
      Alert.alert(t('error'), t('jw_fill_required_fields'));
      return;
    }

    try {
      dispatch(setLoadingInBtn(true));

      const formData = new FormData();
      formData.append('name', shopDetails.name);
      formData.append('description', shopDetails.description || '');
      formData.append('address', shopDetails.address);
      formData.append('city', shopDetails.city);
      formData.append('state', shopDetails.state);
      formData.append('pincode', shopDetails.pincode || '');

      // New shop profile image (shop.image)
      if (profileImage?.uri) {
        const imagePart = buildImageFormPart(profileImage, 'profile.jpg');
        if (imagePart) {
          formData.append('image', imagePart);
        }
      }

      // Keep remaining existing gallery images using original stored URLs/paths
      existingImages.forEach((image) => {
        if (image.originalUri) {
          formData.append('images', image.originalUri);
        }
      });

      // New gallery uploads
      selectedImages.forEach((image, index) => {
        const imagePart = buildImageFormPart(image, `gallery_${index}.jpg`);
        if (imagePart) {
          formData.append('images', imagePart);
        }
      });

      // Explicitly clear gallery when user removed all and added none
      if (existingImages.length === 0 && selectedImages.length === 0) {
        formData.append('images', '');
      }

      const response = await fetch(`${BASEAPIURL}/vendor/vendor-for-user?id=${shopId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      dispatch(setLoadingInBtn(false));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.msg ||
            t('jw_shop_update_error')
        );
      }

      Alert.alert(
        t('success'),
        t('jw_shop_updated'),
        [
          {
            text: t('ok'),
            onPress: () => {
              navigation.navigate('ShopDetailScreen', { shopId });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error updating shop:', error);
      dispatch(setLoadingInBtn(false));
      Alert.alert(t('error'), error.message || t('jw_shop_update_error'));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar showBack title={t('edit_shop_profile')} onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.loadingText}>{t('jw_loading_shop_details')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allGalleryImages = [...existingImages, ...selectedImages];
  const displayProfileImage = profileImage?.uri || existingProfileImage;
  const citiesList = getCitiesForState();

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title={t('edit_shop_profile')} onBackPress={handleBackPress} />
      <Provider>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('jw_shop_profile_image')}</Text>
                <TouchableOpacity
                  style={styles.profileImageContainer}
                  onPress={pickProfileImage}
                >
                  {displayProfileImage ? (
                    <Image source={{ uri: displayProfileImage }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Icon name="store" size={40} color={jewelleryColors.textSecondary} />
                      <Text style={styles.profileImageText} numberOfLines={2}>
                        {t('jw_add_profile_image')}
                      </Text>
                    </View>
                  )}
                  <View style={styles.editProfileBadge}>
                    <Icon name="edit" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('jw_shop_information')}</Text>

                <TextInput
                  style={styles.input}
                  placeholder={`${t('jw_shop_name')} *`}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  value={shopDetails.name}
                  onChangeText={(text) =>
                    setShopDetails({ ...shopDetails, name: text })
                  }
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t('jw_description')}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={shopDetails.description}
                  onChangeText={(text) =>
                    setShopDetails({ ...shopDetails, description: text })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder={`${t('jw_address')} *`}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  value={shopDetails.address}
                  onChangeText={(text) =>
                    setShopDetails({ ...shopDetails, address: text })
                  }
                />

                <SelectDropdown
                  data={statesList}
                  onSelect={(selectedItem) => {
                    setShopDetails({ ...shopDetails, state: selectedItem, city: '' });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem || t('jw_select_state')}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={shopDetails.state || t('jw_select_state')}
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                {shopDetails.state && citiesList.length > 0 && (
                  <SelectDropdown
                    data={citiesList}
                    onSelect={(selectedItem) => {
                      setShopDetails({ ...shopDetails, city: selectedItem });
                    }}
                    buttonTextAfterSelection={(selectedItem) => selectedItem || t('jw_select_city')}
                    rowTextForSelection={(item) => item}
                    defaultButtonText={shopDetails.city || t('jw_select_city')}
                    buttonStyle={styles.dropdownButton}
                    buttonTextStyle={styles.dropdownButtonText}
                  />
                )}

                <TextInput
                  style={styles.input}
                  placeholder={t('jw_pincode')}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="numeric"
                  value={shopDetails.pincode}
                  onChangeText={(text) =>
                    setShopDetails({ ...shopDetails, pincode: text })
                  }
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('jw_gallery_images')}</Text>
                <View style={styles.imageContainer}>
                  {allGalleryImages.map((image, index) => (
                    <View key={`${image.uri}-${index}`} style={styles.imageWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeGalleryImage(image)}
                      >
                        <Icon name="close" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {allGalleryImages.length < 10 && (
                    <TouchableOpacity
                      style={styles.addImageButton}
                      onPress={pickGalleryImage}
                    >
                      <Icon name="add" size={32} color={jewelleryColors.primary} />
                      <Text style={styles.addImageText}>{t('jw_add_image')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateShop}
                disabled={loadingInBtn}
              >
                {loadingInBtn ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('jw_update_shop')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Provider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: jewelleryColors.text,
  },
  profileImageContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: jewelleryColors.primary,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: jewelleryColors.primary,
    borderStyle: 'dashed',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  profileImageText: {
    ...typography.bodySmall,
    fontSize: 10,
    color: jewelleryColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  editProfileBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: jewelleryColors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: jewelleryColors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
  },
  addImageText: {
    ...typography.bodySmall,
    color: jewelleryColors.primary,
    marginTop: spacing.xs,
  },
  input: {
    ...typography.body,
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    color: jewelleryColors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    width: '100%',
    height: 50,
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    marginBottom: spacing.md,
  },
  dropdownButtonText: {
    textAlign: 'left',
    color: jewelleryColors.text,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitButtonText: {
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
});

export default EditShopScreen;
