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
} from "react-native";
import { IconButton, Provider } from "react-native-paper";
import { SafeArea } from "../../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  MainContainer,
  LoginInputField,
  AddProfileBox,
} from "../../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { en, registerTranslation } from "react-native-paper-dates";
import * as ImagePicker from "expo-image-picker";
import { RowBetween } from "../../styles/common.styles";
import { BASEAPIURL } from "../../infrastructure/constants";
import { BASEIMGURL } from "../../infrastructure/constants";
import { setLoadingInBtn } from "../../store/user";
import { useDispatch } from "react-redux";

const EditJobPost = ({ route, navigation }) => {
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

  const handleUpdate = async () => {
    let url = `${BASEAPIURL}/social/job/update/${job._id}`;
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(modifiedDetails),
      });
      console.log("response of edit job details", response);

      if (!response.ok) {
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
                  Edit Job Posting
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
                  Job Title
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  placeholder="Job Title*"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={modifiedDetails.jobTitle}
                  onChangeText={(text) =>
                    setModifiedDetails({ ...modifiedDetails, jobTitle: text })
                  }
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Company
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  placeholder="Company*"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={modifiedDetails.company}
                  onChangeText={(text) =>
                    setModifiedDetails({ ...modifiedDetails, company: text })
                  }
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Location
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  placeholder="Location*"
                  activeUnderlineColor="#d4af37"
                  style={[styles.input, { marginTop: 10, marginBottom: 15 }]}
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={modifiedDetails.location}
                  onChangeText={(text) =>
                    setModifiedDetails({ ...modifiedDetails, location: text })
                  }
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Job Description
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  multiline={true}
                  placeholder="Job Description*"
                  activeUnderlineColor="#d4af37"
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
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Company Description
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  multiline={true}
                  placeholder="Company Description*"
                  activeUnderlineColor="#d4af37"
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
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  Responsibilities
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  multiline={true}
                  placeholder="Responsibilities*"
                  activeUnderlineColor="#d4af37"
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
                />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 4,
                    color: "grey",
                    fontWeight: "600",
                  }}
                >
                  CTC
                </Text>
                <LoginInputField
                  selectionColor="#d4af37"
                  placeholder="CTC*"
                  activeUnderlineColor="#d4af37"
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
    backgroundColor: "#d4af37",
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
