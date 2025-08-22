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

    if (fileType?.startsWith("image")) {
      setUploadedImages((prev) => [...prev, { uri, name, type: fileType }]);
    } else if (fileType?.startsWith("video")) {
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
      </Provider>
    </SafeArea>
  );
}
