import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import {
  IconButton,
  Provider,
  RadioButton,
  ActivityIndicator,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
  ScrollView,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
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
import { RowBetween } from "../../styles/common.styles";
import FormData from "form-data";
import {
  BASEIMGURL,
  BASEAPIURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import { en, registerTranslation } from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import { decode } from "base-64";

const MatrimonyProfileEdit = ({ route, navigation }) => {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  console.log(decodedPayload);
  const userId = decodedPayload.id;
  const [user, setUser] = useState({});
  const [userRoleData,setUserRoleData] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const { loadingInBtn } = useSelector((state) => state.user);
  const [hobby, setHobby] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi");
  const [languageProficiency, setLanguageProficiency] =
    useState("MotherTongue");

  // const [modifiedDetails, setModifiedDetails] = useState({
  //   name: userRoleData.name ?? null,
  //   gender: userRoleData.gender ?? null,
  //   images: [],
  //   aboutMe: userRoleData.aboutMe ?? null,
  //   salary: userRoleData.Annualincome.salary ?? null,
  //   annualincomeVisible: userRoleData.Annualincome.visible ?? null,
  //   casteType: userRoleData.caste.type ?? null,
  //   casteVisible: userRoleData.caste.visible ?? null,
  //   subcaste: userRoleData.subcaste ?? null,
  //   gothra: userRoleData.gothra ?? null,
  //   dosh: userRoleData.dosh ?? null,
  //   familyType: userRoleData.familyType ?? null,
  //   familyStatus: userRoleData.familyStatus ?? null,
  //   familyValues: userRoleData.familyValues ?? null,
  //   workLocation: userRoleData.workLocation ?? null,
  //   homeTown: userRoleData.homeTown ?? null,
  //   highestEducation: userRoleData.highestEducation ?? null,
  //   employedIn: userRoleData.employedIn ?? null,
  //   instagram: userRoleData.socials.instagram ?? null,
  //   linkedin: userRoleData.socials.linkedin ?? null,
  //   whatsapp: userRoleData.socials.whatsapp ?? null,
  //   socialsVisible: userRoleData.socials.Visible ?? null,
  //   occupation: userRoleData.occupation ?? null,
  //   occupationDescription: userRoleData.occupationDescription ?? null,
  //   hobbies: userRoleData.hobbies ?? null,
  //   languages: userRoleData.languages ?? null,
  //   height: userRoleData.height ?? null,
  //   bloodGroup: userRoleData.bloodGroup ?? null,
  //   maritalStatus: userRoleData.maritalStatus ?? null,
  //   dateOfBirth: userRoleData.dateOfBirth ?? null,
  // });


  const fetchUser = async (user_id) => {
    const url = `${BASEAPIURL}/user/${user_id}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("responseeee", response);
      if (response.ok) {
        const data = await response.json();
        console.log("user data:", data);

        setUser(data);
        setUserRoleData(data.roleData);
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user", error);
    } finally {
    }
  };

  // const extractDateParts = (dateString) => {
  //   // Check if dateString is valid (not null, undefined, or empty)
  //   if (!dateString) {
  //     console.error("Invalid date string");
  //     return;
  //   }

  //   useEffect(() => {
  //     fetchUser(userId);

      
  //     if (!dateString) {
  //       console.error("Invalid date string");
  //       return;
  //     }

  //     const date = new Date(dateString);

  //     if (isNaN(date.getTime())) {
  //       console.error("Invalid date format");
  //       return;
  //     }

  //     const extractedYear = date.getUTCFullYear(); // Get year
  //     const extractedMonth = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based, add 1
  //     const extractedDay = String(date.getUTCDate()).padStart(2, "0"); // Get day

  //     setYear(extractedYear);
  //     setMonth(extractedMonth);
  //     setDay(extractedDay);
  //   }, [dateString]);
  // };

  // extractDateParts(modifiedDetails?.dateOfBirth);

  // const addLanguage = () => {
  //   // Check if the language is already added
  //   const languageExists = modifiedDetails.languages?.some(
  //     (lang) => lang.language === selectedLanguage
  //   );

  //   if (!languageExists) {
  //     const newLanguage = { language: selectedLanguage, languageProficiency };
  //     const updatedLanguages = [
  //       ...(modifiedDetails.languages || []),
  //       newLanguage,
  //     ];
  //     setModifiedDetails({ ...modifiedDetails, languages: updatedLanguages });
  //   } else {
  //     alert("This language is already added.");
  //   }
  // };

  // const removeLanguage = (languageToRemove) => {
  //   const updatedLanguages = modifiedDetails.languages.filter(
  //     (lang) => lang.language !== languageToRemove.language
  //   );
  //   setModifiedDetails({ ...modifiedDetails, languages: updatedLanguages });
  // };

  // const addHobby = () => {
  //   if (hobby.trim() !== "") {
  //     // Add the new hobby to the hobbies array
  //     const updatedHobbies = [...(modifiedDetails.hobbies || []), hobby.trim()];
  //     setModifiedDetails({ ...modifiedDetails, hobbies: updatedHobbies });
  //     setHobby(""); // Clear the input field
  //   }
  // };

  // const removeHobby = (hobbyToRemove) => {
  //   const updatedHobbies = modifiedDetails.hobbies.filter(
  //     (hobby) => hobby !== hobbyToRemove
  //   );
  //   setModifiedDetails({ ...modifiedDetails, hobbies: updatedHobbies });
  // };

  // const _pickDocument = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   if (result.canceled) return;

  //   setUploadedImages((prev) => [...prev, result.assets[0]]);
  // };

  // const removeProfileImage = (index, isUploadedImage) => {
  //   if (isUploadedImage) {
  //     setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  //   } else {
  //     setSelectedImages(selectedImages.filter((_, i) => i !== index));
  //   }
  // };

  const handleUpdate = async () => {
    await dispatch(setLoadingInBtn(true));

    try {
      const response = await fetch(
        `${BASEAPIURL}/matrimony/matrimonyUser/edit/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: modifiedDetails,
        }
      );
      await dispatch(setLoadingInBtn(false));
      console.log("Response:", response);
      if (!response.ok) {
        throw new Error("Failed to update matrimony profile details");
      }
      alert("matrimony profile details updated successfully");
      navigation.goBack();
      setLoadingInBtn(false);
    } catch (error) {
      console.error("Error updating matrimony profile details:", error);
      setLoadingInBtn(false);
    }
  };
  return (
    // <SafeArea>
    //   <Provider>
    //     <ScrollView showsVerticalScrollIndicator={false}>
    //       <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
    //         <View style={{ alignItems: "center", flexDirection: "row" }}>
    //           <IconButton
    //             icon="arrow-left"
    //             size={28}
    //             onPress={() => navigation.goBack()}
    //           />
    //           <Text
    //             style={{
    //               fontSize: 20,
    //               fontWeight: "500",
    //               color: "#000",
    //             }}
    //           >
    //             Edit Matrimony Details
    //           </Text>
    //         </View>
    //       </RowBetween>
    //       <MainContainer
    //         style={{ paddingBottom: 56 }}
    //         keyboardDismissMode="on-drag"
    //         keyboardShouldPersistTaps="handled"
    //         contentInsetAdjustmentBehavior="always"
    //       >
    //         <Text
    //           style={{
    //             fontSize: 16,
    //             marginLeft: 24,
    //             color: "#000000",
    //             fontWeight: "600",
    //             marginTop: 20,
    //           }}
    //         >
    //           Edit Your Images
    //         </Text>
    //         <Row style={{ marginLeft: 24, flexWrap: "wrap" }}>
    //           {selectedImages.map((image, index) => (
    //             <View
    //               key={`selected-${index}`}
    //               style={{
    //                 width: 60,
    //                 height: 60,
    //                 borderRadius: 30,
    //                 backgroundColor: "red",
    //                 // marginTop: "10%",
    //                 marginRight: 12,
    //                 alignSelf: "center",
    //               }}
    //             >
    //               <Image style={styles.profileImg} source={{ uri: image }} />
    //               <TouchableOpacity
    //                 onPress={() => removeProfileImage(index, false)}
    //               >
    //                 <View
    //                   style={{
    //                     position: "absolute",
    //                     right: 3,
    //                     bottom: 22,
    //                   }}
    //                 >
    //                   <Image
    //                     source={require("../../assets/images/general/cross.png")}
    //                     style={{ width: 17, height: 17 }}
    //                   />
    //                 </View>
    //               </TouchableOpacity>
    //             </View>
    //           ))}
    //           {uploadedImages.map((image, index) => (
    //             <View
    //               key={`uploaded-${index}`}
    //               style={{
    //                 width: 60,
    //                 height: 60,
    //                 borderRadius: 30,
    //                 backgroundColor: "red",
    //                 // marginTop: "10%",
    //                 marginRight: 12,
    //                 alignSelf: "center",
    //               }}
    //             >
    //               <Image
    //                 style={styles.profileImg}
    //                 source={{ uri: image.uri }}
    //               />
    //               <TouchableOpacity
    //                 onPress={() => removeProfileImage(index, true)}
    //               >
    //                 <View
    //                   style={{
    //                     position: "absolute",
    //                     right: 3,
    //                     bottom: 22,
    //                   }}
    //                 >
    //                   <Image
    //                     source={require("../../assets/images/general/cross.png")}
    //                     style={{ width: 17, height: 17 }}
    //                   />
    //                 </View>
    //               </TouchableOpacity>
    //             </View>
    //           ))}
    //           {selectedImages.length + uploadedImages.length < 6 && (
    //             <AddProfileBox onPress={_pickDocument}>
    //               <Icon name="plus" size={35} color="#d4af37" />
    //             </AddProfileBox>
    //           )}
    //         </Row>
    //         <FormSection style={{ paddingTop: 0 }}>
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Name
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             placeholder="Name*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.name}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, name: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Gender
    //           </Text>
    //           <RadioButton.Group
    //             onValueChange={(value) =>
    //               setModifiedDetails({ ...modifiedDetails, gender: value })
    //             }
    //             value={modifiedDetails.gender} // This value will be either 'male' or 'female'
    //           >
    //             <View
    //               style={{
    //                 flexDirection: "row",
    //                 alignItems: "center",
    //                 marginTop: 10,
    //                 marginBottom: 15,
    //               }}
    //             >
    //               <RadioButton value="male" color="#d4af37" />
    //               <Text
    //                 style={{
    //                   marginRight: 10,
    //                   color: "grey",
    //                   fontWeight: "600",
    //                 }}
    //               >
    //                 Male
    //               </Text>

    //               <RadioButton value="female" color="#d4af37" />
    //               <Text style={{ color: "grey", fontWeight: "600" }}>
    //                 Female
    //               </Text>
    //             </View>
    //           </RadioButton.Group>
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //               // marginTop: 50,
    //             }}
    //           >
    //             About Me
    //           </Text>
    //           <LoginInputField
    //             multiline={true}
    //             numberOfLines={4}
    //             selectionColor="#d4af37"
    //             placeholder="About Me*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.aboutMe}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, aboutMe: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //               // marginTop: 50,
    //             }}
    //           >
    //             Annual Income
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Annual Income*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails?.salary ?? ""}
    //             onChangeText={(text) =>
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 salary: text ?? "",
    //               })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Do you want to display your Annual Income?
    //           </Text>
    //           <View
    //             style={{
    //               flexDirection: "row",
    //               marginTop: 10,
    //               marginBottom: 15,
    //             }}
    //           >
    //             {/* Yes box */}
    //             <TouchableOpacity
    //               onPress={() =>
    //                 setModifiedDetails({
    //                   ...modifiedDetails,
    //                   annualincomeVisible: true,
    //                 })
    //               }
    //               style={{
    //                 backgroundColor: modifiedDetails?.annualincomeVisible
    //                   ? "#d4af37"
    //                   : "#f0f0f0",
    //                 padding: 10,
    //                 borderRadius: 5,
    //                 marginRight: 10,
    //                 borderWidth: 1,
    //                 borderColor: modifiedDetails?.annualincomeVisible
    //                   ? "#d4af37"
    //                   : "#f0f0f0",
    //               }}
    //             >
    //               <Text
    //                 style={{
    //                   color: modifiedDetails?.annualincomeVisible
    //                     ? "#fff"
    //                     : "#000",
    //                 }}
    //               >
    //                 Yes
    //               </Text>
    //             </TouchableOpacity>

    //             {/* No box */}
    //             <TouchableOpacity
    //               onPress={() =>
    //                 setModifiedDetails({
    //                   ...modifiedDetails,
    //                   annualincomeVisible: false,
    //                 })
    //               }
    //               style={{
    //                 backgroundColor: !modifiedDetails?.annualincomeVisible
    //                   ? "#d4af37"
    //                   : "#f0f0f0",
    //                 padding: 10,
    //                 borderRadius: 5,
    //                 borderWidth: 1,
    //                 borderColor: !modifiedDetails?.annualincomeVisible
    //                   ? "#d4af37"
    //                   : "#f0f0f0",
    //               }}
    //             >
    //               <Text
    //                 style={{
    //                   color: !modifiedDetails?.annualincomeVisible
    //                     ? "#fff"
    //                     : "#000",
    //                 }}
    //               >
    //                 No
    //               </Text>
    //             </TouchableOpacity>
    //           </View>
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Caste
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Caste Name*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             // Handle null/undefined value for caste.name
    //             value={modifiedDetails?.casteType ?? ""}
    //             onChangeText={(text) =>
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 casteType: text ?? "",
    //               })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Do you want to display your caste?
    //           </Text>
    //           <View
    //             style={{
    //               flexDirection: "row",
    //               marginTop: 10,
    //               marginBottom: 15,
    //             }}
    //           >
    //             {/* Yes box */}
    //             <TouchableOpacity
    //               onPress={() =>
    //                 setModifiedDetails({
    //                   ...modifiedDetails,
    //                   casteVisible: true,
    //                 })
    //               }
    //               style={{
    //                 backgroundColor: modifiedDetails?.casteVisible
    //                   ? "#d4af37"
    //                   : "#f0f0f0",
    //                 padding: 10,
    //                 borderRadius: 5,
    //                 marginRight: 10,
    //                 borderWidth: 1,
    //                 borderColor: modifiedDetails?.casteVisible
    //                   ? "#d4af37"
    //                   : "#f0f0f0",
    //               }}
    //             >
    //               <Text
    //                 style={{
    //                   color: modifiedDetails?.casteVisible ? "#fff" : "#000",
    //                 }}
    //               >
    //                 Yes
    //               </Text>
    //             </TouchableOpacity>

    //             {/* No box */}
    //             <TouchableOpacity
    //               onPress={() =>
    //                 setModifiedDetails({
    //                   ...modifiedDetails,
    //                   casteVisible: false,
    //                 })
    //               }
    //               style={{
    //                 backgroundColor: !modifiedDetails?.casteVisible
    //                   ? "#d4af37"
    //                   : "#f0f0f0",
    //                 padding: 10,
    //                 borderRadius: 5,
    //                 borderWidth: 1,
    //                 borderColor: !modifiedDetails?.casteVisible
    //                   ? "#d4af37"
    //                   : "#f0f0f0",
    //               }}
    //             >
    //               <Text
    //                 style={{
    //                   color: !modifiedDetails?.casteVisible ? "#fff" : "#000",
    //                 }}
    //               >
    //                 No
    //               </Text>
    //             </TouchableOpacity>
    //           </View>
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Sub Caste
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             placeholder="Sub Caste*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.subcaste}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, subcaste: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Gothra
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             placeholder="Gothra*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.gothra}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, gothra: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //               // marginTop: 50,
    //             }}
    //           >
    //             Dosh
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Dosh*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.dosh}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, dosh: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Family Type
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             placeholder="Family Type*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.familyType}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, familyType: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //               // marginTop: 50,
    //             }}
    //           >
    //             Family Status
    //           </Text>
    //           <LoginInputField
    //             multiline={true}
    //             numberOfLines={4}
    //             selectionColor="#d4af37"
    //             placeholder="Family Status*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.familyStatus}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, familyStatus: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Family Values
    //           </Text>
    //           <LoginInputField
    //             multiline={true}
    //             numberOfLines={4}
    //             selectionColor="#d4af37"
    //             placeholder="Family Values*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.familyValues}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, familyValues: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Work Location
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             placeholder="Work Location*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.workLocation}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, workLocation: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Hometown
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             placeholder="Hometown*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.homeTown}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, homeTown: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Highest Education
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             placeholder="Highest Education*"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.highestEducation}
    //             onChangeText={(text) =>
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 highestEducation: text,
    //               })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //               // marginTop: 50,
    //             }}
    //           >
    //             Employed In
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Employed In*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.employedIn}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, employedIn: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Socials
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Instagram*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails?.instagram ?? ""}
    //             onChangeText={(text) =>
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 instagram: text ?? "",
    //               })
    //             }
    //           />
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="WhatsApp*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails?.whatsapp ?? ""}
    //             onChangeText={(text) =>
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 whatsapp: text ?? "",
    //               })
    //             }
    //           />
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Linkedin*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails?.linkedin ?? ""}
    //             onChangeText={(text) =>
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 linkedin: text ?? "",
    //               })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Do you want to display your Social Media Links?
    //           </Text>
    //           <View
    //             style={{
    //               flexDirection: "row",
    //               marginTop: 10,
    //               marginBottom: 15,
    //             }}
    //           >
    //             <TouchableOpacity
    //               onPress={() =>
    //                 setModifiedDetails({
    //                   ...modifiedDetails,
    //                   socialsVisible: true,
    //                 })
    //               }
    //               style={{
    //                 backgroundColor: modifiedDetails?.socialsVisible
    //                   ? "#d4af37"
    //                   : "#e0e0e0",
    //                 padding: 10,
    //                 borderRadius: 5,
    //                 marginRight: 10,
    //                 borderWidth: 1,
    //                 borderColor: modifiedDetails?.socialsVisible
    //                   ? "#d4af37"
    //                   : "#e0e0e0",
    //               }}
    //             >
    //               <Text
    //                 style={{
    //                   color: modifiedDetails?.socialsVisible ? "#fff" : "#000",
    //                 }}
    //               >
    //                 Yes
    //               </Text>
    //             </TouchableOpacity>
    //             <TouchableOpacity
    //               onPress={() =>
    //                 setModifiedDetails({
    //                   ...modifiedDetails,
    //                   socialsVisible: false,
    //                 })
    //               }
    //               style={{
    //                 backgroundColor: !modifiedDetails?.socialsVisible
    //                   ? "#d4af37"
    //                   : "#e0e0e0",
    //                 padding: 10,
    //                 borderRadius: 5,
    //                 borderWidth: 1,
    //                 borderColor: !modifiedDetails?.socialsVisible
    //                   ? "#d4af37"
    //                   : "#e0e0e0",
    //               }}
    //             >
    //               <Text
    //                 style={{
    //                   color: !modifiedDetails?.socialsVisible ? "#fff" : "#000",
    //                 }}
    //               >
    //                 No
    //               </Text>
    //             </TouchableOpacity>
    //           </View>
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //               // marginTop: 50,
    //             }}
    //           >
    //             Occupation
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Occupation*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.occupation}
    //             onChangeText={(text) =>
    //               setModifiedDetails({ ...modifiedDetails, occupation: text })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //               // marginTop: 50,
    //             }}
    //           >
    //             Occupation Description
    //           </Text>
    //           <LoginInputField
    //             multiline={true}
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Occupation Description*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.occupationDescription}
    //             onChangeText={(text) =>
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 occupationDescription: text,
    //               })
    //             }
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Hobbies
    //           </Text>
    //           <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
    //             <ScrollView style={{ maxHeight: 150, marginVertical: 10 }}>
    //               {modifiedDetails.hobbies?.map((hobby, index) => (
    //                 <View
    //                   key={index}
    //                   style={{
    //                     flexDirection: "row",
    //                     justifyContent: "space-between",
    //                     alignItems: "center",
    //                     padding: 10,
    //                     backgroundColor: "#f0f0f0",
    //                     marginBottom: 5,
    //                     borderRadius: 5,
    //                   }}
    //                 >
    //                   <Text style={{ color: "#000" }}>{hobby}</Text>
    //                   <TouchableOpacity onPress={() => removeHobby(hobby)}>
    //                     <Text style={{ color: "#d9534f" }}>Remove</Text>
    //                   </TouchableOpacity>
    //                 </View>
    //               ))}
    //             </ScrollView>
    //             <TextInput
    //               style={{
    //                 borderColor: "#d4af37",
    //                 borderWidth: 1,
    //                 borderRadius: 5,
    //                 padding: 10,
    //                 marginBottom: 10,
    //               }}
    //               placeholder="Add a new hobby*"
    //               value={hobby}
    //               onChangeText={setHobby}
    //             />
    //             <TouchableOpacity
    //               onPress={addHobby}
    //               style={{
    //                 backgroundColor: "#d4af37",
    //                 padding: 10,
    //                 borderRadius: 5,
    //                 alignItems: "center",
    //               }}
    //             >
    //               <Text style={{ color: "#fff" }}>Add Hobby</Text>
    //             </TouchableOpacity>
    //           </View>
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Languages
    //           </Text>
    //           <View style={{ padding: 20 }}>
    //             {/* Displaying current languages */}
    //             <ScrollView style={{ maxHeight: 150, marginVertical: 10 }}>
    //               {modifiedDetails.languages?.map((lang, index) => (
    //                 <View
    //                   key={index}
    //                   style={{
    //                     flexDirection: "row",
    //                     justifyContent: "space-between",
    //                     alignItems: "center",
    //                     padding: 10,
    //                     backgroundColor: "#f0f0f0",
    //                     marginBottom: 5,
    //                     borderRadius: 5,
    //                   }}
    //                 >
    //                   <Text style={{ color: "#000" }}>
    //                     {lang.language} ({lang.languageProficiency})
    //                   </Text>
    //                   <TouchableOpacity onPress={() => removeLanguage(lang)}>
    //                     <Text style={{ color: "#d9534f" }}>Remove</Text>
    //                   </TouchableOpacity>
    //                 </View>
    //               ))}
    //             </ScrollView>

    //             {/* Language selection */}
    //             <Picker
    //               selectedValue={selectedLanguage}
    //               style={{ height: 50, width: "100%", marginBottom: 10 }}
    //               onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
    //             >
    //               <Picker.Item label="Hindi" value="Hindi" />
    //               <Picker.Item label="Gujarati" value="Gujarati" />
    //               <Picker.Item label="Kannada" value="Kannada" />
    //               <Picker.Item label="Malayalam" value="Malayalam" />
    //               <Picker.Item label="Tamil" value="Tamil" />
    //               <Picker.Item label="Telugu" value="Telugu" />
    //             </Picker>

    //             {/* Language Proficiency selection */}
    //             <Picker
    //               selectedValue={languageProficiency}
    //               style={{ height: 50, width: "100%", marginBottom: 10 }}
    //               onValueChange={(itemValue) =>
    //                 setLanguageProficiency(itemValue)
    //               }
    //             >
    //               <Picker.Item label="Beginner" value="Beginner" />
    //               <Picker.Item label="Amateur" value="Amateur" />
    //               <Picker.Item label="Professional" value="Professional" />
    //               <Picker.Item label="MotherTongue" value="MotherTongue" />
    //             </Picker>

    //             {/* Button to add language */}
    //             <TouchableOpacity
    //               onPress={addLanguage}
    //               style={{
    //                 backgroundColor: "#d4af37",
    //                 padding: 10,
    //                 borderRadius: 5,
    //                 alignItems: "center",
    //               }}
    //             >
    //               <Text style={{ color: "#fff" }}>Add Language</Text>
    //             </TouchableOpacity>
    //           </View>
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Height (in cm)
    //           </Text>
    //           <LoginInputField
    //             keyboardType="numeric" // Ensures the numeric keyboard is shown
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Height*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.height?.toString() ?? ""} // Ensure it's a string for the input
    //             onChangeText={(text) => {
    //               const numericValue = text.replace(/[^0-9]/g, ""); // Allow only numbers
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 height: numericValue ? parseInt(numericValue, 10) : "", // Convert to number if not empty
    //               });
    //             }}
    //           />
    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //               // marginTop: 50,
    //             }}
    //           >
    //             Blood Group
    //           </Text>
    //           <LoginInputField
    //             selectionColor="#d4af37"
    //             activeUnderlineColor="#d4af37"
    //             style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
    //             placeholder="Blood Group*"
    //             underlineColor="transparent"
    //             placeholderTextColor="#9B9B9B"
    //             value={modifiedDetails.bloodGroup}
    //             onChangeText={(text) => {
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 bloodGroup: text.trim() || null,
    //               });
    //             }}
    //           />

    //           <Text
    //             style={{
    //               fontSize: 16,
    //               marginLeft: 4,
    //               color: "grey",
    //               fontWeight: "600",
    //             }}
    //           >
    //             Marital Status
    //           </Text>
    //           <RadioButton.Group
    //             onValueChange={(value) =>
    //               setModifiedDetails({
    //                 ...modifiedDetails,
    //                 maritalStatus: value,
    //               })
    //             }
    //             value={modifiedDetails.maritalStatus} // This value will be either 'male' or 'female'
    //           >
    //             <View
    //               style={{
    //                 flexDirection: "row",
    //                 alignItems: "center",
    //                 marginTop: 10,
    //                 marginBottom: 15,
    //               }}
    //             >
    //               <RadioButton value="Single" color="#d4af37" />
    //               <Text
    //                 style={{
    //                   marginRight: 10,
    //                   color: "grey",
    //                   fontWeight: "600",
    //                 }}
    //               >
    //                 Single
    //               </Text>

    //               <RadioButton value="Divorced" color="#d4af37" />
    //               <Text style={{ color: "grey", fontWeight: "600" }}>
    //                 Divorced
    //               </Text>

    //               <RadioButton value="Widower" color="#d4af37" />
    //               <Text style={{ color: "grey", fontWeight: "600" }}>
    //                 Widower
    //               </Text>
    //             </View>
    //           </RadioButton.Group>

    //           <FormButton onPress={handleUpdate}>
    //             <Text
    //               style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
    //             >
    //               {loadingInBtn === true ? (
    //                 <ActivityIndicator
    //                   style={{
    //                     display: "flex",
    //                     alignSelf: "center",
    //                     justifyContent: "center",
    //                     alignItems: "center",
    //                     flex: 1,
    //                   }}
    //                   // size={"large"}
    //                   color={"white"}
    //                 />
    //               ) : (
    //                 "Submit"
    //               )}
    //             </Text>
    //           </FormButton>
    //         </FormSection>
    //       </MainContainer>
    //     </ScrollView>
    //   </Provider>
    // </SafeArea>
    <View>
      <Text>Something</Text>
    </View>
  );
};

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
export default MatrimonyProfileEdit;
