import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { ActivityIndicator, IconButton, Provider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import {
  FormButton,
  FormSection,
  MainContainer,
  Row,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import { SafeArea } from "../../components/utility/safe-area.component";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";
import { updateListing } from "./B2CAPI";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker";
import { en, registerTranslation } from "react-native-paper-dates";
import { statesData } from "../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import Theme from "../../styles/theme";
import {
  getJewelleryData,
  editJewelleryData,
} from "../../services/jewellery.services";
import { BASEAPIURL } from "../../infrastructure/constants";
import { VideoView, useVideoPlayer } from "expo-video";
import * as DocumentPicker from "expo-document-picker";
const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    // marginTop: "10%",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  input: {
    marginTop: 24,
    backgroundColor: "#F0F0F0",
    borderColor: "#E6E6E6",
    borderRadius: 4,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    resizeMode: "cover",
    marginBottom: 24,
  },
  dateView: {
    marginTop: 24,
    backgroundColor: "#f0f0f0",
    borderColor: "#e6e6e6",
    borderRadius: 4,
    height: 50,
    textTransform: "capitalize",
    width: "100%",
    // color:"black"
    fontSize: 18,
  },
});

export default function EditListing({ route, navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { productId, listing, fetchProduct } = route.params;
  console.log("Listing in edit page: ", listing);

  console.log(productId);

  const token = useSelector((state) => state.user.token);
  const { loadingInBtn } = useSelector((state) => state.user);

  const initialVideos =
    listing && listing.videos ? listing.videos.map((video) => `${video}`) : [];
  const [selectedVideos, setSelectedVideos] = useState(initialVideos);
  const [uploadedVideos, setUploadedVideos] = useState([]);

  const initialImages =
    listing && listing.images ? listing.images.map((image) => `${image}`) : [];

  const [selectedImages, setSelectedImages] = React.useState(initialImages);
  const [uploadedImages, setUploadedImages] = useState([]);

  const _pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "video/*"], // Allows both images and videos
      copyToCacheDirectory: false,
    });

    if (result.canceled) return;

    const { uri, mimeType, name, type } = result.assets[0];
    const fileType = mimeType || type; // Use type as fallback

    console.log("Selected File:", name, "MIME Type:", fileType);

    if (fileType && fileType.startsWith("image")) {
      setUploadedImages((prev) => [...prev, { uri, name, type: fileType }]);
    } else if (fileType && fileType.startsWith("video")) {
      setUploadedVideos((prev) => [...prev, { uri, name, type: fileType }]);
    }
  };

  const removeProfileImage = (index, isUploadedImage, mediaType) => {
    console.log("Uploaded Images after removal: ", uploadedImages);
    console.log("Uploaded Videos after removal: ", uploadedVideos);

    if (mediaType === "image") {
      if (isUploadedImage) {
        setUploadedImages(uploadedImages.filter((_, i) => i !== index));
      } else {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
      }
    } else if (mediaType === "video") {
      if (isUploadedImage) {
        setUploadedVideos(uploadedVideos.filter((_, i) => i !== index));
      } else {
        setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
      }
    }
  };

  const [modifiedDetails, setModifiedDetails] = useState({
    name: listing.name,
    price: listing.price.toString(),
    originalPrice: listing.originalPrice.toString(),
    address: listing.address,
    address_link: listing.address_link,
    description: listing.description,
    category: listing.category,
    subcategory: listing.subcategory,
    condition: listing.condition,
    productAge: listing.productAge,
    // Real Estate specific fields
    propertyType: listing.propertyType || "",
    bedrooms: listing.bedrooms || "",
    bathrooms: listing.bathrooms || "",
    area: listing.area || "",
    furnished: listing.furnished || "",
    floor: listing.floor || "",
    totalFloors: listing.totalFloors || "",
    // Vehicle specific fields
    mileage: listing.mileage || "",
    year: listing.year || "",
    fuelType: listing.fuelType || "",
    transmission: listing.transmission || "",
    // Food Products specific fields
    expiryDate: listing.expiryDate || "",
    weight: listing.weight || "",
    brand: listing.brand || "",
  });
  console.log("modified details", modifiedDetails);

  // const handleUpdate = async () => {
  //   try {
  //     await dispatch(setLoadingInBtn(true));

  //     let token = await AsyncStorage.getItem("token");

  //     if (!token) {
  //       console.error("Bearer token not found");
  //       Alert.alert("Error", "Authentication token is missing.");
  //       await dispatch(setLoadingInBtn(false));
  //       return;
  //     }

  //     console.log("Product ID:", productId);

  //     const formData = new FormData();

  //     // Append modified details
  //     Object.keys(modifiedDetails).forEach((key) => {
  //       if (modifiedDetails[key] !== listing[key]) {
  //         formData.append(key, modifiedDetails[key]);
  //       }
  //     });

  //     // Append existing images
  //     selectedImages.forEach((image, index) => {
  //       formData.append("images", {
  //         uri: image.uri,
  //         name: `selected_image_${index}.jpg`,
  //         type: "image/jpeg",
  //       });
  //     });

  //     // Append newly uploaded images
  //     uploadedImages.forEach((image, index) => {
  //       formData.append("images", {
  //         uri: image.uri,
  //         name: `uploaded_image_${index}.jpg`,
  //         type: "image/jpeg",
  //       });
  //     });

  //     // Append selected videos
  //     selectedVideos.forEach((video, index) => {
  //       formData.append("videos", {
  //         uri: video.uri,
  //         name: `selected_video_${index}.mp4`,
  //         type: "video/mp4",
  //       });
  //     });

  //     // Append newly uploaded videos
  //     uploadedVideos.forEach((video, index) => {
  //       if (!video.uri) {
  //         console.error(`Video at index ${index} has an invalid URI:`, video);
  //         return;
  //       }
  //       formData.append("videos", {
  //         uri: video.uri,
  //         name: video.name || `uploaded_video_${index}.mp4`,
  //         type: video.type || "video/mp4",
  //       });
  //     });

  //     console.log("Final FormData:", formData);

  //     // Use apiClient for better error handling
  //     const response = await apiClient.put(`/listings/edit/${listing._id}`, formData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     await dispatch(setLoadingInBtn(false));

  //     console.log("API Response:", response.data);

  //     Alert.alert("Success", "Listing updated successfully");

  //     fetchProduct();
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Error updating product:", error);
  //     Alert.alert("Error", "Failed to update listing.");
  //     await dispatch(setLoadingInBtn(false));
  //   }
  // };

  const handleUpdate = () => {
    updateListing({
      listing,
      modifiedDetails,
      selectedImages,
      uploadedImages,
      selectedVideos,
      uploadedVideos,
      productId,
      fetchProduct,
      navigation,
      dispatch,
      t,
    });
  };

  // const CategoryData = ["Furniture", "Electronics", "Vehicles", "Other"];
  // const ConditionData = ["New", "Like New", "Used", "Needs Repair"];
  // const SubCategoryData = [
  //   "Sofa",
  //   "Table",
  //   "Beds",
  //   "Dining",
  //   "Wardrobes",
  //   "Laptop",
  //   "Mobile",
  //   "Television",
  //   "Washing Machine",
  //   "Kitchen Appliances",
  //   "Air Conditioner (A.C.) / Cooler",
  //   "Other",
  // ];
  const CategoryData = [
    { label: t("furniture"), value: "Furniture" },
    { label: t("electronics"), value: "Electronics" },
    { label: t("vehicles"), value: "Vehicles" },
    { label: t("real_estate"), value: "Real Estate" },
    { label: t("food_products"), value: "Food Products" },
    { label: t("other"), value: "Other" },
  ];

  // Filter subcategories based on selected category
  const SubCategoryData = [
    // Furniture subcategories
    { label: t("sofa"), value: "Sofa", category: "Furniture" },
    { label: t("table"), value: "Table", category: "Furniture" },
    { label: t("beds"), value: "Beds", category: "Furniture" },
    { label: t("dining"), value: "Dining", category: "Furniture" },
    { label: t("wardrobes"), value: "Wardrobes", category: "Furniture" },
    
    // Electronics subcategories
    { label: t("laptop"), value: "Laptop", category: "Electronics" },
    { label: t("mobile"), value: "Mobile", category: "Electronics" },
    { label: t("television"), value: "Television", category: "Electronics" },
    { label: t("washing_machine"), value: "Washing Machine", category: "Electronics" },
    { label: t("kitchen_appliances"), value: "Kitchen Appliances", category: "Electronics" },
    { label: t("ac_cooler"), value: "Air Conditioner (A.C.) / Cooler", category: "Electronics" },
    
    // Real Estate subcategories
    { label: t("apartment"), value: "Apartment", category: "Real Estate" },
    { label: t("house"), value: "House", category: "Real Estate" },
    { label: t("villa"), value: "Villa", category: "Real Estate" },
    { label: t("plot"), value: "Plot", category: "Real Estate" },
    { label: t("commercial_property"), value: "Commercial Property", category: "Real Estate" },
    
    // Vehicle subcategories
    { label: t("car"), value: "Car", category: "Vehicles" },
    { label: t("bike"), value: "Bike", category: "Vehicles" },
    { label: t("scooter"), value: "Scooter", category: "Vehicles" },
    { label: t("truck"), value: "Truck", category: "Vehicles" },
    { label: t("bus"), value: "Bus", category: "Vehicles" },
    
    // Food Products subcategories
    { label: t("snacks"), value: "Snacks", category: "Food Products" },
    { label: t("beverages"), value: "Beverages", category: "Food Products" },
    { label: t("spices"), value: "Spices", category: "Food Products" },
    { label: t("grains"), value: "Grains", category: "Food Products" },
    { label: t("dairy_products"), value: "Dairy Products", category: "Food Products" },
    
    // Other subcategories
    { label: t("other"), value: "Other", category: "Other" },
  ].filter(sub => sub.category === modifiedDetails.category);

  const ConditionData = [
    { label: t("new"), value: "New" },
    { label: t("like_new"), value: "Like New" },
    { label: t("used"), value: "Used" },
    { label: t("needs_repair"), value: "Needs Repair" },
  ];

  // Real Estate specific data
  const PropertyTypeData = [
    { label: t("residential"), value: "Residential" },
    { label: t("commercial"), value: "Commercial" },
    { label: t("industrial"), value: "Industrial" },
    { label: t("agricultural"), value: "Agricultural" },
  ];

  const FurnishedData = [
    { label: t("furnished"), value: "Furnished" },
    { label: t("semi_furnished"), value: "Semi-Furnished" },
    { label: t("unfurnished"), value: "Unfurnished" },
  ];

  // Vehicle specific data
  const FuelTypeData = [
    { label: t("petrol"), value: "Petrol" },
    { label: t("diesel"), value: "Diesel" },
    { label: t("electric"), value: "Electric" },
    { label: t("hybrid"), value: "Hybrid" },
    { label: t("cng"), value: "CNG" },
  ];

  const TransmissionData = [
    { label: t("manual"), value: "Manual" },
    { label: t("automatic"), value: "Automatic" },
    { label: t("semi_automatic"), value: "Semi-Automatic" },
  ];

  return (
    <SafeArea>
      <Provider>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
          <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <IconButton
                icon="arrow-left"
                size={28}
                onPress={() => navigation.goBack()}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "#000",
                }}
              >
                {t("edit_product")}
              </Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
          >
            <Text
              style={{
                fontSize: 16,
                marginLeft: 24,
                color: "#000000",
                fontWeight: "600",
                marginTop: 50,
              }}
            >
              Edit Product Media
            </Text>

            <Row style={{ marginLeft: 24, flexWrap: "wrap" }}>
              {selectedImages &&
                selectedImages.map((image, index) => (
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "red",
                      // marginTop: "10%",
                      marginRight: 12,
                      alignSelf: "center",
                    }}
                  >
                    <Image
                      key={index}
                      style={styles.profileImg}
                      source={{
                        uri: image,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => removeProfileImage(index, false, "image")}
                    >
                      <View
                        style={{
                          position: "absolute",
                          right: 3,
                          bottom: 22,
                        }}
                      >
                        <Image
                          source={require("../../assets/images/general/cross.png")}
                          style={{ width: 17, height: 17 }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}

              {uploadedImages.map((image, index) => (
                <View
                  key={`uploaded-${index}`}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "red",
                    // marginTop: "10%",
                    marginRight: 12,
                    alignSelf: "center",
                  }}
                >
                  <Image
                    style={styles.profileImg}
                    source={{ uri: image.uri }}
                  />
                  <TouchableOpacity
                    onPress={() => removeProfileImage(index, true, "image")}
                  >
                    <View
                      style={{
                        position: "absolute",
                        right: 3,
                        bottom: 22,
                      }}
                    >
                      <Image
                        source={require("../../assets/images/general/cross.png")}
                        style={{ width: 17, height: 17 }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}

              {selectedVideos &&
                selectedVideos.map((video, index) => (
                  <View
                    key={`selected-video-${index}`}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "red",
                      marginRight: 12,
                      alignSelf: "center",
                    }}
                  >
                    {/* <Video
                      source={{ uri: video.uri }}
                      style={styles.profileImg}
                      resizeMode="cover"
                      shouldPlay={false}
                    /> */}
                    <Image
                      style={styles.profileImg}
                      source={{ uri: video.uri }}
                    />
                    <TouchableOpacity
                      onPress={() => removeProfileImage(index, false, "video")}
                    >
                      <View
                        style={{ position: "absolute", right: 3, bottom: 22 }}
                      >
                        <Image
                          source={require("../../assets/images/general/cross.png")}
                          style={{ width: 17, height: 17 }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}

              {uploadedVideos.map((video, index) => (
                <View
                  key={`uploaded-${index}`}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "red",
                    // marginTop: "10%",
                    marginRight: 12,
                    alignSelf: "center",
                  }}
                >
                  <Image
                    style={styles.profileImg}
                    source={{ uri: video.uri }}
                  />
                  <TouchableOpacity
                    onPress={() => removeProfileImage(index, true, "video")}
                  >
                    <View
                      style={{
                        position: "absolute",
                        right: 3,
                        bottom: 22,
                      }}
                    >
                      <Image
                        source={require("../../assets/images/general/cross.png")}
                        style={{ width: 17, height: 17 }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              {(selectedImages.length + uploadedImages.length < 5 ||
                selectedVideos.length + uploadedVideos.length < 2) && (
                <AddProfileBox onPress={_pickDocument}>
                  <Icon name="plus" size={35} color={Theme.themeColor} />
                </AddProfileBox>
              )}
            </Row>

            <FormSection style={{ paddingTop: 0 }}>
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  // marginTop: 50,
                }}
              >
                {t("product_name")}
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder={t("product_name") + "*"}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.name}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, name: text })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                {t("product_description")}
              </Text>
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder={t("product_description") + "*"}
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.description}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, description: text })
                }
                style={[
                  styles.input,
                  {
                    padding: 15,
                    borderRadius: 5,
                    fontSize: 16,
                    height: 100,
                    color: "black",
                    fontWeight: "400",
                    backgroundColor: "#F0F0F0",
                    marginTop: 5,
                    paddingTop: 15,
                    borderColor: "#e6e6e6",
                    textTransform: "capitalize",
                  },
                ]}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                {t("product_address")}
              </Text>
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder={t("product_address") + "*"}
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.address}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, address: text })
                }
                style={[
                  styles.input,
                  {
                    padding: 15,
                    borderRadius: 5,
                    fontSize: 16,
                    height: 100,
                    color: "black",
                    fontWeight: "400",
                    backgroundColor: "#F0F0F0",
                    marginTop: 5,
                    paddingTop: 15,
                    borderColor: "#e6e6e6",
                    textTransform: "capitalize",
                  },
                ]}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                {t("enter_google_maps_link")}
              </Text>
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder={t("enter_google_maps_link") + "*"}
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.address_link}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, address_link: text })
                }
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[
                  styles.input,
                  {
                    padding: 15,
                    borderRadius: 5,
                    fontSize: 16,
                    height: 100,
                    color: "black",
                    fontWeight: "400",
                    backgroundColor: "#F0F0F0",
                    marginTop: 5,
                    paddingTop: 15,
                    borderColor: "#e6e6e6",
                  },
                ]}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                {t("product_price")}
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder={t("product_price") + "*"}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={modifiedDetails.price}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, price: text })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                {t("product_original_price")}
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder={t("product_original_price") + "*"}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={modifiedDetails.originalPrice}
                onChangeText={(text) =>
                  setModifiedDetails({
                    ...modifiedDetails,
                    originalPrice: text,
                  })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                {t("product_condition")}
              </Text>

              {/* <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={ConditionData}
                defaultButtonText="Select Condition"
                defaultValue={modifiedDetails.condition}
                onSelect={(selectedItem) => {
                  setModifiedDetails({
                    ...modifiedDetails,
                    condition: selectedItem,
                  });
                }}
              /> */}
              {/* Condition field - not relevant for Food Products */}
              {modifiedDetails.category !== "Food Products" && (
                <SelectDropdown
                  data={ConditionData}
                  defaultButtonText={t("select_condition")}
                  defaultValue={ConditionData.find(
                    (item) => item.value === modifiedDetails.condition
                  )}
                  onSelect={(selectedItem) =>
                    setModifiedDetails({
                      ...modifiedDetails,
                      condition: selectedItem.value,
                    })
                  }
                  buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                  buttonTextStyle={{
                    textAlign: "left",
                    color: "#9B9B9B",
                    fontSize: 16,
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                  rowTextForSelection={(item) => item.label}
                />
              )}

              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                {t("product_category")}
              </Text>

              {/* <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={CategoryData}
                defaultButtonText="Select Category"
                defaultValue={modifiedDetails.category}
                onSelect={(selectedItem) => {
                  setModifiedDetails({
                    ...modifiedDetails,
                    category: selectedItem,
                  });
                }}
              /> */}
              <SelectDropdown
                data={CategoryData}
                defaultButtonText={t("select_category")}
                defaultValue={CategoryData.find(
                  (item) => item.value === modifiedDetails.category
                )}
                onSelect={(selectedItem) =>
                  setModifiedDetails({
                    ...modifiedDetails,
                    category: selectedItem.value,
                  })
                }
                buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                rowTextForSelection={(item) => item.label}
              />

              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                {t("product_sub_category")}
              </Text>

              {/* <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={SubCategoryData}
                defaultButtonText="Select Type"
                defaultValue={modifiedDetails.subcategory}
                onSelect={(selectedItem) => {
                  setModifiedDetails({
                    ...modifiedDetails,
                    subcategory: selectedItem,
                  });
                }}
              /> */}
              <SelectDropdown
                data={SubCategoryData}
                defaultButtonText={t("select_subcategory")}
                defaultValue={SubCategoryData.find(
                  (item) => item.value === modifiedDetails.subcategory
                )}
                onSelect={(selectedItem) =>
                  setModifiedDetails({
                    ...modifiedDetails,
                    subcategory: selectedItem.value,
                  })
                }
                buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                rowTextForSelection={(item) => item.label}
              />

              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
              {t("product_age")}
              </Text>

              {/* Product Age field - not relevant for Food Products */}
              {modifiedDetails.category !== "Food Products" && (
                <LoginInputField
                  color
                  selectionColor={Theme.themeColor}
                  activeUnderlineColor={Theme.themeColor}
                  style={[styles.input, { marginTop: 5 }]}
                  placeholder="Product Age*"
                  underlineColor="transparent"
                  // keyboardType="numeric"
                  placeholderTextColor="#9B9B9B"
                  value={modifiedDetails.productAge}
                  onChangeText={(text) =>
                    setModifiedDetails({ ...modifiedDetails, productAge: text })
                  }
                />
              )}

              {/* Real Estate specific fields */}
              {modifiedDetails.category === "Real Estate" && (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    {t("property_type")}
                  </Text>
                  <SelectDropdown
                    data={PropertyTypeData}
                    defaultButtonText={t("select_property_type")}
                    defaultValue={PropertyTypeData.find(
                      (item) => item.value === modifiedDetails.propertyType
                    )}
                    onSelect={(selectedItem) =>
                      setModifiedDetails({
                        ...modifiedDetails,
                        propertyType: selectedItem.value,
                      })
                    }
                    buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                    buttonTextStyle={{
                      textAlign: "left",
                      color: "#9B9B9B",
                      fontSize: 16,
                    }}
                    buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                    rowTextForSelection={(item) => item.label}
                  />

                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    {t("area_sq_ft")}
                  </Text>
                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={[styles.input, { marginTop: 5 }]}
                    placeholder={t("area_sq_ft") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={modifiedDetails.area}
                    onChangeText={(text) =>
                      setModifiedDetails({ ...modifiedDetails, area: text })
                    }
                  />

                  {modifiedDetails.subcategory !== "Plot" && (
                    <>
                      <Text
                        style={{
                          fontSize: 16,
                          marginLeft: 4,
                          color: "grey",
                          fontWeight: "600",
                          marginTop: 20,
                        }}
                      >
                        {t("bedrooms")}
                      </Text>
                      <LoginInputField
                        selectionColor={Theme.themeColor}
                        activeUnderlineColor={Theme.themeColor}
                        style={[styles.input, { marginTop: 5 }]}
                        placeholder={t("bedrooms") + "*"}
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="numeric"
                        value={modifiedDetails.bedrooms}
                        onChangeText={(text) =>
                          setModifiedDetails({ ...modifiedDetails, bedrooms: text })
                        }
                      />

                      <Text
                        style={{
                          fontSize: 16,
                          marginLeft: 4,
                          color: "grey",
                          fontWeight: "600",
                          marginTop: 20,
                        }}
                      >
                        {t("bathrooms")}
                      </Text>
                      <LoginInputField
                        selectionColor={Theme.themeColor}
                        activeUnderlineColor={Theme.themeColor}
                        style={[styles.input, { marginTop: 5 }]}
                        placeholder={t("bathrooms") + "*"}
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="numeric"
                        value={modifiedDetails.bathrooms}
                        onChangeText={(text) =>
                          setModifiedDetails({ ...modifiedDetails, bathrooms: text })
                        }
                      />

                      <Text
                        style={{
                          fontSize: 16,
                          marginLeft: 4,
                          color: "grey",
                          fontWeight: "600",
                          marginTop: 20,
                        }}
                      >
                        {t("furnished_status")}
                      </Text>
                      <SelectDropdown
                        data={FurnishedData}
                        defaultButtonText={t("select_furnished_status")}
                        defaultValue={FurnishedData.find(
                          (item) => item.value === modifiedDetails.furnished
                        )}
                        onSelect={(selectedItem) =>
                          setModifiedDetails({
                            ...modifiedDetails,
                            furnished: selectedItem.value,
                          })
                        }
                        buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                        buttonTextStyle={{
                          textAlign: "left",
                          color: "#9B9B9B",
                          fontSize: 16,
                        }}
                        buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                        rowTextForSelection={(item) => item.label}
                      />
                    </>
                  )}

                  {modifiedDetails.subcategory === "Apartment" && (
                    <>
                      <Text
                        style={{
                          fontSize: 16,
                          marginLeft: 4,
                          color: "grey",
                          fontWeight: "600",
                          marginTop: 20,
                        }}
                      >
                        {t("floor")}
                      </Text>
                      <LoginInputField
                        selectionColor={Theme.themeColor}
                        activeUnderlineColor={Theme.themeColor}
                        style={[styles.input, { marginTop: 5 }]}
                        placeholder={t("floor") + "*"}
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        value={modifiedDetails.floor}
                        onChangeText={(text) =>
                          setModifiedDetails({ ...modifiedDetails, floor: text })
                        }
                      />

                      <Text
                        style={{
                          fontSize: 16,
                          marginLeft: 4,
                          color: "grey",
                          fontWeight: "600",
                          marginTop: 20,
                        }}
                      >
                        {t("total_floors")}
                      </Text>
                      <LoginInputField
                        selectionColor={Theme.themeColor}
                        activeUnderlineColor={Theme.themeColor}
                        style={[styles.input, { marginTop: 5 }]}
                        placeholder={t("total_floors") + "*"}
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="numeric"
                        value={modifiedDetails.totalFloors}
                        onChangeText={(text) =>
                          setModifiedDetails({ ...modifiedDetails, totalFloors: text })
                        }
                      />
                    </>
                  )}
                </>
              )}

              {/* Vehicle specific fields */}
              {modifiedDetails.category === "Vehicles" && (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    {t("mileage_km")}
                  </Text>
                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={[styles.input, { marginTop: 5 }]}
                    placeholder={t("mileage_km") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    keyboardType="numeric"
                    value={modifiedDetails.mileage}
                    onChangeText={(text) =>
                      setModifiedDetails({ ...modifiedDetails, mileage: text })
                    }
                  />

                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    {t("year")}
                  </Text>
                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={[styles.input, { marginTop: 5 }]}
                    placeholder={t("year") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    keyboardType="numeric"
                    value={modifiedDetails.year}
                    onChangeText={(text) =>
                      setModifiedDetails({ ...modifiedDetails, year: text })
                    }
                  />

                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    {t("fuel_type")}
                  </Text>
                  <SelectDropdown
                    data={FuelTypeData}
                    defaultButtonText={t("select_fuel_type")}
                    defaultValue={FuelTypeData.find(
                      (item) => item.value === modifiedDetails.fuelType
                    )}
                    onSelect={(selectedItem) =>
                      setModifiedDetails({
                        ...modifiedDetails,
                        fuelType: selectedItem.value,
                      })
                    }
                    buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                    buttonTextStyle={{
                      textAlign: "left",
                      color: "#9B9B9B",
                      fontSize: 16,
                    }}
                    buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                    rowTextForSelection={(item) => item.label}
                  />

                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    {t("transmission")}
                  </Text>
                  <SelectDropdown
                    data={TransmissionData}
                    defaultButtonText={t("select_transmission")}
                    defaultValue={TransmissionData.find(
                      (item) => item.value === modifiedDetails.transmission
                    )}
                    onSelect={(selectedItem) =>
                      setModifiedDetails({
                        ...modifiedDetails,
                        transmission: selectedItem.value,
                      })
                    }
                    buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                    buttonTextStyle={{
                      textAlign: "left",
                      color: "#9B9B9B",
                      fontSize: 16,
                    }}
                    buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                    rowTextForSelection={(item) => item.label}
                  />
                </>
              )}

              {/* Food Products specific fields */}
              {modifiedDetails.category === "Food Products" && (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    {t("expiry_date")}
                  </Text>
                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={[styles.input, { marginTop: 5 }]}
                    placeholder={t("expiry_date") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={modifiedDetails.expiryDate}
                    onChangeText={(text) =>
                      setModifiedDetails({ ...modifiedDetails, expiryDate: text })
                    }
                  />

                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    {t("weight_quantity")}
                  </Text>
                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={[styles.input, { marginTop: 5 }]}
                    placeholder={t("weight_quantity") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={modifiedDetails.weight}
                    onChangeText={(text) =>
                      setModifiedDetails({ ...modifiedDetails, weight: text })
                    }
                  />

                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                      marginTop: 20,
                    }}
                  >
                    {t("brand")}
                  </Text>
                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={[styles.input, { marginTop: 5 }]}
                    placeholder={t("brand")}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={modifiedDetails.brand}
                    onChangeText={(text) =>
                      setModifiedDetails({ ...modifiedDetails, brand: text })
                    }
                  />
                </>
              )}

              <FormButton onPress={() => handleUpdate(productId)}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  {loadingInBtn === true ? (
                    <ActivityIndicator
                      style={{
                        display: "flex",
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                      }}
                      // size={"large"}
                      color={"white"}
                    />
                  ) : (
                    "Submit"
                  )}
                </Text>
              </FormButton>
            </FormSection>
          </MainContainer>
          </ScrollView>
        </KeyboardAvoidingView>
      </Provider>
    </SafeArea>
  );
}
