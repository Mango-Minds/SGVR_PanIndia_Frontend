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
  const { fetchProducts } = route.params;
  const isFocused = useIsFocused();
  const { t } = useTranslation();

  const [selectedImages, setSelectedImages] = React.useState([]);

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
  });

  console.log(registerDetails, "registerDetails");

  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows images, videos, and documents
      allowsEditing: true,
      aspect: [4, 3],
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
    
    if (!registerDetails.productCondition) {
      Alert.alert(t("error"), t("productConditionRequired"));
      return;
    }
    
    if (!registerDetails.productAge.trim()) {
      Alert.alert(t("error"), t("productAgeRequired"));
      return;
    }
    
    if (!registerDetails.address.trim()) {
      Alert.alert(t("error"), t("addressRequired"));
      return;
    }
    
    if (!registerDetails.phone.trim()) {
      Alert.alert(t("error"), "Phone number is required");
      return;
    }
    
    // Validate phone number format (basic validation)
    if (!registerDetails.phone.match(/^\d{10}$/)) {
      Alert.alert(t("error"), "Please enter a valid 10-digit phone number");
      return;
    }
    
    // Validate address_link if provided
    if (registerDetails.address_link.trim() && !registerDetails.address_link.match(/^https?:\/\/.+\..+/)) {
      Alert.alert(t("error"), t("invalidAddressLink"));
      return;
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
const CategoryData = [
  { label: t("furniture"), value: "Furniture" },
  { label: t("electronics"), value: "Electronics" },
  { label: t("vehicles"), value: "Vehicles" },
  { label: t("other"), value: "Other" },
];

const SubCategoryData = [
  { label: t("sofa"), value: "Sofa" },
  { label: t("table"), value: "Table" },
  { label: t("beds"), value: "Beds" },
  { label: t("dining"), value: "Dining" },
  { label: t("wardrobes"), value: "Wardrobes" },
  { label: t("laptop"), value: "Laptop" },
  { label: t("mobile"), value: "Mobile" },
  { label: t("television"), value: "Television" },
  { label: t("washing_machine"), value: "Washing Machine" },
  { label: t("kitchen_appliances"), value: "Kitchen Appliances" },
  { label: t("ac_cooler"), value: "Air Conditioner (A.C.) / Cooler" },
  { label: t("other"), value: "Other" },
];

const ConditionData = [
  { label: t("new"), value: "New" },
  { label: t("like_new"), value: "Like New" },
  { label: t("used"), value: "Used" },
  { label: t("needs_repair"), value: "Needs Repair" },
];


  return (
    <SafeArea>
      <Provider>
        <ScrollView showsVerticalScrollIndicator={false}>
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
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={CategoryData}
                defaultButtonText={t("select_category") + "*"}
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
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("enter_google_maps_link") + "*"}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.address_link}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, address_link: text })
                }
              />

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

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Phone Number*"
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

//   const [registerDetails, setRegisterDetails] = React.useState({
//     productName: "",
//     productPrice: "",
//     productOriginalPrice: "",
//     productDescription: "",
//     productCategory: "",
//     productSubCategory: "",
//     productCondition: "",
//     productAge: "",
//     address: "",
//     address_link: "",
//   });

//   console.log(registerDetails, "registerDetails");

//   const _pickDocument = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows images, videos, and documents
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (result.canceled === true) return;

//     // Add the selected media to the selectedImages state
//     setSelectedImages((prev) => [...prev, result.assets[0]]);
//   };
//   const removeProfileImage = (index) => {
//     let newArray = [...selectedImages];
//     newArray.splice(index, 1);
//     setSelectedImages(newArray);
//   };

//   const query = new useQueryClient();

//   const token = useSelector((state) => state.user.token);
//   const user = useSelector((state) => state.user.user);
//   console.log("user of add product", user);
//   console.log("token of add product", token);
//   const tokenPayload = token.split(".")[1];

//   const decodedPayload = JSON.parse(decode(tokenPayload));

//   const userType = decodedPayload.userType;

//   // const addProduct = async () => {
//   //   try {
//   //     if (!token) {
//   //       console.error("Bearer token not found");
//   //       return;
//   //     }

//   //     const formData = new FormData();
//   //     console.log("Register Details:", registerDetails);

//   //     formData.append("name", registerDetails.productName);
//   //     formData.append("price", parseFloat(registerDetails.productPrice));
//   //     formData.append(
//   //       "originalPrice",
//   //       parseFloat(registerDetails.productOriginalPrice)
//   //     );
//   //     formData.append("category", registerDetails.productCategory);
//   //     formData.append("subcategory", registerDetails.productSubCategory);
//   //     formData.append("description", registerDetails.productDescription);
//   //     formData.append("condition", registerDetails.productCondition);

//   //     formData.append("productAge", registerDetails.productAge);
//   //     formData.append("address", registerDetails.address);
//   //     formData.append("address_link", registerDetails.address_link);

//   //     selectedImages.forEach((media, index) => {
//   //       console.log(`Media ${index}:`, media.uri);

//   //       let mimeType = "";
//   //       let fileName = "";
//   //       let fieldName = "";

//   //       // Determine the MIME type and file name based on the media type
//   //       if (media.uri) {
//   //         if (media.type === "image") {
//   //           mimeType = "image/jpeg";
//   //           fileName = `image_${index}.jpg`;
//   //           fieldName = "images";
//   //         } else if (media.type === "video") {
//   //           mimeType = "video/mp4";
//   //           fileName = `video_${index}.mp4`;
//   //           fieldName = "videos";
//   //         } else if (media.type === "application") {
//   //           mimeType = "application/pdf";
//   //           fileName = `document_${index}.pdf`;
//   //           fieldName = "documents";
//   //         } else {
//   //           console.log(`Unsupported media type: ${media.type}`);
//   //           return;
//   //         }

//   //         // Append to the correct field in formData (images, videos, or documents)
//   //         formData.append(fieldName, {
//   //           uri: media.uri,
//   //           name: fileName,
//   //           type: mimeType,
//   //         });
//   //       }
//   //     });

//   //     console.log("FormData:", formData);

//   //     await dispatch(setLoadingInBtn(true));

//   //     const response = await fetch(`${BASEAPIURL}/listings/create`, {
//   //       method: "POST",
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //         "Content-Type": "multipart/form-data",
//   //       },
//   //       body: formData,
//   //     });

//   //     await dispatch(setLoadingInBtn(false));

//   //     console.log("Response:", response);

//   //     if (!response.ok) {
//   //       throw new Error("Failed to add product");
//   //     }

//   //     const data = await response.json();
//   //     console.log("Added Product Data:", data);
//   //     fetchProducts();

//   //     setRegisterDetails({
//   //       productName: "",
//   //       productPrice: "",
//   //       productCategory: "",
//   //       productSubCategory: "",
//   //       productDescription: "",
//   //       productCondition: "",
//   //       productAge: "",
//   //       productOriginalPrice: "",
//   //       address: "",
//   //       address_link: "",
//   //     });

//   //     // Show success alert
//   //     Alert.alert(
//   //       "Success",
//   //       "Product Created successfully",
//   //       [
//   //         {
//   //           text: "OK",
//   //           onPress: () => {
//   //             navigation.goBack();
//   //           },
//   //         },
//   //       ],
//   //       { cancelable: false }
//   //     );
//   //   } catch (error) {
//   //     console.error("Error adding product:", error);

//   //     Alert.alert(
//   //       "Error",
//   //       "Failed to add product",
//   //       [{ text: "OK", onPress: () => console.log("OK Pressed") }],
//   //       { cancelable: false }
//   //     );
//   //   }
//   // };

//   //correct one
//   // const addProduct = async () => {
//   //   try {
//   //     let token = await AsyncStorage.getItem("token");

//   //     if (!token) {
//   //       console.error("Bearer token not found");
//   //       Alert.alert("Error", "Authentication token missing.");
//   //       return;
//   //     }

//   //     const formData = new FormData();
//   //     console.log("Register Details:", registerDetails);

//   //     formData.append("name", registerDetails.productName);
//   //     formData.append("price", parseFloat(registerDetails.productPrice));
//   //     formData.append("originalPrice", parseFloat(registerDetails.productOriginalPrice));
//   //     formData.append("category", registerDetails.productCategory);
//   //     formData.append("subcategory", registerDetails.productSubCategory);
//   //     formData.append("description", registerDetails.productDescription);
//   //     formData.append("condition", registerDetails.productCondition);
//   //     formData.append("productAge", registerDetails.productAge);
//   //     formData.append("address", registerDetails.address);
//   //     formData.append("address_link", registerDetails.address_link);

//   //     // Append images, videos, or documents
//   //     selectedImages.forEach((media, index) => {
//   //       console.log(`Media ${index}:`, media.uri);

//   //       let mimeType = "";
//   //       let fileName = "";
//   //       let fieldName = "";

//   //       if (media.uri) {
//   //         if (media.type === "image") {
//   //           mimeType = "image/jpeg";
//   //           fileName = `image_${index}.jpg`;
//   //           fieldName = "images";
//   //         } else if (media.type === "video") {
//   //           mimeType = "video/mp4";
//   //           fileName = `video_${index}.mp4`;
//   //           fieldName = "videos";
//   //         } else if (media.type === "application") {
//   //           mimeType = "application/pdf";
//   //           fileName = `document_${index}.pdf`;
//   //           fieldName = "documents";
//   //         } else {
//   //           console.log(`Unsupported media type: ${media.type}`);
//   //           return;
//   //         }

//   //         formData.append(fieldName, { uri: media.uri, name: fileName, type: mimeType });
//   //       }
//   //     });

//   //     console.log("FormData:", formData);
//   //     await dispatch(setLoadingInBtn(true));

//   //     const response = await apiClient.post("/listings/create", formData, {
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //         "Content-Type": "multipart/form-data",
//   //       },
//   //     });

//   //     await dispatch(setLoadingInBtn(false));
//   //     console.log("Response:", response);

//   //     if (!response.data || response.status !== 201) {
//   //       throw new Error("Failed to add product");
//   //     }

//   //     console.log("Added Product Data:", response.data);
//   //     fetchProducts();

//   //     // Reset form fields
//   //     setRegisterDetails({
//   //       productName: "",
//   //       productPrice: "",
//   //       productCategory: "",
//   //       productSubCategory: "",
//   //       productDescription: "",
//   //       productCondition: "",
//   //       productAge: "",
//   //       productOriginalPrice: "",
//   //       address: "",
//   //       address_link: "",
//   //     });

//   //     Alert.alert("Success", "Product Created successfully", [
//   //       { text: "OK", onPress: () => navigation.goBack() },
//   //     ]);
//   //   } catch (error) {
//   //     console.error("Error adding product:", error);

//   //     Alert.alert("Error", "Failed to add product", [{ text: "OK" }]);
//   //     await dispatch(setLoadingInBtn(false));
//   //   }
//   // };

//   const addProduct = () => {
//     addProductAPI({
//       registerDetails,
//       selectedImages,
//       setLoading: (value) => dispatch(setLoadingInBtn(value)),
//       fetchProducts,
//       navigation,
//       resetForm: () =>
//         setRegisterDetails({
//           productName: "",
//           productPrice: "",
//           productCategory: "",
//           productSubCategory: "",
//           productDescription: "",
//           productCondition: "",
//           productAge: "",
//           productOriginalPrice: "",
//           address: "",
//           address_link: "",
//         }),
//     });
//   };

//   const CategoryData = ["Furniture", "Electronics", "Vehicles", "Other"];
//   const ConditionData = ["New", "Like New", "Used", "Needs Repair"];
//   const SubCategoryData = [
//     "Sofa",
//     "Table",
//     "Beds",
//     "Dining",
//     "Wardrobes",
//     "Laptop",
//     "Mobile",
//     "Television",
//     "Washing Machine",
//     "Kitchen Appliances",
//     "Air Conditioner (A.C.) / Cooler",
//     "Other",
//   ];

//   return (
//     <SafeArea>
//       <Provider>
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
//             <View style={{ alignItems: "center", flexDirection: "row" }}>
//               <IconButton
//                 icon="arrow-left"
//                 size={28}
//                 onPress={() => navigation.goBack()}
//               />
//               <Text
//                 style={{
//                   fontSize: 20,
//                   fontWeight: "500",
//                   color: "#000",
//                 }}
//               >
//                 Add Product
//               </Text>
//             </View>
//           </RowBetween>
//           <MainContainer
//             style={{ paddingBottom: 56 }}
//             keyboardDismissMode="on-drag"
//             keyboardShouldPersistTaps="handled"
//             contentInsetAdjustmentBehavior="always"
//           >
//             <Text
//               style={{
//                 fontSize: 16,
//                 marginLeft: 24,
//                 color: "#000000",
//                 fontWeight: "600",
//                 marginTop: 50,
//               }}
//             >
//               Add Product Media
//             </Text>
//             <Row style={{ marginLeft: 24, flexWrap: "wrap" }}>
//               {selectedImages &&
//                 selectedImages.map((image, index) => (
//                   <View
//                     style={{
//                       width: 60,
//                       height: 60,
//                       borderRadius: 30,
//                       backgroundColor: "red",

//                       marginRight: 12,
//                       alignSelf: "center",
//                     }}
//                   >
//                     <Image
//                       key={index}
//                       style={styles.profileImg}
//                       source={{
//                         uri: image.uri,
//                       }}
//                     />
//                     <TouchableOpacity onPress={() => removeProfileImage(index)}>
//                       <View
//                         style={{
//                           position: "absolute",
//                           right: 3,
//                           bottom: 22,
//                         }}
//                       >
//                         <Image
//                           source={require("../../assets/images/general/cross.png")}
//                           style={{ width: 17, height: 17 }}
//                         />
//                       </View>
//                     </TouchableOpacity>
//                   </View>
//                 ))}

//               {selectedImages.length < 6 && (
//                 <AddProfileBox onPress={_pickDocument}>
//                   <Icon name="plus" size={35} color={Theme.themeColor} />
//                 </AddProfileBox>
//               )}
//             </Row>
//             <FormSection style={{ paddingTop: 0 }}>
//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Product Name*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.productName}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, productName: text })
//                 }
//               />
//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Product Price*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.productPrice}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, productPrice: text })
//                 }
//               />
//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Product Original Price*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.productOriginalPrice}
//                 onChangeText={(text) =>
//                   setRegisterDetails({
//                     ...registerDetails,
//                     productOriginalPrice: text,
//                   })
//                 }
//               />

//               <SelectDropdown
//                 buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
//                 buttonTextStyle={{
//                   textAlign: "left",
//                   color: "#9B9B9B",
//                   fontSize: 16,
//                 }}
//                 data={CategoryData}
//                 defaultButtonText="Select Category*"
//                 value={registerDetails.productCategory}
//                 onSelect={(selectedItem) => {
//                   setRegisterDetails({
//                     ...registerDetails,
//                     productCategory: selectedItem,
//                   });
//                 }}
//               />

//               <SelectDropdown
//                 buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
//                 buttonTextStyle={{
//                   textAlign: "left",
//                   color: "#9B9B9B",
//                   fontSize: 16,
//                 }}
//                 data={SubCategoryData}
//                 defaultButtonText="Select Sub Category*"
//                 value={registerDetails.productSubCategory}
//                 onSelect={(selectedItem) => {
//                   setRegisterDetails({
//                     ...registerDetails,
//                     productSubCategory: selectedItem,
//                   });
//                 }}
//               />

//               <SelectDropdown
//                 buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
//                 buttonTextStyle={{
//                   textAlign: "left",
//                   color: "#9B9B9B",
//                   fontSize: 16,
//                 }}
//                 data={ConditionData}
//                 defaultButtonText="Select Condition*"
//                 value={registerDetails.productCondition}
//                 onSelect={(selectedItem) => {
//                   setRegisterDetails({
//                     ...registerDetails,
//                     productCondition: selectedItem,
//                   });
//                 }}
//               />
//               <TextInput
//                 multiline={true}
//                 numberOfLines={4}
//                 selectionColor={Theme.themeColor}
//                 placeholder="Product Description*"
//                 activeUnderlineColor={Theme.themeColor}
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.productDescription}
//                 onChangeText={(text) =>
//                   setRegisterDetails({
//                     ...registerDetails,
//                     productDescription: text,
//                   })
//                 }
//                 style={[
//                   styles.input,
//                   {
//                     padding: 15,
//                     borderRadius: 5,
//                     fontSize: 16,
//                     height: 100,
//                     color: "black",
//                     fontWeight: "400",
//                     backgroundColor: "#F0F0F0",
//                     marginTop: 20,
//                     paddingTop: 15,
//                     borderColor: "#e6e6e6",
//                     textTransform: "capitalize",
//                   },
//                 ]}
//               />

//               <TextInput
//                 multiline={true}
//                 numberOfLines={4}
//                 selectionColor={Theme.themeColor}
//                 placeholder="Product Address*"
//                 activeUnderlineColor={Theme.themeColor}
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.address}
//                 onChangeText={(text) =>
//                   setRegisterDetails({
//                     ...registerDetails,
//                     address: text,
//                   })
//                 }
//                 style={[
//                   styles.input,
//                   {
//                     padding: 15,
//                     borderRadius: 5,
//                     fontSize: 16,
//                     height: 100,
//                     color: "black",
//                     fontWeight: "400",
//                     backgroundColor: "#F0F0F0",
//                     marginTop: 20,
//                     paddingTop: 15,
//                     borderColor: "#e6e6e6",
//                     textTransform: "capitalize",
//                   },
//                 ]}
//               />
//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Enter google maps link"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.address_link}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, address_link: text })
//                 }
//               />

//               <LoginInputField
//                 color
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Product Age (e.g., 1 year, 6 months)*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 onChangeText={(text) =>
//                   setRegisterDetails({
//                     ...registerDetails,
//                     productAge: text,
//                   })
//                 }
//                 value={registerDetails.productAge}
//               />

//               <FormButton onPress={addProduct}>
//                 <Text
//                   style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
//                 >
//                   {loadingInBtn === true ? (
//                     <ActivityIndicator
//                       style={{
//                         display: "flex",
//                         alignSelf: "center",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         flex: 1,
//                       }}
//                       // size={"large"}
//                       color={"white"}
//                     />
//                   ) : (
//                     "Submit"
//                   )}
//                 </Text>
//               </FormButton>
//             </FormSection>
//           </MainContainer>
//         </ScrollView>
//       </Provider>
//     </SafeArea>
//   );
// }
