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
import Theme from "../../styles/theme";
import { IconButton, Provider,ActivityIndicator } from "react-native-paper";
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
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { en, registerTranslation } from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import {
  getJewelleryData,
  editJewelleryData,
} from "../../services/jewellery.services";

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

export default function EditShopProduct({ route, navigation }) {
  const { loadingInBtn } = useSelector((state) => state.user);
  registerTranslation("en", en);
  const { productId, product, fetchProduct } = route.params;
  console.log("product to edit", product);
  const token = useSelector((state) => state.user.token);
  console.log(token);
  const dispatch = useDispatch();

  const initialImages =
    product && product.pictures
      ? product.pictures.map((image) => `${BASEIMGURL}${image}`)
      : [];

  const [selectedImages, setSelectedImages] = React.useState(initialImages);
  const [uploadedImages, setUploadedImages] = useState([]);

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
  });

  const handleUpdate = async () => {
    await dispatch(setLoadingInBtn(true));
    try {
      const formData = new FormData();

      formData.append("name", modifiedDetails.name);
      formData.append("price", modifiedDetails.price);
      formData.append("description", modifiedDetails.description);
      formData.append("quantity", modifiedDetails.quantity);

      // Append existing images without base URL
      selectedImages.forEach((image) => {
        if (image.startsWith(BASEIMGURL)) {
          formData.append("pictures", image.replace(BASEIMGURL, "")); // Add to pictures array
        }
      });

      // Append newly uploaded images
      uploadedImages.forEach((image, index) => {
        formData.append("pictures", {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        }); // Add to pictures array
      });

      console.log("formData:", formData);

      const response = await fetch(`${BASEAPIURL}/products/${product._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
        await dispatch(setLoadingInBtn(false));
      }

      alert("Product updated successfully");
      fetchProduct();
      navigation.goBack();
      await dispatch(setLoadingInBtn(false));
    } catch (error) {
      console.error("Error updating product:", error);
      await dispatch(setLoadingInBtn(false));
    }
  };

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
                        source={require("../../assets/images/general/cross.png")}
                        style={{ width: 17, height: 17 }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              {selectedImages.length + uploadedImages.length < 6 && (
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
                placeholder="Product Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.name}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, name: text })
                }
              />
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder="Product Description*"
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
                placeholder="Price*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={modifiedDetails.price}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, price: text })
                }
              />

              <LoginInputField
                color
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Product Quantity*"
                underlineColor="transparent"
                keyboardType="numeric"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.quantity}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, quantity: text })
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
