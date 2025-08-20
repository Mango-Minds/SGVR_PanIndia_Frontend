import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Container, RowBetween } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";

import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";

const ViewJobPost = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { jobId } = route.params; // receives job id details from SocialJobs component
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const userId = user._id;
  const [job, setJob] = useState(null);
  const isFocused = useIsFocused();

  // const sendApplication = async () => {
  //   url = `${BASEAPIURL}/social/job/apply/${job._id}`;
  //   try {
  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       Alert.alert("Success", "Job Application sent successfully!");
  //       navigation.goBack();
  //     } else {
  //       Alert.alert("Error", data.message || "Something went wrong.");
  //     }
  //   } catch (error) {
  //     console.error("Job application error:", error);
  //   }
  // };
  const sendApplication = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("Authentication token is missing.");
        Alert.alert("Error", "You are not authorized. Please log in again.");
        return;
      }
  
      const url = `/social/job/apply/${job._id}`;
      const response = await apiClient.post(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", response?.data?.message || "Job Application sent successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", response?.data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Job application error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
    }
  };
  
  
  
  const fetchJobDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("Authentication token is missing.");
        Alert.alert("Error", "You are not authorized. Please log in again.");
        return;
      }
  
      const url = `/social/job/${jobId}`;
      const response = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        console.log("one job", response.data.job);
        setJob(response.data.job);
      } else {
        setError(response?.data?.message || "Failed to fetch job details");
      }
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplicantScreen = (item) => {
    navigation.navigate("JobApplicantForRecruiter", { item,job });
  };


  
  // const fetchJobDetails = async () => {
  //   const url = `${BASEAPIURL}/social/job/${jobId}`;
  //   try {
  //     const response = await fetch(url, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await response.json();
  //     console.log("one job", data.job);
  //     if (response.ok) {
  //       setJob(data.job);
  //     } else {
  //       setError(data.message || "Failed to fetch job details");
  //     }
  //   } catch (err) {
  //     console.error("Error fetching job details:", err);
  //     setError("An unexpected error occurred.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if(isFocused){
      fetchJobDetails();
    }
  }, [isFocused]);

  return (
    <>
    <ScrollView>
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
                color: "#000000",
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {t("jobPosting")}
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

        {/* Job Details */}

        {job && (
        <View style={styles.detailsContainer}>
          <Text style={styles.jobTitle}>{job.jobTitle}</Text>
          <Text style={styles.jobCompany}>{job.company}</Text>
          <Text style={styles.jobLocation}>{job.location}</Text>
          <Text style={styles.label}>{t("jobDescription")}</Text>
          <Text style={styles.detailText}>{job.description}</Text>
          <Text style={styles.label}>{t("companyDescription")}</Text>
          <Text style={styles.detailText}>{job.companyDescription}</Text>
          <Text style={styles.label}>{t("responsibilities")}</Text>
          <Text style={styles.detailText}>{job.responsibilities}</Text>
          <Text style={styles.label}>{t("ctc")}</Text>
          <Text style={styles.detailText}>{job.CTC}</Text>
        </View>
      )}


        {job && userId === job.createdBy._id && job.applicants && (
          <>
            <Text style={styles.headerText}>{t("applicants")}: </Text>
            <FlatList
              contentContainerStyle={styles.listWrapper}
              data={job.applicants}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleApplicantScreen(item)}>
                  <View style={styles.card}>
                    <Text style={styles.applicantName}>
                      {item.applicantId.firstName} {item.applicantId.lastName}
                    </Text>
                    <Text style={styles.applicantStatus}>{item.status}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* Bottom Bar for Document Picker */}
        {job && userId !== job.createdBy._id && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={sendApplication}
            >
              <Text style={styles.uploadButtonText}>{t("apply")}</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
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

  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    marginLeft: 10,
  },
  listWrapper: {
    paddingHorizontal: 10,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Shadow for Android
  },
  applicantName: {
    fontSize: 16,
    color: '#34495E',
    fontWeight: '600',
    flex: 1, // Ensures proper spacing with the status
  },
  applicantStatus: {
    fontSize: 14,
    color: '#2980B9',
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 0, // Prevents text wrapping
    textTransform: 'capitalize',
  },
});

export default ViewJobPost;
