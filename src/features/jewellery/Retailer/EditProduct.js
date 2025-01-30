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
} from "react-native";
import { ActivityIndicator, IconButton, Provider } from "react-native-paper";
import {
  FormButton,
  FormSection,
  MainContainer,
  Row,
  LoginInputField,
  AddProfileBox,
} from "../../../styles/prelogin.styles";
import { SafeArea } from "../../../components/utility/safe-area.component";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";
import { ErrorToggle , setLoadingInBtn} from "../../../store/user";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker";
import { en, registerTranslation } from "react-native-paper-dates";
import { statesData } from "../../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../../styles/common.styles";
import FormData from "form-data";
import { BASEIMGURL } from "../../../infrastructure/constants";

import {
  getJewelleryData,
  editJewelleryData,
} from "../../../services/jewellery.services";
import { BASEAPIURL } from "../../../infrastructure/constants";

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

export default function EditRetailProduct({ route, navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();

  const { productId, product, fetchProduct } = route.params;
  const token = useSelector((state) => state.user.token);
  const initialImages =
    product && product.images
      ? product.images.map((image) => `${BASEIMGURL}${image}`)
      : [];

  const [selectedImages, setSelectedImages] = React.useState(initialImages);
  const [uploadedImages, setUploadedImages] = useState([]);
  const { loadingInBtn } = useSelector((state) => state.user);
  

  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) return;

    setUploadedImages((prev) => [...prev, result.assets[0]]);
  };

  const removeProfileImage = (index, isUploadedImage) => {
    if (isUploadedImage) {
      setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    } else {
      setSelectedImages(selectedImages.filter((_, i) => i !== index));
    }
  };
  const [modifiedDetails, setModifiedDetails] = useState({
    name: product.name,
    price: product.price.toString(),
    description: product.description,
    quantity: product.quantity.toString(),
    quality: product.quality,
    weightPerProduct: product.weightPerProduct.toString(),
    goldAvailable: product.goldAvailable.toString(),
    category: product.category,
    productCategory: product.productCategory,
    condition: product.condition,
  });
  console.log('modified details', modifiedDetails)

  const handleUpdate = async () => {
    await dispatch(setLoadingInBtn(true));

    try {
      const formData = new FormData();

      // Append modified details
      Object.keys(modifiedDetails).forEach((key) => {
        if (modifiedDetails[key] !== product[key]) {
          formData.append(key, modifiedDetails[key]);
        }
      });

      // Append existing images without base URL
      selectedImages.forEach((image, index) => {
        if (image.startsWith(BASEIMGURL)) {
          formData.append("images", image.replace(BASEIMGURL, ""));
        }
      });

      // Append newly uploaded images
      uploadedImages.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        });
      });
      console.log("formdata--", formData)

      const response = await fetch(
        `${BASEAPIURL}/jewelry-products/${product._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      await dispatch(setLoadingInBtn(false));

      console.log('response--', response)

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      alert("Product updated successfully");
      fetchProduct();
      navigation.goBack();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const CategoryData = ["gold", "silver", "diamond"];
  const ConditionData = ["old", "new"];
  const TypeData = ["ring", "necklace", "earings"];

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
                Edit Product
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
              Add More Product Image
            </Text>
            <Row style={{ marginLeft: 24, flexWrap: "wrap" }}>
              {selectedImages.map((image, index) => (
                <View
                  key={`selected-${index}`}
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
                  <Image style={styles.profileImg} source={{ uri: image }} />
                  <TouchableOpacity
                    onPress={() => removeProfileImage(index, false)}
                  >
                    <View
                      style={{
                        position: "absolute",
                        right: 3,
                        bottom: 22,
                      }}
                    >
                      <Image
                        source={require("../../../assets/images/general/cross.png")}
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
                    onPress={() => removeProfileImage(index, true)}
                  >
                    <View
                      style={{
                        position: "absolute",
                        right: 3,
                        bottom: 22,
                      }}
                    >
                      <Image
                        source={require("../../../assets/images/general/cross.png")}
                        style={{ width: 17, height: 17 }}

                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              {selectedImages.length + uploadedImages.length < 6 && (
                <AddProfileBox onPress={_pickDocument}>
                  <Icon name="plus" size={35} color="#d4af37" />
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
                Product Name
              </Text>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Product Name*"
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
                Product Description
              </Text>
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor="#d4af37"
                placeholder="Product Description*"
                activeUnderlineColor="#d4af37"
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
                Price
              </Text>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Price*"
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
                Product Condition
              </Text>

              <SelectDropdown
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
                Product Category
              </Text>

              <SelectDropdown
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
                Product Type
              </Text>

              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={TypeData}
                defaultButtonText="Select Type"
                defaultValue={modifiedDetails.productCategory}
                onSelect={(selectedItem) => {
                  setModifiedDetails({
                    ...modifiedDetails,
                    productCategory: selectedItem,
                  });
                }}
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
                No. of Pieces
              </Text>

              <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Product Quantity*"
                underlineColor="transparent"
                keyboardType="numeric"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.quantity}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, quantity: text })
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
                Quality
              </Text>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Product Quality*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.quality}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, quality: text })
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
                Gold Available
              </Text>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Gold Available*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={modifiedDetails.goldAvailable}
                onChangeText={(text) =>
                  setModifiedDetails({
                    ...modifiedDetails,
                    goldAvailable: text,
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
                Weight (In Grams)
              </Text>

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Weight (Each Product)*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={modifiedDetails.weightPerProduct}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, quality: text })
                }
              />

              <FormButton onPress={handleUpdate}>
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
