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
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { IconButton, Provider } from "react-native-paper";
import { addProductAPI } from "./B2CAPI";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";

import {
  FormButton,
  FormSection,
  MainContainer,
  Row,
  LoginInputField,
  LoginInputAreaField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import { SafeArea } from "../../components/utility/safe-area.component";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { en, registerTranslation } from "react-native-paper-dates";
import { statesData } from "../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEAPIURL } from "../../infrastructure/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "base-64";
import Theme from "../../styles/theme";
import { useIsFocused } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useRealEstateSubscription } from "../../hooks/useRealEstateSubscription";
import RealEstateSubscriptionModal from "../../components/modals/RealEstateSubscriptionModal";
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

export default function AddProduct({ navigation, route }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const { loadingInBtn } = useSelector((state) => state.user);
  const { fetchProducts, category: routeCategory } = route.params;
  const isFocused = useIsFocused();
  const { t } = useTranslation();

  const [selectedImages, setSelectedImages] = React.useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

  const { subscriptionStatus } = useRealEstateSubscription();

  // Auto-set category if passed from route
  React.useEffect(() => {
    if (routeCategory) {
      setRegisterDetails(prev => ({
        ...prev,
        productCategory: routeCategory
      }));
    }
  }, [routeCategory]);

  const [registerDetails, setRegisterDetails] = React.useState({
    productName: "",
    productPrice: "",
    productOriginalPrice: "",
    productDescription: "",
    productCategory: "",
    productSubCategory: "",
    productCondition: "",
    productAge: "",
    address: "",
    address_link: "",
    phone: "",
    // Real Estate specific fields
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    furnished: "",
    floor: "",
    totalFloors: "",
    // Vehicle specific fields
    mileage: "",
    year: "",
    fuelType: "",
    transmission: "",
    // Food Products specific fields
    expiryDate: "",
    weight: "",
    brand: "",
  });

  console.log(registerDetails, "registerDetails");

  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows images, videos, and documents
      quality: 1,
    });

    if (result.canceled === true) return;

    // Add the selected media to the selectedImages state
    setSelectedImages((prev) => [...prev, result.assets[0]]);
  };
  const removeProfileImage = (index) => {
    let newArray = [...selectedImages];
    newArray.splice(index, 1);
    setSelectedImages(newArray);
  };

  const queryClient = useQueryClient();

  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);

  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));

  const addProduct = () => {
    // Check if user is trying to create a real estate listing without subscription
    if (registerDetails.productCategory === "Real Estate" && !subscriptionStatus.isPremium) {
      setShowSubscriptionModal(true);
      return;
    }

    // Validate required fields
    if (!registerDetails.productName.trim()) {
      Alert.alert(t("error"), t("productNameRequired"));
      return;
    }
    
    if (!registerDetails.productPrice.trim()) {
      Alert.alert(t("error"), t("productPriceRequired"));
      return;
    }
    
    if (!registerDetails.productOriginalPrice.trim()) {
      Alert.alert(t("error"), t("productOriginalPriceRequired"));
      return;
    }
    
    if (!registerDetails.productDescription.trim()) {
      Alert.alert(t("error"), t("productDescriptionRequired"));
      return;
    }
    
    if (!registerDetails.productCategory) {
      Alert.alert(t("error"), t("productCategoryRequired"));
      return;
    }
    
    if (!registerDetails.productSubCategory) {
      Alert.alert(t("error"), t("productSubCategoryRequired"));
      return;
    }
    
    // Condition validation - not required for Food Products
    if (registerDetails.productCategory !== "Food Products" && !registerDetails.productCondition) {
      Alert.alert(t("error"), t("productConditionRequired"));
      return;
    }
    
    // Product Age validation - not required for Food Products
    if (registerDetails.productCategory !== "Food Products" && !registerDetails.productAge.trim()) {
      Alert.alert(t("error"), t("productAgeRequired"));
      return;
    }
    
    // Food Products specific validations
    if (registerDetails.productCategory === "Food Products") {
      if (!registerDetails.expiryDate.trim()) {
        Alert.alert(t("error"), t("expiryDateRequired"));
        return;
      }
      if (!registerDetails.weight.trim()) {
        Alert.alert(t("error"), t("weightRequired"));
        return;
      }
    }
    
    // Vehicle specific validations
    if (registerDetails.productCategory === "Vehicles") {
      if (!registerDetails.mileage.trim()) {
        Alert.alert(t("error"), t("mileageRequired"));
        return;
      }
      if (!registerDetails.year.trim()) {
        Alert.alert(t("error"), t("yearRequired"));
        return;
      }
      if (!registerDetails.fuelType) {
        Alert.alert(t("error"), t("fuelTypeRequired"));
        return;
      }
      if (!registerDetails.transmission) {
        Alert.alert(t("error"), t("transmissionRequired"));
        return;
      }
    }
    
    if (!registerDetails.address.trim()) {
      Alert.alert(t("error"), t("addressRequired"));
      return;
    }
    
    if (!registerDetails.phone.trim()) {
      Alert.alert(t("error"), t("phone_number_required"));
      return;
    }
    
    // Validate phone number format (basic validation)
    if (!registerDetails.phone.match(/^\d{10}$/)) {
      Alert.alert(t("error"), t("valid_phone_number"));
      return;
    }
    
    // Validate address_link if provided (required for Real Estate)
    if (registerDetails.productCategory === "Real Estate" && !registerDetails.address_link.trim()) {
      Alert.alert(t("error"), t("addressLinkRequired"));
      return;
    }
    
    if (registerDetails.address_link.trim()) {
      const addressLink = registerDetails.address_link.trim();
      // More flexible URL validation - allow common variations
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      if (!urlPattern.test(addressLink)) {
        Alert.alert(t("error"), t("invalidAddressLink"));
        return;
      }
    }
    
    // Validate that at least one image is selected
    if (selectedImages.length === 0) {
      Alert.alert(t("error"), t("atLeastOneImageRequired"));
      return;
    }



    addProductAPI({
      registerDetails,
      selectedImages,
      setLoading: (value) => dispatch(setLoadingInBtn(value)),
      fetchProducts,
      navigation,
      t,
      resetForm: () =>
        setRegisterDetails({
          productName: "",
          productPrice: "",
          productCategory: "",
          productSubCategory: "",
          productDescription: "",
          productCondition: "",
          productAge: "",
          productOriginalPrice: "",
          address: "",
          address_link: "",
          phone: "",
          propertyType: "",
          bedrooms: "",
          bathrooms: "",
          area: "",
          furnished: "",
          floor: "",
          totalFloors: "",
          mileage: "",
          year: "",
          fuelType: "",
          transmission: "",
          expiryDate: "",
          weight: "",
          brand: "",
        }),
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
// All available categories
const AllCategoryData = [
  { label: t("furniture"), value: "Furniture" },
  { label: t("electronics"), value: "Electronics" },
  { label: t("vehicles"), value: "Vehicles" },
  { label: t("real_estate"), value: "Real Estate" },
  { label: t("food_products"), value: "Food Products" },
  { label: t("other"), value: "Other" },
];

// All available subcategories
const AllSubCategoryData = [
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
];

// Filter categories and subcategories based on route category
const CategoryData = routeCategory 
  ? AllCategoryData.filter(cat => cat.value === routeCategory)
  : AllCategoryData;

// Filter subcategories based on selected category
const SubCategoryData = registerDetails.productCategory 
  ? AllSubCategoryData.filter(sub => sub.category === registerDetails.productCategory)
  : routeCategory 
    ? AllSubCategoryData.filter(sub => sub.category === routeCategory)
    : AllSubCategoryData;

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
                {t("add_product")}
              </Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
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
              {t("add_product_media")}
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

                      marginRight: 12,
                      alignSelf: "center",
                    }}
                  >
                    <Image
                      key={index}
                      style={styles.profileImg}
                      source={{
                        uri: image.uri,
                      }}
                    />
                    <TouchableOpacity onPress={() => removeProfileImage(index)}>
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

              {selectedImages.length < 6 && (
                <AddProfileBox onPress={_pickDocument}>
                  <Icon name="plus" size={35} color={Theme.themeColor} />
                </AddProfileBox>
              )}
            </Row>
            <FormSection style={{ paddingTop: 0 }}>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("product_name") + "*"}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productName}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, productName: text })
                }
              />
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("product_price") + "*"}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productPrice}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, productPrice: text })
                }
              />
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("product_original_price") + "*"}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productOriginalPrice}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    productOriginalPrice: text,
                  })
                }
              />

              {/* <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={CategoryData}
                defaultButtonText={t('select_category') + '*'}
                value={registerDetails.productCategory}
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    productCategory: selectedItem,
                  });
                }}
              />

              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={SubCategoryData}
 defaultButtonText={t('select_sub_category') + '*'}
                value={registerDetails.productSubCategory}
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    productSubCategory: selectedItem,
                  });
                }}
              />

              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={ConditionData}
                 defaultButtonText={t('select_condition') + '*'}
                value={registerDetails.productCondition}
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    productCondition: selectedItem,
                  });
                }}
              /> */}
              <SelectDropdown
                buttonStyle={{ 
                  width: "100%", 
                  height: 50, 
                  marginTop: 24,
                  backgroundColor: routeCategory ? "#E0E0E0" : "#F0F0F0",
                  opacity: routeCategory ? 0.7 : 1
                }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: routeCategory ? "#666666" : "#9B9B9B",
                  fontSize: 16,
                }}
                data={CategoryData}
                defaultButtonText={routeCategory ? CategoryData[0]?.label : t("select_category") + "*"}
                disabled={!!routeCategory}
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    productCategory: selectedItem.value, // Save English value
                  });
                }}
                buttonTextAfterSelection={(selectedItem) => selectedItem.label} // Show translated label
                rowTextForSelection={(item) => item.label} // Show translated label in dropdown list
              />

              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={SubCategoryData}
                defaultButtonText={t("select_sub_category") + "*"}
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    productSubCategory: selectedItem.value, // Save English value
                  });
                }}
                buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                rowTextForSelection={(item) => item.label}
              />

              {/* Condition field - not relevant for Food Products */}
              {registerDetails.productCategory !== "Food Products" && (
                <SelectDropdown
                  buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                  buttonTextStyle={{
                    textAlign: "left",
                    color: "#9B9B9B",
                    fontSize: 16,
                  }}
                  data={ConditionData}
                  defaultButtonText={t("select_condition") + "*"}
                  onSelect={(selectedItem) => {
                    setRegisterDetails({
                      ...registerDetails,
                      productCondition: selectedItem.value, // Save English value
                    });
                  }}
                  buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                  rowTextForSelection={(item) => item.label}
                />
              )}

              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder={t("product_description") + "*"}
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productDescription}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    productDescription: text,
                  })
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
                    marginTop: 20,
                    paddingTop: 15,
                    borderColor: "#e6e6e6",
                    textTransform: "capitalize",
                  },
                ]}
              />

              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder={t("product_address") + "*"}
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.address}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    address: text,
                  })
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
                    marginTop: 20,
                    paddingTop: 15,
                    borderColor: "#e6e6e6",
                    textTransform: "capitalize",
                  },
                ]}
              />
              {/* Address Link field - optional for most categories */}
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("enter_google_maps_link") + (registerDetails.productCategory === "Real Estate" ? "*" : "")}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.address_link}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, address_link: text })
                }
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              {/* Product Age field - not relevant for Food Products */}
              {registerDetails.productCategory !== "Food Products" && (
                <LoginInputField
                  color
                  selectionColor={Theme.themeColor}
                  activeUnderlineColor={Theme.themeColor}
                  style={styles.input}
                  placeholder={t("product_age_example") + "*"}
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  onChangeText={(text) =>
                    setRegisterDetails({
                      ...registerDetails,
                      productAge: text,
                    })
                  }
                  value={registerDetails.productAge}
                />
              )}

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("phone_number") + "*"}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                maxLength={10}
                value={registerDetails.phone}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    phone: text,
                  })
                }
              />

              {/* Real Estate specific fields */}
              {registerDetails.productCategory === "Real Estate" && (
                <>
                  <SelectDropdown
                    buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                    buttonTextStyle={{
                      textAlign: "left",
                      color: "#9B9B9B",
                      fontSize: 16,
                    }}
                    data={PropertyTypeData}
                    defaultButtonText={t("select_property_type") + "*"}
                    onSelect={(selectedItem) => {
                      setRegisterDetails({
                        ...registerDetails,
                        propertyType: selectedItem.value,
                      });
                    }}
                    buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                    rowTextForSelection={(item) => item.label}
                  />

                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={styles.input}
                    placeholder={t("area_sq_ft") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={registerDetails.area}
                    onChangeText={(text) =>
                      setRegisterDetails({
                        ...registerDetails,
                        area: text,
                      })
                    }
                  />

                  {registerDetails.productSubCategory !== "Plot" && (
                    <>
                      <LoginInputField
                        selectionColor={Theme.themeColor}
                        activeUnderlineColor={Theme.themeColor}
                        style={styles.input}
                        placeholder={t("bedrooms") + "*"}
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="numeric"
                        value={registerDetails.bedrooms}
                        onChangeText={(text) =>
                          setRegisterDetails({
                            ...registerDetails,
                            bedrooms: text,
                          })
                        }
                      />

                      <LoginInputField
                        selectionColor={Theme.themeColor}
                        activeUnderlineColor={Theme.themeColor}
                        style={styles.input}
                        placeholder={t("bathrooms") + "*"}
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="numeric"
                        value={registerDetails.bathrooms}
                        onChangeText={(text) =>
                          setRegisterDetails({
                            ...registerDetails,
                            bathrooms: text,
                          })
                        }
                      />

                      <SelectDropdown
                        buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                        buttonTextStyle={{
                          textAlign: "left",
                          color: "#9B9B9B",
                          fontSize: 16,
                        }}
                        data={FurnishedData}
                        defaultButtonText={t("select_furnished_status") + "*"}
                        onSelect={(selectedItem) => {
                          setRegisterDetails({
                            ...registerDetails,
                            furnished: selectedItem.value,
                          });
                        }}
                        buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                        rowTextForSelection={(item) => item.label}
                      />
                    </>
                  )}

                  {registerDetails.productSubCategory === "Apartment" && (
                    <>
                      <LoginInputField
                        selectionColor={Theme.themeColor}
                        activeUnderlineColor={Theme.themeColor}
                        style={styles.input}
                        placeholder={t("floor") + "*"}
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        value={registerDetails.floor}
                        onChangeText={(text) =>
                          setRegisterDetails({
                            ...registerDetails,
                            floor: text,
                          })
                        }
                      />

                      <LoginInputField
                        selectionColor={Theme.themeColor}
                        activeUnderlineColor={Theme.themeColor}
                        style={styles.input}
                        placeholder={t("total_floors") + "*"}
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="numeric"
                        value={registerDetails.totalFloors}
                        onChangeText={(text) =>
                          setRegisterDetails({
                            ...registerDetails,
                            totalFloors: text,
                          })
                        }
                      />
                    </>
                  )}
                </>
              )}

              {/* Vehicle specific fields */}
              {registerDetails.productCategory === "Vehicles" && (
                <>
                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={styles.input}
                    placeholder={t("mileage_km") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    keyboardType="numeric"
                    value={registerDetails.mileage}
                    onChangeText={(text) =>
                      setRegisterDetails({
                        ...registerDetails,
                        mileage: text,
                      })
                    }
                  />

                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={styles.input}
                    placeholder={t("year") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    keyboardType="numeric"
                    value={registerDetails.year}
                    onChangeText={(text) =>
                      setRegisterDetails({
                        ...registerDetails,
                        year: text,
                      })
                    }
                  />

                  <SelectDropdown
                    buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                    buttonTextStyle={{
                      textAlign: "left",
                      color: "#9B9B9B",
                      fontSize: 16,
                    }}
                    data={FuelTypeData}
                    defaultButtonText={t("select_fuel_type") + "*"}
                    onSelect={(selectedItem) => {
                      setRegisterDetails({
                        ...registerDetails,
                        fuelType: selectedItem.value,
                      });
                    }}
                    buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                    rowTextForSelection={(item) => item.label}
                  />

                  <SelectDropdown
                    buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                    buttonTextStyle={{
                      textAlign: "left",
                      color: "#9B9B9B",
                      fontSize: 16,
                    }}
                    data={TransmissionData}
                    defaultButtonText={t("select_transmission") + "*"}
                    onSelect={(selectedItem) => {
                      setRegisterDetails({
                        ...registerDetails,
                        transmission: selectedItem.value,
                      });
                    }}
                    buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                    rowTextForSelection={(item) => item.label}
                  />
                </>
              )}

              {/* Food Products specific fields */}
              {registerDetails.productCategory === "Food Products" && (
                <>
                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={styles.input}
                    placeholder={t("expiry_date") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={registerDetails.expiryDate}
                    onChangeText={(text) =>
                      setRegisterDetails({
                        ...registerDetails,
                        expiryDate: text,
                      })
                    }
                  />

                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={styles.input}
                    placeholder={t("weight_quantity") + "*"}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={registerDetails.weight}
                    onChangeText={(text) =>
                      setRegisterDetails({
                        ...registerDetails,
                        weight: text,
                      })
                    }
                  />

                  <LoginInputField
                    selectionColor={Theme.themeColor}
                    activeUnderlineColor={Theme.themeColor}
                    style={styles.input}
                    placeholder={t("brand")}
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={registerDetails.brand}
                    onChangeText={(text) =>
                      setRegisterDetails({
                        ...registerDetails,
                        brand: text,
                      })
                    }
                  />
                </>
              )}

              <FormButton onPress={addProduct}>
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
                    t("submit")
                  )}
                </Text>
              </FormButton>
            </FormSection>
          </MainContainer>
          </ScrollView>
        </KeyboardAvoidingView>
        
        <RealEstateSubscriptionModal
          visible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={() => {
            setShowSubscriptionModal(false);
            // Optionally refresh subscription status
          }}
        />
      </Provider>
    </SafeArea>
  );
}

// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import {
//   Image,
//   StyleSheet,
//   Text,
//   ScrollView,
//   View,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { IconButton, Provider } from "react-native-paper";
// import { addProductAPI } from "./B2CAPI";
// import apiClient from "../../store/apiClient";
// import {
//   FormButton,
//   FormSection,
//   MainContainer,
//   Row,
//   LoginInputField,
//   LoginInputAreaField,
//   AddProfileBox,
// } from "../../styles/prelogin.styles";
// import { SafeArea } from "../../components/utility/safe-area.component";
// import SelectDropdown from "react-native-select-dropdown";
// import { useDispatch } from "react-redux";
// import { ErrorToggle, setLoadingInBtn } from "../../store/user";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { en, registerTranslation } from "react-native-paper-dates";
// import { statesData } from "../../assets/data/statesAndCities";
// import * as ImagePicker from "expo-image-picker";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { RowBetween } from "../../styles/common.styles";
// import FormData from "form-data";
// import { BASEAPIURL } from "../../infrastructure/constants";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { decode } from "base-64";
// import Theme from "../../styles/theme";
// import { useIsFocused } from "@react-navigation/native";
// import * as DocumentPicker from "expo-document-picker";
// import { Ionicons } from "@expo/vector-icons";
// import * as VideoThumbnails from "expo-video-thumbnails";
// const styles = StyleSheet.create({
//   logo: {
//     alignSelf: "center",
//     // marginTop: "10%",
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//   },
//   input: {
//     marginTop: 24,
//     backgroundColor: "#F0F0F0",
//     borderColor: "#E6E6E6",
//     borderRadius: 4,
//   },
//   profileImg: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 12,
//     resizeMode: "cover",
//     marginBottom: 24,
//   },
//   dateView: {
//     marginTop: 24,
//     backgroundColor: "#f0f0f0",
//     borderColor: "#e6e6e6",
//     borderRadius: 4,
//     height: 50,
//     textTransform: "capitalize",
//     width: "100%",
//     // color:"black"
//     fontSize: 18,
//   },
// });

// export default function AddProduct({ navigation, route }) {
//   registerTranslation("en", en);
//   const dispatch = useDispatch();
//   const { loadingInBtn } = useSelector((state) => state.user);
//   const { fetchProducts } = route.params;
//   const isFocused = useIsFocused();

//   const [selectedImages, setSelectedImages] = React.useState([]);


