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
import { setLoadingInBtn } from '../../store/user';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { BASEAPIURL } from '../../infrastructure/constants';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import SelectDropdown from 'react-native-select-dropdown';
import { getShopDetails, getShopByOwner } from '../../services/jewellery.services';

/** Convert Devanagari/Arabic-Indic digits to ASCII and keep decimal point. */
const normalizeNumericInput = (value = '') => {
  const digitMap = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  return String(value)
    .split('')
    .map((ch) => digitMap[ch] ?? ch)
    .join('')
    .replace(/[^\d.]/g, '')
    .replace(/(\..*)\./g, '$1');
};

const normalizePhoneInput = (value = '') => {
  const digitMap = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  return String(value)
    .split('')
    .map((ch) => digitMap[ch] ?? ch)
    .join('')
    .replace(/[^\d+]/g, '')
    .slice(0, 15);
};

const parseRequiredNumber = (value, fieldLabel) => {
  const normalized = normalizeNumericInput(value);
  const parsed = parseFloat(normalized);
  if (!normalized || Number.isNaN(parsed)) {
    throw new Error(`Please enter a valid ${fieldLabel} using numbers (0-9)`);
  }
  return parsed;
};

const parseOptionalNumber = (value, asInt = false) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }
  const normalized = normalizeNumericInput(value);
  if (!normalized) return null;
  const parsed = asInt ? parseInt(normalized, 10) : parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

const AddProductScreen = ({
  embedded = false,
  shopId: shopIdProp,
  onSuccess,
  asRequirement = false,
} = {}) => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const routeShopId = route.params?.shopId;
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const { loadingInBtn } = useSelector((state) => state.user);
  const [shopId, setShopId] = useState(shopIdProp || routeShopId || null);
  const [resolvingShop, setResolvingShop] = useState(!shopIdProp && !routeShopId);

  const handleBackPress = () => {
    if (shopId && !embedded) {
      navigation.navigate('ShopDetailScreen', { shopId });
    } else {
      navigation.goBack();
    }
  };

  const [selectedImages, setSelectedImages] = useState([]);
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

  const categoryData = ['gold', 'silver', 'diamond', 'platinum', 'gemstone'];
  const conditionData = ['new', 'old', 'refurbished'];
  const qualityData = ['premium', 'standard', 'basic'];

  useEffect(() => {
    const resolveShop = async () => {
      if (shopIdProp || routeShopId) {
        setShopId(shopIdProp || routeShopId);
        setResolvingShop(false);
        return;
      }
      if (!user?._id && !user?.id) {
        setResolvingShop(false);
        return;
      }
      try {
        setResolvingShop(true);
        const shop = await getShopByOwner(user._id || user.id);
        if (shop?._id || shop?.id) {
          setShopId(String(shop._id || shop.id));
        }
      } catch (error) {
        console.error('Error resolving shop for add product:', error);
      } finally {
        setResolvingShop(false);
      }
    };
    resolveShop();
  }, [shopIdProp, routeShopId, user?._id, user?.id]);

  useEffect(() => {
    const loadShopContact = async () => {
      if (!shopId) return;
      try {
        const shop = await getShopDetails(shopId);
        setProductDetails((prev) => ({
          ...prev,
          phone: shop.phone || shop.owner?.phone || prev.phone,
          hours: shop.hours || shop.timing || prev.hours,
        }));
      } catch (error) {
        console.error('Error loading shop contact details:', error);
      }
    };
    loadShopContact();
  }, [shopId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType?.Images
        ? [ImagePicker.MediaType.Images]
        : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImages((prev) => [...prev, result.assets[0]]);
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async () => {
    // Validation
    if (!productDetails.name || !productDetails.price || !productDetails.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please add at least one product image');
      return;
    }

    let parsedPrice;
    let parsedQuantity;
    let parsedWeight;
    try {
      parsedPrice = parseRequiredNumber(productDetails.price, 'price');
      parsedQuantity = parseOptionalNumber(productDetails.quantity, true);
      parsedWeight = parseOptionalNumber(productDetails.weightPerProduct, false);
      if (productDetails.quantity && parsedQuantity === null) {
        throw new Error('Please enter a valid quantity using numbers (0-9)');
      }
      if (productDetails.weightPerProduct && parsedWeight === null) {
        throw new Error('Please enter a valid weight using numbers (0-9)');
      }
    } catch (validationError) {
      Alert.alert('Error', validationError.message);
      return;
    }

    try {
      dispatch(setLoadingInBtn(true));

      const formData = new FormData();
      formData.append('name', productDetails.name);
      formData.append('price', String(parsedPrice));
      formData.append('description', productDetails.description);
      
      if (parsedQuantity !== null) {
        formData.append('quantity', String(parsedQuantity));
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
      if (parsedWeight !== null) {
        formData.append('weightPerProduct', String(parsedWeight));
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
      
      // Add shop association if shopId is provided
      if (shopId) {
        formData.append('shop', shopId);
      }

      // Add images
      selectedImages.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: 'image/jpeg',
        });
      });

      const response = await fetch(
        `${BASEAPIURL}/${asRequirement ? 'product-requirements' : 'jewelry-products'}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let fetch set it automatically with boundary
          },
          body: formData,
        }
      );

      dispatch(setLoadingInBtn(false));

      const errorData = !response.ok
        ? await response.json().catch(() => ({}))
        : null;

      if (!response.ok) {
        throw new Error(
          errorData?.msg ||
            errorData?.message ||
            errorData?.error ||
            (asRequirement ? 'Failed to add product requirement' : 'Failed to add product')
        );
      }

      const data = await response.json();
      console.log(asRequirement ? 'Product requirement added:' : 'Product added successfully:', data);

      Alert.alert(
        'Success',
        asRequirement ? 'Product requirement added successfully' : 'Product added successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess(data);
                return;
              }
              if (embedded) {
                setSelectedImages([]);
                setProductDetails({
                  name: '',
                  price: '',
                  description: '',
                  quantity: '',
                  category: '',
                  condition: '',
                  quality: '',
                  weightPerProduct: '',
                  goldAvailable: '',
                  phone: productDetails.phone,
                  hours: productDetails.hours,
                });
                return;
              }
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error adding product:', error);
      dispatch(setLoadingInBtn(false));
      Alert.alert('Error', error.message || 'Failed to add product');
    }
  };

  const formContent = (
    <Provider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <View style={[styles.container, embedded && styles.embeddedContainer]}>
            {resolvingShop ? (
              <View style={styles.resolvingContainer}>
                <ActivityIndicator size="large" color={jewelleryColors.primary} />
                <Text style={styles.resolvingText}>Loading your shop...</Text>
              </View>
            ) : (
              <>
            {/* Image Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Images</Text>
              <View style={styles.imageContainer}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Icon name="close" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedImages.length < 6 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                    <Icon name="add" size={32} color={jewelleryColors.primary} />
                    <Text style={styles.addImageText}>Add Image</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Product Details Form */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Details</Text>

              <TextInput
                style={styles.input}
                placeholder="Product Name *"
                placeholderTextColor={jewelleryColors.textSecondary}
                value={productDetails.name}
                onChangeText={(text) =>
                  setProductDetails({ ...productDetails, name: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Price (₹) *"
                placeholderTextColor={jewelleryColors.textSecondary}
                keyboardType="numeric"
                value={productDetails.price}
                onChangeText={(text) =>
                  setProductDetails({
                    ...productDetails,
                    price: normalizeNumericInput(text),
                  })
                }
              />

              <SelectDropdown
                data={categoryData}
                onSelect={(selectedItem) => {
                  setProductDetails({ ...productDetails, category: selectedItem });
                }}
                buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select Category'}
                rowTextForSelection={(item) => item}
                defaultButtonText="Select Category"
                buttonStyle={styles.dropdownButton}
                buttonTextStyle={styles.dropdownButtonText}
              />

              <SelectDropdown
                data={conditionData}
                onSelect={(selectedItem) => {
                  setProductDetails({ ...productDetails, condition: selectedItem });
                }}
                buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select Condition'}
                rowTextForSelection={(item) => item}
                defaultButtonText="Select Condition"
                buttonStyle={styles.dropdownButton}
                buttonTextStyle={styles.dropdownButtonText}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description *"
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
                placeholder="Quantity"
                placeholderTextColor={jewelleryColors.textSecondary}
                keyboardType="numeric"
                value={productDetails.quantity}
                onChangeText={(text) =>
                  setProductDetails({
                    ...productDetails,
                    quantity: normalizeNumericInput(text),
                  })
                }
              />

              <SelectDropdown
                data={qualityData}
                onSelect={(selectedItem) => {
                  setProductDetails({ ...productDetails, quality: selectedItem });
                }}
                buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select Quality'}
                rowTextForSelection={(item) => item}
                defaultButtonText="Select Quality"
                buttonStyle={styles.dropdownButton}
                buttonTextStyle={styles.dropdownButtonText}
              />

              <TextInput
                style={styles.input}
                placeholder="Weight per Product (grams)"
                placeholderTextColor={jewelleryColors.textSecondary}
                keyboardType="numeric"
                value={productDetails.weightPerProduct}
                onChangeText={(text) =>
                  setProductDetails({
                    ...productDetails,
                    weightPerProduct: normalizeNumericInput(text),
                  })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Gold Available (e.g., 14K, 18K, 22K)"
                placeholderTextColor={jewelleryColors.textSecondary}
                value={productDetails.goldAvailable}
                onChangeText={(text) =>
                  setProductDetails({ ...productDetails, goldAvailable: text })
                }
              />

              <Text style={styles.sectionSubtitle}>Shop Contact</Text>

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={jewelleryColors.textSecondary}
                keyboardType="phone-pad"
                value={productDetails.phone}
                onChangeText={(text) =>
                  setProductDetails({
                    ...productDetails,
                    phone: normalizePhoneInput(text),
                  })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Open Hours (e.g., 10:00 AM - 8:00 PM)"
                placeholderTextColor={jewelleryColors.textSecondary}
                value={productDetails.hours}
                onChangeText={(text) =>
                  setProductDetails({ ...productDetails, hours: text })
                }
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddProduct}
                disabled={loadingInBtn}
              >
                {loadingInBtn ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {asRequirement ? 'Add Requirement' : 'Add Product'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Provider>
  );

  if (embedded) {
    return <View style={{ flex: 1 }}>{formContent}</View>;
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack onBackPress={handleBackPress} />
      {formContent}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  embeddedContainer: {
    paddingTop: spacing.sm,
  },
  resolvingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolvingText: {
    ...typography.body,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.md,
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
  sectionSubtitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.sm,
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
});

export default AddProductScreen;
