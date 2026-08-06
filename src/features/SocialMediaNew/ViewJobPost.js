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
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [profileWarning, setProfileWarning] = useState("");
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
  const getApplicationStatus = (applicants, userId) => {
    if (!applicants || !Array.isArray(applicants)) return null;
    const applicant = applicants.find((applicant) => applicant.applicantId._id === userId);
    return applicant ? applicant.status : null;
  };

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
        // Update the application status after successful application
        setApplicationStatus("applied");
        navigation.goBack();
      } else {
        Alert.alert("Error", response?.data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Job application error:", error.response?.data || error.message);
      
      // Handle specific profile completion validation errors
      if (error.response?.status === 400 && error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes("complete your profile")) {
          Alert.alert(
            "Profile Incomplete",
            errorMessage,
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Complete Profile",
                onPress: () => {
                  // Navigate to profile screen to complete profile
                  navigation.navigate("ProfileNewScreen");
                }
              }
            ]
          );
        } else {
          Alert.alert("Error", errorMessage);
        }
      } else {
        Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
      }
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

  const checkProfileCompleteness = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await apiClient.get(`/user/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const userProfile = response.data;
        const hasEducation = userProfile?.followData?.education && userProfile.followData.education.length > 0;
        const hasExperience = userProfile?.followData?.jobExperience && userProfile.followData.jobExperience.length > 0;
        const hasResume = userProfile?.followData?.resume && userProfile.followData.resume.trim() !== '';

        if (!hasEducation || !hasExperience || !hasResume) {
          setIsProfileComplete(false);
          let missingFields = [];
          if (!hasEducation) missingFields.push("education");
          if (!hasExperience) missingFields.push("job experience");
          if (!hasResume) missingFields.push("resume");
          setProfileWarning(`Complete your profile (${missingFields.join(', ')}) before applying`);
        } else {
          setIsProfileComplete(true);
          setProfileWarning("");
        }
      }
    } catch (error) {
      console.error("Error checking profile completeness:", error);
    }
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
      checkProfileCompleteness();
    }
  }, [isFocused]);

  // Update application status when job data changes
  useEffect(() => {
    if (job && job.applicants) {
      const status = getApplicationStatus(job.applicants, userId);
      setApplicationStatus(status);
    }
  }, [job, userId]);

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

        {/* Use FlatList instead of ScrollView to avoid VirtualizedList nesting */}
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <>
              {/* Job Details */}
              {job && (
                <View style={styles.detailsContainer}>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle}>{job.jobTitle}</Text>
                    {applicationStatus && (
                      <View style={[styles.statusBadge, styles[`status${applicationStatus.replace(/\s+/g, '_')}`]]}>
                        <Text style={[styles.statusText, styles[`status${applicationStatus.replace(/\s+/g, '_')}Text`]]}>
                          {applicationStatus === "applied" ? "Applied" : 
                           applicationStatus === "under review" ? "Under Review" : 
                           applicationStatus === "rejected" ? "Rejected" : applicationStatus}
                        </Text>
                      </View>
                    )}
                    <View style={styles.companyInfo}>
                      <Ionicons name="business" size={16} color="#666" />
                      <Text style={styles.jobCompany}>{job.company}</Text>
                    </View>
                    <View style={styles.locationInfo}>
                      <Ionicons name="location" size={16} color="#666" />
                      <Text style={styles.jobLocation}>{job.location}</Text>
                    </View>
                    <View style={styles.ctcInfo}>
                      <Ionicons name="cash" size={16} color="#666" />
                      <Text style={styles.ctcText}>₹{job.CTC} LPA</Text>
                    </View>
                  </View>
                  
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("jobDescription")}</Text>
                    <Text style={styles.detailText}>{job.description}</Text>
                  </View>
                  
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("companyDescription")}</Text>
                    <Text style={styles.detailText}>{job.companyDescription}</Text>
                  </View>
                  
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("responsibilities")}</Text>
                    <Text style={styles.detailText}>{job.responsibilities}</Text>
                  </View>
                </View>
              )}

              {/* Applicants Section - Only show if user is the job creator */}
              {job && job.createdBy && userId === job.createdBy._id && job.applicants && job.applicants.length > 0 && (
                <View style={styles.applicantsSection}>
                  <Text style={styles.headerText}>{t("applicants")} ({job.applicants.length})</Text>
                  {job.applicants.map((item, index) => (
                    <TouchableOpacity 
                      key={item._id || index}
                      onPress={() => handleApplicantScreen(item)}
                      style={styles.applicantCard}
                    >
                      <View style={styles.applicantInfo}>
                        <View style={styles.applicantAvatar}>
                          <Text style={styles.avatarText}>
                            {(item.applicantId?.firstName?.charAt(0) || 'U')}{(item.applicantId?.lastName?.charAt(0) || 'U')}
                          </Text>
                        </View>
                        <View style={styles.applicantDetails}>
                          <Text style={styles.applicantName}>
                            {item.applicantId?.firstName || 'Unknown'} {item.applicantId?.lastName || 'User'}
                          </Text>
                          <Text style={styles.applicantEmail}>{item.applicantId?.email || 'Email not provided'}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, styles[`status${item.status.replace(/\s+/g, '_')}`]]}>
                        <Text style={[styles.statusText, styles[`status${item.status.replace(/\s+/g, '_')}Text`]]}>{item.status}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Empty state for applicants */}
              {job && job.createdBy && userId === job.createdBy._id && (!job.applicants || job.applicants.length === 0) && (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No applicants yet</Text>
                  <Text style={styles.emptyStateSubtext}>Share this job posting to attract more candidates</Text>
                </View>
              )}

              {/* Bottom spacing for apply button */}
              {job && job.createdBy && userId !== job.createdBy._id && <View style={styles.bottomSpacing} />}
            </>
          )}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
        />

        {/* Bottom Bar for Apply Button or Status - Fixed at bottom */}
        {job && job.createdBy && userId !== job.createdBy._id && (
          <View style={styles.bottomBar}>
            {/* Profile Completion Warning */}
            {!isProfileComplete && !applicationStatus && (
              <View style={styles.profileWarningContainer}>
                <Ionicons name="warning" size={16} color="#D4AF37" style={{ marginRight: 8 }} />
                <Text style={styles.profileWarningText}>{profileWarning}</Text>
                <TouchableOpacity
                  style={styles.completeProfileButton}
                  onPress={() => navigation.navigate("ProfileNewScreen")}
                >
                  <Text style={styles.completeProfileButtonText}>Complete Profile</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {applicationStatus ? (
              // Show application status
              <View style={[styles.statusButton, styles[`status${applicationStatus}`]]}>
                <Ionicons 
                  name={applicationStatus === "applied" ? "checkmark-circle" : 
                        applicationStatus === "under_review" ? "time" : "close-circle"} 
                  size={20} 
                  color="#fff" 
                  style={{ marginRight: 8 }} 
                />
                <Text style={styles.statusButtonText}>
                  {applicationStatus === "applied" ? "Applied" : 
                   applicationStatus === "under_review" ? "Under Review" : 
                   applicationStatus === "rejected" ? "Rejected" : applicationStatus}
                </Text>
              </View>
            ) : (
              // Show apply button (disabled if profile incomplete)
              <TouchableOpacity
                style={[styles.uploadButton, !isProfileComplete && styles.disabledButton]}
                onPress={sendApplication}
                disabled={!isProfileComplete}
              >
                <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.uploadButtonText}>{t("apply")}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  detailsContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  jobHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  jobCompany: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
    fontWeight: "500",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  jobLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  ctcInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctcText: {
    fontSize: 16,
    color: "#27ae60",
    fontWeight: "bold",
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  applicantsSection: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  applicantCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  applicantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.themeColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  applicantDetails: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  applicantEmail: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  statusapplied: {
    backgroundColor: "#4caf50",
  },
  statusunder_review: {
    backgroundColor: "#ff9800",
  },
  statusrejected: {
    backgroundColor: "#f44336",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    color: "#fff",
  },
  statusappliedText: {
    color: "#fff",
  },
  statusunder_reviewText: {
    color: "#fff",
  },
  statusrejectedText: {
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 100,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  uploadButton: {
    backgroundColor: Theme.themeColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  profileWarningContainer: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeaa7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileWarningText: {
    flex: 1,
    fontSize: 14,
    color: "#856404",
    marginRight: 8,
  },
  completeProfileButton: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completeProfileButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
});

export default ViewJobPost;
