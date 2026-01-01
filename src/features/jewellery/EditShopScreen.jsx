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
import { BASEAPIURL, BASEIMGURL } from '../../infrastructure/constants';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import { getShopDetails } from '../../services/jewellery.services';
import { statesData } from '../../assets/data/statesAndCities';
import SelectDropdown from 'react-native-select-dropdown';

const EditShopScreen = () => {
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

  // Get states list for dropdown
  const statesList = Object.keys(statesData || {});
  
  // Get cities for selected state
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

      // Set existing profile image
      if (shop.image || shop.profileImage) {
        const imgUrl = shop.image || shop.profileImage;
        setExistingProfileImage(
          imgUrl.startsWith('http') ? imgUrl : `${BASEIMGURL}${imgUrl}`
        );
      }

      // Set existing gallery images
      if (shop.images && shop.images.length > 0) {
        const images = shop.images.map((img) => ({
          uri: img.startsWith('http') ? img : `${BASEIMGURL}${img}`,
          isExisting: true,
        }));
        setExistingImages(images);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      Alert.alert('Error', 'Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0]);
    }
  };

  const pickGalleryImage = async () => {
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

  const removeGalleryImage = (index, isExisting) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateShop = async () => {
    // Validation
    if (!shopDetails.name || !shopDetails.address || !shopDetails.city || !shopDetails.state) {
      Alert.alert('Error', 'Please fill in all required fields');
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

      // Add profile image if new one is selected
      if (profileImage) {
        formData.append('image', {
          uri: profileImage.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }

      // Add existing gallery images (send full URL as stored in database)
      existingImages.forEach((image) => {
        // Send the image URL as-is (could be S3 URL or relative path)
        // Backend will handle both cases
        formData.append('images', image.uri);
      });

      // Add new gallery images
      selectedImages.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          name: `gallery_${index}.jpg`,
          type: 'image/jpeg',
        });
      });

      // Update shop using vendor endpoint
      const response = await fetch(`${BASEAPIURL}/vendor/vendor-for-user?id=${shopId}`, {
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
          errorData.message || 
          'Failed to update shop. Please ensure the shop update endpoint is available in the backend.'
        );
      }

      Alert.alert(
        'Success',
        'Shop updated successfully',
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
      console.error('Error updating shop:', error);
      dispatch(setLoadingInBtn(false));
      Alert.alert('Error', error.message || 'Failed to update shop. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar showBack onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
          <Text style={styles.loadingText}>Loading shop details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allGalleryImages = [...existingImages, ...selectedImages];
  const displayProfileImage = profileImage?.uri || existingProfileImage;
  const citiesList = getCitiesForState();

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
              {/* Profile Image */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shop Profile Image</Text>
                <TouchableOpacity
                  style={styles.profileImageContainer}
                  onPress={pickProfileImage}
                >
                  {displayProfileImage ? (
                    <Image source={{ uri: displayProfileImage }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Icon name="store" size={40} color={jewelleryColors.textSecondary} />
                      <Text style={styles.profileImageText} numberOfLines={2}>Add Profile Image</Text>
                    </View>
                  )}
                  <View style={styles.editProfileBadge}>
                    <Icon name="edit" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Shop Details Form */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shop Information</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Shop Name *"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  value={shopDetails.name}
                  onChangeText={(text) =>
                    setShopDetails({ ...shopDetails, name: text })
                  }
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
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
                  placeholder="Address *"
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
                  buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select State'}
                  rowTextForSelection={(item) => item}
                  defaultButtonText={shopDetails.state || 'Select State'}
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                />

                {shopDetails.state && citiesList.length > 0 && (
                  <SelectDropdown
                    data={citiesList}
                    onSelect={(selectedItem) => {
                      setShopDetails({ ...shopDetails, city: selectedItem });
                    }}
                    buttonTextAfterSelection={(selectedItem) => selectedItem || 'Select City'}
                    rowTextForSelection={(item) => item}
                    defaultButtonText={shopDetails.city || 'Select City'}
                    buttonStyle={styles.dropdownButton}
                    buttonTextStyle={styles.dropdownButtonText}
                  />
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Pincode"
                  placeholderTextColor={jewelleryColors.textSecondary}
                  keyboardType="numeric"
                  value={shopDetails.pincode}
                  onChangeText={(text) =>
                    setShopDetails({ ...shopDetails, pincode: text })
                  }
                />
              </View>

              {/* Gallery Images */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gallery Images</Text>
                <View style={styles.imageContainer}>
                  {allGalleryImages.map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeGalleryImage(index, image.isExisting)}
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
                      <Text style={styles.addImageText}>Add Image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateShop}
                disabled={loadingInBtn}
              >
                {loadingInBtn ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Update Shop</Text>
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

