import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
 TextInput,
 } from "react-native";
import {
  IconButton,
  Provider,
 } from "react-native-paper";
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
import { ErrorToggle } from "../../../store/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker";
import {
 en,
  registerTranslation,
} from "react-native-paper-dates";
import { statesData } from "../../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RowBetween } from "../../../styles/common.styles";
import FormData from "form-data";

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

export default function AddGemsStone({ navigation }) {
  registerTranslation("en", en);
 const dispatch = useDispatch();
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [registerDetails, setRegisterDetails] = React.useState({
    GemstoneName: "",
    GemstoneQuantity: "",
    GemstoneDescription: "",
    Gemstoneprice: "",
    pricepergram: "",
    priceperproduct: "",
  });

  console.log(registerDetails , "registerDetails");

  
  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      crop: true,
    });
    if (result.cancelled === true) return;
    setSelectedImages((prev) => [...prev, result]);
  };

  const removeProfileImage = (index) => {
    let newArray = [...selectedImages];
    newArray.splice(index, 1);
    setSelectedImages(newArray);
  };
  const query = new useQueryClient();

  const addProduct = async () => {
    // console.log(registerDetails);
    const data = new FormData();
    // Check if the registerDetails Object each field should not be empty
    if (
      registerDetails.GemstoneName === "" ||
      registerDetails.GemstoneDescription === "" ||
      registerDetails.GemstoneQuantity === ""
     ) {
      dispatch(
        ErrorToggle({
          type: "error",
          msg: "Please fill all the fields",
          toggle: true,
        })
      );
      return;
    }
    if (selectedImages.length === 0) {
      dispatch(
        ErrorToggle({
          type: "error",
          toggle: true,
          msg: "Add Profile Image.",
        })
      );
      return;
    }
    data.append("GemstoneName", registerDetails.GemstoneName);
    data.append("GemstoneQuantity", registerDetails.GemstoneQuantity);
    data.append("GemstoneDescription", registerDetails.GemstoneDescription);
    data.append("Gemstoneprice", registerDetails.Gemstoneprice);
    data.append("pricepergram", registerDetails.pricepergram);
    data.append("priceperproduct", registerDetails.priceperproduct);
    
    for (let i = 0; i < selectedImages.length; i++) {
      // // console.log(selectedImages[i]);
      let uriParts = selectedImages[i].uri.split(".");

      data.append("file", {
        uri: selectedImages[i].uri,
        name: selectedImages[i].uri.split("/").pop(),
        type: "image/" + uriParts[uriParts.length - 1],
      });
    }
    await registerMutation.mutateAsync(data);
  };

    const UselessTextInput = (props) => {
    return (
        <TextInput
            {...props}
            editable
            maxLength={1000}
        />
    );
}

  return (
    <SafeArea>
      <Provider>
        <ScrollView showsVerticalScrollIndicator={false}>
          <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
            <View style={{ alignItems: "center" , flexDirection : "row" }}>
              <IconButton
                icon="arrow-left"
                size={28}
                onPress={() => navigation.goBack()}
              />
              <Text style={{
                fontSize: 20,
                fontWeight: "500",
                color: "#000",
              }}>Add Gemstone</Text>
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
              Add Gemstone Image
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
                          source={require("../../../assets/images/general/cross.png")}
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
                placeholder="Gemstone Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.GemstoneName}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, GemstoneName: text })
                }
              />
                 <UselessTextInput
                            multiline
                            numberOfLines={3}
                            name="GemstoneDescription"
                            placeholder="Gemstone Description*"
                            value={registerDetails.GemstoneDescription}
                            onChangeText={(text) =>
                                setRegisterDetails({ ...registerDetails, GemstoneDescription: text })
                            }
                            style={{ padding:10, borderRadius: 5, height: 100, color: "gray", fontWeight: "500" , backgroundColor : "#F0F0F0" , marginTop : 20 , paddingTop : 15}}
                        />

                 <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Gemstone Quantity*"
                underlineColor="transparent"
                keyboardType="numeric"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, GemstoneQuantity: text })
                }
                value={registerDetails.GemstoneQuantity}
              />
                <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Price per carat*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.Gemstoneprice}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, Gemstoneprice: text })
                }
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Price per gram*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={registerDetails.pricepergram}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, pricepergram: text })
                }
              />
               <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Price per product*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={registerDetails.priceperproduct}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, priceperproduct: text })
                }
              />
             

              <FormButton onPress={addProduct}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  Submit
                </Text>
              </FormButton>
            </FormSection>
          </MainContainer>
        </ScrollView>
      </Provider>
    </SafeArea>
  );
}
