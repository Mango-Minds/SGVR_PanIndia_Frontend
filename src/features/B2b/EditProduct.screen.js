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
  RadioButton,
} from "react-native-paper";
import { SafeArea } from "../../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  MainContainer,
  Row,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
 en,
  registerTranslation,
} from "react-native-paper-dates";
import { statesData } from "../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import {  useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
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

export default function EditProduct({ navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [date, setDate] = React.useState();
  const [month, setMonth] = React.useState();
  const [year, setYear] = React.useState();
 
  const [registerDetails, setRegisterDetails] = React.useState({
    productName: "",
    productType: "",
    productDescription: "",
    productprice: "",
    pricecompromise: "",
  });

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

    if (result.cancelled === true) return;
    let newArray = [...selectedImages];
    newArray[0] = result;
    setSelectedImages(newArray);
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
      registerDetails.productName === "" ||
      registerDetails.productDescription === "" ||
      registerDetails.productprice === "" ||
     registerDetails.pricecompromise === ""
     
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
    data.append("productName", registerDetails.productName);
    data.append("productType", registerDetails.productType);
    data.append("productDescription", registerDetails.productDescription);
    data.append("productprice", registerDetails.productprice);
    data.append("pricecompromise", registerDetails.pricecompromise);
    
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
        <ScrollView>
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
              }}>Edit Product</Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
          >
           
            {selectedImages[0] ? (
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
                  source={{
                    uri: selectedImages[0]
                      ? selectedImages[0].uri
                      : "https://i.imgur.com/XyqQZYh.png",
                  }}
                />
                <TouchableOpacity onPress={_pickDocumentAlt}>
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
                <Icon name="plus" size={35} color="#d4af37" />
              </AddProfileBox>
            )}

            <Text
              style={{
                fontSize: 16,
                marginLeft: 24,
                color: "#000000",
                fontWeight: "600",
                marginTop: 50,
              }}
            >
              Add Product Image
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
                placeholder="Product Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.productName}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, productName: text })
                }
              />

              <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Product Type*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, productType: text })
                }
                value={registerDetails.productType}
              />

                 <UselessTextInput
                            multiline
                            numberOfLines={3}
                            name="productDescription"
                            placeholder="Product Description*"
                            value={registerDetails.productDescription}
                            onChangeText={(text) =>
                                setRegisterDetails({
                                    ...registerDetails,
                                    productDescription: text,
                                })
                            }
                            style={{ padding:10, borderRadius: 5, height: 100, color: "gray", fontWeight: "500" , backgroundColor : "#F0F0F0" , marginTop : 20 , paddingTop : 15}}
                        />

<LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Product Price*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, productprice: text })
                }
                value={registerDetails.productprice}
              />
                <RadioButton.Group
                  onValueChange={(e) => {
                    // setSelectGender(e);
                    setRegisterDetails({ ...registerDetails, pricecompromise: e });
                  }}
                  value={registerDetails.pricecompromise}
                >
                  <Row>
                    <RadioButton.Android
                      uncheckedColor="#d4af37"
                      color="#d4af37"
                      value="fixed"
                    />
                    <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
                      Fixed Price
                    </Text>
                    <RadioButton.Android
                      uncheckedColor="#d4af37"
                      color="#d4af37"
                      value="negotiable"
                    />
                    <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
                    Price Negotiable
                    </Text>
                  </Row>
                </RadioButton.Group>
                <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Address*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.address}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, address: text })
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
                defaultButtonText="Select State*"
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
                defaultButtonText="Select cities*"
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
                placeholder="Pincode*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={registerDetails.pincode}
                maxLength={6}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, pincode: text })
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
