import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Theme from "../../styles/theme";
import { ActivityIndicator, IconButton, Provider } from "react-native-paper";
import {
  FormButton,
  FormSection,
  MainContainer,
  Row,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import { SafeArea } from "../../components/utility/safe-area.component";
import SelectDropdown from "react-native-select-dropdown";
import { useDispatch } from "react-redux";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import { useIsFocused } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker";
import { en, registerTranslation } from "react-native-paper-dates";
import { statesData } from "../../assets/data/statesAndCities";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "react-query";
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";

import { BASEAPIURL } from "../../infrastructure/constants";
import apiClient from "../../store/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function EditMember({ route, navigation }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();

  const { member, templeinfo } = route.params;
  console.log("Mem: ", member);
  const token = useSelector((state) => state.user.token);

  const [selectedImage, setSelectedImage] = useState({
    uri: member.profileImage ? `${member.profileImage}` : null,
  });

  const { loadingInBtn } = useSelector((state) => state.user);
  const isFocused = useIsFocused();

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
  const [modifiedDetails, setModifiedDetails] = useState({
    name: member.name,
    location: member.location,
    designation: member.designation,
    email: member.email,
    phone: member.phone,
    description: member.description,
  });
  console.log("modified details", modifiedDetails);

  // const handleUpdate = async () => {
  //   await dispatch(setLoadingInBtn(true));

  //   try {
  //     const formData = new FormData();

  //     // Append modified details
  //     Object.keys(modifiedDetails).forEach((key) => {
  //       if (modifiedDetails[key] !== member[key]) {
  //         formData.append(key, modifiedDetails[key]);
  //       }
  //     });

  //     // Append existing images without base URL
  //     if (selectedImage && selectedImage.uri) {
  //       let localUri = selectedImage.uri;
  //       let filename = localUri.split("/").pop();

  //       let match = /\.(\w+)$/.exec(filename);
  //       let type = match ? `image/${match[1]}` : `image`;

  //       formData.append("profileImage", {
  //         uri: localUri,
  //         name: filename,
  //         type,
  //       });
  //     }
  //     console.log("formdata--", formData);

  //     const response = await fetch(
  //       `${BASEAPIURL}/temple/${templeinfo._id}/members/${member._id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: formData,
  //       }
  //     );
  //     await dispatch(setLoadingInBtn(false));

  //     console.log("response--", response);

  //     if (!response.ok) {
  //       throw new Error("Failed to update member");
  //     }

  //     alert("member updated successfully");
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Error updating member:", error);
  //   }
  // };

  const handleUpdate = async () => {
    await dispatch(setLoadingInBtn(true));
  const token = AsyncStorage.getItem("token");
    try {
      const formData = new FormData();
  
      // Append modified details
      Object.keys(modifiedDetails).forEach((key) => {
        if (modifiedDetails[key] !== member[key]) {
          formData.append(key, modifiedDetails[key]);
        }
      });
  
      // Append selected image if available
      if (selectedImage && selectedImage.uri) {
        let localUri = selectedImage.uri;
        let filename = localUri.split("/").pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
  
        formData.append("profileImage", {
          uri: localUri,
          name: filename,
          type,
        });
      }
  
      console.log("formdata--", formData);
  
      const response = await apiClient.put(
        `/temple/${templeinfo._id}/members/${member._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      await dispatch(setLoadingInBtn(false));
      console.log("response--", response);
  
      if (!response || response.status !== 200) {
        throw new Error("Failed to update member");
      }
  
      alert("Member updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };
  const CategoryData = ["gold", "silver", "diamond"];
  const ConditionData = ["old", "new"];

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
                Edit Member
              </Text>
            </View>
          </RowBetween>
          <MainContainer
            style={{ paddingBottom: 56 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
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
                <Icon name="plus" size={35} color={Theme.themeColor} />
              </AddProfileBox>
            )}
            <FormSection style={{ paddingTop: 0 }}>
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 30,
                }}
              >
                Member Name
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Name"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.name}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, name: text })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Member Description
              </Text>

              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor={Theme.themeColor}
                placeholder="Member Description*"
                activeUnderlineColor={Theme.themeColor}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.description}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, description: text })
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

              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Email
              </Text>
              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Email"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.email}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, email: text })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Designation
              </Text>

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Phone Number"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={modifiedDetails.designation}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, designation: text })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Phone Number
              </Text>

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Phone Number"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                value={modifiedDetails.phone}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, phone: text })
                }
              />
              <Text
                style={{
                  fontSize: 16,
                  marginLeft: 4,
                  color: "grey",
                  fontWeight: "600",
                  marginTop: 20,
                }}
              >
                Address
              </Text>

              <LoginInputField
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Address"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={modifiedDetails.location}
                onChangeText={(text) =>
                  setModifiedDetails({ ...modifiedDetails, location: text })
                }
              />

              <FormButton onPress={handleUpdate}>
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




// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import {
//   Image,
//   StyleSheet,
//   Text,
//   ScrollView,
//   View,
//   TouchableOpacity,
//   TextInput,
// } from "react-native";
// import Theme from "../../styles/theme";
// import { ActivityIndicator, IconButton, Provider } from "react-native-paper";
// import {
//   FormButton,
//   FormSection,
//   MainContainer,
//   Row,
//   LoginInputField,
//   AddProfileBox,
// } from "../../styles/prelogin.styles";
// import { SafeArea } from "../../components/utility/safe-area.component";
// import SelectDropdown from "react-native-select-dropdown";
// import { useDispatch } from "react-redux";
// import { ErrorToggle, setLoadingInBtn } from "../../store/user";
// import { useIsFocused } from "@react-navigation/native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // import DatePicker from "react-native-datepicker";
// import { en, registerTranslation } from "react-native-paper-dates";
// import { statesData } from "../../assets/data/statesAndCities";
// import * as ImagePicker from "expo-image-picker";
// import { useMutation, useQueryClient } from "react-query";
// import { RowBetween } from "../../styles/common.styles";
// import FormData from "form-data";

// import { BASEAPIURL } from "../../infrastructure/constants";
// import apiClient from "../../store/apiClient";
// const styles = StyleSheet.create({
//   logo: {
//     alignSelf: "center",
//     // marginTop: "10%",
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//   },
//   input: {
//     marginTop: 24,
//     backgroundColor: "#F0F0F0",
//     borderColor: "#E6E6E6",
//     borderRadius: 4,
//   },
//   profileImg: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 12,
//     resizeMode: "cover",
//     marginBottom: 24,
//   },
//   dateView: {
//     marginTop: 24,
//     backgroundColor: "#f0f0f0",
//     borderColor: "#e6e6e6",
//     borderRadius: 4,
//     height: 50,
//     textTransform: "capitalize",
//     width: "100%",
//     // color:"black"
//     fontSize: 18,
//   },
// });

// export default function EditMember({ route, navigation }) {
//   registerTranslation("en", en);
//   const dispatch = useDispatch();

//   const { member, templeinfo } = route.params;
//   console.log("Mem: ", member);
//   const token = useSelector((state) => state.user.token);

//   const [selectedImage, setSelectedImage] = useState({
//     uri: member.profileImage ? `${member.profileImage}` : null,
//   });

//   const { loadingInBtn } = useSelector((state) => state.user);
//   const isFocused = useIsFocused();

//   const _pickDocument = async () => {
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
//   const [modifiedDetails, setModifiedDetails] = useState({
//     name: member.name,
//     location: member.location,
//     designation: member.designation,
//     email: member.email,
//     phone: member.phone,
//     description: member.description,
//   });
//   console.log("modified details", modifiedDetails);

//   // const handleUpdate = async () => {
//   //   await dispatch(setLoadingInBtn(true));

//   //   try {
//   //     const formData = new FormData();

//   //     // Append modified details
//   //     Object.keys(modifiedDetails).forEach((key) => {
//   //       if (modifiedDetails[key] !== member[key]) {
//   //         formData.append(key, modifiedDetails[key]);
//   //       }
//   //     });

//   //     // Append existing images without base URL
//   //     if (selectedImage && selectedImage.uri) {
//   //       let localUri = selectedImage.uri;
//   //       let filename = localUri.split("/").pop();

//   //       let match = /\.(\w+)$/.exec(filename);
//   //       let type = match ? `image/${match[1]}` : `image`;

//   //       formData.append("profileImage", {
//   //         uri: localUri,
//   //         name: filename,
//   //         type,
//   //       });
//   //     }
//   //     console.log("formdata--", formData);

//   //     const response = await fetch(
//   //       `${BASEAPIURL}/temple/${templeinfo._id}/members/${member._id}`,
//   //       {
//   //         method: "PUT",
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //         body: formData,
//   //       }
//   //     );
//   //     await dispatch(setLoadingInBtn(false));

//   //     console.log("response--", response);

//   //     if (!response.ok) {
//   //       throw new Error("Failed to update member");
//   //     }

//   //     alert("member updated successfully");
//   //     navigation.goBack();
//   //   } catch (error) {
//   //     console.error("Error updating member:", error);
//   //   }
//   // };

//   const handleUpdate = async () => {
//     await dispatch(setLoadingInBtn(true));
  
//     try {
//       const formData = new FormData();
  
//       // Append modified details
//       Object.keys(modifiedDetails).forEach((key) => {
//         if (modifiedDetails[key] !== member[key]) {
//           formData.append(key, modifiedDetails[key]);
//         }
//       });
  
//       // Append selected image if available
//       if (selectedImage && selectedImage.uri) {
//         let localUri = selectedImage.uri;
//         let filename = localUri.split("/").pop();
//         let match = /\.(\w+)$/.exec(filename);
//         let type = match ? `image/${match[1]}` : `image`;
  
//         formData.append("profileImage", {
//           uri: localUri,
//           name: filename,
//           type,
//         });
//       }
  
//       console.log("formdata--", formData);
  
//       const response = await apiClient.put(
//         `/temple/${templeinfo._id}/members/${member._id}`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
  
//       await dispatch(setLoadingInBtn(false));
//       console.log("response--", response);
  
//       if (!response || response.status !== 200) {
//         throw new Error("Failed to update member");
//       }
  
//       alert("Member updated successfully");
//       navigation.goBack();
//     } catch (error) {
//       console.error("Error updating member:", error);
//     }
//   };
//   const CategoryData = ["gold", "silver", "diamond"];
//   const ConditionData = ["old", "new"];

//   return (
//     <SafeArea>
//       <Provider>
//         <ScrollView showsVerticalScrollIndicator={false}>
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
//                   fontWeight: "500",
//                   color: "#000",
//                 }}
//               >
//                 Edit Member
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
//               <Text
//                 style={{
//                   fontSize: 16,
//                   marginLeft: 4,
//                   color: "grey",
//                   fontWeight: "600",
//                   marginTop: 30,
//                 }}
//               >
//                 Member Name
//               </Text>
//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={[styles.input, { marginTop: 5 }]}
//                 placeholder="Name"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={modifiedDetails.name}
//                 onChangeText={(text) =>
//                   setModifiedDetails({ ...modifiedDetails, name: text })
//                 }
//               />
//               <Text
//                 style={{
//                   fontSize: 16,
//                   marginLeft: 4,
//                   color: "grey",
//                   fontWeight: "600",
//                   marginTop: 20,
//                 }}
//               >
//                 Member Description
//               </Text>

//               <TextInput
//                 multiline={true}
//                 numberOfLines={4}
//                 selectionColor={Theme.themeColor}
//                 placeholder="Member Description*"
//                 activeUnderlineColor={Theme.themeColor}
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={modifiedDetails.description}
//                 onChangeText={(text) =>
//                   setModifiedDetails({ ...modifiedDetails, description: text })
//                 }
//                 style={[
//                   styles.input,
//                   {
//                     padding: 15,
//                     borderRadius: 5,
//                     fontSize: 16,
//                     height: 100,
//                     color: "black",
//                     fontWeight: "400",
//                     backgroundColor: "#F0F0F0",
//                     marginTop: 20,
//                     paddingTop: 15,
//                     borderColor: "#e6e6e6",
//                     textTransform: "capitalize",
//                   },
//                 ]}
//               />

//               <Text
//                 style={{
//                   fontSize: 16,
//                   marginLeft: 4,
//                   color: "grey",
//                   fontWeight: "600",
//                   marginTop: 20,
//                 }}
//               >
//                 Email
//               </Text>
//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={[styles.input, { marginTop: 5 }]}
//                 placeholder="Email"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={modifiedDetails.email}
//                 onChangeText={(text) =>
//                   setModifiedDetails({ ...modifiedDetails, email: text })
//                 }
//               />
//               <Text
//                 style={{
//                   fontSize: 16,
//                   marginLeft: 4,
//                   color: "grey",
//                   fontWeight: "600",
//                   marginTop: 20,
//                 }}
//               >
//                 Designation
//               </Text>

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={[styles.input, { marginTop: 5 }]}
//                 placeholder="Phone Number"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 keyboardType="numeric"
//                 value={modifiedDetails.designation}
//                 onChangeText={(text) =>
//                   setModifiedDetails({ ...modifiedDetails, designation: text })
//                 }
//               />
//               <Text
//                 style={{
//                   fontSize: 16,
//                   marginLeft: 4,
//                   color: "grey",
//                   fontWeight: "600",
//                   marginTop: 20,
//                 }}
//               >
//                 Phone Number
//               </Text>

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={[styles.input, { marginTop: 5 }]}
//                 placeholder="Phone Number"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 keyboardType="numeric"
//                 value={modifiedDetails.phone}
//                 onChangeText={(text) =>
//                   setModifiedDetails({ ...modifiedDetails, phone: text })
//                 }
//               />
//               <Text
//                 style={{
//                   fontSize: 16,
//                   marginLeft: 4,
//                   color: "grey",
//                   fontWeight: "600",
//                   marginTop: 20,
//                 }}
//               >
//                 Address
//               </Text>

//               <LoginInputField
//                 selectionColor={Theme.themeColor}
//                 activeUnderlineColor={Theme.themeColor}
//                 style={[styles.input, { marginTop: 5 }]}
//                 placeholder="Address"
//                 underlineColor="transparent"
//                 placeholderTextColor="#9B9B9B"
//                 value={modifiedDetails.location}
//                 onChangeText={(text) =>
//                   setModifiedDetails({ ...modifiedDetails, location: text })
//                 }
//               />

//               <FormButton onPress={handleUpdate}>
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
//                     "Submit"
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
