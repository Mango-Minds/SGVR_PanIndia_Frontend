import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { IconButton } from "react-native-paper";
import { Container, RowBetween } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import {
  BASEIMGURL,
  BASEAPIURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import { useSelector } from "react-redux";
const CreateNewJob = ({ navigation }) => {
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

  const handleSubmit = async () => {
    if (Object.values(jobData).some((value) => value === "")) {
      Alert.alert("Error", "Please fill all fields.");
    } else {
      const url = `${BASEAPIURL}/social/job/create`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jobData),
        });

        const data = await response.json();
        if (response.ok) {
          Alert.alert("Success", "Job created successfully!");
          navigation.goBack();
        } else {
          Alert.alert("Error", data.error || "Something went wrong.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Unable to submit job.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
            Create Job Posting
          </TopText>
        </View>
      </RowBetween>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Job Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter job title"
          value={jobData.jobTitle}
          onChangeText={(text) => handleChange("jobTitle", text)}
        />

        <Text style={styles.label}>Company</Text>
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
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    backgroundColor: "#d4af37",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreateNewJob;
