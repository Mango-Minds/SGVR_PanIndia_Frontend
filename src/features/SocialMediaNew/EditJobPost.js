import React, { useState, useEffect } from "react";
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
  MainContainer,
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
import { useTranslation } from "react-i18next";
const EditJobPost = ({ route, navigation }) => {
  const { t } = useTranslation();
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user);
  const job = route.params;
  console.log(job);
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const { loadingInBtn } = useSelector((state) => state.user);
  const [userRoleData, setUserRoleData] = useState(job);
  const [modifiedDetails, setModifiedDetails] = useState({});

  const updateModifiedDetails = () => {
    setModifiedDetails({
      jobTitle: userRoleData?.jobTitle ?? "",
      company: userRoleData?.company ?? "",
      location: userRoleData?.location ?? "",
      description: userRoleData?.description ?? "",
      companyDescription: userRoleData?.companyDescription ?? "",
      responsibilities: userRoleData?.responsibilities ?? "",
      CTC: userRoleData?.CTC ?? "",
    });
  };

  useEffect(() => {
    updateModifiedDetails();
  }, [userRoleData]);

  // const handleUpdate = async () => {
  //   let url = `${BASEAPIURL}/social/job/update/${job._id}`;
  //   try {
  //     const response = await fetch(url, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(modifiedDetails),
  //     });
  //     console.log("response of edit job details", response);

  //     if (!response.ok) {
  //       throw new Error("Failed to update job");
  //     }

  //     alert("job Posting updated successfully");
  //     navigation.goBack();
  //     await dispatch(setLoadingInBtn(false));
  //   } catch (error) {
  //     console.error("Error updating Job details:", error);
  //     await dispatch(setLoadingInBtn(false));
  //   }
  // };
  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("Authentication token is missing.");
      Alert.alert("Error", "You are not authorized. Please log in again.");
      return;
    }
  
    let url = `/social/job/update/${job._id}`;
    try {
      const response = await apiClient.put(
        url,
        modifiedDetails,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response of edit job details", response);
  
      if (response.status !== 200) {
        throw new Error("Failed to update job");
      }
  
      alert("job Posting updated successfully");
      navigation.goBack();
      await dispatch(setLoadingInBtn(false));
    } catch (error) {
      console.error("Error updating Job details:", error);
      await dispatch(setLoadingInBtn(false));
    }
  };
  
  return (
    <>
      <SafeArea>
        <Provider>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
                         <ScrollView 
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
                      fontWeight: "500",
                      color: "#000",
                    }}
                  >
                    {t("editJobPosting")}
                  </Text>
                </View>
              </RowBetween>
              <MainContainer
                style={{ paddingBottom: 56 }}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                contentInsetAdjustmentBehavior="always"
              >
                <FormSection style={{ paddingTop: 0 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                    }}
                  >
                   {t("jobTitle")}
                  </Text>
                                     <LoginInputField
                     selectionColor={Theme.themeColor}
                     placeholder="Job Title*"
                     activeUnderlineColor={Theme.themeColor}
                     style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                     underlineColor="transparent"
                     placeholderTextColor="#9B9B9B"
                     value={modifiedDetails.jobTitle}
                     onChangeText={(text) =>
                       setModifiedDetails({ ...modifiedDetails, jobTitle: text })
                     }
                     returnKeyType="next"
                     blurOnSubmit={false}
                   />
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                    }}
                  >
                    {t("company")}
                  </Text>
                                     <LoginInputField
                     selectionColor={Theme.themeColor}
                     placeholder="Company*"
                     activeUnderlineColor={Theme.themeColor}
                     style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                     underlineColor="transparent"
                     placeholderTextColor="#9B9B9B"
                     value={modifiedDetails.company}
                     onChangeText={(text) =>
                       setModifiedDetails({ ...modifiedDetails, company: text })
                     }
                     returnKeyType="next"
                     blurOnSubmit={false}
                   />
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                    }}
                  >
                    {t("location")}
                  </Text>
                                     <LoginInputField
                     selectionColor={Theme.themeColor}
                     placeholder="Location*"
                     activeUnderlineColor={Theme.themeColor}
                     style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                     underlineColor="transparent"
                     placeholderTextColor="#9B9B9B"
                     value={modifiedDetails.location}
                     onChangeText={(text) =>
                       setModifiedDetails({ ...modifiedDetails, location: text })
                     }
                     returnKeyType="next"
                     blurOnSubmit={false}
                   />
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                    }}
                  >
                   {t("jobDescription")}
                  </Text>
                                     <LoginInputField
                     selectionColor={Theme.themeColor}
                     multiline={true}
                     placeholder="Job Description*"
                     activeUnderlineColor={Theme.themeColor}
                     style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                     underlineColor="transparent"
                     placeholderTextColor="#9B9B9B"
                     value={modifiedDetails.description}
                     onChangeText={(text) =>
                       setModifiedDetails({
                         ...modifiedDetails,
                         description: text,
                       })
                     }
                     returnKeyType="next"
                     blurOnSubmit={false}
                   />
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                    }}
                  >
                   {t("companyDescription")}
                  </Text>
                                     <LoginInputField
                     selectionColor={Theme.themeColor}
                     multiline={true}
                     placeholder="Company Description*"
                     activeUnderlineColor={Theme.themeColor}
                     style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                     underlineColor="transparent"
                     placeholderTextColor="#9B9B9B"
                     value={modifiedDetails.companyDescription}
                     onChangeText={(text) =>
                       setModifiedDetails({
                         ...modifiedDetails,
                         companyDescription: text,
                       })
                     }
                     returnKeyType="next"
                     blurOnSubmit={false}
                   />
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                    }}
                  >
                    {t("responsibilities")}
                  </Text>
                                     <LoginInputField
                     selectionColor={Theme.themeColor}
                     multiline={true}
                     placeholder="Responsibilities*"
                     activeUnderlineColor={Theme.themeColor}
                     style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                     underlineColor="transparent"
                     placeholderTextColor="#9B9B9B"
                     value={modifiedDetails.responsibilities}
                     onChangeText={(text) =>
                       setModifiedDetails({
                         ...modifiedDetails,
                         responsibilities: text,
                       })
                     }
                     returnKeyType="next"
                     blurOnSubmit={false}
                   />
                  <Text
                    style={{
                      fontSize: 16,
                      marginLeft: 4,
                      color: "grey",
                      fontWeight: "600",
                    }}
                  >
                   {t("ctc")}
                  </Text>
                                     <LoginInputField
                     selectionColor={Theme.themeColor}
                     placeholder="CTC*"
                     activeUnderlineColor={Theme.themeColor}
                     style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                     underlineColor="transparent"
                     placeholderTextColor="#9B9B9B"
                     value={modifiedDetails.CTC}
                     onChangeText={(text) =>
                       setModifiedDetails({
                         ...modifiedDetails,
                         CTC: text,
                       })
                     }
                     returnKeyType="done"
                     blurOnSubmit={true}
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
                        t("submit")
                      )}
                    </Text>
                  </FormButton>
                </FormSection>
              </MainContainer>
              
            </ScrollView>
          </KeyboardAvoidingView>
        </Provider>
      </SafeArea>
    </>
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
  mediaContainer: {
    flexDirection: "row",
    marginTop: 20,
    height: "auto",
  },
  mediaPreviewWrapper: {
    position: "relative",
    marginRight: 10,
    marginVertical: 10,
    height: 60,
    width: 60,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -35,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 2,
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.themeColor,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 25,
    width: "30%",
  },
  mediaText: {
    color: "white",
    marginLeft: 10,
  },
});

export default EditJobPost;
