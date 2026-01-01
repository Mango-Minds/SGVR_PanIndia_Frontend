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
import { createStockItem } from '../../services/jewellery.services';

const AddStockItemScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { shopId } = route.params || {};
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

  const handleAddStockItem = async () => {
    // Validation
    if (!stockItemDetails.name || !stockItemDetails.quantity || !stockItemDetails.weight) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Quantity, Weight)');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please add at least one item image');
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

      const data = await createStockItem(formData);
      dispatch(setLoadingInBtn(false));
      console.log('Stock item added successfully:', data);

      Alert.alert(
        'Success',
        'Stock item added successfully',
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
      console.error('Error adding stock item:', error);
      dispatch(setLoadingInBtn(false));
      Alert.alert('Error', error.message || 'Failed to add stock item');
    }
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Add Stock Item" onBackPress={handleBackPress} />
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
                <Text style={styles.sectionSubtitle}>
                  Add images of the stock items (e.g., 50 rings)
                </Text>
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

              {/* Stock Item Details Form */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stock Item Details</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Item Name * (e.g., Gold Rings)"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  value={stockItemDetails.name}
                  onChangeText={(text) =>
                    setStockItemDetails({ ...stockItemDetails, name: text })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Quantity * (e.g., 50)"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="numeric"
                  value={stockItemDetails.quantity}
                  onChangeText={(text) =>
                    setStockItemDetails({ ...stockItemDetails, quantity: text })
                  }
                />

                <TextInput
                  style={styles.input}
                  placeholder="Weight per Item (grams) * (e.g., 5.5)"
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
                  defaultButtonText="Select Purity (e.g., 18K, 22K)"
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Gemstones Used (e.g., Diamond, Ruby, Emerald)"
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
                  defaultButtonText="Select Category"
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
                  defaultButtonText="Payment Terms (e.g., Cash on Delivery)"
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Price per Item (₹) - Optional"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="numeric"
                  value={stockItemDetails.price}
                  onChangeText={(text) =>
                    setStockItemDetails({ ...stockItemDetails, price: text })
                  }
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Additional Description (Optional)"
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
                  onPress={handleAddStockItem}
                  disabled={loadingInBtn}
                >
                  {loadingInBtn ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Add Stock Item</Text>
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
    marginBottom: spacing.xs,
    color: jewelleryColors.text,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    marginBottom: spacing.md,
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

export default AddStockItemScreen;

