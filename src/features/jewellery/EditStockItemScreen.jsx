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
import { getStockItemDetails, updateStockItem } from '../../services/jewellery.services';

const EditStockItemScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { stockItemId, shopId } = route.params || {};
  const token = useSelector((state) => state.user.token);
  const { loadingInBtn } = useSelector((state) => state.user);

  const handleBackPress = () => {
    if (shopId) {
      navigation.navigate('StockDetailsScreen', { shopId });
    } else {
      navigation.goBack();
    }
  };

  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [stockItemDetails, setStockItemDetails] = useState({
    name: '',
    price: '',
    description: '',
    quantity: '',
    weight: '',
    purity: '',
    gemstones: '',
    paymentTerms: '',
    category: '',
  });
  const [loading, setLoading] = useState(true);

  const categoryData = ['Rings', 'Bracelets', 'Chains', 'Earrings', 'Necklaces', 'Other'];
  const purityData = ['14K', '18K', '22K', '24K', '925 Silver', 'Platinum'];
  const paymentTermsData = [
    'Cash on Delivery',
    'Advance Payment',
    '50% Advance, 50% on Delivery',
    'Full Payment Required',
    'Net 30 Days',
    'Net 60 Days',
  ];

  useEffect(() => {
    if (stockItemId) {
      fetchStockItemDetails();
    }
  }, [stockItemId]);

  const fetchStockItemDetails = async () => {
    try {
      setLoading(true);
      const response = await getStockItemDetails(stockItemId);
      const item = response.stockItem || response.data || response;

      setStockItemDetails({
        name: item.name || '',
        price: item.price?.toString() || '',
        description: item.description || '',
        quantity: item.quantity?.toString() || '',
        weight: item.weightPerProduct?.toString() || '',
        purity: item.purity || item.goldAvailable || '',
        gemstones: item.gemstones || '',
        paymentTerms: item.paymentTerms || '',
        category: item.productCategory ? item.productCategory.charAt(0).toUpperCase() + item.productCategory.slice(1) : '',
      });

      // Set existing images
      if (item.images && item.images.length > 0) {
        const images = item.images
          .filter((img) => img && typeof img === 'string' && img.trim().length > 0) // Filter out invalid images
          .map((img) => {
            const trimmedImg = img.trim();
            // If it's already a full URL (http/https), use it as-is
            // Otherwise, prepend BASEIMGURL
            const uri = trimmedImg.startsWith('http://') || trimmedImg.startsWith('https://') 
              ? trimmedImg 
              : `${BASEIMGURL}${trimmedImg.startsWith('/') ? trimmedImg.slice(1) : trimmedImg}`;
            
            return {
              uri: uri,
              isExisting: true,
            };
          });
        setExistingImages(images);
      }
    } catch (error) {
      console.error('Error fetching stock item details:', error);
      Alert.alert('Error', error.message || 'Failed to load stock item details');
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

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateStockItem = async () => {
    // Validation
    if (!stockItemDetails.name || !stockItemDetails.quantity || !stockItemDetails.weight) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Quantity, Weight)');
      return;
    }

    if (existingImages.length === 0 && selectedImages.length === 0) {
      Alert.alert('Error', 'Please keep at least one item image');
      return;
    }

    try {
      dispatch(setLoadingInBtn(true));

      const formData = new FormData();
      formData.append('name', stockItemDetails.name);
      formData.append('quantity', parseInt(stockItemDetails.quantity));
      formData.append('weightPerProduct', parseFloat(stockItemDetails.weight));
      
      // Only append price if it's a valid number
      if (stockItemDetails.price && stockItemDetails.price.trim() !== '') {
        const numPrice = parseFloat(stockItemDetails.price);
        if (!isNaN(numPrice) && numPrice >= 0) {
          formData.append('price', numPrice);
        }
      }
      if (stockItemDetails.description) {
        formData.append('description', stockItemDetails.description);
      }
      if (stockItemDetails.purity) {
        formData.append('goldAvailable', stockItemDetails.purity);
        formData.append('purity', stockItemDetails.purity);
      }
      if (stockItemDetails.gemstones) {
        formData.append('gemstones', stockItemDetails.gemstones);
      }
      if (stockItemDetails.paymentTerms) {
        formData.append('paymentTerms', stockItemDetails.paymentTerms);
      }
      if (stockItemDetails.category) {
        formData.append('productCategory', stockItemDetails.category.toLowerCase());
        formData.append('category', 'gold'); // Default category
      }

      // Add existing images that weren't removed (as string URLs)
      // Only include images that are valid URLs
      existingImages.forEach((img) => {
        if (img && img.uri && typeof img.uri === 'string' && img.uri.trim().length > 0) {
          // If it's a full URL, send it as a string
          // The backend will handle it appropriately
          formData.append('images', img.uri);
        }
      });

      // Add new images as file objects
      selectedImages.forEach((image, index) => {
        if (image && image.uri) {
          formData.append('images', {
            uri: image.uri,
            name: `image_${index}.jpg`,
            type: image.type || 'image/jpeg',
          });
        }
      });

      const data = await updateStockItem(stockItemId, formData);
      dispatch(setLoadingInBtn(false));
      console.log('Stock item updated successfully:', data);

      Alert.alert(
        'Success',
        'Stock item updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('StockDetailsScreen', { shopId });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error updating stock item:', error);
      dispatch(setLoadingInBtn(false));
      Alert.alert('Error', error.message || 'Failed to update stock item');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar showBack title="Edit Stock Item" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.loadingText}>Loading stock item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allImages = [...existingImages, ...selectedImages];

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Edit Stock Item" onBackPress={handleBackPress} />
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
                <Text style={styles.sectionTitle}>Item Images *</Text>
                <View style={styles.imageContainer}>
                  {allImages.map((image, index) => {
                    const isExisting = image.isExisting;
                    const imageKey = `image_${index}`;
                    const hasError = imageErrors[imageKey];
                    
                    return (
                      <View key={index} style={styles.imageWrapper}>
                        {!hasError && image.uri ? (
                          <Image 
                            source={{ uri: image.uri }} 
                            style={styles.image}
                            onError={() => {
                              setImageErrors(prev => ({ ...prev, [imageKey]: true }));
                            }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Icon name="image" size={32} color={jewelleryColors.textSecondary} />
                            <Text style={styles.imageErrorText}>Failed to load</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(index, isExisting)}
                        >
                          <Icon name="close" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  {allImages.length < 6 && (
                    <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                      <Icon name="add" size={32} color={jewelleryColors.primary} />
                      <Text style={styles.addImageText}>Add Image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Stock Item Details Form */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stock Item Details</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Item Name *"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  value={stockItemDetails.name}
                  onChangeText={(text) =>
                    setStockItemDetails({ ...stockItemDetails, name: text })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Quantity *"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="numeric"
                  value={stockItemDetails.quantity}
                  onChangeText={(text) =>
                    setStockItemDetails({ ...stockItemDetails, quantity: text })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Weight per Item (grams) *"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="decimal-pad"
                  value={stockItemDetails.weight}
                  onChangeText={(text) =>
                    setStockItemDetails({ ...stockItemDetails, weight: text })
                  }
                />

                <SelectDropdown
                  data={purityData}
                  onSelect={(selectedItem) => {
                    setStockItemDetails({ ...stockItemDetails, purity: selectedItem });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select Purity'}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={stockItemDetails.purity || 'Select Purity'}
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Gemstones Used"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  value={stockItemDetails.gemstones}
                  onChangeText={(text) =>
                    setStockItemDetails({ ...stockItemDetails, gemstones: text })
                  }
                />

                <SelectDropdown
                  data={categoryData}
                  onSelect={(selectedItem) => {
                    setStockItemDetails({ ...stockItemDetails, category: selectedItem });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select Category'}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={stockItemDetails.category || 'Select Category'}
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                <SelectDropdown
                  data={paymentTermsData}
                  onSelect={(selectedItem) => {
                    setStockItemDetails({ ...stockItemDetails, paymentTerms: selectedItem });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select Payment Terms'}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={stockItemDetails.paymentTerms || 'Select Payment Terms'}
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Price per Item (₹)"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="numeric"
                  value={stockItemDetails.price}
                  onChangeText={(text) =>
                    setStockItemDetails({ ...stockItemDetails, price: text })
                  }
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Additional Description"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={stockItemDetails.description}
                  onChangeText={(text) =>
                    setStockItemDetails({ ...stockItemDetails, description: text })
                  }
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleUpdateStockItem}
                  disabled={loadingInBtn}
                >
                  {loadingInBtn ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Update Stock Item</Text>
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
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: jewelleryColors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageErrorText: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 10,
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

export default EditStockItemScreen;

