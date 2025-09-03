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
} from "react-native";
import { IconButton, Provider } from "react-native-paper";
import { SafeArea } from "../../components/utility/safe-area.component";
import Theme from "../../styles/theme";
import {
  FormButton,
  FormSection,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { en, registerTranslation } from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import { RowBetween } from "../../styles/common.styles";

import { setLoadingInBtn } from "../../store/user";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../B2C/B2CAPI";
import { useTranslation } from "react-i18next";
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
});
export default function EditUserProfile({ navigation, route }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const { t } = useTranslation();
  const { userData, user, fetchUser, userId } = route.params;

  const [firstName, setFirstName] = useState(userData.user.firstName);
  const [lastName, setLastName] = useState(userData.user.lastName);
  const [email, setEmail] = useState(userData.user.email);
  const [phone, setPhone] = useState(userData.user.phone);
  const [address, setAddress] = useState(userData.user.address);
  const [selectedImage, setSelectedImage] = useState({
    uri: userData.user.image ? `${userData.user.image}` : null,
  });

  const { loadingInBtn } = useSelector((state) => state.user);

  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      crop: true,
    });

    if (result.canceled === true) return;
    setSelectedImage(result.assets[0]);
  };

  const userType = useSelector((state) => state.user.user.userType);
  const heading = t("edit_profile");

  const handleSubmit = async () => {
    updateUserProfile({
      firstName,
      lastName,
      email,
      phone: phone,
      address,
      selectedImage,
      userId,
      dispatch,
      setLoadingInBtn, 
      fetchUser,
      navigation,
    });
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
                {heading}
              </Text>
            </View>
          </RowBetween>
          <View
            style={{ paddingBottom: 56, flex: 1 }}
          >
            {selectedImage.uri ? (
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
                  source={{ uri: selectedImage.uri }}
                />
                <TouchableOpacity onPress={_pickDocument}>
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
                <Icon name="plus" size={35} color={Theme.themeColor} />
              </AddProfileBox>
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
                placeholder="Email Id *"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
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
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={styles.input}
                placeholder="Phone Number*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
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

// export default function EditUserProfile({ navigation, route }) {
//   registerTranslation("en", en);
//   const dispatch = useDispatch();

//   const token = useSelector((state) => state.user.token);
//   const { userData, user, fetchUser, userId } = route.params;
// console.log("user: ", userData);

//   const [firstName, setFirstName] = useState(userData.user.firstName);
//   const [lastName, setLastName] = useState(userData.user.lastName);
//   const [email, setEmail] = useState(userData.user.email);
//   const [phone, setPhone] = useState(userData.user.phone);
//   const [address, setAddress] = useState(userData.user.address);
//   const [selectedImage, setSelectedImage] = useState({
//     uri: userData.user.image ? `${userData.user.image}` : null,
//   });

//   const { loadingInBtn } = useSelector((state) => state.user);

//   const _pickDocument = async () => {
//     // let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     // if (permissions.granted === false) {
//     //   alert("Permission is required");
//     //   return;
//     // }

//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//       crop: true,
//     });

//     if (result.canceled === true) return;
//     setSelectedImage(result.assets[0]);
//   };

//   const _pickDocumentAlt = async () => {
//     let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (permissions.granted === false) {
//       alert("Permission is required");
//       return;
//     }
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//       crop: true,
//     });

//     if (result.canceled === true) return;
//     setSelectedImage(result);
//   };

//   const userType = useSelector((state) => state.user.user.userType);
//   const heading = "Edit Profile";


  
//   const handleSubmit = async () => {
//     updateUserProfile({
//       firstName,
//       lastName,
//       email,
//       contactInfo: phone,
//       address,
//       selectedImage,
//       userId,
//       dispatch,
//       setLoadingInBtn, 
//       fetchUser,
//       navigation,
//     });
//   };

//   return (
//     <SafeArea>
//       <Provider>
//         <ScrollView>
//           <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
//             <View style={{ alignItems: "center", flexDirection: "row" }}>
//               <IconButton
//                 icon="arrow-left"
//                 size={28}
//                 onPress={() => navigation.goBack()}
//               />
//               <Text
//                 style={{
//                   fontSize: 20,
//                   fontWeight: "bold",
//                   color: "#000",
//                   letterSpacing: 0.5,
//                 }}
//               >
//                 {heading}
//               </Text>
//             </View>
//           </RowBetween>
//           <MainContainer
//             style={{ paddingBottom: 56 }}
//             keyboardDismissMode="on-drag"
//             keyboardShouldPersistTaps="handled"
//             contentInsetAdjustmentBehavior="always"
//           >
//             {selectedImage.uri ? (
//               <View
//                 style={{
//                   width: 120,
//                   height: 120,
//                   borderRadius: 60,
//                   backgroundColor: "red",
//                   marginTop: "10%",
//                   alignSelf: "center",
//                 }}
//               >
//                 <Image
//                   style={styles.logo}
//                   source={{ uri: selectedImage.uri }}
//                 />
//                 <TouchableOpacity onPress={_pickDocument}>
//                   <View
//                     style={{
//                       position: "absolute",
//                       right: 0,
//                       bottom: 0,

//                       backgroundColor: "lightgrey",
//                       display: "flex",
//                       flex: 1,
//                       alignItems: "center",
//                       justifyContent: "center",
//                       // width: 20,
//                       // height: 20,
//                       borderRadius: 60,
//                       padding: 8,
//                     }}
//                   >
//                     <Image
//                       source={require("../../assets/images/matrimony/camera.png")}
//                       style={{ width: 15, height: 15 }}
//                     />
//                   </View>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <AddProfileBox
//                 onPress={_pickDocument}
//                 style={{ ...styles.logo, marginTop: "10%" }}
//               >
//                 <Icon name="plus" size={35} color={Theme.themeColor} />
//               </AddProfileBox>
//             )}
//             <FormSection style={{ paddingTop: 0 }}>
//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="First Name *"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={firstName}
//                 onChangeText={setFirstName}
//               />

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Last Name *"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={lastName}
//                 onChangeText={setLastName}
//               />

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Email Id *"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 value={email}
//                 onChangeText={setEmail}
//               />
//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={styles.input}
//                 placeholder="Address *"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 autoCapitalize="none"
//                 value={address}
//                 onChangeText={setAddress}
//               />
//               <LoginInputField
//                selectionColor={Theme.themeColor}

//                  activeUnderlineColor={Theme.themeColor}

//                 style={styles.input}
//                 placeholder="Phone Number*"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 keyboardType="numeric"
//                 maxLength={10}
//                 value={phone}
//                 onChangeText={setPhone}
//               />

//               <FormButton onPress={handleSubmit}>
//                 <Text
//                   style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
//                 >
//                   {loadingInBtn === true ? (
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
//                     "Update Profile"
//                   )}
//                 </Text>
//               </FormButton>
//             </FormSection>
//           </MainContainer>
//         </ScrollView>
//       </Provider>
//     </SafeArea>
//   );
// }

