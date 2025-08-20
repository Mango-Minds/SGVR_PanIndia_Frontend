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
const Tab = createBottomTabNavigator();

export default function ProfileNewScreen() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
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
    fetchPostsAPI(userId, setUserPosts);
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

      // case "Articles":
      //   return articlesContent.map((article, index) => (
      //     <Text key={index} style={styles.activityText}>
      //       {article}
      //     </Text>
      //   ));

      default:
        return null;
    }
  };

  const suggestedPeople = [
    {
      id: 1,
      name: "John Doe",
      title: "Software Engineer at Tech Corp",
      avatar:
        "https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?semt=ais_hybrid",
    },
    {
      id: 2,
      name: "Jane Smith",
      title: "Product Manager at StartUp Inc.",
      avatar:
        "https://img.freepik.com/free-photo/close-up-portrait-young-man-isolated-black-studio-wall_155003-29357.jpg?semt=ais_hybrid",
    },
    {
      id: 3,
      name: "Michael Johnson",
      title: "Data Scientist at DataWorks",
      avatar:
        "https://img.freepik.com/free-photo/bearded-man-listening-music-through-earphones_53876-129947.jpg?semt=ais_hybrid",
    },
    {
      id: 4,
      name: "Emily Brown",
      title: "UI/UX Designer at Design Studio",
      avatar:
        "https://img.freepik.com/free-photo/front-view-smiley-business-man_23-2148479583.jpg?semt=ais_hybrid",
    },
    {
      id: 5,
      name: "David Wilson",
      title: "DevOps Engineer at Cloudify",
      avatar:
        "https://img.freepik.com/free-photo/front-view-serious-man_23-2148946212.jpg?semt=ais_hybrid",
    },
  ];

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

  const educationData = userProfile?.followData?.education || [];
  const followersCount = userProfile?.followData?.followers?.length || 0;
  const followingCount = userProfile?.followData?.following?.length || 0;
  const jobExperienceData = userProfile?.followData?.jobExperience || [];

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);

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
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon
            name="arrow-back"
            size={24}
            color="#000"
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <SearchField
            placeholder={t("search")}
            style={styles.searchField}
            onFocus={() => navigation.navigate("SearchResults")}
          />
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={openSettingsModal}>
          <Icon name="settings" size={24} color="#000" />
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
              <Text style={styles.aboutMeTitle}>{t("about")}</Text>
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
                <Icon name="pencil" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.aboutMeText}>
                {userProfile?.followData?.about || t("noAboutMe")}
              </Text>
            </View>
            <View style={styles.tabContainer}>
              {["posts", "about", "photos", "friends"].map((tab) => (
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
    paddingVertical: 8,
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
    justifyContent: "center",
    borderRadius: 0,
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
  aboutMeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
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
    paddingHorizontal: 16,
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
    fontSize: 14,
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
});

// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   TouchableWithoutFeedback,
//   Keyboard,
//   Animated,
//   PanResponder,
//   Dimensions,
//   SafeAreaView,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import Theme from "../../styles/theme";
// import { useIsFocused } from "@react-navigation/native";
// import * as FileSystem from "expo-file-system";
// import { shareAsync } from "expo-sharing";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { FlatList } from "react-native-gesture-handler";
// import NewSocialCard from "./NewSocialCard";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Button, TextInput } from "react-native-paper";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { NavigationContainer } from "@react-navigation/native";
// import { useNavigation } from "@react-navigation/native";
// import { IconButton } from "react-native-paper";
// import UserImg from "../../assets/images/general/user.png";
// import BottomNavigation from "../../components/social/BottomNavigation";
// import { useSelector } from "react-redux";
// import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
// import { SearchField } from "../../styles/common.styles";
// import SearchResults from "./SearchResults";
// import * as DocumentPicker from "expo-document-picker";
// import { setLoadingInBtn } from "../../store/user";
// import { useDispatch } from "react-redux";

// import { decode } from "base-64";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import apiClient from "../../store/apiClient";
// import { useTranslation } from "react-i18next";

// const Tab = createBottomTabNavigator();

// export default function ProfileNewScreen() {
//   const dispatch = useDispatch();
//   const { t } = useTranslation();
//   const token = useSelector((state) => state.user.token);
//   const user = useState(useSelector((state) => state.user.user));
//   const isFocused = useIsFocused();
//   const tokenPayload = token.split(".")[1];
//   const [loadingAnimation, setLoadingAnimation] = useState(true);
//   const decodedPayload = JSON.parse(decode(tokenPayload));

//   const userId = decodedPayload.id;

//   const [userProfile, setUserProfile] = useState([]);
//   const [userData, setUserData] = useState([]);
//   const pan = useRef(new Animated.ValueXY()).current;
//   // const fetchUserProfile = async () => {
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await fetch(`${BASEAPIURL}/user/profile/${userId}`, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (!response.ok) {
//   //       throw new Error("Network response was not ok");
//   //     }

//   //     const data = await response.json();
//   //     setUserProfile(data);
//   //   } catch (err) {
//   //     console.log(err);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //     // setLoading(false);
//   //   }
//   // };
//   // const fetchUser = async () => {
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await fetch(`${BASEAPIURL}/user/${userId}`, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (!response.ok) {
//   //       throw new Error("Network response was not ok");
//   //     }

//   //     const data = await response.json();
//   //     setUserData(data);
//   //   } catch (err) {
//   //     console.log(err);
//   //   } finally {
//   //     // setLoading(false);
//   //     setLoadingAnimation(false);
//   //   }
//   // };

//   const fetchUserProfile = async () => {
//     try {
//       setLoadingAnimation(true);
//       const token = await AsyncStorage.getItem("token");

//       const response = await apiClient.get(`/user/profile/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setUserProfile(response.data);
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };
//   const fetchUser = async () => {
//     try {
//       setLoadingAnimation(true);
//       const token = await AsyncStorage.getItem("token");

//       const response = await apiClient.get(`/user/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setUserData(response.data);
//     } catch (error) {
//       console.error("Error fetching user:", error);
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserProfile();
//   }, []);

//   useEffect(() => {
//     fetchUser();
//   }, []);
//   useEffect(() => {
//     if (isFocused) {
//       fetchUserProfile();
//       fetchUser();
//     }
//   }, [isFocused]);

//   const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
//   const [isEditModalVisible, setEditModalVisible] = useState(false);

//   const openSettingsModal = () => {
//     setSettingsModalVisible(true);
//   };

//   const closeSettingsModal = () => {
//     setSettingsModalVisible(false);
//     pan.setValue({ x: 0, y: 0 });
//   };

//   const openEditModal = () => {
//     setEditModalVisible(true);
//   };

//   const closeEditModal = () => {
//     setEditModalVisible(false);
//     pan.setValue({ x: 0, y: 0 });
//   };
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: Animated.event([null, { dy: pan.y }], {
//         useNativeDriver: false,
//       }),
//       onPanResponderRelease: (_, gestureState) => {
//         if (gestureState.dy > 100) {
//           closeRepostModal();
//         } else {
//           Animated.spring(pan, {
//             toValue: { x: 0, y: 0 },
//             useNativeDriver: false,
//           }).start();
//         }
//       },
//     })
//   ).current;

//   const [page, setPage] = useState(1);
//   const [allLoaded, setAllLoaded] = useState(false);
//   const [userposts, setUserPosts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // const fetchPosts = async () => {
//   //   if (allLoaded) return;
//   //   try {
//   //     setLoadingAnimation(true);
//   //     const response = await fetch(`${BASEAPIURL}/social/post/user/${userId}`, {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     if (!response.ok) {
//   //       throw new Error("Network response was not ok");
//   //     }
//   //     const data = await response.json();
//   //     setUserPosts(data);
//   //     console.log("DATA: ", data);
//   //   } catch (err) {
//   //     console.log(err);
//   //     setError(err.message);
//   //   } finally {
//   //     setLoadingAnimation(false);
//   //   }
//   // };
//   const fetchPosts = async () => {
//     if (allLoaded) return;

//     try {
//       setLoadingAnimation(true);

//       const token = await AsyncStorage.getItem("token");
//       const response = await apiClient.get(`/social/post/user/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setUserPosts(response.data);
//       console.log("Posts fetched: ", response.data);
//     } catch (err) {
//       console.error("Error fetching posts:", err);
//       setError(err.message || "Something went wrong while fetching posts.");
//     } finally {
//       setLoadingAnimation(false);
//     }
//   };

//   useEffect(() => {
//     fetchPosts();
//   }, []);

//   const userName = "yukta.chopra";
//   const firstName = "Yukta";
//   const lastName = "Chopra";
//   const bio = `Adventurer & Creator`;
//   const imageUrl =
//     "https://media.istockphoto.com/id/2143311599/photo/a-cheerful-asian-woman-enjoys-a-walk-during-a-summer-night.webp?a=1&b=1&s=612x612&w=0&k=20&c=D7Yb-GG6xR5vPDF40d5pL8OtDGHbav2AOZmg9q6nEXg=";

//   const [isShareModalVisible, setShareModalVisible] = useState(false);
//   const navigation = useNavigation();
//   const openShareModal = () => {
//     setShareModalVisible(true);
//   };

//   const closeShareModal = () => {
//     setShareModalVisible(false);
//   };

//   const [activeTab, setActiveTab] = useState("posts");

//   const postsContent = [
//     "This is my first post!",
//     "Loving the new features in React Native!",
//     "Just completed a project on full-stack development.",
//   ];

//   const articlesContent = [
//     "How to build a simple React Native app.",
//     "Understanding state management in React.",
//     "Best practices for web development.",
//   ];

//   const documentsContent = [
//     "Resume.pdf",
//     "Project Portfolio.pdf",
//     "Technical Report.docx",
//   ];
//   const [showAllPosts, setShowAllPosts] = useState(false);

//   const handleSeeAllClick = () => {
//     setShowAllPosts((prev) => !prev);
//   };
//   // const handleDeletePost = async () => {
//   //   try {
//   //     const response = await fetch(`${BASEAPIURL}/social/post/${postId}`, {
//   //       method: "DELETE",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });
//   //     if (!response.ok) {
//   //       throw new Error("Failed to delete post");
//   //     }

//   //     Alert.alert(
//   //       "Success",
//   //       "Post deleted successfully",
//   //       [
//   //         {
//   //           text: "OK",
//   //           onPress: () => {
//   //             fetchPosts();
//   //             navigation.goBack();
//   //           },
//   //         },
//   //       ],
//   //       { cancelable: false }
//   //     );
//   //   } catch (error) {
//   //     console.error("Error deleting product:", error);
//   //   }
//   // };

//   const handleDeletePost = async () => {
//     try {
//       const response = await apiClient.delete(`/social/post/${postId}`);
//       console.log("Delete response:", response);

//       Alert.alert(
//         "Success",
//         "Post deleted successfully",
//         [
//           {
//             text: "OK",
//             onPress: () => {
//               fetchPosts();
//               navigation.goBack();
//             },
//           },
//         ],
//         { cancelable: false }
//       );
//     } catch (error) {
//       console.error("Error deleting post:", error);

//       // Add more logs to understand what's coming back
//       console.log("Axios error object:", {
//         status: error?.response?.status,
//         data: error?.response?.data,
//         message: error.message,
//       });

//       Alert.alert(
//         "Error",
//         error?.response?.data?.message ||
//           error.message ||
//           "Something went wrong while deleting the post."
//       );
//     }
//   };

//   const renderContent = () => {
//     switch (activeTab) {
//       case "Posts":
//         if (showAllPosts) {
//           return userposts?.posts?.map((post) => (
//             <NewSocialCard
//               key={post._id}
//               post={post}
//               profileImageUri={`${post.createdBy.image}`}
//               description={post.content}
//               video={post.video}
//               source="ProfileNewScreen"
//               firstName={post.createdBy.firstName}
//               lastName={post.createdBy.lastName}
//               postId={post._id}
//               handleDeletePost={handleDeletePost}
//               fetchPosts={fetchPosts}
//               postImages={post.images}
//             />
//           ));
//         } else {
//           const firstPost = userposts?.posts?.[0];

//           return firstPost ? (
//             <NewSocialCard
//               key={firstPost._id}
//               post={firstPost}
//               profileImageUri={`${firstPost.createdBy.image}`}
//               description={firstPost.content}
//               video={firstPost.video}
//               source="ProfileNewScreen"
//               firstName={firstPost.createdBy.firstName}
//               lastName={firstPost.createdBy.lastName}
//               postId={firstPost._id}
//               handleDeletePost={handleDeletePost}
//               fetchPosts={fetchPosts}
//               postImages={firstPost.images}
//             />
//           ) : (
//             <Text>{t("NoPostsAvailable")}</Text>
//           );
//         }

//       // case "Articles":
//       //   return articlesContent.map((article, index) => (
//       //     <Text key={index} style={styles.activityText}>
//       //       {article}
//       //     </Text>
//       //   ));

//       default:
//         return null;
//     }
//   };

//   const suggestedPeople = [
//     {
//       id: 1,
//       name: "John Doe",
//       title: "Software Engineer at Tech Corp",
//       avatar:
//         "https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?semt=ais_hybrid",
//     },
//     {
//       id: 2,
//       name: "Jane Smith",
//       title: "Product Manager at StartUp Inc.",
//       avatar:
//         "https://img.freepik.com/free-photo/close-up-portrait-young-man-isolated-black-studio-wall_155003-29357.jpg?semt=ais_hybrid",
//     },
//     {
//       id: 3,
//       name: "Michael Johnson",
//       title: "Data Scientist at DataWorks",
//       avatar:
//         "https://img.freepik.com/free-photo/bearded-man-listening-music-through-earphones_53876-129947.jpg?semt=ais_hybrid",
//     },
//     {
//       id: 4,
//       name: "Emily Brown",
//       title: "UI/UX Designer at Design Studio",
//       avatar:
//         "https://img.freepik.com/free-photo/front-view-smiley-business-man_23-2148479583.jpg?semt=ais_hybrid",
//     },
//     {
//       id: 5,
//       name: "David Wilson",
//       title: "DevOps Engineer at Cloudify",
//       avatar:
//         "https://img.freepik.com/free-photo/front-view-serious-man_23-2148946212.jpg?semt=ais_hybrid",
//     },
//   ];

//   const profileImageUri = userProfile?.user?.image
//     ? `${userProfile.user.image}`
//     : null;

//   const bannerImageUri = userProfile.followData?.bannerImage
//     ? `${userProfile.followData.bannerImage.replace(/\\/g, "/")}`
//     : null;

//   const resumeUri =
//     typeof userProfile.followData?.resume === "string" &&
//     userProfile.followData.resume.trim() !== ""
//       ? `${userProfile.followData.resume}`
//       : null;

//   // const getFileNameFromUrl = (url) => {
//   //   if (!url) return "No Resume Uploaded";
//   //   // Extract the last segment after the last slash
//   //   const fullPath = url.split("/").pop();

//   //   return fullPath
//   //     .split("profileBanner")
//   //     .pop()
//   //     .replace(/^[\\/]/, "");
//   // };

//   // const downloadPDF = async (resumeUri) => {
//   //   if (!resumeUri) return;

//   //   // Extract filename from URL
//   //   const filename = getFileNameFromUrl(resumeUri);

//   //   try {
//   //     // Download the resume from the URL
//   //     const result = await FileSystem.downloadAsync(
//   //       resumeUri,
//   //       FileSystem.documentDirectory + filename
//   //     );

//   //     // Save the file
//   //     await save(result.uri, filename, result.headers["Content-Type"]);
//   //     alert("Resume downloaded successfully");
//   //   } catch (error) {
//   //     console.log("Error downloading file:", error);
//   //   }
//   // };

//   // Function to save the downloaded file

//   const save = async (uri, filename, mimetype) => {
//     if (Platform.OS === "android") {
//       try {
//         // Request directory permissions on Android
//         const permissions =
//           await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
//         if (permissions.granted) {
//           const base64 = await FileSystem.readAsStringAsync(uri, {
//             encoding: FileSystem.EncodingType.Base64,
//           });
//           // Create and write the file to the requested directory
//           await FileSystem.StorageAccessFramework.createFileAsync(
//             permissions.directoryUri,
//             filename,
//             mimetype
//           ).then(async (uri) => {
//             await FileSystem.writeAsStringAsync(uri, base64, {
//               encoding: FileSystem.EncodingType.Base64,
//             });
//           });
//         } else {
//           // If permissions aren't granted, fallback to sharing the file
//           shareAsync(uri);
//         }
//       } catch (e) {
//         console.log("Error saving file:", e);
//         // Fallback to sharing if any error occurs
//         shareAsync(uri);
//       }
//     } else {
//       // For iOS and other platforms, share the file directly
//       shareAsync(uri);
//     }
//   };

//   const educationData = userProfile?.followData?.education || [];
//   const followersCount = userProfile?.followData?.followers?.length || 0;
//   const followingCount = userProfile?.followData?.following?.length || 0;
//   const jobExperienceData = userProfile?.followData?.jobExperience || [];

//   const [docModalVisible, setDocModalVisible] = useState(false);
//   const [uploadedDoc, setUploadedDoc] = useState(null);

//   const pickDoc = async () => {
//     try {
//       let result = await DocumentPicker.getDocumentAsync({
//         type: "application/pdf",
//       });

//       if (!result.canceled) {
//         setUploadedDoc(result.assets[0]);
//         setDocModalVisible(true);
//       }
//     } catch (error) {
//       console.log("error doc:", error);
//     }
//   };

//   // const submitDoc = async (event) => {
//   //   event.preventDefault();

//   //   // Check if there's any uploaded media (image, video, or document)
//   //   let uploaded_media = uploadedDoc;

//   //   if (uploaded_media) {
//   //     try {
//   //       // Upload media first
//   //       const formData = new FormData();
//   //       formData.append("resume", {
//   //         uri: uploaded_media.uri,
//   //         name: uploaded_media.name,
//   //         type: uploaded_media.mimeType,
//   //         size: uploaded_media.size,
//   //       });

//   //       const response = await fetch(`${BASEAPIURL}/user/update-follow-data`, {
//   //         method: "PATCH",
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //         body: formData,
//   //       });

//   //       let data_media = null;
//   //       if (response.ok) {
//   //         data_media = await response.json();

//   //         alert("Resume Updated Successfully");
//   //         fetchUserProfile();
//   //         setDocModalVisible(false);
//   //       } else {
//   //         throw new Error("Failed to upload resume");
//   //       }
//   //     } catch (error) {
//   //       console.error("Error uploading resume:", error);
//   //     }
//   //   }

//   //   setUploadedDoc(null);
//   // };
//   const submitDoc = async (event) => {
//     event.preventDefault();

//     if (!uploadedDoc) return;

//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) throw new Error("Unauthorized");

//       const formData = new FormData();
//       formData.append("resume", {
//         uri: uploadedDoc.uri,
//         name: uploadedDoc.name,
//         type: uploadedDoc.mimeType || "application/pdf",
//       });

//       const response = await apiClient.patch(
//         "/user/update-follow-data",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       if (response.status === 200) {
//         alert("Resume Updated Successfully");
//         fetchUserProfile();
//         setDocModalVisible(false);
//       } else {
//         throw new Error("Failed to upload resume");
//       }
//     } catch (error) {
//       console.error("Error uploading resume:", error);
//       alert("Error uploading resume");
//     } finally {
//       setUploadedDoc(null);
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.headerContainer}>
//         <TouchableOpacity style={styles.iconButton}>
//           <Icon
//             name="arrow-back"
//             size={24}
//             color="#000"
//             onPress={() => navigation.goBack()}
//           />
//         </TouchableOpacity>
//         <View style={styles.searchContainer}>
//           <SearchField
//             placeholder={t("search")}
//             style={styles.searchField}
//             onFocus={() => navigation.navigate("SearchResults")}
//           />
//         </View>
//         <TouchableOpacity style={styles.iconButton} onPress={openSettingsModal}>
//           <Icon name="settings" size={24} color="#000" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.generalInfoContainer}>
//         <View style={styles.bannerProfileContainer}>
//           <TouchableOpacity
//             style={styles.editIconContainer}
//             onPress={() => {
//               navigation.navigate("EditProfileInfo", {
//                 userId: userId,
//                 userProfile: userProfile,
//                 fetchUserProfile: fetchUserProfile,
//               });
//             }}
//           >
//             <Icon name="pencil" size={24} color="#fff" />
//           </TouchableOpacity>
//           <Image source={{ uri: bannerImageUri }} style={styles.bannerImage} />

//           <View style={styles.profileImageContainer}>
//             <Image
//               source={profileImageUri ? { uri: profileImageUri } : UserImg}
//               style={styles.profileImage}
//             />
//           </View>
//         </View>

//         {/* User Info */}
//         <View style={styles.userInfoContainer}>
//           <Text style={styles.userName}>
//             {userData.user?.firstName} {userData.user?.lastName}
//           </Text>
//           <TouchableOpacity
//             style={styles.editPencilIconContainer}
//             onPress={() => {
//               navigation.navigate("EditUserProfile", {
//                 userId: userId,
//                 userProfile: userProfile,
//                 fetchUserProfile: fetchUserProfile,
//                 user: user,
//                 userData: userData,
//                 fetchUser: fetchUser,
//               });
//             }}
//           >
//             <Icon name="pencil" size={24} color="black" />
//           </TouchableOpacity>
//           <Text style={styles.userLocation}>{userData.user?.address}</Text>
//           <View style={styles.socialContainer}>
//             <TouchableOpacity
//               onPress={() =>
//                 navigation.navigate("FollowersFollowing", { type: "Followers" })
//               }
//             >
//               <Text style={styles.linkText}>
//                 {followersCount} {t("followers")}

//               </Text>
//             </TouchableOpacity>
//             <Text> </Text>
//             <TouchableOpacity
//               onPress={() =>
//                 navigation.navigate("FollowersFollowing", { type: "Following" })
//               }
//             >
//               <Text style={styles.linkText}>
//                 {followingCount} {t("following")}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//       <View style={styles.aboutMeContainer}>
//         <Text style={styles.aboutMeTitle}>{t("about")}</Text>
//         <TouchableOpacity
//           style={styles.editPencilIconContainer}
//           onPress={() => {
//             navigation.navigate("EditUserEducationInfo", {
//               userId: userId,
//               userProfile: userProfile,
//               fetchUserProfile: fetchUserProfile,
//               educationData: educationData,
//               jobExperienceData: jobExperienceData,
//             });
//           }}
//         >
//           <Icon name="pencil" size={24} color="black" />
//         </TouchableOpacity>
//         <Text style={styles.aboutMeText}>{userProfile?.followData?.about}</Text>
//       </View>

//       {educationData && educationData.length > 0 ? (
//         educationData.map((education, index) => (
//           <View key={index} style={styles.educationSection}>
//             <Text style={styles.educationTitle}>{t("education")}</Text>
//             <Text style={styles.educationTitle}>{education?.degree}</Text>
//             <Text style={styles.institution}>{education?.institution}</Text>
//             <Text style={styles.duration}>{education?.duration}</Text>
//             <Text style={styles.description}>{education?.description}</Text>
//           </View>
//         ))
//       ) : (
//         <View style={styles.aboutMeContainer}>
//           <Text style={styles.aboutMeTitle}>{t("addEducation")}</Text>
//         </View>
//       )}

//       {jobExperienceData && jobExperienceData.length > 0 ? (
//         jobExperienceData.map((jobExperience, index) => (
//           <View key={index} style={styles.educationSection}>
//             <Text style={styles.educationTitle}>{t("jobExperience")}</Text>
//             <Text style={styles.educationTitle}>{jobExperience?.company}</Text>
//             <Text style={styles.institution}>{jobExperience?.role}</Text>
//             <Text style={styles.duration}>{jobExperience?.duration}</Text>
//             <Text style={styles.description}>{jobExperience?.description}</Text>
//           </View>
//         ))
//       ) : (
//         <View style={styles.aboutMeContainer}>
//           <Text style={styles.aboutMeTitle}>{t("addJobExperience")}</Text>
//         </View>
//       )}

//       <View style={styles.aboutMeContainer}>
//         <Text style={styles.aboutMeTitle}>{t("resume")}</Text>
//         <TouchableOpacity
//           style={styles.editPencilIconContainer}
//           onPress={() => setDocModalVisible(true)}
//         >
//           {resumeUri ? (
//             <Icon name="pencil" size={24} color="black" />
//           ) : (
//             <Icon name="add" size={24} color="black" />
//           )}
//         </TouchableOpacity>

//         {resumeUri ? (
//           <TouchableOpacity>
//             <View style={styles.documentContainer}>
//               <TouchableOpacity onPress={() => downloadPDF(resumeUri)}>
//                 <View style={styles.card}>
//                   <View style={styles.documentRow}>
//                     <Ionicons
//                       name="document-text-outline"
//                       size={24}
//                       color="red"
//                     />
//                     <Text style={styles.fileNameText}>
//                       {getFileNameFromUrl(resumeUri)}
//                     </Text>
//                   </View>

//                   <View style={styles.downloadIconContainer}>
//                     <Ionicons name="download-outline" size={20} color="white" />
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             </View>
//           </TouchableOpacity>
//         ) : (
//           <Text style={styles.uploadButtonText}>{t("addResume")}</Text>
//         )}
//       </View>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={docModalVisible}
//         onRequestClose={() => setDocModalVisible(false)}
//       >
//         <TouchableWithoutFeedback onPress={() => setDocModalVisible(false)}>
//           <View style={styles.modalResumeOverlay}>
//             <View style={styles.modalResumeContainer}>
//               <View style={styles.modalResumeContent}>
//                 {uploadedDoc ? (
//                   <>
//                     <View style={styles.centeredContent}>
//                       <Text style={styles.fileNameText}>
//                         {uploadedDoc.name}
//                       </Text>
//                       <TouchableOpacity
//                         style={styles.submitResumeButton}
//                         onPress={submitDoc}
//                       >
//                         <Text style={styles.submitResumeButtonText}>
//                           {t("submit")}
//                         </Text>
//                       </TouchableOpacity>
//                     </View>
//                   </>
//                 ) : (
//                   <TouchableOpacity
//                     style={styles.resumeOption}
//                     onPress={pickDoc}
//                   >
//                     <View style={styles.resumeIconCircle}>
//                       <Ionicons name="document" size={24} color="red" />
//                     </View>
//                     <Text style={styles.resumeOptionText}>{t("document")}</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>

//       <View style={styles.activityContainer}>
//         <Text style={styles.activityTitle}>{t("activity")}</Text>
//         <View style={styles.tabContainer}>
//           {["Posts"].map((tab) => (
//             // <TouchableOpacity
//             //   key={tab}
//             //   style={[styles.tab, activeTab === tab && styles.activeTab]}
//             //   onPress={() => setActiveTab(tab)}
//             // >
//             //   <Text
//             //     style={[
//             //       styles.tabText,
//             //       activeTab === tab && styles.activeTabText,
//             //     ]}
//             //   >
//             //     {tab}
//             //   </Text>
//             // </TouchableOpacity>
//             <TouchableOpacity
//               key="posts"
//               style={[styles.tab, activeTab === "posts" && styles.activeTab]}
//               onPress={() => setActiveTab("posts")}
//             >
//               <Text
//                 style={[
//                   styles.tabText,
//                   activeTab === "posts" && styles.activeTabText,
//                 ]}
//               >
//                 {t("posts")}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {activeTab === "posts" && (
//           <View>
//             <SafeAreaView style={styles.socialFeedContainer}>
//               <FlatList
//                  data={userposts?.posts || []}
//                 renderItem={({ item }) => {
//                   return <NewSocialCard post={item} posts={userposts} />;
//                 }}
//                 keyExtractor={(item) => item._id.toString()}
//                 onEndReached={fetchPosts}
//                 onEndReachedThreshold={0.5}
//               />
//             </SafeAreaView>
//           </View>
//         )}

//         <ScrollView style={styles.contentContainer}>
//           {renderContent()}
//         </ScrollView>
//         <View style={styles.lineDivider} />
//         <Text style={styles.seeAllText} onPress={handleSeeAllClick}>
//           {/* {showAllPosts ? "Show Less" : `See All ${activeTab}`} */}
//           {showAllPosts
//             ? t("showLess")
//             : `${t("seeAll")} ${t(activeTab.toLowerCase())}`}
//         </Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f0f0f0",
//     marginTop: 30,
//   },
//   generalInfoContainer: {
//     backgroundColor: "white",
//     paddingBottom: 10,
//   },
//   headerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     backgroundColor: "#f8f8f8",
//   },
//   iconButton: {
//     padding: 8,
//   },
//   searchContainer: {
//     height: 40,
//     width: "80%",
//     marginHorizontal: 5,
//     backgroundColor: "#eeeeee",
//     justifyContent: "center",
//     borderRadius: 0,
//   },
//   searchField: {
//     height: 40,
//     width: "100%",
//     backgroundColor: "#eeeeee",
//     paddingHorizontal: 15,
//     marginHorizontal: 10,
//     fontSize: 16,
//     borderRadius: 0,
//   },
//   bannerProfileContainer: {
//     height: 120,
//     backgroundColor: "#eeeeee",
//     alignItems: "center",
//   },
//   bannerImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   profileImageContainer: {
//     position: "absolute",
//     bottom: -30,
//     left: 20,
//     borderWidth: 3,
//     borderColor: "#ffffff",
//     borderRadius: 50,
//     overflow: "hidden",
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//   },
//   userInfoContainer: {
//     marginTop: 30,
//     paddingHorizontal: 20,
//     alignItems: "flex-start",
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 5,
//   },
//   userTitle: {
//     fontSize: 16,
//     color: "#666666",
//     marginBottom: 3,
//   },
//   userLocation: {
//     fontSize: 14,
//     color: "#888888",
//   },
//   socialContainer: {
//     flexDirection: "row",
//     marginTop: 10,
//     justifyContent: "center",
//   },
//   linkText: {
//     fontSize: 15,

//     color: Theme.themeColor,
//   },
//   divider: {
//     marginHorizontal: 5,
//     color: "#888888",
//   },
//   aboutMeContainer: {
//     marginTop: 15,
//     padding: 15,
//     backgroundColor: "white",
//   },
//   aboutMeTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   educationTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 5,
//     marginTop: 15,
//   },
//   aboutMeText: {
//     fontSize: 14,
//     color: "#333",
//     textAlign: "left",
//     lineHeight: 20,
//   },

//   activityContainer: {
//     marginTop: 20,
//     width: "100%",
//     backgroundColor: "white",
//   },

//   tabContainer: {
//     flexDirection: "row",
//     borderRadius: 8,
//     overflow: "hidden",
//     marginBottom: 10,
//   },
//   tab: {
//     paddingVertical: 6,
//     alignItems: "center",
//     marginHorizontal: 10,
//     paddingHorizontal: 10,
//     borderWidth: 1.5,
//     borderColor: Theme.themeColor,
//     borderRadius: 30,
//     backgroundColor: "#fff",
//   },
//   activeTab: {
//     backgroundColor: Theme.themeColor,
//     elevation: 2,
//     borderBottomWidth: 4,

//     borderBottomColor: Theme.themeColor,
//   },
//   tabText: {
//     fontSize: 16,
//     color: Theme.themeColor,
//     textAlign: "center",
//   },
//   activeTabText: {
//     fontWeight: "bold",
//     color: "white",
//   },

//   contentContainer: {
//     padding: 10,
//   },
//   activityText: {
//     fontSize: 14,
//     marginVertical: 5,
//     color: "#333",
//   },
//   lineDivider: {
//     height: 1,
//     backgroundColor: "#e1e9ee",
//   },
//   seeAllText: {
//     marginTop: 10,
//     color: Theme.themeColor,
//     fontWeight: "600",
//     textAlign: "center",
//     fontSize: 18,
//     padding: 10,
//   },
//   activityTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//     padding: 10,
//   },

//   EducationTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   educationSection: {
//     padding: 12,
//     marginVertical: 10,
//     shadowColor: "#000",
//     marginTop: 20,
//     width: "100%",
//     backgroundColor: "white",
//   },
//   educationTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333333",
//     marginBottom: 5,
//   },
//   institution: {
//     fontSize: 16,
//     color: "#666666",
//     marginBottom: 5,
//   },
//   duration: {
//     fontSize: 14,
//     color: "#999999",
//     marginBottom: 10,
//   },
//   description: {
//     fontSize: 14,
//     color: "#666666",
//     lineHeight: 20,
//   },

//   suggestedPeopleSection: {
//     backgroundColor: "#ffffff",
//     padding: 20,
//     marginVertical: 10,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333333",
//     marginBottom: 15,
//   },
//   personCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 15,
//   },
//   personInfo: {
//     marginTop: 10,
//     flex: 1,
//   },
//   personName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333333",
//   },
//   personTitle: {
//     fontSize: 16,
//     color: "#666666",
//   },
//   connectButton: {
//     paddingVertical: 5,
//     paddingHorizontal: 15,
//     borderRadius: 30,
//     marginTop: 6,
//     width: 100,
//     borderColor: "black",
//     borderWidth: 1,
//   },

//   connectButtonText: {
//     color: "black",
//     fontWeight: "bold",
//     textAlign: "center",
//   },

//   separator: {
//     height: 1,
//     backgroundColor: "#D3D3D3",
//     marginVertical: 10,
//   },

//   uploadButton: {
//     backgroundColor: Theme.themeColor,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     width: "40%",
//   },
//   uploadButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },

//   modalOverlay: {
//     flex: 1,
//     justifyContent: "flex-end",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContainer: {
//     width: "100%",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 20,
//     alignItems: "center",
//   },
//   modalOption: {
//     padding: 10,
//     width: "100%",
//   },
//   iconTextContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   icon: {
//     marginRight: 10,
//   },
//   modalText: {
//     fontSize: 18,
//     textAlign: "left",
//   },
//   modalSubText: {
//     fontSize: 15,
//     color: "gray",
//     marginTop: 5,
//   },
//   swipeBar: {
//     width: "100%",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   bar: {
//     width: 40,
//     height: 5,
//     backgroundColor: "#ccc",
//     borderRadius: 2.5,
//   },
//   editIconContainer: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//     borderRadius: 20,
//     padding: 5,
//     zIndex: 1,
//   },

//   editPencilIconContainer: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     padding: 5,
//   },

//   modalResumeOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalResumeContainer: {
//     backgroundColor: "lightgrey",
//     padding: 20,
//     borderTopLeftRadius: 15,
//     borderTopRightRadius: 15,
//     alignItems: "center",
//   },
//   modalResumeContent: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-around",
//     width: "100%",
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   resumeOption: {
//     alignItems: "center",
//     justifyContent: "center",
//     flexWrap: "wrap",
//     padding: 15,
//     width: 100,
//   },
//   resumeIconCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "white",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 5,
//   },
//   resumeOptionText: {
//     fontSize: 15,
//     color: "black",
//     textAlign: "center",
//     flexWrap: "nowrap",
//   },
//   resumeCloseButton: {
//     alignItems: "center",
//     paddingVertical: 10,
//   },
//   resumeCloseButtonText: {
//     fontSize: 16,
//     color: Theme.themeColor,
//   },

//   submitResumeButton: {
//     backgroundColor: Theme.themeColor,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   submitResumeButtonText: {
//     fontSize: 16,
//     color: "#FFFFFF",
//     fontWeight: "bold",
//     textAlign: "center",
//   },

//   fileNameText: {
//     color: "#333",
//     fontSize: 16,
//     fontStyle: "italic",
//     left: 5,
//   },
//   centeredContent: {
//     alignItems: "center",
//     justifyContent: "center",
//     flex: 1,
//   },
//   documentContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     backgroundColor: "white",
//     borderRadius: 10,
//     marginVertical: 5,
//     width: 200,
//   },
//   documentRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   documentContainer: {
//     marginTop: 10,
//   },

//   card: {
//     backgroundColor: "#f9f9f9",
//     padding: 15,
//     borderRadius: 10,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     position: "relative",
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   documentRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   fileNameText: {
//     marginLeft: 10,
//     fontSize: 16,
//   },

//   downloadIconContainer: {
//     position: "absolute",
//     top: 10,
//     right: 5,
//     backgroundColor: "gray",
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   uploadButtonText: {
//     color: "black",
//     fontSize: 16,
//   },
// });
