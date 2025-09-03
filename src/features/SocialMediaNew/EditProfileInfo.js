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
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Theme from "../../styles/theme";
import { IconButton, Provider } from "react-native-paper";
import { SafeArea } from "../../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TextInput from "react-native-paper";
import { en, registerTranslation } from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import { RowBetween } from "../../styles/common.styles";

import { setLoadingInBtn } from "../../store/user";
import { useDispatch } from "react-redux";
import { FlatList } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";
import { updateUserBannerImage } from "./SocialMediaAPIs";

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
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
    fontSize: 18,
  },
  educationContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  educationItem: {
    marginBottom: 16,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: "bold",
  },
  educationInstitution: {
    fontSize: 14,
    color: "#555",
  },
  educationDuration: {
    fontSize: 14,
    color: "#777",
  },
  educationDescription: {
    fontSize: 14,
    color: "#333",
  },

  educationItem: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  addButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: Theme.themeColor,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  removeButton: {
    marginTop: 8,
    padding: 5,
    backgroundColor: "#ff4d4d",
    borderRadius: 5,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default function EditProfileInfo({ navigation, route }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const token = useSelector((state) => state.user.token);
  const { userProfile, fetchUserProfile, userId, fetchUser } = route.params;

  const [firstName, setFirstName] = useState(userProfile?.user?.firstName || "");
  const [lastName, setLastName] = useState(userProfile?.user?.lastName || "");
  const [address, setAddress] = useState(userProfile?.user?.address || "");

  const [selectedImage, setSelectedImage] = useState({
    uri: userProfile.followData?.bannerImage
      ? `${userProfile?.followData?.bannerImage}`
      : null,
  });

  const { loadingInBtn } = useSelector((state) => state.user);

  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Better aspect ratio for banner images
      quality: 1,
      crop: true,
    });

    if (result.canceled === true) return;
    setSelectedImage(result.assets[0]);
  };

  
  const handleSubmit = async () => {
    try {
      // Check if we have a banner image to update
      if (selectedImage && selectedImage.uri) {
        // Update banner image using the new function
        await updateUserBannerImage({
          bannerImage: selectedImage,
          dispatch,
          setLoadingInBtn,
          fetchUserProfile,
          navigation,
          t,
        });
      } else {
        // Update user profile information (name, address, etc.)
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("Authentication token is missing.");
          Alert.alert("Error", "You are not authorized. Please log in again.");
          return;
        }
    
        await dispatch(setLoadingInBtn(true));
    
        let headers = {
          Authorization: `Bearer ${token}`,
        };
    
        let body = {
          firstName,
          lastName,
          address,
        };
        headers["Content-Type"] = "application/json";
    
        const response = await apiClient.patch(
          `/user/update/${userId}`,
          body,
          { headers }
        );
    
        await dispatch(setLoadingInBtn(false));
    
        if (response.status !== 200) {
          throw new Error(`Failed to update user: ${response.data?.message || ""}`);
        }
    
        alert("Information Updated Successfully");
        if (fetchUser && typeof fetchUser === 'function') {
          fetchUser();
        }
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Error: ${error.message}`);
      dispatch(setLoadingInBtn(false));
    }
  };
  
  return (
    <SafeArea>
      <Provider>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
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
                  fontWeight: "bold",
                  color: "#000",
                  letterSpacing: 0.5,
                }}
              >
               {t("editBannerImage")}
              </Text>
            </View>
          </RowBetween>
          <View
            style={{ paddingBottom: 56, flex: 1 }}
          >
            <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
                {t("editBannerImage")}
              </Text>
              <Text style={{ fontSize: 14, color: "#666", marginBottom: 20, textAlign: "center" }}>
                {t("bannerImageDescription")}
              </Text>
            </View>
            
            {selectedImage.uri ? (
              <View
                style={{
                  width: "90%",
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: "#f0f0f0",
                  marginTop: 10,
                  alignSelf: "center",
                  overflow: "hidden",
                }}
              >
                <Image
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "cover",
                  }}
                  source={{ uri: selectedImage.uri }}
                />
                <TouchableOpacity onPress={_pickDocument}>
                  <View
                    style={{
                      position: "absolute",
                      right: 10,
                      bottom: 10,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      borderRadius: 25,
                      padding: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="camera" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={_pickDocument}
                style={{
                  width: "90%",
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: "#f0f0f0",
                  marginTop: 10,
                  alignSelf: "center",
                  borderWidth: 2,
                  borderColor: "#ddd",
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="image-plus" size={50} color={Theme.themeColor} />
                <Text style={{ marginTop: 10, color: Theme.themeColor, fontSize: 16 }}>
                  {t("selectBannerImage")}
                </Text>
              </TouchableOpacity>
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
                returnKeyType="next"
                blurOnSubmit={false}
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
                returnKeyType="next"
                blurOnSubmit={false}
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
                returnKeyType="done"
                blurOnSubmit={true}
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
                      color={"white"}
                    />
                  ) : (
                   t("update_profile")
                  )}
                </Text>
              </FormButton>
            </FormSection>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Provider>
    </SafeArea>
  );
}
