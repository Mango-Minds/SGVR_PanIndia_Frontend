import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Divider, Menu, Provider, RadioButton } from "react-native-paper";
import { SafeArea } from "../components/utility/safe-area.component";
import { useSelector, useDispatch } from "react-redux";
import SelectDropdown from "react-native-select-dropdown";
import { updateUser } from "../store/user";
import { IconButton } from "react-native-paper";
import axios from "axios";
import Theme from "../styles/theme";
import {
  BottomText,
  ForgotText,
  FormButton,
  FormSection,
  FormSectionTitle,
  MainContainer,
  MenuLead,
  Row,
  LoginInputField,
} from "../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ErrorToggle, setLoadingInBtn, signup } from "../store/user";
import { statesData } from "../assets/data/statesAndCities";
import { parseInt } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASEAPIURL } from "../infrastructure/constants";
import { setInitialUser } from "../store/user";
const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginTop: "10%",
  },
  input: {
    marginTop: 24,
    backgroundColor: "#F0F0F0",
    borderColor: "#E6E6E6",
    borderRadius: 4,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12, // Space between options
  },
  radioText: {
    color: "#9b9b9b",
    fontSize: 14,
  },
});

const userTypes = {
 
  Temple: ["Temple Admin", "Temple Shop", "Devotees", "Pandit"],
  Matrimony: [
    "Matrimony Man",
    "Matrimony Woman",
    "Matrimony Vendor",
    "Planner",
    "Decorator",
    "Caterer",
    "Venue",
  ],
  Jewellery: [
    "Vendor",
    "Shop",
    "Worker",
    "Designer",
    "Gemologist",
    "Browse Only",
  ],
};


const userTypeMappings = {
  
  "Temple Admin": "templeAdmin",
  "Temple Shop": "templeShopOwner",
  Devotees: "basicUser",
  Pandit: "pandit",
  "Matrimony Man": "matrimonyMan",
  "Matrimony Woman": "matrimonyWoman",
  "Matrimony Vendor": "matrimonyVendor",
  Planner: "planner",
  Decorator: "decorator",
  Caterer: "caterer",
  Venue: "venue",
  "Vendor": "vendor",
  "Shop": "shop",
  "Worker": "worker",
  "Designer": "jewelryDesigner",
  "Gemologist": "gemologist",
  "Browse Only": "basicUser",
};


export default function OnboardModuleForm({ route, navigation }) {
  const dispatch = useDispatch();
  const { userId, redirectTo } = route.params || {};

  console.log("userid in onboard form: ", userId);
  const { loadingInBtn } = useSelector((state) => state.user);

  const [selectedModule, setSelectedModule] = useState(redirectTo || "");

  const [selectGender, setSelectGender] = useState("");

  const [details, setDetails] = useState({
    phone: "",
    dob: "",
    gender: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    userType: "",
    suggestedBy: "",
  });

  const userTypesForModule = userTypes[selectedModule] || [];
console.log("Selected Module:", selectedModule);
  console.log("User Types for Module:", userTypesForModule);
  useEffect(() => {
    if (redirectTo) {
      setSelectedModule(redirectTo);
      setDetails((prev) => ({
        ...prev,
        userType: "",
      }));
    }
  }, [redirectTo]);


  useEffect(() => {
    if (details.gender) {
      setSelectGender(details.gender.toLowerCase());
    }
  }, [details.gender]);

  

  
  
  const handleSubmit = async () => {
    try {
      const mappedUserType = userTypeMappings[details.userType];
  
      if (!mappedUserType || mappedUserType.trim() === "") {
        alert("Please select a valid user type.");
        dispatch(setLoadingInBtn(false));
        return;
      }
  
      dispatch(setLoadingInBtn(true));
  
      const onboardingFlagMap = {
        Matrimony: "isMatrimonyOnboarded",
        Temple: "isTempleOnboarded",
        Jewellery: "isJewelryOnboarded",
      };
  
      const updatedDetails = {
        ...details,
        userType: [mappedUserType],
        [onboardingFlagMap[selectedModule]]: true,
      };
  
      console.log("Submitting updated user details:", updatedDetails);
      console.log("details.userType", details.userType);
      console.log("mappedUserType", mappedUserType);
      const res = await fetch(`${BASEAPIURL}/user/update/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDetails),
      });
  
      const data = await res.json();
      console.log("User updated:", data);
      // if (data.user) {
      //   // Dispatch to update the Redux store with the new user data
      //   dispatch(updateUser(data.user)); 
      // }

      if (data.user) {
  const normalizedUser = {
    ...data.user,
    userType: Array.isArray(data.user.userType)
      ? data.user.userType
      : [data.user.userType],
  };
  dispatch(updateUser(normalizedUser));
  
  // Persist updated user data to AsyncStorage so it's available on next app start
  await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
  console.log("User data persisted to AsyncStorage with onboarding flags:", {
    isJewelryOnboarded: normalizedUser.isJewelryOnboarded,
    isMatrimonyOnboarded: normalizedUser.isMatrimonyOnboarded,
    isTempleOnboarded: normalizedUser.isTempleOnboarded,
  });
  
  // Also update the setInitialUser to ensure Redux state is fully updated
  const token = await AsyncStorage.getItem("token");
  const refreshToken = await AsyncStorage.getItem("refresh_token");
  if (token && refreshToken) {
    dispatch(setInitialUser({
      user: normalizedUser,
      token,
      refreshToken,
    }));
  }
}


      console.log("Data.user: ", data.user);
  
      dispatch(setLoadingInBtn(false));
      
      // Navigate to the specific module after successful onboarding
      if (selectedModule === "Matrimony") {
        navigation.navigate("Matrimony");
      } else if (selectedModule === "Temple") {
        // Since we're already in the Temple stack, navigate to TempleHome
        // Use setTimeout to ensure navigation happens after state updates
        setTimeout(() => {
          navigation.navigate("TempleHome");
        }, 100);
      } else if (selectedModule === "Jewellery") {
        navigation.reset({
          index: 0,
          routes: [{ name: "HomeScreen" }],
        });
      } else {
        navigation.navigate(selectedModule);
      }
    } catch (err) {
      dispatch(setLoadingInBtn(false));
      console.error("Submit failed", err);
    }
  };
  
    
  return (
    <SafeArea>
      <Provider>
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
          <MainContainer style={{ paddingBottom: 10 }}>
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <IconButton
                icon="arrow-left"
                onPress={() => navigation.goBack()}
              />
            </View>
            <FormSection>
              <FormSectionTitle>Additional Information</FormSectionTitle>

              {/* Phone Number */}
              <LoginInputField
               selectionColor={Theme.themeColor}

                 activeUnderlineColor={Theme.themeColor}

                style={styles.input}
                placeholder="Phone Number*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                maxLength={10}
                value={details.phone}
                onChangeText={(text) => setDetails({ ...details, phone: text })}
              />

             
              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={userTypesForModule}
                defaultButtonText="Select User Type"
                value={details.userType} 
                onSelect={(selectedItem) => {
                  setDetails({
                    ...details,
                    userType: selectedItem, 
                  });
                }}
              />

              {/* Gender Selection */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    color: "Theme.themeColor",
                    fontSize: 14,
                    marginRight: 8,
                  }}
                >

                  I am*
                </Text>
                <RadioButton.Group
                  onValueChange={(val) => {
                    setSelectGender(val); // 'male', 'female', etc.
                    setDetails((prevDetails) => ({
                      ...prevDetails,
                      gender: val, // Also 'male', 'female'
                    }));
                  }}
                  value={selectGender}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {["male", "female", "prefer not to say"].map((option) => (
                      <View key={option} style={styles.radioContainer}>
                        <RadioButton.Android
                          uncheckedColor={Theme.themeColor}
                          color={Theme.themeColor}

                          value={option}
                        />
                        <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </RadioButton.Group>
              </View>

              {/* Address Field */}
              <LoginInputField
                 selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}

                style={styles.input}
                placeholder="Address"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={details.address}
                onChangeText={(text) =>
                  setDetails({ ...details, address: text })
                }
              />

              {/* State Selection */}
              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={Object.keys(statesData)}
                defaultButtonText="Select State"
                value={details.state}
                onSelect={(selectedItem) => {
                  setDetails({ ...details, state: selectedItem });
                }}
              />

              {/* City Selection */}
              <SelectDropdown
                buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
                buttonTextStyle={{
                  textAlign: "left",
                  color: "#9B9B9B",
                  fontSize: 16,
                }}
                data={statesData[details.state] || []}
                defaultButtonText="Select City"
                onSelect={(selectedItem) => {
                  setDetails({ ...details, city: selectedItem });
                }}
              />

              {/* Pincode */}
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Pincode"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={details.pincode}
                maxLength={6}
                onChangeText={(text) =>
                  setDetails({ ...details, pincode: text })
                }
              />

              {/* Submit Button */}
              <FormButton onPress={handleSubmit}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  {loadingInBtn ? (
                    <ActivityIndicator color={"white"} />
                  ) : (
                    "Submit"
                  )}
                </Text>
              </FormButton>
            </FormSection>
          </MainContainer>
          </ScrollView>
        </KeyboardAvoidingView>
      </Provider>
    </SafeArea>
  );
}
