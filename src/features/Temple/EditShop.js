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
import { ActivityIndicator, IconButton, Provider } from "react-native-paper";
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
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import { useIsFocused } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker";
import { en, registerTranslation } from "react-native-paper-dates";
import { statesData } from "../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEIMGURL } from "../../infrastructure/constants";
import { BASEAPIURL } from "../../infrastructure/constants";

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

export default function EditShop({ route, navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();

  const { shop } = route.params;
  const token = useSelector((state) => state.user.token);
  const initialImages =
    shop && shop.images
      ? shop.images.map((image) => `${image}`)
      : [];

  const [selectedImages, setSelectedImages] = React.useState(initialImages);
  const [uploadedImages, setUploadedImages] = useState([]);
  const { loadingInBtn } = useSelector((state) => state.user);
  const isFocused = useIsFocused();
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
    name: shop.name,
    city: shop.city,
    address: shop.address,
    description: shop.description,
    // email: shop.email,
    // phoneNumber: shop.phoneNumber,
    pincode: shop.pincode,
    state: shop.state,
  });
  console.log("modified details", modifiedDetails);

  const handleUpdate = async () => {
    await dispatch(setLoadingInBtn(true));

    try {
      const formData = new FormData();

      // Append modified details
      Object.keys(modifiedDetails).forEach((key) => {
        if (modifiedDetails[key] !== shop[key]) {
          formData.append(key, modifiedDetails[key]);
        }
      });

      // Append existing images without base URL
      // selectedImages.forEach((image, index) => {
      //   if (image.startsWith(BASEIMGURL)) {
      //     formData.append("images", image.replace(BASEIMGURL, ""));
      //   }
      // });
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      // Append newly uploaded images
      uploadedImages.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        });
      });
      console.log("formdata--", formData);

      const response = await fetch(
        `${BASEAPIURL}/templeShops/${shop._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      await dispatch(setLoadingInBtn(false));

      console.log("response--", response);

      if (!response.ok) {
        throw new Error("Failed to update shop");
      }

      alert("shop updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating shop:", error);
    }
  };

  const CategoryData = ["gold", "silver", "diamond"];
  const ConditionData = ["old", "new"];

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
                Edit Shop
              </Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
          >
            {/* <Text
              style={{
                fontSize: 16,
                marginLeft: 24,
                color: "#000000",
                fontWeight: "600",
                marginTop: 20,
              }}
            >
              Add More shop Images
            </Text> */}
            {/* <Row style={{ marginLeft: 24, flexWrap: "wrap" }}>
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
                  <Icon name="plus" size={35} color="#d4af37" />
                </AddProfileBox>
              )}
            </Row> */}
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
                Shop Name
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="shop Name*"
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
                Shop Description
              </Text>
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder="Description*"
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
                   
                  },
                ]}
              />
              {/* <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Email
              </Text>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Email"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.email}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, email: text })
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
                Phone Number
              </Text>

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Phone Number"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={modifiedDetails.phoneNumber}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, phoneNumber: text })
                }
              /> */}
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Shop Address
              </Text>

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="shop Address"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.address}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, address: text })
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
                State
              </Text>

              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={Object.keys(statesData)}
                defaultButtonText="Select State"
                defaultValue={modifiedDetails.state}
                onSelect={(selectedItem) => {
                  setModifiedDetails({
                    ...modifiedDetails,
                    state: selectedItem,
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
                City
              </Text>

              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 5 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={statesData[modifiedDetails.state] || []}
                defaultValue={modifiedDetails.city}
                defaultButtonText="Select cities"
                onSelect={(selectedItem) => {
                  setModifiedDetails({
                    ...modifiedDetails,
                    city: selectedItem,
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
                Pincode
              </Text>

              <LoginInputField
                color
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Pincode*"
                underlineColor="transparent"
                keyboardType="numeric"
                placeholderTextColor="#9B9B9B"
                defaultValue={modifiedDetails.pincode}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, pincode: text })
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
