import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { IconButton } from "react-native-paper";
import { Container, RowBetween } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import {

  BASEAPIURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import Theme from "../../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { submitNewJob } from "./SocialMediaAPIs";
import { useTranslation } from "react-i18next";
const CreateNewJob = ({ navigation }) => {
  const { t } = useTranslation();
  const token = useSelector((state) => state.user.token);
  const [jobData, setJobData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    description: "",
    companyDescription: "",
    responsibilities: "",
    CTC: "",
  });

  const handleChange = (name, value) => {
    setJobData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    if (Object.values(jobData).some((value) => value === "")) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitNewJob(jobData); // ✅ call central API
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Job created successfully!");
        // Navigate back to SocialJobs screen with refresh parameter
        navigation.navigate("SocialJobs", { refresh: true });
      } else {
        Alert.alert("Error", response.data?.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Job submission error:", error);
      Alert.alert("Error", error?.response?.data?.message || "Unable to submit job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
             <ScrollView 
         contentContainerStyle={styles.container}
         showsVerticalScrollIndicator={false}
         keyboardShouldPersistTaps="handled"
       >
        <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View
            style={{ display: "flex", justifyContent: "center", width: "72%" }}
          >
            <TopText
              style={{
                color: "#000000",
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {t("createJobPosting")}
            </TopText>
          </View>
        </RowBetween>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Job Title *</Text>
                     <TextInput
             style={styles.input}
             placeholder="e.g., Senior Software Engineer"
             value={jobData.jobTitle}
             onChangeText={(text) => handleChange("jobTitle", text)}
             returnKeyType="next"
             blurOnSubmit={false}
           />

          {/* <Text style={styles.label}>Company</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter company name"
            value={jobData.company}
            onChangeText={(text) => handleChange("company", text)}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={jobData.location}
            onChangeText={(text) => handleChange("location", text)}
          />

          <Text style={styles.label}>Job Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter job description"
            value={jobData.description}
            onChangeText={(text) => handleChange("description", text)}
            multiline
          />

          <Text style={styles.label}>Company Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter company description"
            value={jobData.companyDescription}
            onChangeText={(text) => handleChange("companyDescription", text)}
            multiline
          />

          <Text style={styles.label}>Responsibilities</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Enter responsibilities"
            value={jobData.responsibilities}
            onChangeText={(text) => handleChange("responsibilities", text)}
            multiline
          />

          <Text style={styles.label}>CTC</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter CTC"
            value={jobData.CTC}
            onChangeText={(text) => handleChange("CTC", text)}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity> */}
           <Text style={styles.label}>Company *</Text>
                     <TextInput
             style={styles.input}
             placeholder="e.g., Apple Inc."
             value={jobData.company}
             onChangeText={(text) => handleChange("company", text)}
             returnKeyType="next"
             blurOnSubmit={false}
           />

          <Text style={styles.label}>Location *</Text>
                     <TextInput
             style={styles.input}
             placeholder="e.g., Bengaluru, Karnataka"
             value={jobData.location}
             onChangeText={(text) => handleChange("location", text)}
             returnKeyType="next"
             blurOnSubmit={false}
           />

          <Text style={styles.label}>Job Description *</Text>
                     <TextInput
             style={[styles.input, styles.multilineInput]}
             placeholder="Describe the role, key responsibilities, and what you're looking for in a candidate..."
             value={jobData.description}
             onChangeText={(text) => handleChange("description", text)}
             multiline
             returnKeyType="next"
             blurOnSubmit={false}
           />

          <Text style={styles.label}>Company Description *</Text>
                     <TextInput
             style={[styles.input, styles.multilineInput]}
             placeholder="Tell candidates about your company, culture, and what makes you unique..."
             value={jobData.companyDescription}
             onChangeText={(text) => handleChange("companyDescription", text)}
             multiline
             returnKeyType="next"
             blurOnSubmit={false}
           />

          <Text style={styles.label}>Key Responsibilities *</Text>
                     <TextInput
             style={[styles.input, styles.multilineInput]}
             placeholder="List the main duties and responsibilities for this position..."
             value={jobData.responsibilities}
             onChangeText={(text) => handleChange("responsibilities", text)}
             multiline
             returnKeyType="next"
             blurOnSubmit={false}
           />

          <Text style={styles.label}>Annual Salary (CTC) *</Text>
                     <TextInput
             style={styles.input}
             placeholder="e.g., 32 (in LPA - Lakhs Per Annum)"
             value={jobData.CTC}
             onChangeText={(text) => handleChange("CTC", text)}
             keyboardType="numeric"
             returnKeyType="done"
             blurOnSubmit={true}
           />
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Creating Job Posting..." : "Create Job Posting"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

};




const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  formContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: Theme.themeColor,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateNewJob;
