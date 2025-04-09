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
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import { BASEAPIURL } from "../../infrastructure/constants";
import { decode } from "base-64";
import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import DateTimePicker from "@react-native-community/datetimepicker";

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
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#9B9B9B",
  },
  orText: {
    marginHorizontal: 8,
    fontSize: 16,
    color: "#9B9B9B",
  },
});

export default function AddGod({ navigation, route }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const { templeinfo } = route.params;
  console.log("Temple infor: ", templeinfo);
  const templeId = templeinfo._id;
  console.log("Temple id in gods page: ", templeId);
  const { loadingInBtn } = useSelector((state) => state.user);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [registerDetails, setRegisterDetails] = React.useState({
    godName: "",
    godDescription: "",
    godSymbol: "",
    godFestivals: "",
    godRelatedDeities: "",
  });

  console.log(registerDetails, "registerDetails");

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
  const query = new useQueryClient();

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));

  const userType = decodedPayload.userType;

  // const addGod = async () => {
  //   console.log("Tid: ", templeId);
  //   try {
  //     if (!token) {
  //       console.error("Bearer token not found");
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("godName", registerDetails.godName);
  //     formData.append("description", registerDetails.godDescription);

  //     formData.append("symbol", registerDetails.godSymbol);

  //     formData.append("festivals", registerDetails.godFestivals);
  //     formData.append("relatedDeities", registerDetails.godRelatedDeities);

  //     selectedImages.forEach((image, index) => {
  //       formData.append("godImage", {
  //         uri: image.uri,
  //         name: `image_${index}.jpg`,
  //         type: "image/jpeg",
  //       });
  //     });

  //     console.log("formdata add god", formData);
  //     await dispatch(setLoadingInBtn(true));

  //     const response = await fetch(`${BASEAPIURL}/temple/${templeId}/gods`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "multipart/form-data", // Required for file uploads
  //       },
  //       body: formData,
  //     });
  //     await dispatch(setLoadingInBtn(false));

  //     console.log("response", response);

  //     if (!response.ok) {
  //       throw new Error("Failed to add product");
  //     }

  //     setRegisterDetails({
  //       godName: "",
  //       godDescription: "",
  //       godSymbol: "",
  //       godFestivals: "",
  //       godRelatedDeities: "",
  //     });

  //     const data = await response.json();
  //     console.log("Added god:", data);

  //     Alert.alert(
  //       "Success",
  //       "God Added Successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error adding god:", error);

  //     Alert.alert(
  //       "Error",
  //       "Failed to add god",
  //       [{ text: "OK", onPress: () => console.log("OK Pressed") }],
  //       { cancelable: false }
  //     );
  //   }
  // };

  const addGod = async () => {
    console.log("Tid: ", templeId);
    let token = await AsyncStorage.getItem("token");
    try {
      if (!token) {
        console.error("Bearer token not found");
        return;
      }
  
      const formData = new FormData();
      formData.append("godName", registerDetails.godName);
      formData.append("description", registerDetails.godDescription);
      formData.append("symbol", registerDetails.godSymbol);
      formData.append("festivals", registerDetails.godFestivals);
      formData.append("relatedDeities", registerDetails.godRelatedDeities);
  
      selectedImages.forEach((image, index) => {
        formData.append("godImage", {
          uri: image.uri,
          name: `image_${index}.jpg`,
          type: "image/jpeg",
        });
      });
  
      console.log("formdata add god", formData);
      await dispatch(setLoadingInBtn(true));
  
      const response = await apiClient.post(`/temple/${templeId}/gods`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Required for file uploads
        },
      });
  
      await dispatch(setLoadingInBtn(false));
  
      console.log("response", response);
  
      if (!response || (response.status !== 200 && response.status !== 201)) {
        throw new Error("Failed to add god");
      }
  
      setRegisterDetails({
        godName: "",
        godDescription: "",
        godSymbol: "",
        godFestivals: "",
        godRelatedDeities: "",
      });
  
      const data = response.data;
      console.log("Added god:", data);
  
      Alert.alert(
        "Success",
        "God Added Successfully",
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
      console.error("Error adding god:", error);
  
      Alert.alert(
        "Error",
        "Failed to add god",
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
                Add God
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
              Add God Image
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
                  <Icon name="plus" size={35} color={Theme.themeColor}/>
                </AddProfileBox>
              )}
            </Row>
            <FormSection style={{ paddingTop: 0 }}>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="God Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.godName}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, godName: text })
                }
              />
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder="Description*"
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.godDescription}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    godDescription: text,
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
                placeholder="Symbols*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.godSymbol}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, godSymbol: text })
                }
              />
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Festivals*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.godFestivals}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    godFestivals: text,
                  })
                }
              />
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Related Deities*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.godRelatedDeities}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, godRelatedDeities: text })
                }
              />
             

              <FormButton onPress={addGod}>
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
