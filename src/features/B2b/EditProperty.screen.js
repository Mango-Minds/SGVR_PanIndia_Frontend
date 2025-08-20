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
  Menu,
} from "react-native-paper";
import { SafeArea } from "../../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  MainContainer,
  Row,
  MenuLead,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker";
import {
 en,
  registerTranslation,
} from "react-native-paper-dates";
import { statesData } from "../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function EditProperty({ navigation }) {
  registerTranslation("en", en);
  const [visible, setVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [visible3, setVisible3] = useState(false);
  const dispatch = useDispatch();
  const [selectedImages, setSelectedImages] = React.useState([]);
 
  const [registerDetails, setRegisterDetails] = React.useState({
    Advertisingfor: "",
    propertyspacetype: "",
    propertyType: "",
    address: "",
    state : "",
    city : "",
    pincode : "",
    propertytotalfloors : "",
    propertyFloor : "",
    furnishingType : "",
    propertytotalarea : "",
    propertycarpetarea : "",
    propertyprice : "",
    securityamount : "",
    propertyage : "",
    OwnershipType : "",
    propertyDescription : "",
  });

  const MenuItem = (props) => {
    return (
      <Menu.Item
        style={{
          width: "100%",
        }}
        titleStyle={{
          fontSize: 14,
          color: "#656565",
          fontWeight: "500",
        }}
        onPress={() => {
          props.setRegisterDetails({
            ...props.allValues,
            [props.name]: props.value,
          });
          props.setVisible(false);
        }}
        title={props.value}
      />
    );
  };

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
      registerDetails.Advertisingfor === "" ||
      registerDetails.propertyspacetype === "" ||
      registerDetails.propertyType === "" ||
     registerDetails.address === "" ||
     registerDetails.state === "" ||
     registerDetails.city === "" ||
     registerDetails.pincode === "" ||
     registerDetails.furnishingType === "" ||
     registerDetails.propertyFloor === "" ||
     registerDetails.propertytotalarea === "" ||
     registerDetails.propertycarpetarea === "" ||
     registerDetails.propertyprice === "" ||
     registerDetails.securityamount === "" ||
     registerDetails.propertyage === "" ||
     registerDetails.OwnershipType === ""

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
    data.append("Advertisingfor", registerDetails.Advertisingfor);
    data.append("propertyspacetype", registerDetails.propertyspacetype);
    data.append("propertyType", registerDetails.propertyType);
    data.append("address", registerDetails.address);
    data.append("state", registerDetails.state);
    data.append("city", registerDetails.city);
    data.append("pincode", registerDetails.pincode);
    data.append("propertytotalfloors", registerDetails.propertytotalfloors);
    data.append("propertyFloor", registerDetails.propertyFloor);
    data.append("furnishingType", registerDetails.furnishingType);
    data.append("propertytotalarea", registerDetails.propertytotalarea);
    data.append("propertycarpetarea", registerDetails.propertycarpetarea);
    data.append("securityamount", registerDetails.securityamount);
    data.append("propertyage", registerDetails.propertyage);
    data.append("propertyDescription", registerDetails.propertyDescription);
    data.append("OwnershipType", registerDetails.OwnershipType);
    data.append("propertyprice", registerDetails.propertyprice);

    
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
              }}>Edit Property</Text>
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
              Add Property Image
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
            <View style={{ paddingHorizontal: 0 }}>
              <Menu
                style={{
                  width: "80%",
                  // height: 50,
                  marginTop: 25,
                  color: "black",
                }}
                visible={visible}
                // onDismiss={() => setVisible(false)}
                anchor={
                  <MenuLead
                    onPress={() => {
                      setVisible(true);
                    }}
                    style={{ height: 50 }}
                    title={registerDetails.Advertisingfor || "Advertising for *"}
                    bgColor="#F0F0F0"
                    textcolor="Advertising For *"
                  />
                }
              >
                <MenuItem
                  name="Advertisingfor"
                  value="Sale"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="Advertisingfor"
                  value="Rent"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="Advertisingfor"
                  value="Lease"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
              </Menu>
            </View>
            <RadioButton.Group
                  onValueChange={(e) => {
                    // setSelectGender(e);
                    setRegisterDetails({ ...registerDetails, propertyspacetype: e });
                  }}
                  value={registerDetails.propertyspacetype}
                >
                  <Row>
                    <RadioButton.Android
                      uncheckedColor="#d4af37"
                      color="#d4af37"
                      value="Residential"
                    />
                    <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
                    Residential
                    </Text>
                    <RadioButton.Android
                      uncheckedColor="#d4af37"
                      color="#d4af37"
                      value="Commercial"
                    />
                    <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
                    Commercial
                    </Text>
                  </Row>
                </RadioButton.Group>
                <View style={{ paddingHorizontal: 0 }}>
              <Menu
                style={{
                  width: "80%",
                  // height: 50,
                  marginTop: 25,
                  color: "black",
                }}
                visible={visible1}
                // onDismiss={() => setVisible(false)}
                anchor={
                  <MenuLead
                    onPress={() => {
                        setVisible1(true);
                    }}
                    style={{ height: 50 }}
                    title={registerDetails.propertyType || "Property Type *"}
                    bgColor="#F0F0F0"
                    textcolor="Property Type *"
                  />
                }
              >
                <MenuItem
                  name="propertyType"
                  value="Apartment"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="propertyType"
                  value="House"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="propertyType"
                  value="Flat"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                 <MenuItem
                  name="propertyType"
                  value="Villa / Mension"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="propertyType"
                  value="Plot"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                 <MenuItem
                  name="propertyType"
                  value="Shop"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                 <MenuItem
                  name="propertyType"
                  value="Office"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                 <MenuItem
                  name="propertyType"
                  value="Farm House"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                 <MenuItem
                  name="propertyType"
                  value="Pent House"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                 <MenuItem
                  name="propertyType"
                  value="Other"
                  setVisible={setVisible1}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                </Menu>
            </View>
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
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Total Floors Name"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.propertytotalfloors}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, propertytotalfloors: text })
                }
              />

              <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Property Floor"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, propertyFloor: text })
                }
                value={registerDetails.propertyFloor}
              />

            <View style={{ paddingHorizontal: 0 }}>
              <Menu
                style={{
                  width: "80%",
                  // height: 50,
                  marginTop: 25,
                  color: "black",
                }}
                visible={visible2}
                // onDismiss={() => setVisible(false)}
                anchor={
                  <MenuLead
                    onPress={() => {
                      setVisible2(true);
                    }}
                    style={{ height: 50 }}
                    title={registerDetails.furnishingType || "Furnishing Type *"}
                    bgColor="#F0F0F0"
                    textcolor="Furnishing Type *"
                  />
                }
              >
                <MenuItem
                  name="furnishingType"
                  value="Fully Furnished"
                  setVisible={setVisible2}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="furnishingType"
                  value="Semi Furnished"
                  setVisible={setVisible2}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="furnishingType"
                  value="Unfurnished"
                  setVisible={setVisible2}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
              </Menu>
            </View>
            <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Property Area (in sqft)*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, propertytotalarea: text })
                }
                value={registerDetails.propertytotalarea}
              />
              <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Carpet Area (in sqft)*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, propertycarpetarea: text })
                }
                value={registerDetails.propertycarpetarea}
              />
               <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Rent (pm)/ Total Price"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, propertyprice: text })
                }
                value={registerDetails.propertyprice}
              />
               <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Security Amount"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, securityamount: text })
                }
                value={registerDetails.securityamount}
              />
               <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Property Age (in years)"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, propertyage: text })
                }
                value={registerDetails.propertyage}
              />

<View style={{ paddingHorizontal: 0 }}>
              <Menu
                style={{
                  width: "80%",
                  // height: 50,
                  marginTop: 25,
                  color: "black",
                }}
                visible={visible3}
                // onDismiss={() => setVisible(false)}
                anchor={
                  <MenuLead
                    onPress={() => {
                      setVisible3(true);
                    }}
                    style={{ height: 50 }}
                    title={registerDetails.OwnershipType || "Ownership Type "}
                    bgColor="#F0F0F0"
                    textcolor="Ownership Type "
                  />
                }
              >
                <MenuItem
                  name="OwnershipType"
                  value="Owned"
                  setVisible={setVisible3}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="OwnershipType"
                  value="Rented"
                  setVisible={setVisible3}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="OwnershipType"
                  value="Leased"
                  setVisible={setVisible3}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                 <MenuItem
                  name="OwnershipType"
                  value="PG"
                  setVisible={setVisible3}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                 <MenuItem
                  name="OwnershipType"
                  value="Hostel"
                  setVisible={setVisible3}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                 <MenuItem
                  name="OwnershipType"
                  value="Independent"
                  setVisible={setVisible3}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="OwnershipType"
                  value="Other"
                  setVisible={setVisible3}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
              </Menu>
            </View>

                 <UselessTextInput
                            multiline
                            numberOfLines={3}
                            name="propertyDescription"
                            placeholder="Property Description*"
                            value={registerDetails.propertyDescription}
                            onChangeText={(text) =>
                                setRegisterDetails({
                                    ...registerDetails,
                                    propertyDescription: text,
                                })
                            }
                            style={{ padding:10, borderRadius: 5, height: 100, color: "gray", fontWeight: "500" , backgroundColor : "#F0F0F0" , marginTop : 20 , paddingTop : 15}}
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
