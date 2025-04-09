import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Theme from "../../styles/theme";
import { IconButton, Provider } from "react-native-paper";
import { SafeArea } from "../../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  MainContainer,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { en, registerTranslation } from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import { RowBetween } from "../../styles/common.styles";
import { BASEAPIURL } from "../../infrastructure/constants";
import { BASEIMGURL } from "../../infrastructure/constants";
import { setLoadingInBtn } from "../../store/user";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function TempleEditAdminRegisterScreen({ navigation, route }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();

  const token = useSelector((state) => state.user.token);
  const { userData, user, fetchUser, userId } = route.params;

  const [firstName, setFirstName] = useState(userData.user.firstName);
  const [lastName, setLastName] = useState(userData.user.lastName);
  const [email, setEmail] = useState(userData.user.email);
  const [phone, setPhone] = useState(userData.user.phone);
  const [address, setAddress] = useState(userData.user.address);
  const [selectedImage, setSelectedImage] = useState({
    uri: userData.user.image ? `${userData.user.image}` : null,
  });

  const { loadingInBtn } = useSelector((state) => state.user);

  const _pickDocument = async () => {
    // let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // if (permissions.granted === false) {
    //   alert("Permission is required");
    //   return;
    // }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      crop: true,
    });

    if (result.canceled === true) return;
    setSelectedImage(result.assets[0]);
  };

  const _pickDocumentAlt = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissions.granted === false) {
      alert("Permission is required");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      crop: true,
    });

    if (result.canceled === true) return;
    setSelectedImage(result);
  };

  const userType = useSelector((state) => state.user.user.userType);
  const heading =
    userType === "templeAdmin"
      ? "Edit Temple Admin Profile"
      : userType === "templeShopOwner"
      ? "Edit Shop Profile"
      : "Edit Profile";

  // const handleSubmit = async () => {
  //   try {
  //     let formData = new FormData();
  //     formData.append("firstName", firstName);
  //     formData.append("lastName", lastName);
  //     formData.append("email", email);
  //     formData.append("phone", phone);
  //     formData.append("address", address);

  //     if (selectedImage && selectedImage.uri) {
  //       let localUri = selectedImage.uri;
  //       let filename = localUri.split("/").pop();

  //       let match = /\.(\w+)$/.exec(filename);
  //       let type = match ? `image/${match[1]}` : `image`;

  //       formData.append("image", { uri: localUri, name: filename, type });
  //     }
  //     await dispatch(setLoadingInBtn(true));
  //     const response = await fetch(`${BASEAPIURL}/user/update/${userId}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: formData,
  //     });
  //     await dispatch(setLoadingInBtn(false));

  //     if (!response.ok) {
  //       throw new Error("Failed to update user");
  //     }
  //     alert("Information Updated Successfully");
  //     fetchUser();
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Error updating user:", error);
  //   }
  // };
  // const handleSubmit = async () => {
  //   try {
  //     let token = await AsyncStorage.getItem("token");
      
  //         if (!token) {
  //           console.error("Bearer token not found");
  //           throw new Error("Bearer token is missing");
  //         }
  //     let formData = new FormData();
  //     formData.append("firstName", firstName);
  //     formData.append("lastName", lastName);
  //     formData.append("email", email);
  //     formData.append("phone", phone);
  //     formData.append("address", address);
  
  //     if (selectedImage && selectedImage.uri) {
  //       let localUri = selectedImage.uri;
  //       let filename = localUri.split("/").pop();
  
  //       let match = /\.(\w+)$/.exec(filename);
  //       let type = match ? `image/${match[1]}` : `image`;
  
  //       formData.append("image", { uri: localUri, name: filename, type });
  //     }
  
  //     await dispatch(setLoadingInBtn(true));
  
  //     await apiClient.patch(`/user/update/${userId}`, formData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "multipart/form-data", // Required for file uploads
  //       },
  //     });
  
  //     dispatch(setLoadingInBtn(false));
  
  //     alert("Information Updated Successfully");
  //     fetchUser();
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Error updating user:", error);
  //     dispatch(setLoadingInBtn(false));
  //   }
  // };
  
  // const handleSubmit = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("token");
  
  //     if (!token) {
  //       console.error("Bearer token not found");
  //       Alert.alert("Error", "Authentication token is missing.");
  //       return;
  //     }
  
  //     await dispatch(setLoadingInBtn(true));
  
  //     const fullUrl = `${BASEAPIURL}/user/update/${userId}`;
  //     console.log("Hitting URL:", fullUrl);
  
  //     let bodyToSend;
  //     let headers;
  
  //     if (selectedImage && selectedImage.uri) {
  //       // still using FormData if image exists
  //       let formData = new FormData();
  //       formData.append("firstName", firstName);
  //       formData.append("lastName", lastName);
  //       formData.append("email", email);
  //       formData.append("phone", phone);
  //       formData.append("address", address);
  
  //       const localUri = selectedImage.uri;
  //       const filename = localUri.split("/").pop();
  //       const match = /\.(\w+)$/.exec(filename);
  //       const type = match ? `image/${match[1]}` : `image/jpeg`;
  
  //       formData.append("image", { uri: localUri, name: filename, type });
  
  //       bodyToSend = formData;
  //       headers = {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "multipart/form-data",
  //       };
  //     } else {
  //       // send as raw JSON
  //       bodyToSend = {
  //         firstName,
  //         lastName,
  //         email,
  //         phone,
  //         address,
  //       };
  //       headers = {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       };
  //     }
  
  //     const response = await apiClient.patch(fullUrl, bodyToSend, { headers });
  
  //     await dispatch(setLoadingInBtn(false));
  
  //     console.log("API Response:", response.data);
  //     Alert.alert("Success", "Information Updated Successfully");
  
  //     fetchUser();
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Error updating user:", error);
  //     Alert.alert("Error", "Failed to update user information.");
  //     await dispatch(setLoadingInBtn(false));
  //   }
  // };
  


  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");
  
      let formData = new FormData();
  
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
  
      if (selectedImage && selectedImage.uri && selectedImage.uri.startsWith("file://")) {
        let localUri = selectedImage.uri;
        let filename = localUri.split("/").pop();
  
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
  
        formData.append("image", {
          uri: localUri,
          name: filename,
          type: type,
        });
      }
  
      await dispatch(setLoadingInBtn(true));
  
      const response = await apiClient.patch(
        `/user/update/${userId}`,
        formData,
        {
          headers: {
            // DO NOT manually set Content-Type here
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      await dispatch(setLoadingInBtn(false));
  
      if (response.status !== 200) {
        throw new Error("Failed to update user");
      }
  
      alert("Information Updated Successfully");
      fetchUser();
      navigation.goBack();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user: " + error.message);
      await dispatch(setLoadingInBtn(false));
    }
  };
  
  
  return (
    <SafeArea>
      <Provider>
        <ScrollView>
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
                  fontWeight: "bold",
                  color: "#000",
                  letterSpacing: 0.5,
                }}
              >
                {heading}
              </Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
          >
            {selectedImage.uri ? (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "red",
                  marginTop: "10%",
                  alignSelf: "center",
                }}
              >
                <Image
                  style={styles.logo}
                  source={{ uri: selectedImage.uri }}
                />
                <TouchableOpacity onPress={_pickDocument}>
                  <View
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 0,

                      backgroundColor: "lightgrey",
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      // width: 20,
                      // height: 20,
                      borderRadius: 60,
                      padding: 8,
                    }}
                  >
                    <Image
                      source={require("../../assets/images/matrimony/camera.png")}
                      style={{ width: 15, height: 15 }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <AddProfileBox
                onPress={_pickDocument}
                style={{ ...styles.logo, marginTop: "10%" }}
              >
                <Icon name="plus" size={35} color={Theme.themeColor} />
              </AddProfileBox>
            )}
            <FormSection style={{ paddingTop: 0 }}>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="First Name *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={firstName}
                onChangeText={setFirstName}
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Last Name *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={lastName}
                onChangeText={setLastName}
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Email Id *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Address *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                autoCapitalize="none"
                value={address}
                onChangeText={setAddress}
              />

              <FormButton onPress={handleSubmit}>
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
                    "Update Profile"
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






