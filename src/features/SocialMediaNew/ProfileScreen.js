import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  PanResponder,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import Theme from "../../styles/theme";
import { useIsFocused } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FlatList } from "react-native-gesture-handler";
import NewSocialCard from "./NewSocialCard";
import Icon from "react-native-vector-icons/Ionicons";
import { Button, TextInput } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import UserImg from "../../assets/images/general/user.png";
import BottomNavigation from "../../components/social/BottomNavigation";
import { useSelector } from "react-redux";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { SearchField } from "../../styles/common.styles";
import SearchResults from "./SearchResults";
import * as DocumentPicker from "expo-document-picker";
import { setLoadingInBtn } from "../../store/user";
import { useDispatch } from "react-redux";
import {
  BASEAPIURL,
  BASEIMGURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import { decode } from "base-64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { fetchPostsAPI, fetchUserProfileAPI } from "./SocialMediaAPIs";
import ProfileGallery from "./ProfileGallery";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Tab = createBottomTabNavigator();

export default function ProfileNewScreen() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const token = useSelector((state) => state.user.token);
  const user = useState(useSelector((state) => state.user.user));
  const isFocused = useIsFocused();
  const tokenPayload = token.split(".")[1];
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const decodedPayload = JSON.parse(decode(tokenPayload));

  const userId = decodedPayload.id;

  const [userProfile, setUserProfile] = useState([]);
  const [userData, setUserData] = useState([]);
  const pan = useRef(new Animated.ValueXY()).current;

  // const fetchUserProfile = async () => {
  //   try {
  //     setLoadingAnimation(true);
  //     const token = await AsyncStorage.getItem("token");

  //     const response = await apiClient.get(`/user/profile/${userId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     console.log("✅ API response received:", response?.data);

  //     setUserProfile(response.data);
  //   } catch (error) {
  //     console.error("Error fetching user profile:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  const fetchUserProfile = async () => {
    try {
      setLoadingAnimation(true);
      const token = await AsyncStorage.getItem("token");
      const userLanguage =
        (await AsyncStorage.getItem("user-language")) || "en";

      const response = await apiClient.get(`/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = response.data;

      // Only translate if language isn't English
      if (userLanguage !== "en") {
        // Helper to translate text via your API
        const translateText = async (text) => {
          if (!text) return text;

          const translationRes = await fetch(`${BASEAPIURL}/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: [{ text }],
              targetLang: userLanguage,
            }),
          });

          if (!translationRes.ok) return text;

          const translationData = await translationRes.json();

          if (
            translationData.success &&
            Array.isArray(translationData.translatedData) &&
            translationData.translatedData[0]?.text
          ) {
            return translationData.translatedData[0].text;
          }

          return text;
        };

        // Translate the 'about' field
        profileData.followData.about = await translateText(
          profileData.followData.about
        );

        // Translate each education description
        if (Array.isArray(profileData.followData.education)) {
          for (const edu of profileData.followData.education) {
            edu.description = await translateText(edu.description);
            edu.degree = await translateText(edu.degree); // optional if needed
            edu.institution = await translateText(edu.institution); // optional if needed
          }
        }

        // Translate each job experience description
        if (Array.isArray(profileData.followData.jobExperience)) {
          for (const job of profileData.followData.jobExperience) {
            job.description = await translateText(job.description);
            job.company = await translateText(job.company); // optional if needed
            job.role = await translateText(job.role); // optional if needed
          }
        }
      }

      setUserProfile(profileData);
    } catch (error) {
      console.error("Error fetching or translating user profile:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };

  const fetchUser = async () => {
  try {
    setLoadingAnimation(true);

    const token = await AsyncStorage.getItem("token");
    const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

    const response = await apiClient.get(`/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const userInfo = response.data;
      console.log("userInfo: ", userInfo.user);

      // Translation only if language is not English AND userInfo.user is an array
      if (selectedLanguage !== "en" && Array.isArray(userInfo.user)) {
        const translationResponse = await apiClient.post("/translate", {
          data: userInfo,
          targetLang: selectedLanguage,
        });

        console.log("translationResponse: ", translationResponse);

        if (translationResponse?.data?.translatedData?.length) {
          setUserData(translationResponse.data.translatedData);
        } else {
          setUserData(userInfo);
        }
      } else {
        setUserData(userInfo);
      }
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  } finally {
    setLoadingAnimation(false);
  }
};

  // const fetchUser = async () => {
  //   try {
  //     setLoadingAnimation(true);
  //     const token = await AsyncStorage.getItem("token");
  //     const userLanguage =
  //       (await AsyncStorage.getItem("user-language")) || "en";

  //     const response = await apiClient.get(`/user/${userId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     let userData = response.data;

  //     if (userLanguage !== "en" && userData.user) {
  //       // Collect texts to translate
  //       const textsToTranslate = [];

  //       if (userData.user.firstName)
  //         textsToTranslate.push(userData.user.firstName);
  //       if (userData.user.lastName)
  //         textsToTranslate.push(userData.user.lastName);
  //       if (userData.user.address) textsToTranslate.push(userData.user.address);

  //       if (textsToTranslate.length > 0) {
  //         const translationRes = await apiClient.post("/translate", {
  //           data: textsToTranslate,
  //           targetLang: userLanguage,
  //         });

  //         const translatedData = translationRes.data?.translatedData || [];
  //         console.log("Translated Data: ", translatedData);
  //         // Map translations back, assuming same order
  //         let idx = 0;
  //         if (userData.user.firstName) {
  //           userData.user.firstName =
  //             translatedData[idx]?.text || userData.user.firstName;
  //           idx++;
  //         }
  //         if (userData.user.lastName) {
  //           userData.user.lastName =
  //             translatedData[idx]?.text || userData.user.lastName;
  //           idx++;
  //         }
  //         if (userData.user.address) {
  //           userData.user.address =
  //             translatedData[idx]?.text || userData.user.address;
  //           idx++;
  //         }
  //       }
  //     }

  //     setUserData(userData);
  //   } catch (error) {
  //     console.error("Error fetching user:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  // const fetchUser = async () => {
  //   try {
  //     setLoadingAnimation(true);
  //     const token = await AsyncStorage.getItem("token");

  //     const response = await apiClient.get(`/user/${userId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     setUserData(response.data);
  //   } catch (error) {
  //     console.error("Error fetching user:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);
  useEffect(() => {
    if (isFocused) {
      fetchUserProfile();
      fetchUser();
    }
  }, [isFocused]);

  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const openSettingsModal = () => {
    setSettingsModalVisible(true);
  };

  const closeSettingsModal = () => {
    setSettingsModalVisible(false);
    pan.setValue({ x: 0, y: 0 });
  };

  const openEditModal = () => {
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    pan.setValue({ x: 0, y: 0 });
  };
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeRepostModal();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const [page, setPage] = useState(1);
  const [allLoaded, setAllLoaded] = useState(false);
  const [userposts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // const fetchPosts = async () => {
  //   if (allLoaded) return;

  //   try {
  //     setLoadingAnimation(true);

  //     const token = await AsyncStorage.getItem("token");
  //     const response = await apiClient.get(`/social/post/user/${userId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     setUserPosts(response.data);
  //     console.log("Posts fetched: ", response.data);
  //   } catch (err) {
  //     console.error("Error fetching posts:", err);
  //     setError(err.message || "Something went wrong while fetching posts.");
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  const fetchPosts = async () => {
    if (allLoaded) return;
    fetchPostsAPI(userId, setUserPosts, { limit: 100 });
  };
  console.log("Userposts in my profile: ", userposts);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle focus events to refresh posts when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh posts when screen comes into focus
      fetchPosts();
    });

    return unsubscribe;
  }, [navigation]);

  const userName = "yukta.chopra";
  const firstName = "Yukta";
  const lastName = "Chopra";
  const bio = `Adventurer & Creator`;
  const imageUrl =
    "https://media.istockphoto.com/id/2143311599/photo/a-cheerful-asian-woman-enjoys-a-walk-during-a-summer-night.webp?a=1&b=1&s=612x612&w=0&k=20&c=D7Yb-GG6xR5vPDF40d5pL8OtDGHbav2AOZmg9q6nEXg=";

  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const navigation = useNavigation();
  const openShareModal = () => {
    setShareModalVisible(true);
  };

  const closeShareModal = () => {
    setShareModalVisible(false);
  };

  const [activeTab, setActiveTab] = useState("posts");

  const postsContent = [
    "This is my first post!",
    "Loving the new features in React Native!",
    "Just completed a project on full-stack development.",
  ];

  const articlesContent = [
    "How to build a simple React Native app.",
    "Understanding state management in React.",
    "Best practices for web development.",
  ];

  const documentsContent = [
    "Resume.pdf",
    "Project Portfolio.pdf",
    "Technical Report.docx",
  ];
  const [showAllPosts, setShowAllPosts] = useState(false);

  const handleSeeAllClick = () => {
    setShowAllPosts((prev) => !prev);
  };
  // const handleDeletePost = async () => {
  //   try {
  //     const response = await fetch(`${BASEAPIURL}/social/post/${postId}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to delete post");
  //     }

  //     Alert.alert(
  //       "Success",
  //       "Post deleted successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             fetchPosts();
  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error deleting product:", error);
  //   }
  // };

  const handleDeletePost = async () => {
    try {
      const response = await apiClient.delete(`/social/post/${postId}`);
      console.log("Delete response:", response);

      Alert.alert(
        "Success",
        "Post deleted successfully",
        [
          {
            text: "OK",
            onPress: async () => {
              // Ensure fetchPosts completes before navigation
              if (fetchPosts) {
                await fetchPosts();
              }
              // Navigate to SocialHomeScreen to ensure user stays in social section
              setTimeout(() => {
                navigation.navigate("SocialHomeScreen");
              }, 100);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error deleting post:", error);

      // Add more logs to understand what's coming back
      console.log("Axios error object:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error.message,
      });

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong while deleting the post."
      );
    }
  };

  const organizationDetails = userProfile?.followData?.organizationDetails;
  const isOrgProfile = userProfile?.followData?.isOrganization === true;
  const hasOrgContent =
    organizationDetails?.companyName ||
    organizationDetails?.industry ||
    organizationDetails?.website ||
    organizationDetails?.companySize ||
    userProfile?.followData?.about;

  const skeletonPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonPulse, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [skeletonPulse]);

  const renderAboutLoadingPlaceholder = () => (
    <View style={styles.aboutLoadingContainer}>
      <ActivityIndicator size="small" color={Theme.themeColor} style={{ marginBottom: 16 }} />
      <Animated.View
        style={[
          styles.aboutSkeletonLine,
          styles.aboutSkeletonLineShort,
          { opacity: skeletonPulse },
        ]}
      />
      <Animated.View
        style={[
          styles.aboutSkeletonLine,
          styles.aboutSkeletonLineLong,
          { opacity: skeletonPulse },
        ]}
      />
      <Animated.View
        style={[
          styles.aboutSkeletonLine,
          styles.aboutSkeletonLineLong,
          { opacity: skeletonPulse },
        ]}
      />
    </View>
  );

  const renderCompanyNameOnly = () => (
    <View style={styles.jobItem}>
      {organizationDetails?.companyName ? (
        <Text style={styles.jobCompany}>{organizationDetails.companyName}</Text>
      ) : null}
    </View>
  );

  const renderCompanyAboutSection = (textStyle = styles.aboutMeText) => (
    <View style={styles.jobItem}>
      {organizationDetails?.companyName ? (
        <Text style={styles.jobCompany}>{organizationDetails.companyName}</Text>
      ) : null}
      {organizationDetails?.industry ? (
        <Text style={styles.jobRole}>
          {t("industry")}: {organizationDetails.industry}
        </Text>
      ) : null}
      {organizationDetails?.website ? (
        <Text style={styles.jobDuration}>
          {t("website")}: {organizationDetails.website}
        </Text>
      ) : null}
      {organizationDetails?.companySize ? (
        <Text style={styles.jobDescription}>
          {t("companySize")}: {organizationDetails.companySize}
        </Text>
      ) : null}
      {userProfile?.followData?.about ? (
        <Text style={[textStyle, { marginTop: 8 }]}>
          {userProfile.followData.about}
        </Text>
      ) : null}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        if (showAllPosts) {
          return userposts?.posts?.map((post) => (
            <NewSocialCard
              key={post._id}
              post={post}
              profileImageUri={`${post.createdBy.image}`}
              description={post.content}
              video={post.video}
              source="ProfileNewScreen"
              firstName={post.createdBy.firstName}
              lastName={post.createdBy.lastName}
              postId={post._id}
              handleDeletePost={handleDeletePost}
              fetchPosts={fetchPosts}
              postImages={post.images}
            />
          ));
        } else {
          const firstPost = userposts?.posts?.[0];

          return firstPost ? (
            <NewSocialCard
              key={firstPost._id}
              post={firstPost}
              profileImageUri={`${firstPost.createdBy.image}`}
              description={firstPost.content}
              video={firstPost.video}
              source="ProfileNewScreen"
              firstName={firstPost.createdBy.firstName}
              lastName={firstPost.createdBy.lastName}
              postId={firstPost._id}
              handleDeletePost={handleDeletePost}
              fetchPosts={fetchPosts}
              postImages={firstPost.images}
            />
          ) : (
            <Text>{t("NoPostsAvailable")}</Text>
          );
        }

      case "gallery":
        return (
          <ProfileGallery posts={userposts?.posts || []} />
        );

      case "about":
        return (
          <View style={styles.aboutTabContent}>
            {loadingAnimation ? (
              renderAboutLoadingPlaceholder()
            ) : isOrgProfile ? (
              <>
                {hasOrgContent ? (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>
                      <Icon name="business" size={20} color={Theme.themeColor} style={{ marginRight: 8 }} />
                      {t("organizationDetails")}
                    </Text>
                    {renderCompanyAboutSection(styles.educationDescription)}
                  </View>
                ) : (
                  <View style={styles.emptyAboutTabContainer}>
                    <Icon name="business-outline" size={48} color="#9B9B9B" style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyAboutTabText}>{t("noAboutMe")}</Text>
                    <TouchableOpacity
                      style={styles.addAboutButton}
                      onPress={() => {
                        navigation.navigate("EditUserEducationInfo", {
                          userId: userId,
                          userProfile: userProfile,
                          fetchUserProfile: fetchUserProfile,
                        });
                      }}
                    >
                      <Text style={styles.addAboutButtonText}>+ {t("editUserProfile")}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
            {/* Education Section */}
            {userProfile?.followData?.education?.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  <Icon name="school" size={20} color={Theme.themeColor} style={{ marginRight: 8 }} />
                  {t("education")}
                </Text>
                {userProfile.followData.education.map((edu, index) => (
                  <View key={index} style={styles.educationItem}>
                    <Text style={styles.educationDegree}>{edu.degree}</Text>
                    <Text style={styles.educationInstitution}>{edu.institution}</Text>
                    <Text style={styles.educationDuration}>{edu.duration}</Text>
                    {edu.description && (
                      <Text style={styles.educationDescription}>{edu.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Job Experience Section */}
            {userProfile?.followData?.jobExperience?.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  <Icon name="briefcase" size={20} color={Theme.themeColor} style={{ marginRight: 8 }} />
                  {t("jobExperience")}
                </Text>
                {userProfile.followData.jobExperience.map((job, index) => (
                  <View key={index} style={styles.jobItem}>
                    <Text style={styles.jobCompany}>{job.company}</Text>
                    <Text style={styles.jobRole}>{job.role}</Text>
                    <Text style={styles.jobDuration}>{job.duration}</Text>
                    {job.description && (
                      <Text style={styles.jobDescription}>{job.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Resume Section */}
            {userProfile?.followData?.resume && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  <Icon name="document-outline" size={20} color={Theme.themeColor} style={{ marginRight: 8 }} />
                  {t("resume")}
                </Text>
                <View style={styles.resumeItem}>
                  <Icon name="document-text" size={24} color="#dc3545" style={{ marginRight: 8 }} />
                  <Text style={styles.resumeFileName}>
                    {getFileNameFromUrl(userProfile.followData.resume)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.downloadResumeButton, isDownloadingResume && styles.downloadResumeButtonDisabled]}
                    onPress={() => downloadPDF(resumeUri)}
                    disabled={isDownloadingResume}
                  >
                    {isDownloadingResume ? (
                      <ActivityIndicator size="small" color={Theme.themeColor} />
                    ) : (
                      <Icon name="download" size={20} color={Theme.themeColor} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Empty State */}
            {(!userProfile?.followData?.education?.length && !userProfile?.followData?.jobExperience?.length && !userProfile?.followData?.resume) && (
              <View style={styles.emptyAboutTabContainer}>
                <Icon name="account-edit-outline" size={48} color="#9B9B9B" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyAboutTabText}>{t("noAboutMe")}</Text>
                <TouchableOpacity
                  style={styles.addAboutButton}
                  onPress={() => {
                    navigation.navigate("EditUserEducationInfo", {
                      userId: userId,
                      userProfile: userProfile,
                      fetchUserProfile: fetchUserProfile,
                    });
                  }}
                >
                  <Text style={styles.addAboutButtonText}>+ {t("addEducation")}</Text>
                </TouchableOpacity>
              </View>
            )}
              </>
            )}
          </View>
        );

      default:
        return null;
    }
  };



  const profileImageUri = userProfile?.user?.image
    ? `${userProfile.user.image}`
    : null;

  const bannerImageUri = userProfile.followData?.bannerImage
    ? `${userProfile.followData.bannerImage.replace(/\\/g, "/")}`
    : null;

  const resumeUri =
    typeof userProfile.followData?.resume === "string" &&
    userProfile.followData.resume.trim() !== ""
      ? `${userProfile.followData.resume}`
      : null;

  const getFileNameFromUrl = (url) => {
    if (!url) return "No Resume Uploaded";
    // Extract the last segment after the last slash
    const fullPath = url.split("/").pop();

    return fullPath
      .split("profileBanner")
      .pop()
      .replace(/^[\\/]/, "");
  };

  // Check network connectivity
  const checkNetworkConnectivity = async () => {
    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        timeout: 5000 
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const downloadPDF = async (resumeUri) => {
    if (!resumeUri) return;

    // Check network connectivity first
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      Alert.alert(
        t("networkError"), 
        t("noInternetConnection"),
        [
          { text: "OK", style: "default" },
          { text: t("retry"), onPress: () => downloadPDF(resumeUri) }
        ]
      );
      return;
    }

    setIsDownloadingResume(true);
    
    // Extract filename from URL
    const filename = getFileNameFromUrl(resumeUri);

    try {
      // Download the resume from the URL with timeout
      const downloadPromise = FileSystem.downloadAsync(
        resumeUri,
        FileSystem.documentDirectory + filename
      );
      
      // Add timeout of 30 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Download timeout')), 30000)
      );
      
      const result = await Promise.race([downloadPromise, timeoutPromise]);

      // Save the file
      await save(result.uri, filename, result.headers["Content-Type"]);
      Alert.alert(t("success"), t("downloadSuccess"));
    } catch (error) {
      console.log("Error downloading file:", error);
      
      // Provide more specific error messages based on error type
      let errorMessage = t("downloadError");
      
      if (error.message && error.message.includes("Unable to resolve host")) {
        errorMessage = t("noInternetConnection");
      } else if (error.message && error.message.includes("timeout")) {
        errorMessage = t("downloadTimeout");
      } else if (error.message && error.message.includes("404")) {
        errorMessage = t("fileNotFound");
      }
      
      Alert.alert(t("downloadError"), errorMessage, [
        { text: "OK", style: "default" },
        { text: t("retry"), onPress: () => downloadPDF(resumeUri) }
      ]);
    } finally {
      setIsDownloadingResume(false);
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

  const educationData = userProfile?.followData?.education || [];
  const followersCount = userProfile?.followData?.followers?.length || 0;
  const followingCount = userProfile?.followData?.following?.length || 0;
  const jobExperienceData = userProfile?.followData?.jobExperience || [];

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);

  console.log("UserProfile: ", userProfile);
  console.log("userData: ", userData);
  const pickDoc = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (!result.canceled) {
        setUploadedDoc(result.assets[0]);
        setDocModalVisible(true);
      }
    } catch (error) {
      console.log("error doc:", error);
    }
  };

  // const submitDoc = async (event) => {
  //   event.preventDefault();

  //   // Check if there's any uploaded media (image, video, or document)
  //   let uploaded_media = uploadedDoc;

  //   if (uploaded_media) {
  //     try {
  //       // Upload media first
  //       const formData = new FormData();
  //       formData.append("resume", {
  //         uri: uploaded_media.uri,
  //         name: uploaded_media.name,
  //         type: uploaded_media.mimeType,
  //         size: uploaded_media.size,
  //       });

  //       const response = await fetch(`${BASEAPIURL}/user/update-follow-data`, {
  //         method: "PATCH",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: formData,
  //       });

  //       let data_media = null;
  //       if (response.ok) {
  //         data_media = await response.json();

  //         alert("Resume Updated Successfully");
  //         fetchUserProfile();
  //         setDocModalVisible(false);
  //       } else {
  //         throw new Error("Failed to upload resume");
  //       }
  //     } catch (error) {
  //       console.error("Error uploading resume:", error);
  //     }
  //   }

  //   setUploadedDoc(null);
  // };
  const submitDoc = async (event) => {
    event.preventDefault();

    if (!uploadedDoc) return;

    if (userProfile?.followData?.isOrganization) {
      Alert.alert(t("error"), t("resumeNotForOrgProfiles"));
      setUploadedDoc(null);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const formData = new FormData();
      formData.append("resume", {
        uri: uploadedDoc.uri,
        name: uploadedDoc.name,
        type: uploadedDoc.mimeType || "application/pdf",
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

      if (response.status === 200) {
        alert("Resume Updated Successfully");
        fetchUserProfile();
        setDocModalVisible(false);
      } else {
        throw new Error("Failed to upload resume");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Error uploading resume");
    } finally {
      setUploadedDoc(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: Platform.OS === 'ios' ? Math.max(insets.top * 0.5, 8) : 8 }]}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon
            name="arrow-back"
            size={24}
            color="#000"
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SearchResults")}
        >
          <Icon name="search" size={18} color="#888" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, color: "#888" }}>{t("search")}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === "posts" ? (userposts?.posts || []) : []}
        renderItem={({ item }) => (
          <NewSocialCard
            post={item}
            profileImageUri={item.createdBy.image}
            description={item.content}
            video={item.video}
            source="EachProfile"
            firstName={item.createdBy.firstName}
            lastName={item.createdBy.lastName}
            postId={item._id}
            postImages={item.images}
            fetchPosts={fetchPosts}
            userId={userId}
          />
        )}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={() => (
          <>
            <View style={styles.generalInfoContainer}>
              <View style={styles.bannerProfileContainer}>
                <TouchableOpacity
                  style={styles.editIconContainer}
                  onPress={() => {
                    navigation.navigate("EditProfileInfo", {
                      userId: userId,
                      userProfile: userProfile,
                      fetchUserProfile: fetchUserProfile,
                      fetchUser: fetchUser,
                    });
                  }}
                >
                  <Icon name="pencil" size={24} color="#fff" />
                </TouchableOpacity>
                <Image source={{ uri: bannerImageUri }} style={styles.bannerImage} />

                <View style={styles.profileImageContainer}>
                  <Image
                    source={profileImageUri ? { uri: profileImageUri } : UserImg}
                    style={styles.profileImage}
                  />
                </View>
              </View>

              {/* User Info */}
              <View style={styles.userInfoContainer}>
                <Text style={styles.userName}>
                  {userData.user?.firstName} {userData.user?.lastName}
                </Text>
                <TouchableOpacity
                  style={styles.editPencilIconContainer}
                  onPress={() => {
                    navigation.navigate("EditUserProfile", {
                      userId: userId,
                      userProfile: userProfile,
                      fetchUserProfile: fetchUserProfile,
                      user: user,
                      userData: userData,
                      fetchUser: fetchUser,
                    });
                  }}
                >
                  <Icon name="pencil" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.userLocation}>{userData.user?.address}</Text>
                <View style={styles.socialContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("FollowersFollowing", { type: "Followers" })
                    }
                  >
                    <Text style={styles.linkText}>
                      {" "}
                      {followersCount} {t("followers")}
                    </Text>
                  </TouchableOpacity>
                  <Text> </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("FollowersFollowing", { type: "Following" })
                    }
                  >
                    <Text style={styles.linkText}>
                      {followingCount} {t("following")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.aboutMeContainer}>
              <View style={styles.aboutMeHeader}>
                <Text style={styles.aboutMeTitle}>
                  {isOrgProfile ? t("company") : t("about")}
                </Text>
                <TouchableOpacity
                  style={styles.editPencilIconContainer}
                  onPress={() => {
                    navigation.navigate("EditUserEducationInfo", {
                      userId: userId,
                      userProfile: userProfile,
                      fetchUserProfile: fetchUserProfile,
                    });
                  }}
                >
                  <Icon name="pencil" size={20} color={Theme.themeColor} />
                </TouchableOpacity>
              </View>

              {loadingAnimation ? (
                renderAboutLoadingPlaceholder()
              ) : isOrgProfile ? (
                organizationDetails?.companyName ? (
                  renderCompanyNameOnly()
                ) : (
                  <View style={styles.emptyAboutContainer}>
                    <Icon name="business-outline" size={24} color="#9B9B9B" style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyAboutText}>{t("noAboutMe")}</Text>
                  </View>
                )
              ) : userProfile?.followData?.about ? (
                <Text style={styles.aboutMeText}>
                  {userProfile?.followData?.about}
                </Text>
              ) : (
                <View style={styles.emptyAboutContainer}>
                  <Icon name="account-edit-outline" size={24} color="#9B9B9B" style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyAboutText}>{t("noAboutMe")}</Text>
                </View>
              )}
            </View>
            <View style={styles.tabContainer}>
              {["posts", "gallery", "about"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    activeTab === tab && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === tab && styles.activeTabButtonText,
                    ]}
                  >
                    {t(tab)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {activeTab !== "posts" && (
              <View style={styles.contentContainer}>
                {renderContent()}
              </View>
            )}
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 30,
  },
  generalInfoContainer: {
    backgroundColor: "white",
    paddingBottom: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 8,
    backgroundColor: "#f8f8f8",
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    height: 40,
    width: "80%",
    marginHorizontal: 5,
    backgroundColor: "#eeeeee",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchField: {
    height: 40,
    width: "100%",
    backgroundColor: "#eeeeee",
    paddingHorizontal: 15,
    marginHorizontal: 10,
    fontSize: 16,
    borderRadius: 0,
  },
  bannerProfileContainer: {
    height: 120,
    backgroundColor: "#eeeeee",
    alignItems: "center",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileImageContainer: {
    position: "absolute",
    bottom: -30,
    left: 20,
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 50,
    overflow: "hidden",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userInfoContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },
  userTitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 3,
  },
  userLocation: {
    fontSize: 14,
    color: "#888888",
  },
  socialContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "center",
  },
  linkText: {
    fontSize: 15,

    color: Theme.themeColor,
  },
  divider: {
    marginHorizontal: 5,
    color: "#888888",
  },
  aboutMeContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "white",
  },
  aboutMeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  aboutMeTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  educationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 15,
  },
  aboutMeText: {
    fontSize: 14,
    color: "#333",
    textAlign: "left",
    lineHeight: 20,
  },
  emptyAboutContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  emptyAboutText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 20,
  },
  aboutLoadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
    width: "100%",
  },
  aboutSkeletonLine: {
    height: 14,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    marginBottom: 8,
    alignSelf: "stretch",
  },
  aboutSkeletonLineShort: {
    width: "40%",
    alignSelf: "flex-start",
  },
  aboutSkeletonLineLong: {
    width: "90%",
    alignSelf: "flex-start",
  },

  activityContainer: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "white",
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "white",
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  activeTabButton: {
    backgroundColor: Theme.themeColor,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  activeTabButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  tab: {
    paddingVertical: 6,
    alignItems: "center",
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: Theme.themeColor,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  activeTab: {
    backgroundColor: Theme.themeColor,
    elevation: 2,
    borderBottomWidth: 4,

    borderBottomColor: Theme.themeColor,
  },
  tabText: {
    fontSize: 16,
    color: Theme.themeColor,
    textAlign: "center",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "white",
  },

  contentContainer: {
    padding: 10,
  },
  activityText: {
    fontSize: 14,
    marginVertical: 5,
    color: "#333",
  },
  lineDivider: {
    height: 1,
    backgroundColor: "#e1e9ee",
  },
  seeAllText: {
    marginTop: 10,
    color: Theme.themeColor,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18,
    padding: 10,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 10,
  },

  EducationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  educationSection: {
    padding: 12,
    marginVertical: 10,
    shadowColor: "#000",
    marginTop: 20,
    width: "100%",
    backgroundColor: "white",
  },
  educationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  institution: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 5,
  },
  duration: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },

  // About Tab Content Styles
  aboutTabContent: {
    padding: 16,
    backgroundColor: "#fff",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
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
  emptyAboutTabContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyAboutTabText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  addAboutButton: {
    backgroundColor: Theme.themeColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addAboutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resumeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
  downloadResumeButtonDisabled: {
    opacity: 0.6,
  },

  suggestedPeopleSection: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  personInfo: {
    marginTop: 10,
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  personTitle: {
    fontSize: 16,
    color: "#666666",
  },
  connectButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginTop: 6,
    width: 100,
    borderColor: "black",
    borderWidth: 1,
  },

  connectButtonText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },

  separator: {
    height: 1,
    backgroundColor: "#D3D3D3",
    marginVertical: 10,
  },

  uploadButton: {
    backgroundColor: Theme.themeColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "40%",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalOption: {
    padding: 10,
    width: "100%",
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  modalText: {
    fontSize: 18,
    textAlign: "left",
  },
  modalSubText: {
    fontSize: 15,
    color: "gray",
    marginTop: 5,
  },
  swipeBar: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  bar: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
  },
  editIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 5,
    zIndex: 1,
  },

  editPencilIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },

  modalResumeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalResumeContainer: {
    backgroundColor: "lightgrey",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: "center",
  },
  modalResumeContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resumeOption: {
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    padding: 15,
    width: 100,
  },
  resumeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  resumeOptionText: {
    fontSize: 15,
    color: "black",
    textAlign: "center",
    flexWrap: "nowrap",
  },
  resumeCloseButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  resumeCloseButtonText: {
    fontSize: 16,
    color: Theme.themeColor,
  },

  submitResumeButton: {
    backgroundColor: Theme.themeColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  submitResumeButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },

  fileNameText: {
    color: "#333",
    fontSize: 16,
    fontStyle: "italic",
    left: 5,
  },
  centeredContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  documentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 5,
    width: 200,
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  documentContainer: {
    marginTop: 10,
  },

  card: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileNameText: {
    marginLeft: 10,
    fontSize: 16,
  },

  downloadIconContainer: {
    position: "absolute",
    top: 10,
    right: 5,
    backgroundColor: "gray",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "black",
    fontSize: 16,
  },
  emptyAboutContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  emptyAboutText: {
    fontSize: 14,
    color: "#9B9B9B",
    textAlign: "center",
  },
});
