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
import { Ionicons } from "react-native-vector-icons";
import { Container, RowBetween } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import {
  BASEIMGURL,
  BASEAPIURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import { Provider, RadioButton, ActivityIndicator } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";

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

  const changeApplicationStatus = async () => {
    const statusData = {
      status: applicationStatus,
    };
    try {
      url = `${BASEAPIURL}/social/job/applicant/${jobId}/${applicantId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(statusData),
      });
      const data = response.json();
      if (response.ok) {
        Alert.alert("Success", "Job Application updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Job update error:", error);
    }
  };

  const followProfile = async () => {
    try {
      url = `${BASEAPIURL}/user/profile/${applicantId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
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
    <View style={styles.card}>
      <Text style={styles.title}>{item.degree}</Text>
      <Text style={styles.subtitle}>{item.institution}</Text>
      <Text style={styles.duration}>{item.duration}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderJobItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.role}</Text>
      <Text style={styles.subtitle}>{item.company}</Text>
      <Text style={styles.duration}>{item.duration}</Text>
      <Text style={styles.description}>{item.description}</Text>
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

  const resumeUri = `${BASEIMGURL}${applicantProfileData?.followData?.resume?.replace(/\\/g, "/")}`

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
          style={styles.container}
          contentContainerStyle={styles.scrollContainer}
        >
          <Text style={styles.sectionHeader}>Resume</Text>
          <Text style={styles.title}>
            {getFileNameFromUrl(applicantProfileData?.followData?.resume)}
          </Text>
          <TouchableOpacity style={[styles.uploadButton, { width: "45%" }]} onPress={() => downloadPDF(resumeUri)}>
            <Text style={styles.uploadButtonText}>Download Resume</Text>
          </TouchableOpacity>

          <Text style={styles.sectionHeader}>Education</Text>
          <FlatList
            data={applicantProfileData?.followData?.education}
            renderItem={renderEducationItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false} // Disable scrolling for this FlatList
            contentContainerStyle={styles.list}
          />
          <Text style={styles.sectionHeader}>Job Experience</Text>
          <FlatList
            data={applicantProfileData?.followData?.jobExperience}
            renderItem={renderJobItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false} // Disable scrolling for this FlatList
            contentContainerStyle={styles.list}
          />
        </ScrollView>

        <View style={styles.bottomBar}>
          <RadioButton.Group
            value={applicationStatus} // Bind the selected value to the state
            onValueChange={(newValue) => setApplicationStatus(newValue)} // Update state on change
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
                marginBottom: 15,
              }}
            >
              {/* Option 1 */}
              <RadioButton value="applied" color={Theme.themeColor} />
              <Text
                style={{
                  marginRight: 10,
                  color: "grey",
                  fontWeight: "600",
                }}
              >
                Applied
              </Text>

              {/* Option 2 */}
              <RadioButton value="under review" color={Theme.themeColor} />
              <Text style={{ color: "grey", fontWeight: "600" }}>
                Under Review
              </Text>

              {/* Option 3 */}
              <RadioButton value="rejected" color={Theme.themeColor} />
              <Text
                style={{
                  marginRight: 10,
                  color: "grey",
                  fontWeight: "600",
                }}
              >
                Rejected
              </Text>
            </View>
          </RadioButton.Group>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => changeApplicationStatus()}
          >
            <Text style={styles.uploadButtonText}>Change Applicant Status</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  jobCompany: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
  jobLocation: {
    fontSize: 14,
    color: "#888",
    marginVertical: 5,
  },
  jobStatus: {
    fontSize: 14,
    color: "#0073b1",
    marginVertical: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginVertical: 5,
  },
  bottomBar: {
    paddingVertical: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  uploadButton: {
    backgroundColor: Theme.themeColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.themeColor,
    marginBottom: 8,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    fontWeight: "400",
    color: "#000",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: "300",
    color: "#000",
  },
});

export default JobApplicantForRecruiter;
