import React, { useState } from "react";
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
import Theme from "../../styles/theme";
import { Picker } from "@react-native-picker/picker";
import apiClient from "../../store/apiClient";
import { IconButton, Provider } from "react-native-paper";
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
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEAPIURL } from "../../infrastructure/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "base-64";
import { useTranslation } from "react-i18next";
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

export default function AddTemple({ navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const { t } = useTranslation();
  const userType = useSelector((state) => state.user.user.userType[0]);
  console.log("User Type:", userType);
  console.log("Token:", token);

  const { loadingInBtn } = useSelector((state) => state.user);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [registerDetails, setRegisterDetails] = React.useState({
    templeName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    description: "",
    phoneNumber: "",
    email: "",
    images: [],
    donation: [],
    members: [],
    templeShops: [],
    templeEvents: [],
    templeLocationLink: "",
  });

  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (result.canceled === true) return;
    setSelectedImages((prev) => [...prev, result.assets[0]]);
  };

  const removeProfileImage = (index) => {
    let newArray = [...selectedImages];
    newArray.splice(index, 1);
    setSelectedImages(newArray);
  };

  const addTemple = async () => {
    try {
      let token = await AsyncStorage.getItem("token");
      console.log("Async token: ", token);
      if (!token) {
        console.error("Bearer token not found");
        return;
      }

      const formData = new FormData();
      formData.append("templeName", registerDetails.templeName);
      formData.append("address", registerDetails.address);
      formData.append("city", registerDetails.city);
      formData.append("state", registerDetails.state);
      formData.append("pincode", registerDetails.pincode);
      formData.append("description", registerDetails.description);
      formData.append("phoneNumber", registerDetails.phoneNumber);
      formData.append("email", registerDetails.email);
      formData.append("templeLocationLink", registerDetails.templeLocationLink);

      registerDetails.donation.forEach((donation, index) => {
        formData.append(`donation[${index}]`, donation);
      });

      registerDetails.members.forEach((member, index) => {
        formData.append(`members[${index}]`, member);
      });

      registerDetails.templeShops.forEach((shop, index) => {
        formData.append(`templeShops[${index}]`, shop);
      });

      registerDetails.templeEvents.forEach((event, index) => {
        formData.append(`templeEvents[${index}]`, event);
      });

      selectedImages.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        });
      });

      await dispatch(setLoadingInBtn(true));

      console.log("FormData:", formData);

      const response = await apiClient.post("/temple", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("API Response:", response);

      await dispatch(setLoadingInBtn(false));

      Alert.alert(
        t("success"),
        t("templeCreated"),
        [{ text: t("ok"), onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error adding Temple:", error);

      if (error.response?.status === 401) {
        console.error("Token expired, attempting refresh...");
        await getUpdatedTokens(await AsyncStorage.getItem("refresh_token"));
        token = await AsyncStorage.getItem("token");

        if (token) {
          return addTemple(); // Retry the function with the new token
        }
      }

      Alert.alert(
        t("error"),
        t("templeCreationFailed"),
        [{ text: t("ok"), onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
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
                {t("addTemple")}
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
              {t("addTempleImages")}
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
                placeholder={t("Temple Name")}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.templeName}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, templeName: text })
                }
              />
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder={t("description")}
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.description}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    description: text,
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
                  },
                ]}
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("phoneNumber")}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                maxLength={10}
                value={registerDetails.phoneNumber}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, phoneNumber: text })
                }
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("email")}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.email}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, email: text })
                }
                autoCapitalize="none"
              />
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("taddress")}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.address}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, address: text })
                }
              />
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("googleMapsLink")}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.templeLocationLink}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    templeLocationLink: text,
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
                data={Object.keys(statesData)}
                defaultButtonText={t("selectState")}
                value={registerDetails.state}
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    state: selectedItem,
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
                data={statesData[registerDetails.state] || []}
                defaultButtonText={t("selectCity")}
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    city: selectedItem,
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
                data={Object.keys(statesData).map((key) => ({
                  key,
                  label: t(`states.${key}`),
                }))}
                defaultButtonText={t("selectState")}
                onSelect={(selected) =>
                  setRegisterDetails({
                    ...registerDetails,
                    state: selected.key,
                  })
                }
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
                data={(statesData[registerDetails.state] || []).map((key) => ({
                  key,
                  label: t(`cities.${key}`),
                }))}
                defaultButtonText={t("selectCity")}
                onSelect={(selected) =>
                  setRegisterDetails({ ...registerDetails, city: selected.key })
                }
                buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                rowTextForSelection={(item) => item.label}
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder={t("pincode")}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={registerDetails.pincode}
                maxLength={6}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, pincode: text })
                }
              />
              <FormButton onPress={addTemple}>
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
