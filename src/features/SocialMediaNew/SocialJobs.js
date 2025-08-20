import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Button,
  Image,
  Alert,
} from "react-native";
import { IconButton } from "react-native-paper";
import { Container, RowBetween } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";
import NewSocialCard from "./NewSocialCard";
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomNavigation from "../../components/social/BottomNavigation";
import Theme from "../../styles/theme";

import { debounce } from "lodash";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";

const SocialJobs = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState("searchJobs");
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const userId = user._id;
  console.log("user for matching jobs", user);
  const [jobsPerUser, setJobsPerUser] = useState([]);
  const isFocused = useIsFocused();
  const [searchTerm, setSearchTerm] = useState("");
  const [initialDataFetched, setInitialDataFetched] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleJobPress = (job) => {
    navigation.navigate("ViewJobPost", { jobId: job._id });
  };

  
  const deleteJob = async (jobId) => {
    // Alert.alert(
    //   "Confirm Deletion",
    //   `Are you sure you want to delete the entry?`,
    //   [
    //     {
    //       text: "No",
    //       onPress: () => {
    //         console.log("Deletion canceled.");
    //       },
    //       style: "cancel",
    //     },
    //     {
    //       text: "Yes",
    //       onPress: async () => {
    //         try {
    //           const token = await AsyncStorage.getItem("token");
    //           if (!token) {
    //             alert("You are not authorized. Please log in again.");
    //             return;
    //           }
  
    //           const apiUrl = `/social/job/delete/${jobId}`;
    //           const response = await apiClient.delete(apiUrl, {
    //             headers: {
    //               Authorization: `Bearer ${token}`,
    //             },
    //           });
  
    //           if (response.status === 200) {
    //             alert(`Job entry was deleted successfully.`);
    //             setAllUserJobs((prevJobs) =>
    //               prevJobs.filter((job) => job._id !== jobId)
    //             );
    //           } else {
    //             alert(
    //               `Failed to delete the entry. Status: ${response.status}`
    //             );
    //             return false;
    //           }
    //         } catch (error) {
    //           alert(
    //             `An error occurred while deleting the entry: ${error.message}`
    //           );
    //           return false;
    //         }
    //       },
    //     },
    //   ],
    //   { cancelable: false }
    // );
  Alert.alert(
  t("confirm_deletion_title"),
  t("confirm_deletion_message"),
  [
    {
      text: t("no"),
      onPress: () => console.log("Deletion canceled."),
      style: "cancel",
    },
    {
      text: t("yes"),
      onPress: async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            alert(t("unauthorized_alert"));
            return;
          }

          const apiUrl = `/social/job/delete/${jobId}`;
          const response = await apiClient.delete(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            alert(t("job_deleted_success"));
            setAllUserJobs((prevJobs) =>
              prevJobs.filter((job) => job._id !== jobId)
            );
          } else {
            alert(t("job_delete_failed", { status: response.status }));
            return false;
          }
        } catch (error) {
          alert(t("job_delete_error", { error: error.message }));
          return false;
        }
      },
    },
  ],
  { cancelable: false }
);
  };
  
  const [appliedJobsPage, setAppliedJobsPage] = useState(1);
  const [allAppliedJobsLoaded, setAllAppliedJobsLoaded] = useState(false);
  const [allAppliedJobs, setAllAppliedJobs] = useState([]);
  const [allJobsPage, setAllJobsPage] = useState(1);
  const [allJobsLoaded, setAllJobsLoaded] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const [userJobsPage, setUserJobsPage] = useState(1);
  const [allUserJobsLoaded, setAllUserJobsLoaded] = useState(false);
  const [allUserJobs, setAllUserJobs] = useState([]);
  const [appliedJobsSearchQuery, setAppliedJobsSearchQuery] = useState("");
  const [allJobsSearchQuery, setAllJobsSearchQuery] = useState("");
  const [userJobsSearchQuery, setUserJobsSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  

const fetchAppliedJobs = async (query = "") => {
  if (allAppliedJobsLoaded || loading) return;

  query = typeof query === "string" ? query : "";
  console.log("Inside all applied jobs fetch:", query);

  setLoading(true);
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Unauthorized");

    console.log("Token:", token);
    console.log("User ID:", userId);

    const response = await apiClient.get(
      `/social/job/applied/${userId}?page=${appliedJobsPage}&limit=10&search=${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    console.log("Fetched applied jobs:", data);

    if (data.appliedJobs.length < 10) setAllAppliedJobsLoaded(true);
    setAllAppliedJobs((prev) => [...prev, ...data.appliedJobs]);
    setAppliedJobsPage((prevPage) => prevPage + 1);
  } catch (error) {
    console.error("Error fetching applied jobs:", error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};

  

 
  const fetchAllJobs = async (query = "") => {
    if (allJobsLoaded || loading) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");
  
      const response = await apiClient.get(
        `/social/job/all?page=${allJobsPage}&limit=10&search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = response.data;
      if (data.jobs.length < 10) setAllJobsLoaded(true);
  
      const filteredJobs = data.jobs.filter((job) => job.createdBy !== userId);
      setAllJobs((prev) => [...prev, ...filteredJobs]);
      setAllJobsPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching all jobs:", error);
    } finally {
      setLoading(false);
    }
  };
  

  
  const fetchJobsByUser = async (query = "") => {
    if (allUserJobsLoaded || loading) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");
  
      const response = await apiClient.get(
        `/social/job/all/${userId}?page=${userJobsPage}&limit=10&search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = response.data;
      if (data.userJobs.length < 10) setAllUserJobsLoaded(true);
      setAllUserJobs((prev) => [...prev, ...data.userJobs]);
      setUserJobsPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
    } finally {
      setLoading(false);
    }
  };
  


  const debouncedFetchData = useCallback(
    debounce((query, tab) => {
      console.log("inside debounce");
      if (tab === "appliedJobs") {
        setAllAppliedJobs([]);
        setAppliedJobsPage(1);
        setAllAppliedJobsLoaded(false);
        fetchAppliedJobs(query);
      } else if (tab === "searchJobs") {
        setAllJobs([]);
        setAllJobsPage(1);
        setAllJobsLoaded(false);
        fetchAllJobs(query);
      } else if (tab === "yourListings") {
        setAllUserJobs([]);
        setUserJobsPage(1);
        setAllUserJobsLoaded(false);
        fetchJobsByUser(query);
      }
    }, 1000),
    []
  );

  const handleSearch = (query) => {
    if (activeTab === "appliedJobs") {
      setAppliedJobsSearchQuery(query);
      debouncedFetchData(query, "appliedJobs");
    } else if (activeTab === "searchJobs") {
      setAllJobsSearchQuery(query);
      debouncedFetchData(query, "searchJobs");
    } else if (activeTab === "yourListings") {
      setUserJobsSearchQuery(query);
      debouncedFetchData(query, "yourListings");
    }
  };

  const fetchDataOnTabFocus = () => {
    if (activeTab === "appliedJobs") {
      debouncedFetchData(appliedJobsSearchQuery, "appliedJobs");
    } else if (activeTab === "searchJobs") {
      debouncedFetchData(allJobsSearchQuery, "searchJobs");
    } else if (activeTab === "yourListings") {
      debouncedFetchData(userJobsSearchQuery, "yourListings");
    }
  };

  const getApplicantStatus = (applicants, userId) => {
    const applicant = applicants.find((job) => job.applicantId === userId);
    return applicant ? applicant.status : "Not Applied"; 
  };

 
  useEffect(() => {
    fetchAppliedJobs(appliedJobsSearchQuery);
    fetchAllJobs(allJobsSearchQuery);
    fetchJobsByUser(userJobsSearchQuery);
    setInitialDataFetched(true); 
  }, []);
  
  
  useEffect(() => {
    if (isFocused && initialDataFetched) {
      fetchDataOnTabFocus(); 
    }
  }, [isFocused]);

  // Handle refresh parameter from navigation
  useEffect(() => {
    if (route.params?.refresh) {
      fetchDataOnTabFocus();
      // Clear the refresh parameter to prevent infinite refresh
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);


  



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
             {t("jobs")}
            </TopText>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("CreateNewJob")}>
            <Ionicons name="add" size={30} color="#000" />
          </TouchableOpacity>
        </RowBetween>
        
        {activeTab === "appliedJobs" && (
          <View style={styles.searchContainer}>
            <View style={styles.searchFilter}>
              <TextInput
                style={styles.searchInput}
                value={appliedJobsSearchQuery}
               placeholder={t("search_jobs_placeholder")}
                onChangeText={handleSearch}
              />
             
            </View>
            <FlatList
              data={allAppliedJobs}
              onEndReached={() => fetchAppliedJobs(appliedJobsSearchQuery)}
              onEndReachedThreshold={0.5}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleJobPress(item)}>
                <View style={styles.jobItem}>
                  <View style={styles.jobInfo}>
                    <View>
                      <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                      <Text style={styles.companyName}>{item.company}</Text>
                      <Text style={styles.jobLocation}>{item.location}</Text>
                    </View>
                    <Text style={styles.jobStatus}>{getApplicantStatus(item.applicants, userId)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              )}
            />
          </View>
        )}
        {activeTab === "searchJobs" && (
          <View style={styles.searchContainer}>
           
          
            <View style={styles.searchFilter}>
              <TextInput
                value={allJobsSearchQuery}
                style={styles.searchInput}
               placeholder={t("search_jobs_placeholder")}
                onChangeText={handleSearch}
              />
             
            </View>
            <FlatList
              data={allJobs}
              onEndReached={() => fetchAllJobs(allJobsSearchQuery)}
              onEndReachedThreshold={0.5}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleJobPress(item)}>
                  <View style={styles.jobItem}>
                    <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                    <Text style={styles.companyName}>{item.company}</Text>
                    <Text style={styles.jobLocation}>{item.location}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        {activeTab === "yourListings" && (
          <>
            <View style={styles.searchContainer}>
              <View style={styles.searchFilter}>
                <TextInput
                  value={userJobsSearchQuery}
                  style={styles.searchInput}
                 placeholder={t("search_jobs_placeholder")}
                  onChangeText={handleSearch}
                />
                
              </View>
              <FlatList
                data={allUserJobs}
                keyExtractor={(item) => item._id.toString()}
                onEndReached={() => fetchJobsByUser(userJobsSearchQuery)}
                onEndReachedThreshold={0.5}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleJobPress(item)}>
                    <View style={styles.listingItem}>
                      <View style={styles.listingDetails}>
                        <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                        <Text style={styles.companyName}>{item.company}</Text>
                        <Text style={styles.jobLocation}>{item.location}</Text>
                      </View>
                      <View style={styles.iconContainer}>
                        <TouchableOpacity
                          onPress={() => navigation.navigate("EditJob", item)}
                        >
                          <Ionicons
                            name="pencil"
                            size={20}
                            color="#000"
                            style={styles.icon}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteJob(item._id)}>
                          <Ionicons
                            name="trash-bin"
                            size={20}
                            color="#000"
                            style={styles.icon}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </>
        )}
      
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "appliedJobs" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("appliedJobs")}
          >
            <Text style={styles.tabText}>{t("applied_jobs")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "searchJobs" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("searchJobs")}
          >
            <Text style={styles.tabText}>{t("search_jobs")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "yourListings" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("yourListings")}
          >
            <Text style={styles.tabText}>{t("your_listings")}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNavigation navigation={navigation} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  searchFilter: {
    flexDirection: "row",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  tabButton: {
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 10,
    marginTop: 20,
    backgroundColor: "#e0e0e0",
  },
  activeTab: {
    backgroundColor: Theme.themeColor,
    color: "white",
  },
  tabText: {
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    width: "90%",
  },
  jobItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  jobCompany: {
    fontSize: 14,
    color: "#555",
  },
  jobLocation: {
    fontSize: 12,
    color: "#888",
  },
  jobStatus: {
    fontSize: 12,
    color: "#0073b1",
    marginTop: 5,
  },
  recentSearchesContainer: {
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  searchItem: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 10,
  },
  searchText: {
    color: "#333",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedRadioCircle: {
    backgroundColor: "#000",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listingItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    flexDirection: "row", // Arrange job details and icons horizontally
    justifyContent: "space-between", // Space between job details and icons
    alignItems: "center", // Center content vertically
  },
  listingDetails: {
    flex: 1, // Allow job details to take up remaining space
  },
  iconContainer: {
    flexDirection: "row", // Arrange icons horizontally
    alignItems: "center", // Align icons vertically in the center
    gap: 10, // Add spacing between icons (alternative to margin)
  },
  icon: {
    marginHorizontal: 5, // Adjust spacing around individual icons if needed
  },
  jobInfo: {
    flexDirection: 'row', // Align job details and status horizontally
    justifyContent: 'space-between', // Push status to the right
    alignItems: 'center', // Align items vertically in the center
  },
  jobStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007BFF', // Highlight status with a blue color
    backgroundColor: '#EAF4FF', // Light blue background for contrast
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15, // Rounded edges
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 80, // Ensure consistent width
  },
});

export default SocialJobs;
