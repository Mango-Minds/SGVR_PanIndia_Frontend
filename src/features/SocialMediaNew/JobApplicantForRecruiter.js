import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  Button,
  Alert,
  Platform,
} from "react-native";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Container, RowBetween } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";

import { useSelector } from "react-redux";
import { Provider, RadioButton, ActivityIndicator } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
const JobApplicantForRecruiter = ({ route, navigation }) => {
  const { item, job } = route.params;
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);

  const [applicant, setApplicant] = useState(item);
  const [applicantProfileData, setApplicantProfileData] = useState({});
  const [applicationStatus, setApplicationStatus] = useState(applicant.status);

  const userId = user.roleData.owner;
  const jobId = job._id;
  const applicantId = applicant.applicantId._id;

  // console.log(applicant);

  // const changeApplicationStatus = async () => {
  //   const statusData = {
  //     status: applicationStatus,
  //   };
  //   try {
  //     url = `${BASEAPIURL}/social/job/applicant/${jobId}/${applicantId}`;
  //     const response = await fetch(url, {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(statusData),
  //     });
  //     const data = response.json();
  //     if (response.ok) {
  //       Alert.alert("Success", "Job Application updated successfully!");
  //       navigation.goBack();
  //     } else {
  //       Alert.alert("Error", data.message || "Something went wrong.");
  //     }
  //   } catch (error) {
  //     console.error("Job update error:", error);
  //   }
  // };

  // const followProfile = async () => {
  //   try {
  //     url = `${BASEAPIURL}/user/profile/${applicantId}`;
  //     const response = await fetch(url, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       setApplicantProfileData(data);
  //     } else {
  //       console.error("cannot get profile data", data.error);
  //     }
  //   } catch (error) {
  //     console.error("Job application error:", error);
  //   }
  // };

  const changeApplicationStatus = async () => {
    const statusData = {
      status: applicationStatus,
    };
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("Authentication token is missing.");
        Alert.alert("Error", "You are not authorized. Please log in again.");
        return;
      }
  
      const url = `/social/job/applicant/${jobId}/${applicantId}`;
      const response = await apiClient.put(url, statusData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        Alert.alert("Success", "Job Application updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", response?.data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Job update error:", error);
    }
  };
  
  const followProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("Authentication token is missing.");
        Alert.alert("Error", "You are not authorized. Please log in again.");
        return;
      }
  
      const url = `/user/profile/${applicantId}`;
      const response = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = response.data;
      if (response.status === 200) {
        setApplicantProfileData(data);
      } else {
        console.error("cannot get profile data", data.error);
      }
    } catch (error) {
      console.error("Job application error:", error);
    }
  };
  

  useEffect(() => {
    followProfile();
  }, []);

  const renderEducationItem = ({ item }) => (
    <View style={styles.educationItem}>
      <Text style={styles.educationDegree}>{item.degree}</Text>
      <Text style={styles.educationInstitution}>{item.institution}</Text>
      <Text style={styles.educationDuration}>{item.duration}</Text>
      {item.description && (
        <Text style={styles.educationDescription}>{item.description}</Text>
      )}
    </View>
  );

  const renderJobItem = ({ item }) => (
    <View style={styles.jobItem}>
      <Text style={styles.jobCompany}>{item.company}</Text>
      <Text style={styles.jobRole}>{item.role}</Text>
      <Text style={styles.jobDuration}>{item.duration}</Text>
      {item.description && (
        <Text style={styles.jobDescription}>{item.description}</Text>
      )}
    </View>
  );

  const downloadPDF = async (resumeUri) => {
    if (!resumeUri) return;

    // Extract filename from URL
    const filename = getFileNameFromUrl(resumeUri);

    try {
      // Download the resume from the URL
      const result = await FileSystem.downloadAsync(
        resumeUri,
        FileSystem.documentDirectory + filename
      );

      // Save the file
      await save(result.uri, filename, result.headers["Content-Type"]);
      alert("Resume downloaded successfully");
    } catch (error) {
      console.log("Error downloading file:", error);
    }
  };

  // Function to save the downloaded file
  const save = async (uri, filename, mimetype) => {
    if (Platform.OS === "android") {
      try {
        // Request directory permissions on Android
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          // Create and write the file to the requested directory
          await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            filename,
            mimetype
          ).then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          });
        } else {
          // If permissions aren't granted, fallback to sharing the file
          shareAsync(uri);
        }
      } catch (e) {
        console.log("Error saving file:", e);
        // Fallback to sharing if any error occurs
        shareAsync(uri);
      }
    } else {
      // For iOS and other platforms, share the file directly
      shareAsync(uri);
    }
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return "No Resume Uploaded";
    // Extract the last segment after the last slash
    const fullPath = url.split("/").pop();

    return fullPath
      .split("profileBanner")
      .pop()
      .replace(/^[\\/]/, "");
  };

  const resumeUri = `${applicantProfileData?.followData?.resume?.replace(/\\/g, "/")}`

  // console.log(resumeUri);

  return (
    <>
      <View style={styles.container}>
        <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={{ alignItems: "center" }}>
            <TopText
              style={{
                color: Theme.themeColor,
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {applicant.applicantId.firstName} {applicant.applicantId.lastName}
            </TopText>
          </View>
          <TouchableOpacity>
            <Ionicons
              name="pencil"
              size={20}
              color="#fff"
              style={styles.filterIcon}
            />
          </TouchableOpacity>
        </RowBetween>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Resume Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Resume</Text>
            <View style={styles.resumeItem}>
              <Text style={styles.resumeFileName}>
                {getFileNameFromUrl(applicantProfileData?.followData?.resume)}
              </Text>
              <TouchableOpacity 
                style={styles.downloadResumeButton} 
                onPress={() => downloadPDF(resumeUri)}
              >
                <Text style={styles.downloadResumeButtonText}>Download Resume</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Education Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Education</Text>
            <FlatList
              data={applicantProfileData?.followData?.education}
              renderItem={renderEducationItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.list}
            />
          </View>

          {/* Job Experience Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Job Experience</Text>
            <FlatList
              data={applicantProfileData?.followData?.jobExperience}
              renderItem={renderJobItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.list}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <RadioButton.Group
            value={applicationStatus}
            onValueChange={(newValue) => setApplicationStatus(newValue)}
          >
            <View style={styles.radioButtonContainer}>
              <RadioButton value="applied" color={Theme.themeColor} />
              <Text style={styles.radioButtonText}>Applied</Text>

              <RadioButton value="under review" color={Theme.themeColor} />
              <Text style={styles.radioButtonText}>Under Review</Text>

              <RadioButton value="rejected" color={Theme.themeColor} />
              <Text style={styles.radioButtonText}>Rejected</Text>
            </View>
          </RadioButton.Group>
          <TouchableOpacity
            style={styles.changeStatusButton}
            onPress={() => changeApplicationStatus()}
          >
            <Text style={styles.changeStatusButtonText}>Change Applicant Status</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  resumeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  resumeFileName: {
    flex: 1,
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  downloadResumeButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.themeColor,
  },
  downloadResumeButtonText: {
    color: Theme.themeColor,
    fontSize: 12,
    fontWeight: "600",
  },
  educationItem: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Theme.themeColor,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  educationInstitution: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  educationDuration: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  educationDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  jobItem: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
  },
  jobCompany: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  jobRole: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  jobDuration: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  list: {
    paddingBottom: 16,
  },
  bottomBar: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  radioButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginLeft: 4,
  },
  changeStatusButton: {
    backgroundColor: Theme.themeColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  changeStatusButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default JobApplicantForRecruiter;
