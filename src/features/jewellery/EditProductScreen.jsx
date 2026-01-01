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
import { IconButton, Provider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { setLoadingInBtn } from '../../store/user';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { BASEAPIURL, BASEIMGURL } from '../../infrastructure/constants';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import SelectDropdown from 'react-native-select-dropdown';

const EditProductScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { productId, shopId } = route.params || {};
  const token = useSelector((state) => state.user.token);
  const { loadingInBtn } = useSelector((state) => state.user);

  const handleBackPress = () => {
    if (shopId) {
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
  });
  const [loading, setLoading] = useState(true);

  const categoryData = ['gold', 'silver', 'diamond', 'platinum', 'gemstone'];
  const conditionData = ['new', 'old', 'refurbished'];
  const qualityData = ['premium', 'standard', 'basic'];

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASEAPIURL}/jewelry-products/${productId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }

      const data = await response.json();
      const product = data.jewelryProduct || data.data || data;

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
      Alert.alert('Error', 'Failed to load product details');
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
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (existingImages.length === 0 && selectedImages.length === 0) {
      Alert.alert('Error', 'Please add at least one product image');
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

      // Add new images
      selectedImages.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: 'image/jpeg',
        });
      });

      const response = await fetch(`${BASEAPIURL}/jewelry-products/${productId}`, {
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
        throw new Error(errorData.message || 'Failed to update product');
      }

      const data = await response.json();
      console.log('Product updated successfully:', data);

      Alert.alert(
        'Success',
        'Product updated successfully',
        [
          {
            text: 'OK',
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
      Alert.alert('Error', error.message || 'Failed to update product');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar showBack onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allImages = [...existingImages, ...selectedImages];

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack onBackPress={handleBackPress} />
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
                <Text style={styles.sectionTitle}>Product Images</Text>
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
                    setProductDetails({ ...productDetails, price: text })
                  }
                />

                <SelectDropdown
                  data={categoryData}
                  onSelect={(selectedItem) => {
                    setProductDetails({ ...productDetails, category: selectedItem });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select Category'}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={productDetails.category || 'Select Category'}
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
                  defaultButtonText={productDetails.condition || 'Select Condition'}
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
                    setProductDetails({ ...productDetails, quantity: text })
                  }
                />

                <SelectDropdown
                  data={qualityData}
                  onSelect={(selectedItem) => {
                    setProductDetails({ ...productDetails, quality: selectedItem });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select Quality'}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={productDetails.quality || 'Select Quality'}
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
                    setProductDetails({ ...productDetails, weightPerProduct: text })
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

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleUpdateProduct}
                  disabled={loadingInBtn}
                >
                  {loadingInBtn ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Update Product</Text>
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

