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
    console.log("Tab changed to:", tab);
    setActiveTab(tab);
    
    // Refresh data when switching to Your Listings tab
    if (tab === "yourListings") {
      console.log("Refreshing Your Listings data");
      // Reset all state variables first
      setAllUserJobs([]);
      setUserJobsPage(1);
      setAllUserJobsLoaded(false);
      setLoading(false);
      
      // Fetch data immediately without setTimeout
      fetchJobsByUser("", true);
    } else if (tab === "appliedJobs") {
      console.log("Refreshing Applied Jobs data");
      setAllAppliedJobs([]);
      setAppliedJobsPage(1);
      setAllAppliedJobsLoaded(false);
      setLoading(false);
      fetchAppliedJobs("", true);
    } else if (tab === "searchJobs") {
      console.log("Refreshing Search Jobs data");
      setAllJobs([]);
      setAllJobsPage(1);
      setAllJobsLoaded(false);
      setLoading(false);
      fetchAllJobs("", true);
    }
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
  const [refreshing, setRefreshing] = useState(false);

  

const fetchAppliedJobs = async (query = "", isRefresh = false) => {
  console.log("fetchAppliedJobs called with query:", query, "isRefresh:", isRefresh);
  console.log("allAppliedJobsLoaded:", allAppliedJobsLoaded, "loading:", loading);
  
  // Only check allAppliedJobsLoaded, not loading state for tab changes
  if (allAppliedJobsLoaded && !query && !isRefresh) {
    console.log("fetchAppliedJobs early return due to allAppliedJobsLoaded");
    return;
  }

  query = typeof query === "string" ? query : "";
  console.log("Inside all applied jobs fetch:", query, "isRefresh:", isRefresh);

  if (isRefresh) {
    setRefreshing(true);
  } else {
    setLoading(true);
  }
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Unauthorized");

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
    setAllAppliedJobs((prev) => {
      if (isRefresh) return data.appliedJobs;
      const existingIds = new Set(prev.map(j => j._id));
      const newOnes = data.appliedJobs.filter(j => !existingIds.has(j._id));
      return [...prev, ...newOnes];
    });
    if (!isRefresh) setAppliedJobsPage((prevPage) => prevPage + 1);
  } catch (error) {
    console.error("Error fetching applied jobs:", error.response?.data || error.message);
  } finally {
    if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  }
};

  

 
  const fetchAllJobs = async (query = "", isRefresh = false) => {
    console.log("fetchAllJobs called with query:", query, "isRefresh:", isRefresh);
    console.log("allJobsLoaded:", allJobsLoaded, "loading:", loading);
    console.log("allJobsPage:", allJobsPage);
    
    if (allJobsLoaded && !isRefresh) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");
  
      const pageToUse = isRefresh ? 1 : allJobsPage;
      const response = await apiClient.get(
        `/social/job/all?page=${pageToUse}&limit=10&search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = response.data;
      console.log("All jobs response:", data);
      console.log("Current userId:", userId);
      
      if (data.jobs.length < 10) setAllJobsLoaded(true);
  
      const filteredJobs = data.jobs.filter((job) => job.createdBy?._id !== userId);
      console.log("Original jobs count:", data.jobs.length);
      console.log("Filtered jobs count:", filteredJobs.length);
      console.log("Filtered jobs:", filteredJobs);
      
      setAllJobs((prev) => {
        if (isRefresh) return filteredJobs;
        const existingIds = new Set(prev.map(j => j._id));
        const newOnes = filteredJobs.filter(j => !existingIds.has(j._id));
        return [...prev, ...newOnes];
      });
      if (!isRefresh) setAllJobsPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching all jobs:", error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };
  

  
  const fetchJobsByUser = async (query = "", isRefresh = false) => {
    console.log("fetchJobsByUser called with query:", query, "isRefresh:", isRefresh);
    console.log("allUserJobsLoaded:", allUserJobsLoaded, "loading:", loading);
    console.log("userJobsPage:", userJobsPage);
    
    // Only check allUserJobsLoaded, not loading state for tab changes
    if (allUserJobsLoaded && !query && !isRefresh) {
      console.log("fetchJobsByUser early return due to allUserJobsLoaded");
      return;
    }
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");
  
      console.log("Fetching jobs for user:", userId);
      const pageToUse = isRefresh ? 1 : userJobsPage;
      const response = await apiClient.get(
        `/social/job/all/${userId}?page=${pageToUse}&limit=10&search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = response.data;
      console.log("User jobs response:", data);
      
      // Set the loaded flag only if we have fewer jobs than the limit
      if (data.userJobs.length < 10) {
        setAllUserJobsLoaded(true);
      }
      
      console.log("Setting allUserJobs with:", data.userJobs);
      setAllUserJobs((prev) => {
        // If this is a refresh or search query, replace the entire list
        if (isRefresh || query) {
          return data.userJobs;
        }
        // Otherwise, append new jobs and remove duplicates
        const existingIds = new Set(prev.map(job => job._id));
        const newJobs = data.userJobs.filter(job => !existingIds.has(job._id));
        const combinedJobs = [...prev, ...newJobs];
        console.log("New allUserJobs state will be:", combinedJobs);
        return combinedJobs;
      });
      
      if (!isRefresh) {
        setUserJobsPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching user jobs:", error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };
  


  const debouncedFetchData = useCallback(
    debounce((query, tab) => {
      console.log("inside debounce");
      if (tab === "appliedJobs") {
        setAllAppliedJobs([]);
        setAppliedJobsPage(1);
        setAllAppliedJobsLoaded(false);
        fetchAppliedJobs(query, true);
      } else if (tab === "searchJobs") {
        setAllJobs([]);
        setAllJobsPage(1);
        setAllJobsLoaded(false);
        fetchAllJobs(query, true);
      } else if (tab === "yourListings") {
        setAllUserJobs([]);
        setUserJobsPage(1);
        setAllUserJobsLoaded(false);
        fetchJobsByUser(query, true);
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
      // Force refresh for applied jobs when tab is focused
      setAllAppliedJobs([]);
      setAppliedJobsPage(1);
      setAllAppliedJobsLoaded(false);
      fetchAppliedJobs(appliedJobsSearchQuery, true);
    } else if (activeTab === "searchJobs") {
      debouncedFetchData(allJobsSearchQuery, "searchJobs");
    } else if (activeTab === "yourListings") {
      // Force refresh for your listings when tab is focused
      setAllUserJobs([]);
      setUserJobsPage(1);
      setAllUserJobsLoaded(false);
      fetchJobsByUser(userJobsSearchQuery, true);
    }
  };

  const getApplicantStatus = (applicants, userId) => {
    console.log("getApplicantStatus called with applicants:", applicants, "userId:", userId);
    const applicant = applicants.find((applicant) => applicant.applicantId._id === userId);
    console.log("Found applicant:", applicant);
    const status = applicant ? applicant.status : "Not Applied";
    console.log("Raw status:", status);
    return status;
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

  // Remove this useEffect as it's causing duplicate data loading
  // The handleTabChange function now handles data loading properly

  // Handle refresh parameter from navigation
  useEffect(() => {
    if (route.params?.refresh) {
      console.log("Refresh triggered from navigation params");
      // Reset all states and fetch fresh data
      setAllUserJobs([]);
      setUserJobsPage(1);
      setAllUserJobsLoaded(false);
      setLoading(false);
      
      // Fetch fresh data for the current tab
      if (activeTab === "yourListings") {
        fetchJobsByUser("", true);
      } else {
        fetchDataOnTabFocus();
      }
      
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
            {console.log("Rendering Applied Jobs tab, allAppliedJobs:", allAppliedJobs)}
            <View style={styles.searchFilter}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={appliedJobsSearchQuery}
                placeholder="Search your applied jobs..."
                onChangeText={handleSearch}
                placeholderTextColor="#999"
              />
            </View>
            <FlatList
              data={allAppliedJobs}
              refreshing={refreshing}
              onRefresh={() => {
                setAllAppliedJobs([]);
                setAppliedJobsPage(1);
                setAllAppliedJobsLoaded(false);
                fetchAppliedJobs(appliedJobsSearchQuery, true);
              }}
              onEndReached={() => fetchAppliedJobs(appliedJobsSearchQuery)}
              onEndReachedThreshold={0.5}
              keyExtractor={(item, index) => `${item._id || 'applied_job'}_${index}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                console.log("Rendering applied job item:", item);
                console.log("Item applicants:", item.applicants);
                const status = getApplicantStatus(item.applicants, userId);
                console.log("Calculated status:", status);
                
                // Convert status to CSS class name format (replace spaces with underscores)
                const statusClass = status.replace(/\s+/g, '_');
                console.log("Status class:", statusClass);
                console.log("Status badge style:", styles[`status${statusClass}`]);
                console.log("Status text style:", styles[`status${statusClass}Text`]);
                console.log("Final text style:", [styles.statusText, styles[`status${statusClass}Text`]]);
                
                return (
                <TouchableOpacity onPress={() => handleJobPress(item)}>
                  <View style={styles.listingItem}>
                    <View style={styles.listingDetails}>
                      <View style={styles.jobHeader}>
                        <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                        <View style={[styles.statusBadge, styles[`status${statusClass}`]]}>
                          <Text style={[styles.statusText, styles[`status${statusClass}Text`]]}>{status}</Text>
                        </View>
                      </View>
                      <View style={styles.companyInfo}>
                        <Ionicons name="business" size={16} color="#666" />
                        <Text style={styles.companyName}>{item.company}</Text>
                      </View>
                      <View style={styles.locationInfo}>
                        <Ionicons name="location" size={16} color="#666" />
                        <Text style={styles.jobLocation}>{item.location}</Text>
                      </View>
                      <View style={styles.ctcInfo}>
                        <Ionicons name="cash" size={16} color="#27ae60" />
                        <Text style={styles.ctcText}>₹{item.CTC} LPA</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                );
              }}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No applied jobs yet</Text>
                  <Text style={styles.emptyStateSubtext}>Browse and apply to jobs in the Search Jobs tab</Text>
                </View>
              )}
            />
          </View>
        )}
        {activeTab === "searchJobs" && (
          <View style={styles.searchContainer}>
            {console.log("Rendering Search Jobs tab, allJobs:", allJobs)}
            <View style={styles.searchFilter}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                value={allJobsSearchQuery}
                style={styles.searchInput}
                placeholder="Search by job title, company, or location..."
                onChangeText={handleSearch}
                placeholderTextColor="#999"
              />
            </View>
            <FlatList
              data={allJobs}
              refreshing={refreshing}
              onRefresh={() => {
                setAllJobs([]);
                setAllJobsPage(1);
                setAllJobsLoaded(false);
                fetchAllJobs(allJobsSearchQuery, true);
              }}
              onEndReached={() => fetchAllJobs(allJobsSearchQuery)}
              onEndReachedThreshold={0.5}
              keyExtractor={(item, index) => `${item._id || 'job'}_${index}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleJobPress(item)}>
                  <View style={styles.listingItem}>
                    <View style={styles.listingDetails}>
                      <View style={styles.jobHeader}>
                        <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>Apply Now</Text>
                        </View>
                      </View>
                      <View style={styles.companyInfo}>
                        <Ionicons name="business" size={16} color="#666" />
                        <Text style={styles.companyName}>{item.company}</Text>
                      </View>
                      <View style={styles.locationInfo}>
                        <Ionicons name="location" size={16} color="#666" />
                        <Text style={styles.jobLocation}>{item.location}</Text>
                      </View>
                      <View style={styles.ctcInfo}>
                        <Ionicons name="cash" size={16} color="#27ae60" />
                        <Text style={styles.ctcText}>₹{item.CTC} LPA</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No jobs found</Text>
                  <Text style={styles.emptyStateSubtext}>Try different keywords or check back later</Text>
                </View>
              )}
            />
          </View>
        )}
        {activeTab === "yourListings" && (
          <>
            <View style={styles.searchContainer}>
              <View style={styles.searchFilter}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  value={userJobsSearchQuery}
                  style={styles.searchInput}
                  placeholder="Search your job listings..."
                  onChangeText={handleSearch}
                  placeholderTextColor="#999"
                />
              </View>
              {console.log("Rendering Your Listings tab, allUserJobs:", allUserJobs)}
              <FlatList
                data={allUserJobs}
                keyExtractor={(item, index) => `${item._id || 'user_job'}_${index}`}
                onEndReached={() => fetchJobsByUser(userJobsSearchQuery)}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={() => {
                  setUserJobsPage(1);
                  setAllUserJobsLoaded(false);
                  fetchJobsByUser(userJobsSearchQuery, true);
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleJobPress(item)}>
                    <View style={styles.listingItem}>
                      <View style={styles.listingDetails}>
                        <View style={styles.jobHeader}>
                          <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                          <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>
                              {item.applicants?.length || 0} {item.applicants?.length === 1 ? 'applicant' : 'applicants'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.companyInfo}>
                          <Ionicons name="business" size={16} color="#666" />
                          <Text style={styles.companyName}>{item.company}</Text>
                        </View>
                        <View style={styles.locationInfo}>
                          <Ionicons name="location" size={16} color="#666" />
                          <Text style={styles.jobLocation}>{item.location}</Text>
                        </View>
                        <View style={styles.ctcInfo}>
                          <Ionicons name="cash" size={16} color="#27ae60" />
                          <Text style={styles.ctcText}>₹{item.CTC} LPA</Text>
                        </View>
                      </View>
                      <View style={styles.iconContainer}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => navigation.navigate("EditJob", item)}
                        >
                          <Ionicons
                            name="pencil"
                            size={18}
                            color="#fff"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => deleteJob(item._id)}
                        >
                          <Ionicons
                            name="trash-bin"
                            size={18}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <Ionicons name="briefcase-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyStateText}>No job listings yet</Text>
                    <Text style={styles.emptyStateSubtext}>Tap the + icon to create your first job posting</Text>
                  </View>
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
      <BottomNavigation navigation={navigation} currentScreen="jobs" />
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
    padding: 12,
    paddingLeft: 40,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
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
    marginBottom: 12,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listingDetails: {
    flex: 1,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ctcInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctcText: {
    fontSize: 14,
    color: "#27ae60",
    fontWeight: "600",
    marginLeft: 4,
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
    color: "#fff",
    textTransform: "capitalize",
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
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    backgroundColor: Theme.themeColor,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  jobInfo: {
    flexDirection: 'row', // Align job details and status horizontally
    justifyContent: 'space-between', // Push status to the right
    alignItems: 'center', // Align items vertically in the center
  },
  jobStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007BFF',
    backgroundColor: '#EAF4FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 80,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});

export default SocialJobs;
