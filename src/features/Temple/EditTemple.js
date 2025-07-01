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
  Alert
} from "react-native";
import { ActivityIndicator, IconButton, Provider } from "react-native-paper";
import Theme from "../../styles/theme";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker";
import { en, registerTranslation } from "react-native-paper-dates";
import { statesData } from "../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEAPIURL } from "../../infrastructure/constants";
import apiClient from "../../store/apiClient";
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

export default function EditTemple({ route, navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();

  const { temple , fetchTemple} = route.params;
  const token = useSelector((state) => state.user.token);
  const initialImages =
    temple && temple.images
      ? temple.images.map((image) => `${image}`)
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
    templeName: temple.templeName,
    city: temple.city,
    address: temple.address,
    description: temple.description,
    email: temple.email,
    phoneNumber: temple.phoneNumber,
    pincode: temple.pincode,
    state: temple.state,
    templeLocationLink: temple.templeLocationLink,
  });
  console.log("modified details", temple.templeLocationLink);

  // const handleUpdate = async () => {
  //   await dispatch(setLoadingInBtn(true));

  //   try {
  //     const formData = new FormData();

  //     // Append modified details
  //     Object.keys(modifiedDetails).forEach((key) => {
  //       if (modifiedDetails[key] !== temple[key]) {
  //         formData.append(key, modifiedDetails[key]);
  //       }
  //     });

      
  //     selectedImages.forEach((image) => {
  //       formData.append("images", image);
  //     });
      

  //     // Append newly uploaded images
  //     uploadedImages.forEach((image, index) => {
  //       formData.append("images", {
  //         uri: image.uri,
  //         name: `image_${index}.jpg`,
  //         type: "image/jpeg",
  //       });
  //     });
  //     console.log("formdata--", formData);

  //     const response = await fetch(
  //       `${BASEAPIURL}/temple/${temple._id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: formData,
  //       }
  //     );
  //     await dispatch(setLoadingInBtn(false));

  //     console.log("response--", response);

  //     if (!response.ok) {
  //       throw new Error("Failed to update temple");
  //     }
  //     fetchTemple();
  //     alert("Temple updated successfully");
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Error updating temple:", error);
  //   }
  // };

  // const handleUpdate = async () => {
  //   try {
  //     let token = await AsyncStorage.getItem("token");
  //     await dispatch(setLoadingInBtn(true));
  
  //     const formData = new FormData();
  
  //     // Append only modified details
  //     Object.keys(modifiedDetails).forEach((key) => {
  //       if (modifiedDetails[key] !== temple[key]) {
  //         formData.append(key, modifiedDetails[key]);
  //       }
  //     });
  
  //     // Append existing images
  //     selectedImages.forEach((image) => {
  //       formData.append("images", image);
  //     });
  
  //     // Append newly uploaded images
  //     uploadedImages.forEach((image, index) => {
  //       formData.append("images", {
  //         uri: image.uri,
  //         name: `image_${index}.jpg`,
  //         type: "image/jpeg",
  //       });
  //     });
  
  //     console.log("FormData:", formData);
  
  //     const response = await fetch(`${BASEAPIURL}/temple/${temple._id}`, {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: formData,
  //     });
  
  //     await dispatch(setLoadingInBtn(false));
  
  //     if (!response.ok) {
  //       throw new Error("Failed to update temple");
  //     }
  
  //     fetchTemple();
  //     Alert.alert("Success", "Temple updated successfully");
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Error updating temple:", error);
  //     Alert.alert("Error", "Failed to update temple");
  //     await dispatch(setLoadingInBtn(false));
  //   }
  // };
  const handleUpdate = async () => {
    try {
      await dispatch(setLoadingInBtn(true));
  
      // Ensure we always use the latest token from AsyncStorage
      let token = await AsyncStorage.getItem("token");
  
      if (!token) {
        console.error("Bearer token not found");
        return;
      }
  
      const formData = new FormData();
  
      // Append only modified details
      Object.keys(modifiedDetails).forEach((key) => {
        if (modifiedDetails[key] !== temple[key]) {
          formData.append(key, modifiedDetails[key]);
        }
      });
  
      // Append existing images
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
  
      console.log("FormData:", formData);
  
      const response = await apiClient.put(`/temple/${temple._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      await dispatch(setLoadingInBtn(false));
  
      console.log("API Response:", response);
  
      fetchTemple(); // Refresh temple data
      Alert.alert("Success", "Temple updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating temple:", error);
  console.log("error.response?.status: ", error.response?.status);
      // Handle token expiration and refresh
      if (error.response?.status === 1) {
        console.error("Token expired, trying to refresh...");
        await getUpdatedTokens(await AsyncStorage.getItem("refresh_token"));
        token = await AsyncStorage.getItem("token");
  
        if (token) {
          return handleUpdate(); // Retry request with new token
        }
      }
  
      Alert.alert("Error", "Failed to update temple");
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
                Edit Temple
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
                marginTop: 20,
              }}
            >
              Add More Temple Images
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
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  // marginTop: 50,
                }}
              >
                Temple Name
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Temple Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.templeName}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, templeName: text })
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
                Temple Description
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
              <Text
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
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
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
                Temple Location Link
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Temple Location Link*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.templeLocationLink}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, templeLocationLink: text })
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
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Phone Number"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={modifiedDetails.phoneNumber}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, phoneNumber: text })
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
                Temple Address
              </Text>

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Temple Address"
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
