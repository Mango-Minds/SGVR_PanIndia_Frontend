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
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { IconButton, Provider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { setLoadingInBtn } from '../../store/user';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { BASEAPIURL, BASEIMGURL } from '../../infrastructure/constants';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import SelectDropdown from 'react-native-select-dropdown';

const EditProductScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { productId, shopId, type } = route.params || {};
  const isRequirement = type === 'requirement';
  const token = useSelector((state) => state.user.token);
  const { loadingInBtn } = useSelector((state) => state.user);
  const apiBase = isRequirement ? 'product-requirements' : 'jewelry-products';

  const handleBackPress = () => {
    if (shopId && !isRequirement) {
      navigation.navigate('ShopDetailScreen', { shopId });
    } else {
      navigation.goBack();
    }
  };

  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [productDetails, setProductDetails] = useState({
    name: '',
    price: '',
    description: '',
    quantity: '',
    category: '',
    condition: '',
    quality: '',
    weightPerProduct: '',
    goldAvailable: '',
    phone: '',
    hours: '',
  });
  const [loading, setLoading] = useState(true);

  const categoryData = ['gold', 'silver', 'diamond', 'platinum', 'gemstone'];
  const conditionData = ['new', 'old', 'refurbished'];
  const qualityData = ['premium', 'standard', 'basic'];

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId, isRequirement]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASEAPIURL}/${apiBase}/${productId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          isRequirement
            ? t('jw_fetch_requirement_error')
            : t('jw_fetch_product_error')
        );
      }

      const data = await response.json();
      const product =
        data.productRequirement || data.jewelryProduct || data.data || data;

      setProductDetails({
        name: product.name || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        quantity: product.quantity?.toString() || '',
        category: product.category || '',
        condition: product.condition || '',
        quality: product.quality || '',
        weightPerProduct: product.weightPerProduct?.toString() || '',
        goldAvailable: product.goldAvailable || '',
        phone: product.phone || '',
        hours: product.hours || '',
      });

      // Set existing images
      if (product.images && product.images.length > 0) {
        const images = product.images.map((img) => ({
          uri: img.startsWith('http') ? img : `${BASEIMGURL}${img}`,
          isExisting: true,
        }));
        setExistingImages(images);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert(
        t('error'),
        isRequirement
          ? t('jw_load_requirement_error')
          : t('jw_load_product_error')
      );
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImages((prev) => [...prev, result.assets[0]]);
    }
  };

  const removeImage = (index, isExisting) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateProduct = async () => {
    // Validation
    if (!productDetails.name || !productDetails.price || !productDetails.description) {
      Alert.alert(t('error'), t('jw_fill_required_fields'));
      return;
    }

    if (existingImages.length === 0 && selectedImages.length === 0) {
      Alert.alert(t('error'), t('jw_add_at_least_one_image'));
      return;
    }

    try {
      dispatch(setLoadingInBtn(true));

      const formData = new FormData();
      formData.append('name', productDetails.name);
      formData.append('price', parseFloat(productDetails.price));
      formData.append('description', productDetails.description);
      
      if (productDetails.quantity) {
        formData.append('quantity', parseInt(productDetails.quantity));
      }
      if (productDetails.category) {
        formData.append('category', productDetails.category);
      }
      if (productDetails.condition) {
        formData.append('condition', productDetails.condition);
      }
      if (productDetails.quality) {
        formData.append('quality', productDetails.quality);
      }
      if (productDetails.weightPerProduct) {
        formData.append('weightPerProduct', parseFloat(productDetails.weightPerProduct));
      }
      if (productDetails.goldAvailable) {
        formData.append('goldAvailable', productDetails.goldAvailable);
      }
      if (productDetails.phone) {
        formData.append('phone', productDetails.phone.trim());
      }
      if (productDetails.hours) {
        formData.append('hours', productDetails.hours.trim());
      }

      // Add new images
      selectedImages.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: 'image/jpeg',
        });
      });

      const response = await fetch(`${BASEAPIURL}/${apiBase}/${productId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let fetch set it automatically with boundary
        },
        body: formData,
      });

      dispatch(setLoadingInBtn(false));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.msg ||
            errorData.message ||
            (isRequirement ? t('jw_update_requirement_error') : t('jw_update_product_error'))
        );
      }

      const data = await response.json();
      console.log('Updated successfully:', data);

      Alert.alert(
        t('success'),
        isRequirement
          ? t('jw_update_requirement_success')
          : t('jw_update_product_success'),
        [
          {
            text: t('ok'),
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error updating product:', error);
      dispatch(setLoadingInBtn(false));
      Alert.alert(
        t('error'),
        error.message ||
          (isRequirement ? t('jw_update_requirement_error') : t('jw_update_product_error'))
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar
          showBack
          title={isRequirement ? t('jw_edit_requirement') : t('jw_edit_product')}
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.loadingText}>
            {isRequirement ? t('jw_loading_requirement') : t('jw_loading_product_details')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const allImages = [...existingImages, ...selectedImages];

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar
        showBack
        title={isRequirement ? t('jw_edit_requirement') : t('jw_edit_product')}
        onBackPress={handleBackPress}
      />
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
              {/* Image Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('jw_product_images')}</Text>
                <View style={styles.imageContainer}>
                  {allImages.map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image
                        source={{ uri: image.uri }}
                        style={styles.image}
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeImage(index, image.isExisting)}
                      >
                        <Icon name="close" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {allImages.length < 6 && (
                    <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                      <Icon name="add" size={32} color={jewelleryColors.primary} />
                      <Text style={styles.addImageText}>{t('jw_add_image')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Product Details Form */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('jw_product_details')}</Text>

                <TextInput
                  style={styles.input}
                  placeholder={t('jw_product_name_ph')}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  value={productDetails.name}
                  onChangeText={(text) =>
                    setProductDetails({ ...productDetails, name: text })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder={t('jw_price_ph')}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="numeric"
                  value={productDetails.price}
                  onChangeText={(text) =>
                    setProductDetails({ ...productDetails, price: text })
                  }
                />

                <SelectDropdown
                  data={categoryData}
                  onSelect={(selectedItem) => {
                    setProductDetails({ ...productDetails, category: selectedItem });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem || t('jw_select_category')}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={productDetails.category || t('jw_select_category')}
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                <SelectDropdown
                  data={conditionData}
                  onSelect={(selectedItem) => {
                    setProductDetails({ ...productDetails, condition: selectedItem });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem || t('jw_select_condition')}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={productDetails.condition || t('jw_select_condition')}
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t('jw_description_ph')}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={productDetails.description}
                  onChangeText={(text) =>
                    setProductDetails({ ...productDetails, description: text })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder={t('jw_quantity_ph')}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="numeric"
                  value={productDetails.quantity}
                  onChangeText={(text) =>
                    setProductDetails({ ...productDetails, quantity: text })
                  }
                />

                <SelectDropdown
                  data={qualityData}
                  onSelect={(selectedItem) => {
                    setProductDetails({ ...productDetails, quality: selectedItem });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem || t('jw_select_quality')}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={productDetails.quality || t('jw_select_quality')}
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                <TextInput
                  style={styles.input}
                  placeholder={t('jw_weight_per_product_ph')}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="numeric"
                  value={productDetails.weightPerProduct}
                  onChangeText={(text) =>
                    setProductDetails({ ...productDetails, weightPerProduct: text })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder={t('jw_gold_available_ph')}
                  placeholderTextColor={jewelleryColors.textSecondary}
                  value={productDetails.goldAvailable}
                  onChangeText={(text) =>
                    setProductDetails({ ...productDetails, goldAvailable: text })
                  }
                />

                {isRequirement && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder={t('jw_phone_number_ph')}
                      placeholderTextColor={jewelleryColors.textSecondary}
                      keyboardType="phone-pad"
                      value={productDetails.phone}
                      onChangeText={(text) =>
                        setProductDetails({ ...productDetails, phone: text })
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('jw_open_hours_ph')}
                      placeholderTextColor={jewelleryColors.textSecondary}
                      value={productDetails.hours}
                      onChangeText={(text) =>
                        setProductDetails({ ...productDetails, hours: text })
                      }
                    />
                  </>
                )}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleUpdateProduct}
                  disabled={loadingInBtn}
                >
                  {loadingInBtn ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isRequirement ? t('jw_update_requirement') : t('jw_update_product')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
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

export default EditProductScreen;

