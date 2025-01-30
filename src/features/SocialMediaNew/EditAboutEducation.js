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
  TextInput,
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
import { FlatList } from "react-native-gesture-handler";

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
    height: 200,
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
  educationContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  educationItem: {
    marginBottom: 16,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: "bold",
  },
  educationInstitution: {
    fontSize: 14,
    color: "#555",
  },
  educationDuration: {
    fontSize: 14,
    color: "#777",
  },
  educationDescription: {
    fontSize: 14,
    color: "#333",
  },

  educationItem: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  addButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#d4af37",
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  removeButton: {
    marginTop: 8,
    padding: 5,
    backgroundColor: "#ff4d4d",
    borderRadius: 5,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default function EditUserEducationInfo({ navigation, route }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();

  const token = useSelector((state) => state.user.token);
  const { userProfile, fetchUserProfile } = route.params;



  const [about, setAbout] = useState(userProfile?.followData?.about || "");


  const [education, setEducation] = useState(
    userProfile?.followData?.education?.length > 0
      ? userProfile.followData.education
      : [{ degree: "", institution: "", duration: "", description: "" }]
  );
  const [jobExperience, setJobExperience] = useState(
    userProfile?.followData?.jobExperience?.length > 0
      ? userProfile.followData.jobExperience
      : [{ company: "", role: "", duration: "", description: "" }]
  );

  const addEducationField = () => {
    setEducation((prevEducation) => [
      ...prevEducation,
      { degree: "", institution: "", duration: "", description: "" },
    ]);
  };

  const addJobExperienceField = () => {
    setJobExperience((prevJobExperience) => [
      ...prevJobExperience,
      { company: "", role: "", duration: "", description: "" },
    ]);
  };

  const updateEducation = (index, field, value) => {
    setEducation((prevEducation) => {
      const updatedEducation = [...prevEducation];
      updatedEducation[index] = { ...updatedEducation[index], [field]: value };
      return updatedEducation;
    });
  };
  const updatejobExperience = (index, field, value) => {
    setJobExperience((prevJobExperience) => {
      const updatedJobExperience = [...prevJobExperience]; // Shallow copy
      updatedJobExperience[index] = {
        ...updatedJobExperience[index],
        [field]: value,
      }; // Deep copy for the specific object
      return updatedJobExperience;
    });
  };
  const removeEducation = (index) => {
    setEducation((prevEducation) =>
      prevEducation.filter((_, i) => i !== index)
    );
  };

  const removejobExperience = (index) => {
    setJobExperience((prevJobExperience) =>
      prevJobExperience.filter((_, i) => i !== index)
    );
  };

  const { loadingInBtn } = useSelector((state) => state.user);

  const handleSubmit = async () => {
    try {
      let formData = new FormData();
      formData.append("about", about);
      formData.append("education", JSON.stringify(education));
      formData.append("jobExperience", JSON.stringify(jobExperience));

      await dispatch(setLoadingInBtn(true));

      const response = await fetch(`${BASEAPIURL}/user/update-follow-data`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      await dispatch(setLoadingInBtn(false));

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user: ${errorText}`);
      }

      alert("Information Updated Successfully");
      fetchUserProfile();
      navigation.goBack();
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Error: ${error.message}`);
    }
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
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#000",
                  letterSpacing: 0.5,
                }}
              >
                Edit User Profile
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
              <TextInput
                multiline={true}
                numberOfLines={4}
                selectionColor="#d4af37"
                placeholder="About*"
                activeUnderlineColor="#d4af37"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={about}
                onChangeText={setAbout}
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
                    marginTop: 5,
                    paddingTop: 15,
                    borderColor: "#e6e6e6",
                    textTransform: "capitalize",
                  },
                ]}
              />

              {education.map((edu, index) => (
                <View key={index} style={{ marginBottom: 16 }}>
                  <LoginInputField
                    placeholder="Degree"
                    value={edu.degree}
                    onChangeText={(text) =>
                      updateEducation(index, "degree", text)
                    }
                  />
                  <LoginInputField
                    placeholder="Institution"
                    value={edu.institution}
                    onChangeText={(text) =>
                      updateEducation(index, "institution", text)
                    }
                  />
                  <LoginInputField
                    placeholder="Duration"
                    value={edu.duration}
                    onChangeText={(text) =>
                      updateEducation(index, "duration", text)
                    }
                  />

                  <TextInput
                    multiline={true}
                    numberOfLines={4}
                    selectionColor="#d4af37"
                    placeholder="Description*"
                    activeUnderlineColor="#d4af37"
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={edu.description}
                    onChangeText={(text) =>
                      updateEducation(index, "description", text)
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
                        marginTop: 5,
                        paddingTop: 15,
                        borderColor: "#e6e6e6",
                        textTransform: "capitalize",
                      },
                    ]}
                  />
                  <TouchableOpacity
                    style={{ marginTop: 8 }}
                    onPress={() => removeEducation(index)}
                  >
                    <Text style={{ color: "red" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={addEducationField}>
                <Text style={{ color: "#d4af37" }}>+ Add Education</Text>
              </TouchableOpacity>

              {jobExperience.map((job, index) => (
                <View key={index} style={{ marginBottom: 16 }}>
                  <LoginInputField
                    placeholder="Company"
                    value={job.company}
                    onChangeText={(text) =>
                      updatejobExperience(index, "company", text)
                    }
                  />
                  <LoginInputField
                    placeholder="Role"
                    value={job.role}
                    onChangeText={(text) =>
                      updatejobExperience(index, "role", text)
                    }
                  />
                  <LoginInputField
                    placeholder="Duration"
                    value={job.duration}
                    onChangeText={(text) =>
                      updatejobExperience(index, "duration", text)
                    }
                  />

                  <TextInput
                    multiline={true}
                    numberOfLines={4}
                    selectionColor="#d4af37"
                    placeholder="Job Description*"
                    activeUnderlineColor="#d4af37"
                    underlineColor="transparent"
                    placeholderTextColor="#9B9B9B"
                    value={job.description}
                    onChangeText={(text) =>
                      updatejobExperience(index, "description", text)
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
                        marginTop: 5,
                        paddingTop: 15,
                        borderColor: "#e6e6e6",
                        textTransform: "capitalize",
                      },
                    ]}
                  />
                  <TouchableOpacity
                    style={{ marginTop: 8 }}
                    onPress={() => removejobExperience(index)}
                  >
                    <Text style={{ color: "red" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={addJobExperienceField}>
                <Text style={{ color: "#d4af37" }}>+ Add Job Experience</Text>
              </TouchableOpacity>

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
                    "Update Profile"
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
