import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { editProfileHandler } from "../../services/matrimony.services";
import { getCurrentUserMatrimonyprofile } from "../../services/matrimony.services";
import { setLoadingInBtn } from "../../store/user";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Divider,
  IconButton,
  Menu,
  Provider,
  RadioButton,
} from "react-native-paper";
import { SafeArea } from "../../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  MainContainer,
  MenuLead,
  Row,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import { useSelector, useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-datepicker"; // Removed - using @react-native-community/datetimepicker instead
import * as ImagePicker from "expo-image-picker";
import { createMatrimonyAccount } from "../../services/matrimony.services";
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
});

export const MenuItem = (props) => {
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

export default function Editmyprofile({ navigation }) {
  const { myMatrimonyProfile, loadingInBtn } = useSelector(
    (state) => state.user
  );

  //   console.log(myMatrimonyProfile);

  const dispatch = useDispatch();

  const [visible, setVisible] = React.useState(false);
  const [jobVisible, setJobVisible] = React.useState(false);
  const [maritalVisible, setMaritalVisible] = React.useState(false);
  const [rashiVisible, setRashiVisible] = React.useState(false);
  const [relation, setRelation] = React.useState("");
  const [hobby, setHobby] = React.useState("");
  const [hobbyArray, setHobbyArray] = React.useState([]);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [date, setDate] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [year, setYear] = React.useState("");

  const addHobby = () => {
    setHobbyArray([...hobbyArray, hobby]);
    setHobby("");
  };

  const removeThisHobby = (hobby) => {
    const newHobbyArray = hobbyArray.filter((item) => {
      return item !== hobby && item;
    });
    setHobbyArray(newHobbyArray);
  };

  const [registerDetails, setRegisterDetails] = React.useState({
    fname: myMatrimonyProfile.fname,
    midname: myMatrimonyProfile.midname,
    lname: myMatrimonyProfile.lname,
    age: myMatrimonyProfile.age,
    gender: myMatrimonyProfile.gender,
    phone: myMatrimonyProfile,
    email: myMatrimonyProfile,
    education: "",
    job: "",
    jobType: "",
    hobbies: [],
    birthPlace: "",
    maritalStatus: "",
    gottra: "",
    rashi: "",

    mother: {
      name: "",
      phone: "",
      email: "",
      birthPlace: "",
      occupation: "",
    },
    father: {
      name: "",
      phone: "",
      email: "",
      birthPlace: "",
      occupation: "",
    },
    siblings: [],
    currentcity: "",
    currentstate: "",
    currentcountry: "",
    currentpincode: "",
    currentAddress: "",
    permanentcity: "",
    permanentstate: "",
    permanentcountry: "",
    permanentpincode: "",
    permanentAddress: "",
    lookingFor: "",
  });

  React.useEffect(() => {
    setRegisterDetails({
      ...myMatrimonyProfile,
      age: String(myMatrimonyProfile.age),
    });

    setHobbyArray(myMatrimonyProfile.hobbies);

    setDate(
      new Date(myMatrimonyProfile.dob).getDate() >= 9
        ? String(new Date(myMatrimonyProfile.dob).getDate())
        : "0" + String(new Date(myMatrimonyProfile.dob).getDate())
    );
    setMonth(
      new Date(myMatrimonyProfile.dob).getMonth() + 1 >= 9
        ? String(new Date(myMatrimonyProfile.dob).getMonth() + 1)
        : "0" + String(new Date(myMatrimonyProfile.dob).getMonth() + 1)
    );
    setYear(String(new Date(myMatrimonyProfile.dob).getFullYear()));
  }, [myMatrimonyProfile]);

  const _pickDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
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

  const registerMutation = useMutation(editProfileHandler, {
    onSuccess: async (data) => {
      query.invalidateQueries("get-my-matrimony-profile");
      await dispatch(setLoadingInBtn(false));
      navigation.navigate("MyProfile");
    },
    onError: async (err) => {
      await dispatch(setLoadingInBtn(false));
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
    await dispatch(setLoadingInBtn(true));
    let yearInNumber = parseInt(year);
    if (yearInNumber < 1900 || yearInNumber > 2100) {
      await dispatch(
        ErrorToggle({
          toggle: true,
          msg: "Enter a valid Birth year",
          type: "error",
        })
      );
      return;
    }
    if (date === "" || year === "" || month === "") {
      await dispatch(
        ErrorToggle({
          toggle: true,
          msg: "Enter a valid Date of Birth",
          type: "error",
        })
      );
    }

    const data = new FormData();
    data.append("fname", registerDetails.fname);
    data.append("midname", registerDetails.midname);
    data.append("lname", registerDetails.lname);
    data.append("age", registerDetails.age);
    data.append("dob", year + "-" + month + "-" + date);
    data.append("gender", registerDetails.gender);
    data.append("phone", registerDetails.phone);
    data.append("email", registerDetails.email);
    data.append("education", registerDetails.education);
    data.append("job", registerDetails.job);
    data.append("jobType", registerDetails.jobType);
    data.append("hobbies", JSON.stringify(hobbyArray));
    data.append("birthPlace", registerDetails.birthPlace);
    data.append("maritalStatus", registerDetails.maritalStatus);
    data.append("gottra", registerDetails.gottra);
    data.append("rashi", registerDetails.rashi);
    data.append("mother", JSON.stringify(registerDetails.mother));
    data.append("father", JSON.stringify(registerDetails.father));
    data.append("siblings", JSON.stringify(registerDetails.siblings));
    data.append("currentcity", registerDetails.currentcity);
    data.append("currentstate", registerDetails.currentstate);
    data.append("currentcountry", registerDetails.currentcountry);
    data.append("currentpincode", registerDetails.currentpincode);
    data.append("currentAddress", registerDetails.currentAddress);
    data.append("permanentcity", registerDetails.permanentcity);
    data.append("permanentstate", registerDetails.permanentstate);
    data.append("permanentcountry", registerDetails.permanentcountry);
    data.append("permanentpincode", registerDetails.permanentpincode);
    data.append("permanentAddress", registerDetails.permanentAddress);
    data.append("lookingfor", registerDetails.lookingfor);
    if (selectedImages.length > 0) {
      for (let i = 0; i < selectedImages.length; i++) {
        let uriParts = selectedImages[i].uri.split(".");
        data.append("file", {
          uri: selectedImages[i].uri,
          name: selectedImages[i].uri.split("/").pop(),
          type: "image/" + uriParts[uriParts.length - 1],
        });
      }
    }

    await registerMutation.mutateAsync(data);
  };

  const handleAddSibling = () => {
    let siblings = registerDetails.siblings;
    siblings.push({
      name: "",
      job: "",
      age: "",
      martialStatus: "",
      relation: "",
    });
    setRegisterDetails({
      ...registerDetails,
      siblings,
    });
  };

  return (
    <SafeArea>
      <Provider>
        <ScrollView>
          <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <IconButton
                icon="arrow-left"
                size={28}
                onPress={() => navigation.goBack()}
              />
              <Text
                style={{
                  color: "#242424",
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                Edit Your Profile
              </Text>
            </View>
          </RowBetween>
          <MainContainer style={{ paddingBottom: 56 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <Menu
                style={{
                  width: "80%",
                  height: 50,
                  marginTop: 25,
                  color: "black",
                }}
                visible={visible}
                onDismiss={() => setVisible(false)}
                anchor={
                  <MenuLead
                    onPress={() => {
                      setVisible(true);
                    }}
                    style={{ height: 50 }}
                    title={registerDetails.lookingFor || "Profile For"}
                    bgColor="#F0F0F0"
                  />
                }
              >
                <MenuItem
                  name="lookingFor"
                  value="Self"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="lookingFor"
                  value="Son"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="lookingFor"
                  value="Daughter"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="lookingFor"
                  value="Brother"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="lookingFor"
                  value="Sister"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="lookingFor"
                  value="Other"
                  setVisible={setVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
              </Menu>
            </View>
            {selectedImages[0] ? (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "red",
                  marginTop: "10%",
                  alignItems: "center",
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
              Add Profile
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
              {/* <Image
                style={styles.profileImg}
                source={{
                  uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZSUyMGltYWdlc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
                }}
              /> */}
              {selectedImages.length < 6 && (
                <AddProfileBox onPress={_pickDocument}>
                  <Icon name="plus" size={35} color="#d4af37" />
                </AddProfileBox>
              )}
            </Row>
            <FormSection style={{ paddingTop: 0 }}>
              {/* <FormSectionTitle>Signup</FormSectionTitle> */}
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="First Name"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={registerDetails.fname}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, fname: text })
                }
              />

              <LoginInputField
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
                placeholder="Last Name"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, lname: text })
                }
                value={registerDetails.lname}
              />

              <Row>
                <Text
                  style={{ color: "#B98C13", fontSize: 14, marginRight: 8 }}
                >
                  I am
                </Text>
                <RadioButton.Group
                  onValueChange={(e) => {
                    // setSelectGender(e);
                    setRegisterDetails({ ...registerDetails, gender: e });
                  }}
                  value={registerDetails.gender}
                >
                  <Row>
                    <RadioButton.Android
                      uncheckedColor="#d4af37"
                      color="#d4af37"
                      value="male"
                    />
                    <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
                      Male
                    </Text>
                    <RadioButton.Android
                      uncheckedColor="#d4af37"
                      color="#d4af37"
                      value="female"
                    />
                    <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
                      Female
                    </Text>
                  </Row>
                </RadioButton.Group>
              </Row>
              <Text
                style={{
                  color: "#7E7E7E",
                  fontSize: 17,
                }}
              >
                DOB :{" "}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <LoginInputField
                  maxLength={2}
                  keyboardType="numeric"
                  returnKeyType="done"
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { width: "28%", marginRight: "2%" }]}
                  placeholder="DD*"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={date}
                  onChangeText={(text) => {
                    if (
                      Number(text) > -1 &&
                      Number(text) < 32 &&
                      text !== "00"
                    ) {
                      setDate(text);
                    } else {
                      setDate("");
                      dispatch(
                        ErrorToggle({
                          toggle: true,
                          msg: "Enter valid date",
                          type: "error",
                        })
                      );
                    }
                  }}
                />
                <LoginInputField
                  keyboardType="numeric"
                  returnKeyType="done"
                  maxLength={2}
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { width: "28%", marginRight: "2%" }]}
                  placeholder="MM*"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={month}
                  onChangeText={(text) => {
                    if (
                      Number(text) > -1 &&
                      Number(text) < 13 &&
                      text !== "00"
                    ) {
                      setMonth(text);
                    } else {
                      setMonth("");
                      dispatch(
                        ErrorToggle({
                          toggle: true,
                          msg: "Enter valid month",
                          type: "error",
                        })
                      );
                    }
                  }}
                />
                <LoginInputField
                  keyboardType="numeric"
                  returnKeyType="done"
                  maxLength={4}
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { width: "38%", marginRight: "2%" }]}
                  placeholder="YYYY*"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={year}
                  onChangeText={(text) => {
                    setYear(text);
                  }}
                />
              </View>

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Age"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, age: text })
                }
                value={registerDetails.age}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Phone no."
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
                placeholder="Email Id"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="email-address"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, email: text })
                }
                autoCapitalize="none"
                value={registerDetails.email}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Highest Education"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, education: text })
                }
                value={registerDetails.education}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Job Title"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, job: text })
                }
                value={registerDetails.job}
              />

              <Menu
                style={{ width: "80%", height: 50, marginTop: 25 }}
                visible={jobVisible}
                onDismiss={() => setJobVisible(false)}
                // value={registerDetails.jobType}
                anchor={
                  <MenuLead
                    onPress={() => {
                      setJobVisible(true);
                    }}
                    style={{ height: 50 }}
                    title={registerDetails.jobType || "Job Type"}
                    bgColor="#F0F0F0"
                  />
                }
              >
                <MenuItem
                  name="jobType"
                  value="Private Sector"
                  setVisible={setJobVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="jobType"
                  value="Government Sector"
                  setVisible={setJobVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="jobType"
                  value="Business/Self Employed"
                  setVisible={setJobVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
              </Menu>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: "5%",
                  flexWrap: "wrap",
                }}
              >
                {hobbyArray.length > 0 &&
                  hobbyArray.map((hobby, index) => (
                    <View
                      style={{
                        padding: 6,
                        borderColor: "#d4af37",
                        borderWidth: 1,
                        borderRadius: 8,
                        marginRight: "4%",
                        marginTop: "3%",
                        flexDirection: "row",
                      }}
                    >
                      <Text style={{ color: "#d4af37", marginRight: 3 }}>
                        {hobby}
                      </Text>
                      <TouchableOpacity onPress={() => removeThisHobby(hobby)}>
                        <Icon
                          style={{ opacity: 0.3 }}
                          name="close"
                          size={20}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Hobbies"
                value={hobby}
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) => setHobby(text)}
                // onChangeText={(text) =>
                //   setRegisterDetails({ ...registerDetails, hobbies: text })
                // }
              />
              <View
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flexDirection: "row",
                }}
              >
                <TouchableOpacity
                  onPress={() => addHobby()}
                  style={{
                    marginTop: 8,
                    backgroundColor: "#D4AF371A",
                    width: 65,
                    borderColor: "#d4af37",
                    borderWidth: 1.5,
                    borderRadius: 8,
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 8,
                    }}
                  >
                    <Text
                      style={{
                        opacity: 0.5,
                        fontWeight: "500",
                        marginRight: 4,
                      }}
                    >
                      Add
                    </Text>
                    <Icon
                      style={{ opacity: 0.3 }}
                      name="plus"
                      size={20}
                      color="black"
                    />
                  </View>
                </TouchableOpacity>
              </View>

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Birth Place"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, birthPlace: text })
                }
                value={registerDetails.birthPlace}
              />
              <Menu
                style={{ width: "80%", height: 50, marginTop: 25 }}
                visible={maritalVisible}
                onDismiss={() => setMaritalVisible(false)}
                anchor={
                  <MenuLead
                    onPress={() => {
                      setMaritalVisible(true);
                    }}
                    style={{ height: 50 }}
                    title={registerDetails.maritalStatus || "Marital Status"}
                    bgColor="#F0F0F0"
                  />
                }
                // value={registerDetails.maritalStatus}
              >
                <MenuItem
                  name="maritalStatus"
                  value="Single"
                  setVisible={setMaritalVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                {/* <MenuItem
                  name="maritalStatus"
                  value="Married"
                  setVisible={setMaritalVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                /> */}
                <MenuItem
                  name="maritalStatus"
                  value="Divorced"
                  setVisible={setMaritalVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="maritalStatus"
                  value="Widowed/Widower"
                  setVisible={setMaritalVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="maritalStatus"
                  value="Other"
                  setVisible={setMaritalVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
              </Menu>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Gothra"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({ ...registerDetails, gottra: text })
                }
                value={registerDetails.gottra}
              />

              <Menu
                style={{ width: "80%", height: 50, marginTop: -250 }}
                visible={rashiVisible}
                onDismiss={() => setRashiVisible(false)}
                anchor={
                  <MenuLead
                    onPress={() => {
                      setRashiVisible(true);
                    }}
                    style={{ height: 50 }}
                    title={registerDetails.rashi || "Rashi"}
                    bgColor="#F0F0F0"
                  />
                }
              >
                <MenuItem
                  name="rashi"
                  value="Aries"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Taurus"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Gemini"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Cancer"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Leo"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Virgo"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Libra"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Scorpio"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Sagittarius"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Capricorn"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Aquarius "
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
                <MenuItem
                  name="rashi"
                  value="Pisces"
                  setVisible={setRashiVisible}
                  setRegisterDetails={setRegisterDetails}
                  allValues={registerDetails}
                />
              </Menu>

              {/* Inputs for gottra and rashi and currentAddress and permanentAddress */}
              <Text style={{ marginTop: 20, fontSize: 16, fontWeight: "bold" }}>
                Current Address
              </Text>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Current Address"
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
                placeholder="Current City"
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
                placeholder="Current State"
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
                placeholder="Current Country"
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
                placeholder="Current Pincode"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    currentpincode: text,
                  })
                }
                value={registerDetails.currentpincode}
              />

              <View>
                <Text
                  style={{ marginTop: 20, fontSize: 16, fontWeight: "bold" }}
                >
                  Permanent Address
                </Text>

                <LoginInputField
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={styles.input}
                  placeholder="Permanent Address"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  onChangeText={(text) =>
                    setRegisterDetails({
                      ...registerDetails,
                      permanentAddress: text,
                    })
                  }
                  value={registerDetails.permanentAddress}
                />
                <LoginInputField
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={styles.input}
                  placeholder="Permanent City"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  onChangeText={(text) =>
                    setRegisterDetails({
                      ...registerDetails,
                      permanentcity: text,
                    })
                  }
                  value={registerDetails.permanentcity}
                />
                <LoginInputField
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={styles.input}
                  placeholder="Permanent State"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  onChangeText={(text) =>
                    setRegisterDetails({
                      ...registerDetails,
                      permanentstate: text,
                    })
                  }
                  value={registerDetails.permanentstate}
                />
                <LoginInputField
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={styles.input}
                  placeholder="Permanent Country"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  onChangeText={(text) =>
                    setRegisterDetails({
                      ...registerDetails,
                      permanentcountry: text,
                    })
                  }
                  value={registerDetails.permanentcountry}
                />
                <LoginInputField
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={styles.input}
                  placeholder="Permanent Pincode"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  onChangeText={(text) =>
                    setRegisterDetails({
                      ...registerDetails,
                      permanentpincode: text,
                    })
                  }
                  value={registerDetails.permanentpincode}
                />
              </View>

              <Text style={{ marginTop: 20, fontSize: 16, fontWeight: "bold" }}>
                Family Details
              </Text>

              {/* Father Details */}
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  fontWeight: "normal",
                  color: "#656565",
                }}
              >
                Father Details
              </Text>

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Name"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    father: { ...registerDetails.father, name: text },
                  })
                }
                value={registerDetails.father?.name}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Phone no."
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    father: { ...registerDetails.father, phone: text },
                  })
                }
                value={registerDetails.father?.phone}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Email Id"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="email-address"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    father: { ...registerDetails.father, email: text },
                  })
                }
                autoCapitalize="none"
                value={registerDetails.father?.email}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Birth place"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    father: { ...registerDetails.father, birthPlace: text },
                  })
                }
                value={registerDetails.father?.birthPlace}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Occupation"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    father: { ...registerDetails.father, occupation: text },
                  })
                }
                value={registerDetails.father?.occupation}
              />
              {/* Mother Details */}
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  fontWeight: "normal",
                  color: "#656565",
                }}
              >
                Mother Details
              </Text>
              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Name"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    mother: { ...registerDetails.mother, name: text },
                  })
                }
                value={registerDetails.mother.name}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Phone no."
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    mother: { ...registerDetails.mother, phone: text },
                  })
                }
                value={registerDetails.mother.phone}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Email Id"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                keyboardType="email-address"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    mother: { ...registerDetails.mother, email: text },
                  })
                }
                autoCapitalize="none"
                value={registerDetails.mother.email}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Birth place"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    mother: { ...registerDetails.mother, birthPlace: text },
                  })
                }
                value={registerDetails.mother.birthPlace}
              />

              <LoginInputField
                selectionColor="#d4af37"
                activeUnderlineColor="#d4af37"
                style={styles.input}
                placeholder="Occupation"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                onChangeText={(text) =>
                  setRegisterDetails({
                    ...registerDetails,
                    mother: { ...registerDetails.mother, occupation: text },
                  })
                }
                value={registerDetails.mother.occupation}
              />

              {/* Sibling Details */}

              {registerDetails.siblings.length > 0 &&
                registerDetails.siblings.map((sibling, index) => {
                  return (
                    <React.Fragment key={index}>
                      <Text
                        style={{
                          marginTop: 16,
                          fontSize: 12,
                          fontWeight: "normal",
                          color: "#656565",
                        }}
                      >
                        Sibling {index + 1}
                      </Text>
                      <LoginInputField
                        selectionColor="#d4af37"
                        activeUnderlineColor="#d4af37"
                        style={styles.input}
                        placeholder=" Name"
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        onChangeText={(text) => {
                          setRegisterDetails({
                            ...registerDetails,
                            siblings: [
                              ...registerDetails.siblings.slice(0, index),
                              { ...sibling, name: text },
                              ...registerDetails.siblings.slice(index + 1),
                            ],
                          });
                        }}
                        value={sibling.name}
                      />

                      <LoginInputField
                        selectionColor="#d4af37"
                        activeUnderlineColor="#d4af37"
                        style={styles.input}
                        placeholder="Age"
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(text) =>
                          setRegisterDetails({
                            ...registerDetails,
                            siblings: [
                              ...registerDetails.siblings.slice(0, index),
                              { ...sibling, age: text },
                              ...registerDetails.siblings.slice(index + 1),
                            ],
                          })
                        }
                        value={sibling.age}
                      />

                      <LoginInputField
                        selectionColor="#d4af37"
                        activeUnderlineColor="#d4af37"
                        style={styles.input}
                        placeholder="Occupation"
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        keyboardType="email-address"
                        onChangeText={(text) =>
                          setRegisterDetails({
                            ...registerDetails,
                            siblings: [
                              ...registerDetails.siblings.slice(0, index),
                              { ...sibling, job: text },
                              ...registerDetails.siblings.slice(index + 1),
                            ],
                          })
                        }
                        autoCapitalize="none"
                        value={sibling.job}
                      />

                      <LoginInputField
                        selectionColor="#d4af37"
                        activeUnderlineColor="#d4af37"
                        style={styles.input}
                        placeholder="Martial Status"
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        onChangeText={(text) =>
                          setRegisterDetails({
                            ...registerDetails,
                            siblings: [
                              ...registerDetails.siblings.slice(0, index),
                              { ...sibling, maritalStatus: text },
                              ...registerDetails.siblings.slice(index + 1),
                            ],
                          })
                        }
                        value={sibling.maritalStatus}
                      />
                      {/* <LoginInputField
                        selectionColor="#d4af37"
                        activeUnderlineColor="#d4af37"
                        style={styles.input}
                        placeholder="Relation"
                        underlineColor="transparent"
                        placeholderTextColor="#9B9B9B"
                        onChangeText={(text) =>
                          setRegisterDetails({
                            ...registerDetails,
                            siblings: [
                              ...registerDetails.siblings.slice(0, index),
                              { ...sibling, relation: text },
                              ...registerDetails.siblings.slice(index + 1),
                            ],
                          })
                        }
                        value={sibling.relation}
                      /> */}
                       <Menu
                        style={{ width: "80%", marginTop: 25 }}
                        visible={relation === "active" + index}
                        onDismiss={() => setRelation("active")}
                        // value={registerDetails.jobType}
                        anchor={
                          <MenuLead
                            onPress={() => {
                              setRelation("active" + index);
                            }}
                            style={{ height: 50 }}
                            title={
                              registerDetails.siblings[index].relation ||
                              "Relation"
                            }
                            bgColor="#F0F0F0"
                            textcolor="Job Type *"
                          />
                        }
                      >
                        <MenuItem
                          name="relation"
                          value="Elder Brother"
                          setVisible={setRelation}
                          setRegisterDetails={(text) => {
                            setRegisterDetails({
                              ...registerDetails,
                              siblings: [
                                ...registerDetails.siblings.slice(0, index),
                                { ...sibling, relation: text.relation },
                                ...registerDetails.siblings.slice(index + 1),
                              ],
                            });
                          }}
                          allValues={registerDetails.siblings}
                        />
                        <MenuItem
                          name="relation"
                          value="Elder Sister"
                          setVisible={setRelation}
                          setRegisterDetails={(text) => {
                            setRegisterDetails({
                              ...registerDetails,
                              siblings: [
                                ...registerDetails.siblings.slice(0, index),
                                { ...sibling, relation: text.relation },
                                ...registerDetails.siblings.slice(index + 1),
                              ],
                            });
                          }}
                          allValues={registerDetails.siblings}
                        />
                        <MenuItem
                          name="relation"
                          value="Younger Brother"
                          setVisible={setRelation}
                          setRegisterDetails={(text) => {
                            setRegisterDetails({
                              ...registerDetails,
                              siblings: [
                                ...registerDetails.siblings.slice(0, index),
                                { ...sibling, relation: text.relation },
                                ...registerDetails.siblings.slice(index + 1),
                              ],
                            });
                          }}
                          allValues={registerDetails.siblings}
                        />
                        <MenuItem
                          name="relation"
                          value="Younger Sister"
                          setVisible={setRelation}
                          setRegisterDetails={(text) => {
                            setRegisterDetails({
                              ...registerDetails,
                              siblings: [
                                ...registerDetails.siblings.slice(0, index),
                                { ...sibling, relation: text.relation },
                                ...registerDetails.siblings.slice(index + 1),
                              ],
                            });
                          }}
                          allValues={registerDetails.siblings}
                        />
                        <MenuItem
                          name="relation"
                          value="Twin Brother"
                          setVisible={setRelation}
                          setRegisterDetails={(text) => {
                            setRegisterDetails({
                              ...registerDetails,
                              siblings: [
                                ...registerDetails.siblings.slice(0, index),
                                { ...sibling, relation: text.relation },
                                ...registerDetails.siblings.slice(index + 1),
                              ],
                            });
                          }}
                          allValues={registerDetails.siblings}
                        />
                        <MenuItem
                          name="relation"
                          value="Twin Sister"
                          setVisible={setRelation}
                          setRegisterDetails={(text) => {
                            setRegisterDetails({
                              ...registerDetails,
                              siblings: [
                                ...registerDetails.siblings.slice(0, index),
                                { ...sibling, relation: text.relation },
                                ...registerDetails.siblings.slice(index + 1),
                              ],
                            });
                          }}
                          allValues={registerDetails.siblings}
                        />
                      </Menu>
                      <Divider />
                    </React.Fragment>
                  );
                })}

              {/* <TouchableOpacity
                onPress={handleAddSibling}
                style={{
                  marginTop: 16,
                  marginBottom: 16,
                  alignSelf: "flex-end",
                  backgroundColor: "#d4af37",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "normal",
                    color: "#fff",
                    padding: 20,
                  }}
                >
                  Add Sibling
                </Text>
              </TouchableOpacity> */}

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
                    "Save Changes"
                  )}
                </Text>
              </FormButton>
            </FormSection>

            {/* <BottomText>
              Already have an account?{' '}
              <ForgotText
                style={{ color: '#4191DF', fontSize: 13 }}
                onPress={() => navigation.navigate('Login')}
              >
                Signin
              </ForgotText>
            </BottomText>

            <BottomText style={{ marginTop: 45 }}>
              Facing problems while signing up?{' '}
              <ForgotText style={{ color: '#B98C13', fontSize: 13 }}>Contact Us</ForgotText>
            </BottomText> */}
          </MainContainer>
        </ScrollView>
      </Provider>
    </SafeArea>
  );
}
