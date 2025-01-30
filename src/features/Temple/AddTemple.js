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
import { Picker } from "@react-native-picker/picker";
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

  const token = useSelector((state) => state.user.token);


  const addTemple = async () => {
    try {
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
      console.log(registerDetails, "registerDetails");
      console.log(formData, "registerDetails");


      const response = await fetch(`${BASEAPIURL}/temple`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      await dispatch(setLoadingInBtn(false));

      console.log("responseee", response);
      if (!response.ok) {
        throw new Error("Failed to add Temple");
      }

      setRegisterDetails({
        templeName: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        description: "",
        phoneNumber: "",
        email: "",
        templeLocationLink: "",
        images: [],
        donation: [],
        members: [],
        templeShops: [],
        templeEvents: [],
      });

      const data = await response.json();
      console.log("Added Temple:", data);

      Alert.alert(
        "Success",
        "Temple Created successfully",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error adding Temple:", error);

      Alert.alert(
        "Error",
        "Failed to add temple",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
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
                Add Temple
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
              Add Temple Images
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
                  <Icon name="plus" size={35} color="#d4af37" />
                </AddProfileBox>
              )}
            </Row>
            <FormSection style={{ paddingTop: 0 }}>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Temple Name*"
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
                selectionColor="#d4af37"
                placeholder="Description*"
                activeUnderlineColor="#d4af37"
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
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Phone Number*"
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
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Email*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.email}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, email: text })
                }
                autoCapitalize="none"
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Address"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.address}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, address: text })
                }
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Enter google maps link"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.templeLocationLink}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, templeLocationLink: text })
                }
              />

              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={Object.keys(statesData)}
                defaultButtonText="Select State"
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
                defaultButtonText="Select city"
                onSelect={(selectedItem) => {
                  setRegisterDetails({
                    ...registerDetails,
                    city: selectedItem,
                  });
                }}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Pincode"
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
