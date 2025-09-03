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
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Theme from "../../styles/theme";
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
import * as DocumentPicker from "expo-document-picker";
import { RowBetween } from "../../styles/common.styles";
import { BASEAPIURL } from "../../infrastructure/constants";

import { setLoadingInBtn } from "../../store/user";
import { useDispatch } from "react-redux";
import { FlatList } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { updateUserAboutEducationDetails } from "./SocialMediaAPIs";
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
    backgroundColor: Theme.themeColor,
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
  // New styles for improved about section
  aboutSection: {
    marginBottom: 24,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  aboutInputContainer: {
    position: "relative",
  },
  aboutTextInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#495057",
    minHeight: 120,
    textAlignVertical: "top",
    lineHeight: 24,
  },
  aboutTextInputFocused: {
    borderColor: Theme.themeColor,
    borderWidth: 2,
  },
  characterCounter: {
    position: "absolute",
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: "#6c757d",
  },
  characterCounterWarning: {
    color: "#ffc107",
  },
  characterCounterError: {
    color: "#dc3545",
  },
  aboutSuggestions: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976d2",
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 12,
    color: "#424242",
    lineHeight: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 24,
  },
  // Resume Section Styles
  resumeSection: {
    marginBottom: 24,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  resumeContainer: {
    marginTop: 12,
  },
  resumeFileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  existingResumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  noResumeContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderStyle: "dashed",
  },
  resumeFileName: {
    flex: 1,
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  removeResumeButton: {
    padding: 4,
  },
  resumeNote: {
    fontSize: 12,
    color: "#6c757d",
    fontStyle: "italic",
    marginTop: 4,
  },
  noResumeText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
  uploadResumeButton: {
    backgroundColor: Theme.themeColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  uploadResumeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadResumeButtonDisabled: {
    opacity: 0.6,
  },
});

export default function EditUserEducationInfo({ navigation, route }) {
  registerTranslation("en", en);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const token = useSelector((state) => state.user.token);
  const { userProfile, fetchUserProfile } = route.params;

  const [about, setAbout] = useState(userProfile?.followData?.about || "");
  const [isAboutFocused, setIsAboutFocused] = useState(false);
  const MAX_ABOUT_CHARACTERS = 500;
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);

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

  // Cleanup loading state when component unmounts
  useEffect(() => {
    return () => {
      if (loadingInBtn) {
        dispatch(setLoadingInBtn(false));
      }
    };
  }, [loadingInBtn, dispatch]);

  // Character counter logic
  const getCharacterCounterStyle = () => {
    const charCount = about.length;
    if (charCount > MAX_ABOUT_CHARACTERS) {
      return styles.characterCounterError;
    } else if (charCount > MAX_ABOUT_CHARACTERS * 0.8) {
      return styles.characterCounterWarning;
    }
    return styles.characterCounter;
  };

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setResumeFile(file);
        setResumeFileName(file.name);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert(t("error"), t("errorPickingDocument"));
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setResumeFileName("");
  };

  const handleSubmit = async () => {
    // Validate about section
    if (about.length > MAX_ABOUT_CHARACTERS) {
      Alert.alert(
        t("error"),
        t("aboutCharacterLimit", { limit: MAX_ABOUT_CHARACTERS })
      );
      return;
    }

    // If there's a new resume file, upload it first
    if (resumeFile) {
      setIsUploadingResume(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const formData = new FormData();
        formData.append("resume", {
          uri: resumeFile.uri,
          name: resumeFile.name,
          type: resumeFile.mimeType || "application/pdf",
        });

        const response = await apiClient.patch(
          "/user/update-follow-data",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to upload resume");
        }
      } catch (error) {
        console.error("Error uploading resume:", error);
        Alert.alert(t("error"), t("errorUploadingResume"));
        setIsUploadingResume(false);
        return;
      } finally {
        setIsUploadingResume(false);
      }
    }

    updateUserAboutEducationDetails({
      about,
      education,
      jobExperience,
      t,
      dispatch,
      setLoadingInBtn,
      fetchUserProfile,
      navigation,
    });
  };

  return (
    <SafeArea>
      <Provider>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="always"
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
                  {t("editUserProfile")}
                </Text>
              </View>
            </RowBetween>
            <MainContainer
              style={{ paddingBottom: 56 }}
              keyboardDismissMode="on-drag"
            >
              <FormSection style={{ paddingTop: 0 }}>
                {/* Improved About Section */}
                <View style={styles.aboutSection}>
                  <View style={styles.aboutSectionTitle}>
                    <Icon name="account-edit" size={20} color={Theme.themeColor} style={{ marginRight: 8 }} />
                    <Text>{t("about")}</Text>
                  </View>
                  
                  <View style={styles.aboutInputContainer}>
                                         <TextInput
                       multiline={true}
                       numberOfLines={6}
                       selectionColor={Theme.themeColor}
                       placeholder={t("aboutPlaceholder")}
                       activeUnderlineColor={Theme.themeColor}
                       underlineColor="transparent"
                       placeholderTextColor="#9B9B9B"
                       value={about}
                       onChangeText={setAbout}
                       onFocus={() => setIsAboutFocused(true)}
                       onBlur={() => setIsAboutFocused(false)}
                       maxLength={MAX_ABOUT_CHARACTERS}
                       returnKeyType="done"
                       blurOnSubmit={true}
                       style={[
                         styles.aboutTextInput,
                         isAboutFocused && styles.aboutTextInputFocused,
                       ]}
                     />
                    <Text style={getCharacterCounterStyle()}>
                      {about.length}/{MAX_ABOUT_CHARACTERS}
                    </Text>
                  </View>

                  {/* About Suggestions */}
                  {about.length < 50 && (
                    <View style={styles.aboutSuggestions}>
                      <Text style={styles.suggestionsTitle}>💡 Suggestions:</Text>
                      <Text style={styles.suggestionText}>
                        {t("aboutSuggestions")}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.sectionDivider} />

                {/* Education Section */}
                <Text style={styles.sectionTitle}>
                  <Icon name="school" size={20} color={Theme.themeColor} style={{ marginRight: 8 }} />
                  {t("education")}
                </Text>

                {education.map((edu, index) => (
                  <View key={index} style={{ marginBottom: 16 }}>
                    <LoginInputField
                      placeholder={t("degreePlaceholder")}
                      value={edu.degree}
                      onChangeText={(text) =>
                        updateEducation(index, "degree", text)
                      }
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                    <LoginInputField
                      placeholder={t("institutionPlaceholder")}
                      value={edu.institution}
                      onChangeText={(text) =>
                        updateEducation(index, "institution", text)
                      }
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                    <LoginInputField
                      placeholder={t("durationPlaceholder")}
                      value={edu.duration}
                      onChangeText={(text) =>
                        updateEducation(index, "duration", text)
                      }
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    <TextInput
                      multiline={true}
                      numberOfLines={4}
                      selectionColor={Theme.themeColor}
                      placeholder={t("descriptionPlaceholder")}
                      activeUnderlineColor={Theme.themeColor}
                      underlineColor="transparent"
                      placeholderTextColor="#9B9B9B"
                      value={edu.description}
                      onChangeText={(text) =>
                        updateEducation(index, "description", text)
                      }
                      returnKeyType="done"
                      blurOnSubmit={true}
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
                      <Text style={{ color: "red" }}>{t("remove")}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={addEducationField}>
                  <Text style={{ color: Theme.themeColor }}>+ {t("addEducation")}</Text>
                </TouchableOpacity>

                <View style={styles.sectionDivider} />

                {/* Job Experience Section */}
                <Text style={styles.sectionTitle}>
                  <Icon name="briefcase" size={20} color={Theme.themeColor} style={{ marginRight: 8 }} />
                  {t("jobExperience")}
                </Text>

                {jobExperience.map((job, index) => (
                  <View key={index} style={{ marginBottom: 16 }}>
                    <LoginInputField
                      placeholder={t("companyPlaceholder")}
                      value={job.company}
                      onChangeText={(text) =>
                        updatejobExperience(index, "company", text)
                      }
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                    <LoginInputField
                      placeholder={t("rolePlaceholder")}
                      value={job.role}
                      onChangeText={(text) =>
                        updatejobExperience(index, "role", text)
                      }
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                    <LoginInputField
                      placeholder={t("durationPlaceholder")}
                      value={job.duration}
                      onChangeText={(text) =>
                        updatejobExperience(index, "duration", text)
                      }
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />

                    <TextInput
                      multiline={true}
                      numberOfLines={4}
                      selectionColor={Theme.themeColor}
                      placeholder={t("jobDescriptionPlaceholder")}
                      activeUnderlineColor={Theme.themeColor}
                      underlineColor="transparent"
                      placeholderTextColor="#9B9B9B"
                      value={job.description}
                      onChangeText={(text) =>
                        updatejobExperience(index, "description", text)
                      }
                      returnKeyType="done"
                      blurOnSubmit={true}
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
                      <Text style={{ color: "red" }}>{t("remove")}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={addJobExperienceField}>
                  <Text style={{ color: Theme.themeColor }}>
                    + {t("addJobExperience")}
                  </Text>
                </TouchableOpacity>

                <View style={styles.sectionDivider} />

                {/* Resume Section */}
                <View style={styles.resumeSection}>
                  <Text style={styles.sectionTitle}>
                    <Icon name="file-document-outline" size={20} color={Theme.themeColor} style={{ marginRight: 8 }} />
                    {t("resume")}
                  </Text>
                  
                  <View style={styles.resumeContainer}>
                    {resumeFile ? (
                      <View style={styles.resumeFileContainer}>
                        <Icon name="file-pdf-box" size={24} color="#dc3545" style={{ marginRight: 8 }} />
                        <Text style={styles.resumeFileName} numberOfLines={1}>
                          {resumeFileName}
                        </Text>
                        <TouchableOpacity onPress={removeResume} style={styles.removeResumeButton}>
                          <Icon name="close" size={20} color="#dc3545" />
                        </TouchableOpacity>
                      </View>
                    ) : userProfile?.followData?.resume ? (
                      <View style={styles.existingResumeContainer}>
                        <Icon name="file-pdf-box" size={24} color="#dc3545" style={{ marginRight: 8 }} />
                        <Text style={styles.resumeFileName} numberOfLines={1}>
                          {t("existingResume")}
                        </Text>
                        <Text style={styles.resumeNote}>{t("resumeNote")}</Text>
                      </View>
                    ) : (
                      <View style={styles.noResumeContainer}>
                        <Icon name="file-document-outline" size={24} color="#9B9B9B" style={{ marginBottom: 8 }} />
                        <Text style={styles.noResumeText}>{t("noResumeUploaded")}</Text>
                      </View>
                    )}
                    
                    <TouchableOpacity 
                      style={[styles.uploadResumeButton, isUploadingResume && styles.uploadResumeButtonDisabled]} 
                      onPress={pickResume}
                      disabled={isUploadingResume}
                    >
                      {isUploadingResume ? (
                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      ) : (
                        <Icon name="upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                      )}
                      <Text style={styles.uploadResumeButtonText}>
                        {isUploadingResume ? t("uploadingResume") : (resumeFile ? t("changeResume") : t("uploadResume"))}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

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
            </MainContainer>
          </ScrollView>
        </KeyboardAvoidingView>
      </Provider>
    </SafeArea>
  );
}
