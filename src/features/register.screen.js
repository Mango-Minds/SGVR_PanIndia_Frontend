import React, { useState } from "react";
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
import Theme from "../styles/theme";
import {
  BottomText,
  ForgotText,
  FormButton,
  FormSection,
  FormSectionTitle,
  MenuLead,
  Row,
  LoginInputField,
} from "../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ErrorToggle, setLoadingInBtn, signup } from "../store/user";
import { statesData } from "../assets/data/statesAndCities";
import { parseInt } from "lodash";
const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginTop: "20%",
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
export default function RegisterScreen({ navigation }) {
  const { loadingInBtn } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [hidePass, setHidePass] = useState(true);

  const [registerDetails, setRegisterDetails] = useState({
    firstName: "",

    lastName: "",

    email: "",
    phone: "",
    password: "",

    gender: "",    
  state: "",
  city: "",       
  pincode: "",    
  address: "", 
  });

  const handleShowPassword = () => {
    setHidePass((prevState) => !prevState);
  };

  const handleSignup = async () => {
    if (registerDetails.email === "" || registerDetails.password === "") {
      await dispatch(
        ErrorToggle({
          toggle: true,
          msg: "Enter all fields",
          type: "error",
        })
      );
      return;
    }

    console.log(date, "date");
    console.log({ ...registerDetails, dob: year + "-" + month + "-" + date });
    await dispatch(setLoadingInBtn(true));
    const data = await dispatch(
      signup({
        ...registerDetails,
        // dob: year + "-" + month + "-" + date,
      })
    );
    if (data.status === 0) {
      setRegisterDetails({
        firstName: "",
        midname: "",
        lastName: "",
        username: "",
        email: "",

        password: "",
      });
      // Navigate to login page instead of OTP verification
      navigation.navigate("Login");
    }
    await dispatch(setLoadingInBtn(false));
  };

  const [date, setDate] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [year, setYear] = React.useState("");

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
            <View style={{ flex: 1, justifyContent: "center" }}>
            <Image
              style={styles.logo}
              source={require("../assets/images/pre-login/miLogo-small.png")}
            />


            <FormSection>
              <FormSectionTitle>Signup</FormSectionTitle>

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Username*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.username}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, username: text })
                }
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="First Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.firstName}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, firstName: text })
                }
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Middle Name"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.midname}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, midname: text })
                }
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Last Name*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.lastName}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, lastName: text })
                }
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Email*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.email}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, email: text })
                }
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <View style={{ position: "relative" }}>
                <LoginInputField
                  placeholderTextColor="#9B9B9B"
                  underlineColor="transparent"
                  placeholder="Password*"
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  value={registerDetails.password}
                  secureTextEntry={hidePass ? true : false}
                  onChangeText={(text) =>
                    setRegisterDetails({ ...registerDetails, password: text })
                  }
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
                <View
                  style={{
                    position: "absolute",
                    top: "51%",
                    right: "5%",
                    elevation: 3,
                  }}
                >
                  <TouchableOpacity onPress={handleShowPassword}>
                    {!hidePass ? (
                      <Icon name="eye-outline" size={20} />
                    ) : (
                      <Icon name="eye-off-outline" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <FormButton onPress={handleSignup}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  {loadingInBtn ? (
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
                    "Sign up"
                  )}
                </Text>
              </FormButton>
            </FormSection>

            <BottomText>
              Already have an account?{" "}
              <ForgotText
                style={{ color: "#4191DF", fontSize: 13 }}
                onPress={() => navigation.navigate("Login")}
              >
                Signin
              </ForgotText>
            </BottomText>
            <BottomText>
              Having trouble while Signup ?{" "}
              <ForgotText
                style={{ color: "#4191DF", fontSize: 13 }}
                onPress={() => navigation.navigate("Contactus")}
              >
                Contact Us
              </ForgotText>
            </BottomText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Provider>
    </SafeArea>
  );
}








// import React, { useState } from "react";
// import {
//   Image,
//   StyleSheet,
//   Text,
//   Platform,
//   ScrollView,
//   View,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   ActivityIndicator,
//   Pressable,
// } from "react-native";
// import { Divider, Menu, Provider, RadioButton } from "react-native-paper";
// import { SafeArea } from "../components/utility/safe-area.component";
// import { useSelector, useDispatch } from "react-redux";
// import SelectDropdown from "react-native-select-dropdown";
// import Theme from "../styles/theme";

// import {
//   BottomText,
//   ForgotText,
//   FormButton,
//   FormSection,
//   FormSectionTitle,
//   MainContainer,
//   MenuLead,
//   Row,
//   LoginInputField,
// } from "../styles/prelogin.styles";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { ErrorToggle, setLoadingInBtn, signup } from "../store/user";
// import { statesData } from "../assets/data/statesAndCities";
// import { parseInt } from "lodash";

// const styles = StyleSheet.create({
//   logo: {
//     alignSelf: "center",
//     marginTop: "10%",
//   },
//   input: {
//     marginTop: 24,
//     backgroundColor: "#F0F0F0",
//     borderColor: "#E6E6E6",
//     borderRadius: 4,
//   },
//   radioContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 12, // Space between options
//   },
//   radioText: {
//     color: "#9b9b9b",
//     fontSize: 14,
//   },
// });
// export default function RegisterScreen({ navigation }) {
//   const { loadingInBtn } = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const [open, setOpen] = useState(false);
//   const userTypeData = ["shop", "vendor", "worker"];
//   const [hidePass, setHidePass] = useState(true);
//   const [selectGender, setSelectGender] = useState("Male");
//   const [registerDetails, setRegisterDetails] = useState({
//     firstName: "",
//     // midname: "",
//     lastName: "",
//     // username: "",
//     email: "",
//     phone: "",
//     password: "",
//     // suggestedBy: "",
//     dob: "",
//     gender: selectGender,
//     address: "",
//     state: "",
//     pincode: "",
//     city: "",
//     userType: "",
//   });
//   const [selectDOB, setSelectedDOB] = useState("");
//   const [showdob, setShowdob] = useState(false);
//   const handleShowPassword = () => {
//     setHidePass((prevState) => !prevState);
//   };

//   const handleSignup = async () => {
//     // let yearInNumber = parseInt(year);
//     // console.log(yearInNumber);
//     // if (yearInNumber < 1900 || yearInNumber > 2100) {
//     //   await dispatch(
//     //     ErrorToggle({
//     //       toggle: true,
//     //       msg: "Enter a valid Birth year",
//     //       type: "error",
//     //     })
//     //   );
//     //   return;
//     // }
//     if (
//       // registerDetails.firstName === "" ||
//       // registerDetails.lastName === "" ||
//       // registerDetails.username === "" ||
//       registerDetails.email === "" ||
//       // registerDetails.phone === "" ||
//       registerDetails.password === ""
//       // registerDetails.userType === "" ||
//       // registerDetails.suggestedBy === "" ||
//       // registerDetails.dob === "" ||
//       // registerDetails.gender === "" ||
//       // registerDetails.address === "" ||
//       // registerDetails.state === "" ||
//       // registerDetails.pincode === "" ||
//       // registerDetails.city === "" ||
//       // date === "" ||
//       // year === "" ||
//       // month === ""
//     ) {
//       await dispatch(
//         ErrorToggle({
//           toggle: true,
//           msg: "Enter all fields",
//           type: "error",
//         })
//       );
//       return;
//     }

//     console.log(date, "date");
//     // console.log({ ...registerDetails, dob: year + "-" + month + "-" + date });
//     await dispatch(setLoadingInBtn(true));
//     const data = await dispatch(
//       signup({
//         ...registerDetails,
//         // dob: year + "-" + month + "-" + date,
//       })
//     );
//     if (data.status === 0) {
//       setRegisterDetails({
//         firstName: "",
//         midname: "",
//         lastName: "",
//         username: "",
//         email: "",
//         phone: "",
//         password: "",
//         suggestedBy: "",
//         dob: "",
//         gender: "Male",
//         address: "",
//         state: "",
//         pincode: "",
//         city: "",
//         userType: "",
//       });
//       navigation.navigate("Verify", {
//         phone: registerDetails.phone,
//         password: registerDetails.password,
//         id: data.data.id,
//         type: "register",
//       });
//     }
//     await dispatch(setLoadingInBtn(false));
//   };

//   // const [date, setDate] = useState(new Date());
//   const [date, setDate] = React.useState("");
//   const [month, setMonth] = React.useState("");
//   const [year, setYear] = React.useState("");

//   const [selectedModule, setSelectedModule] = useState(null);

//   const userTypes = {
//     //Jewellery: ["Shop", "Vendor", "Worker", "Gemologist", "Jewelry Designer"],
//     Temple: ["Temple Admin", "Temple Shop", "Devotees", "Pandit"],
//     Matrimony: [
//       "Matrimony Man",
//       "Matrimony Woman",
//       "Matrimony Vendor",
//       "Planner",
//       "Decorator",
//       "Caterer",
//       "Venue",
//     ],
//   };

//   const userTypeMappings = {
//     // Shop: "shop",
//     // Vendor: "vendor",
//     // Worker: "worker",
//     // Gemologist: "gemologist",
//     // "Jewelry Designer": "jewelryDesigner",
//     "Temple Admin": "templeAdmin",
//     "Temple Shop": "templeShopOwner",
//     Devotees: "basicUser",
//     Pandit: "pandit",
//     "Matrimony Man": "matrimonyMan",
//     "Matrimony Woman": "matrimonyWoman",
//     "Matrimony Vendor": "matrimonyVendor",
//     Planner: "planner",
//     Decorator: "decorator",
//     Caterer: "caterer",
//     Venue: "venue",
//   };

//   return (
//     <SafeArea>
//       <Provider>
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <MainContainer style={{ paddingBottom: 10 }}>
//             <Image
//               style={styles.logo}
//               source={require("../assets/images/pre-login/miLogo-small.png")}
//             />

//             <FormSection>
//               <FormSectionTitle>Signup</FormSectionTitle>
//               {/* <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       enabled={true}

//       > */}
//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Username*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.username}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, username: text })
//                 }
//               />

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="First Name*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.firstName}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, firstName: text })
//                 }
//               />

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Middle Name"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.midname}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, midname: text })
//                 }
//               />

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Last Name*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.lastName}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, lastName: text })
//                 }
//               />
//               {/*       <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Phone Number*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 keyboardType="numeric"
//                 maxLength={10}
//                 value={registerDetails.phone}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, phone: text })
//                 }
//               />    */}

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Email*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.email}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, email: text })
//                 }
//                 autoCapitalize="none"
//               />

//               <SelectDropdown
//                 buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
//                 buttonTextStyle={{
//                   textAlign: "left",
//                   color: "#9B9B9B",
//                   fontSize: 16,
//                 }}
//                 data={Object.keys(userTypes)}
//                 defaultButtonText="Select Module"
//                 onSelect={(selectedItem) => {
//                   setSelectedModule(selectedItem);
//                   setRegisterDetails({ ...registerDetails, userType: "" }); // Reset userType when module changes
//                 }}
//               />

//               {selectedModule && (
//                 <SelectDropdown
//                   buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
//                   buttonTextStyle={{
//                     textAlign: "left",
//                     color: "#9B9B9B",
//                     fontSize: 16,
//                   }}
//                   data={userTypes[selectedModule]}
//                   defaultButtonText="Select User Type"
//                   value={registerDetails.userType}
//                   onSelect={(selectedItem) => {
//                     setRegisterDetails({
//                       ...registerDetails,
//                       userType: userTypeMappings[selectedItem],
//                     });
//                   }}
//                 />
//               )}

//               {/* 
//               <SelectDropdown
//                 buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
//                 buttonTextStyle={{
//                   textAlign: "left",
//                   color: "#9B9B9B",
//                   fontSize: 16,
//                 }}
//                 data={userTypeData}
//                 defaultButtonText="Select User Type"
//                 value={registerDetails.userType}
//                 onSelect={(selectedItem) => {
//                   setRegisterDetails({
//                     ...registerDetails,
//                     userType: selectedItem,
//                   });
//                 }}
//               /> */}

//               <View
//                 style={{
//                   flexDirection: "row",
//                   flexWrap: "wrap",
//                   alignItems: "center",
//                   marginTop: 8,
//                 }}
//               >
//                 <Text
//                   style={{
//                     color: Theme.themeColor,
//                     fontSize: 14,
//                     marginRight: 8,
//                   }}
//                 >
//                   I am*
//                 </Text>
//                 <RadioButton.Group
//                   onValueChange={(e) => {
//                     setSelectGender(e);
//                     setRegisterDetails({
//                       ...registerDetails,
//                       gender: e,
//                     });
//                   }}
//                   value={selectGender}
//                 >
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       flexWrap: "wrap",
//                       alignItems: "center",
//                     }}
//                   >
//                     <View style={styles.radioContainer}>
//                       <RadioButton.Android
//                         uncheckedColor={Theme.themeColor}
//                         color={Theme.themeColor}
//                         value="Male"
//                       />
//                       <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
//                         Male
//                       </Text>
//                     </View>
//                     <View style={styles.radioContainer}>
//                       <RadioButton.Android
//                         uncheckedColor={Theme.themeColor}
//                         color={Theme.themeColor}
//                         value="Female"
//                       />
//                       <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
//                         Female
//                       </Text>
//                     </View>
//                     <View style={styles.radioContainer}>
//                       <RadioButton.Android
//                         uncheckedColor={Theme.themeColor}
//                         color={Theme.themeColor}
//                         value="Female"
//                       />
//                       <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
//                         Prefer not to say
//                       </Text>
//                     </View>
//                   </View>
//                 </RadioButton.Group>
//               </View>

//               {/* <Text
//                 style={{
//                   fontSize: 18,
//                   fontWeight: "600",
//                   opacity: 0.35,
//                 }}
//               >
//                 Date of Birth :
//               </Text>

//               <View
//                 style={{
//                   flexDirection: "row",
//                 }}
//               >
//                 <LoginInputField
//                   maxLength={2}
//                   keyboardType="numeric"
//                   returnKeyType="done"
//                   selectionColor={Theme.themeColor}
//                   activeUnderlineColor={Theme.themeColor}
//                   style={[styles.input, { width: "28%", marginRight: "2%" }]}
//                   placeholder="DD"
//                   underlineColor="transparent"
//                   placeholderTextColor="#9B9B9B"
//                   value={date}
//                   onChangeText={(text) => {
//                     if (
//                       Number(text) > -1 &&
//                       Number(text) < 32 &&
//                       text !== "00"
//                     ) {
//                       setDate(text);
//                     } else {
//                       setDate("");
//                       dispatch(
//                         ErrorToggle({
//                           toggle: true,
//                           msg: "Enter valid date",
//                           type: "error",
//                         })
//                       );
//                     }
//                   }}
//                 />
//                 <LoginInputField
//                   keyboardType="numeric"
//                   returnKeyType="done"
//                   maxLength={2}
//                   selectionColor={Theme.themeColor}
//                   activeUnderlineColor={Theme.themeColor}
//                   style={[styles.input, { width: "28%", marginRight: "2%" }]}
//                   placeholder="MM"
//                   underlineColor="transparent"
//                   placeholderTextColor="#9B9B9B"
//                   value={month}
//                   onChangeText={(text) => {
//                     if (
//                       Number(text) > -1 &&
//                       Number(text) < 13 &&
//                       text !== "00"
//                     ) {
//                       setMonth(text);
//                     } else {
//                       setMonth("");
//                       dispatch(
//                         ErrorToggle({
//                           toggle: true,
//                           msg: "Enter valid month",
//                           type: "error",
//                         })
//                       );
//                     }
//                   }}
//                 />
//                 <LoginInputField
//                   keyboardType="numeric"
//                   returnKeyType="done"
//                   maxLength={4}
//                   selectionColor={Theme.themeColor}
//                   activeUnderlineColor={Theme.themeColor}
//                   style={[styles.input, { width: "38%", marginRight: "2%" }]}
//                   placeholder="YYYY"
//                   underlineColor="transparent"
//                   placeholderTextColor="#9B9B9B"
//                   value={year}
//                   onChangeText={(text) => {
//                     setYear(text);
//                   }}
//                 />
//               </View>

//               {/* <DatePicker
              
//                 style={{ width: "100%" }}
//                 mode="date"
//                 date={selectDOB}
//                 placeholder="Date of Birth"
//                 format="YYYY-MM-DD"
//                 maxDate={new Date()}
//                 showIcon={false}
//                 confirmBtnText="Confirm"
//                 cancelBtnText="Cancel"
//                 customStyles={{
//                   dateInput: {
//                     backgroundColor: "#F0F0F0",
//                     borderWidth: 0,
//                     height: 50,
//                   },
//                   placeholderText: {
//                     fontSize: 16,
//                     color: "#9B9B9B",
//                     alignSelf: "flex-start",
//                     marginLeft: 14,
//                   },
//                   dateText: {
//                     fontSize: 16,
//                     color: "#000",
//                     alignSelf: "flex-start",
//                     marginLeft: 14,
//                   },
//                   datePickerCon: {
//                     color: "black",
//                     backgroundColor: "white",
//                   },
//                 }}
//                 onDateChange={(e) => {
//                   setSelectedDOB(e);
//                   setRegisterDetails({ ...registerDetails, dob: e });
//                 }}
//               /> */}
//               {/*    <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Address"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.address}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, address: text })
//                 }
//               />

//               <SelectDropdown
//                 buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
//                 buttonTextStyle={{
//                   textAlign: "left",
//                   color: "#9B9B9B",
//                   fontSize: 16,
//                 }}
//                 data={Object.keys(statesData)}
//                 defaultButtonText="Select State"
//                 value={registerDetails.state}
//                 onSelect={(selectedItem) => {
//                   setRegisterDetails({
//                     ...registerDetails,
//                     state: selectedItem,
//                   });
//                 }}
//               />

//               <SelectDropdown
//                 buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
//                 buttonTextStyle={{
//                   textAlign: "left",
//                   color: "#9B9B9B",
//                   fontSize: 16,
//                 }}
//                 data={statesData[registerDetails.state] || []}
//                 defaultButtonText="Select cities"
//                 onSelect={(selectedItem) => {
//                   setRegisterDetails({
//                     ...registerDetails,
//                     city: selectedItem,
//                   });
//                 }}
//               />

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Pincode"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 keyboardType="numeric"
//                 value={registerDetails.pincode}
//                 maxLength={6}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, pincode: text })
//                 }
//               /> */}

//               <View style={{ position: "relative" }}>
//                 <LoginInputField
//                   placeholderTextColor="#9B9B9B"
//                   underlineColor="transparent"
//                   placeholder="Password*"
//                   selectionColor={Theme.themeColor}
//                   activeUnderlineColor={Theme.themeColor}
//                   value={registerDetails.password}
//                   secureTextEntry={hidePass ? true : false}
//                   onChangeText={(text) =>
//                     setRegisterDetails({ ...registerDetails, password: text })
//                   }
//                 />
//                 <View
//                   style={{
//                     position: "absolute",
//                     top: "51%",
//                     right: "5%",
//                     elevation: 3,
//                   }}
//                 >
//                   <TouchableOpacity onPress={handleShowPassword}>
//                     {!hidePass ? (
//                       <Icon name="eye-outline" size={20} />
//                     ) : (
//                       <Icon name="eye-off-outline" size={20} />
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Suggested By*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={registerDetails.suggestedBy}
//                 onChangeText={(text) =>
//                   setRegisterDetails({ ...registerDetails, suggestedBy: text })
//                 }
//               /> */}

//               {/* <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Reference Code"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 onChangeText={(text) =>
//                   setRegisterDetails({
//                     ...registerDetails,
//                     referenceCode: text,
//                   })
//                 }
//               /> */}
//               {/* </KeyboardAvoidingView> */}

//               <FormButton onPress={handleSignup}>
//                 <Text
//                   style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
//                 >
//                   {loadingInBtn ? (
//                     <ActivityIndicator
//                       style={{
//                         display: "flex",
//                         alignSelf: "center",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         flex: 1,
//                       }}
//                       // size={"large"}
//                       color={"white"}
//                     />
//                   ) : (
//                     "Sign up"
//                   )}
//                 </Text>
//               </FormButton>
//             </FormSection>

//             <BottomText>
//               Already have an account?{" "}
//               <ForgotText
//                 style={{ color: "#4191DF", fontSize: 13 }}
//                 onPress={() => navigation.navigate("Login")}
//               >
//                 Signin
//               </ForgotText>
//             </BottomText>
//             <BottomText>
//               Having trouble while Signup ?{" "}
//               <ForgotText
//                 style={{ color: "#4191DF", fontSize: 13 }}
//                 onPress={() => navigation.navigate("Contactus")}
//               >
//                 Contact Us
//               </ForgotText>
//             </BottomText>
//           </MainContainer>
//         </ScrollView>
//       </Provider>
//     </SafeArea>
//   );
// }
