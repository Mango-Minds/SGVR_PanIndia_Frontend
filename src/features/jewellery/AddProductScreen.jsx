import React, { useState } from 'react';
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
import { BASEAPIURL } from '../../infrastructure/constants';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import SelectDropdown from 'react-native-select-dropdown';

const AddProductScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { shopId } = route.params || {};
  const token = useSelector((state) => state.user.token);
  const { loadingInBtn } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user.user);

  const handleBackPress = () => {
    if (shopId) {
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
  });

  const categoryData = ['gold', 'silver', 'diamond', 'platinum', 'gemstone'];
  const conditionData = ['new', 'old', 'refurbished'];
  const qualityData = ['premium', 'standard', 'basic'];

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

      const response = await fetch(`${BASEAPIURL}/jewelry-products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let fetch set it automatically with boundary
        },
        body: formData,
      });

      dispatch(setLoadingInBtn(false));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add product');
      }

      const data = await response.json();
      console.log('Product added successfully:', data);

      Alert.alert(
        'Success',
        'Product added successfully',
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
      console.error('Error adding product:', error);
      dispatch(setLoadingInBtn(false));
      Alert.alert('Error', error.message || 'Failed to add product');
    }
  };

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
                  onPress={handleAddProduct}
                  disabled={loadingInBtn}
                >
                  {loadingInBtn ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Add Product</Text>
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
});

export default AddProductScreen;

