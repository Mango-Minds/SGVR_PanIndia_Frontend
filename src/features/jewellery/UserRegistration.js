import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
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
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker";
import {
  en,
  registerTranslation,
} from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import { createMatrimonyAccount } from "../../services/matrimony.services";
import { useMutation, useQueryClient } from "react-query";
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

export default function JewelleryUserRegisterScreen({ navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const [selectedImages, setSelectedImages] = React.useState([]);
  
  const [registerDetails, setRegisterDetails] = React.useState({
    fname: "",
    midname: "",
    lname: "",
   phone: "",
   shopname: "",
    email: "",
    aboutbusiness: "",
   currentcity: "",
    currentstate: "",
    currentcountry: "",
    currentpincode: "",
    currentAddress: "",
   
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
  const registerMutation = useMutation(createMatrimonyAccount, {
    onSuccess: async (data) => {
      if (
        (data.status === 0 && data.msg === "created") ||
        (data.status === 1 && data.msg === "account already exists")
      ) {
        await query.invalidateQueries("matrimonyUserExists");
      }
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          type: "error",
          msg: err.message,
          toggle: true,
        })
      );
    },
  });

  const handleSignup = async () => {
    // console.log(registerDetails);
    const data = new FormData();
    // Check if the registerDetails Object each field should not be empty
    if (
      registerDetails.fname === "" ||
      registerDetails.lname === "" ||
      registerDetails.phone === "" ||
      registerDetails.email === "" ||
      registerDetails.shopname === "" ||
      registerDetails.currentcity === "" ||
      registerDetails.currentstate === "" ||
      registerDetails.currentcountry === "" ||
      registerDetails.currentpincode === "" ||
      registerDetails.currentAddress === ""     
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
    data.append("fname", registerDetails.fname);
    data.append("midname", registerDetails.midname);
    data.append("lname", registerDetails.lname);
    data.append("shopname", registerDetails.shopname);
    data.append("phone", registerDetails.phone);
    data.append("email", registerDetails.email);
    data.append("aboutbusiness", registerDetails.aboutbusiness);
    data.append("currentcity", registerDetails.currentcity);
    data.append("currentstate", registerDetails.currentstate);
    data.append("currentcountry", registerDetails.currentcountry);
    data.append("currentpincode", registerDetails.currentpincode);
    data.append("currentAddress", registerDetails.currentAddress);
   
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

 

  return (
    <SafeArea>
      <Provider>
        <ScrollView>
          <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
            <View style={{ alignItems: "center" , flexDirection : "row"}}>
              <IconButton
                icon="arrow-left"
                size={28}
                onPress={() => navigation.goBack()}
              />
              <Text style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#000",
                letterSpacing: 0.5,
              }}>Add Shop Profile</Text>
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
            <FormSection style={{ paddingTop: 0 }}>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="First Name *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.fname}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, fname: text })
                }
              />

              <LoginInputField
                color
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Middle Name"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, midname: text })
                }
                value={registerDetails.midname}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Last Name *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, lname: text })
                }
                value={registerDetails.lname}
              /> 
               <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Shop Name/ Business Name *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
               onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, shopname: text })
                }
                value={registerDetails.shopname}
              />
<LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="About Your Business *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, aboutbusiness: text })
                }
                value={registerDetails.aboutbusiness}
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Phone no.*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    phone: text,
                  })
                }
                value={registerDetails.phone}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Email Id *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="email-address"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, email: text })
                }
                autoCapitalize="none"
                value={registerDetails.email}
              />

              

              {/* Inputs for gottra and rashi and currentAddress and permanentAddress */}
              <Text style={{ marginTop: 20, fontSize: 16, fontWeight: "bold" }}>
                Address
              </Text>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Street/House No./FLat No./Landmark"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    currentAddress: text,
                  })
                }
                value={registerDetails.currentAddress}
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="City"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    currentcity: text,
                  })
                }
                value={registerDetails.currentcity}
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="State"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    currentstate: text,
                  })
                }
                value={registerDetails.currentstate}
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Country"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    currentcountry: text,
                  })
                }
                value={registerDetails.currentcountry}
              />
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Pincode"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    currentpincode: text,
                  })
                }
                keyboardType="numeric"
                value={registerDetails.currentpincode}
              />
              <FormButton onPress={handleSignup}>
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
