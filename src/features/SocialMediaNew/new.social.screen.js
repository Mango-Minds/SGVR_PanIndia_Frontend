import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import { Container, RowBetween } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";
import Theme from "../../styles/theme";
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from "expo-image-picker";
import BottomNavigation from "../../components/social/BottomNavigation";

import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import NewSocialCard from "./NewSocialCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { fetchAllPosts, getMyMoments, uploadMoment, deleteMoment, getVisibleMoments } from "./SocialMediaAPIs";
// import { FlatList } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { useFollowStatus } from "./FollowStatusContext";
import { debounce } from "lodash";
const SocialHomeScreen = ({ navigation, route }) => {
  const token = useSelector((state) => state.user.token);
const { t } = useTranslation();
  // const profileImageUrl =
  //   "https://media.istockphoto.com/id/2143311599/photo/a-cheerful-asian-woman-enjoys-a-walk-during-a-summer-night.webp?a=1&b=1&s=612x612&w=0&k=20&c=D7Yb-GG6xR5vPDF40d5pL8OtDGHbav2AOZmg9q6nEXg=";

  const [posts, setPosts] = useState([]);
  const [myMoments, setMyMoments] = useState([]);
  const [isUploadingMoment, setIsUploadingMoment] = useState(false);
  const [visibleMoments, setVisibleMoments] = useState([]);
  const [page, setPage] = useState(1); // Track the current page
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { getFollowStatus, updateFollowStatus } = useFollowStatus();


  // const fetchPosts = async (isRefresh = false) => {
  //   if (allLoaded && !isRefresh) return;
  
  //   try {
  //     if (!isRefresh) setLoadingAnimation(true);
  
  //     const pageToFetch = isRefresh ? 1 : page;
  
  //     const response = await fetchAllPosts(pageToFetch);
  //     const data = response.data;
  
  //     if (isRefresh) {
  //       setPosts(data.posts);
  //       setPage(2);
  //       setAllLoaded(data.posts.length < 10);
  //     } else {
  //       if (data.posts.length < 10) setAllLoaded(true);
  //       setPosts((prevPosts) => [...prevPosts, ...data.posts]);
  //       setPage((prevPage) => prevPage + 1);
  //     }
  //   } catch (err) {
  //     console.error("Fetch posts error:", err);
  //     setError(err.message);
  //   } finally {
  //     if (!isRefresh) setLoadingAnimation(false);
  //   }
  // };
  
  const fetchPosts = async (isRefresh = false) => {
  if (allLoaded && !isRefresh && !isSearching) return;

  try {
    if (!isRefresh) setLoadingAnimation(true);

    const pageToFetch = isRefresh ? 1 : page;

    const response = await fetchAllPosts(pageToFetch, 10, searchTerm);
    const data = response.data;

    // Get user's selected language (default to 'en')
    const selectedLanguage = (await AsyncStorage.getItem("user-language")) || "en";

    // Call translation API to translate the posts
    const translateResponse = await apiClient.post(
      "/translate",
      {
        data: data.posts,
        targetLang: selectedLanguage,
      }
    );

    const translatedPosts = translateResponse.data.translatedData;
    
    // Ensure images are preserved after translation
    const postsWithImages = translatedPosts.map((translatedPost, index) => {
      const originalPost = data.posts[index];
      return {
        ...translatedPost,
        images: originalPost?.images || translatedPost?.images || [],
        video: originalPost?.video || translatedPost?.video || null
      };
    });

    if (isRefresh || isSearching) {
      setPosts(postsWithImages);
      setPage(2);
      setAllLoaded(postsWithImages.length < 10);
      setIsSearching(false);
    } else {
      if (postsWithImages.length < 10) setAllLoaded(true);
      setPosts((prevPosts) => [...prevPosts, ...postsWithImages]);
      setPage((prevPage) => prevPage + 1);
    }
  } catch (err) {
    console.error("Fetch posts error:", err);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    setError(err.message);
  } finally {
    if (!isRefresh) setLoadingAnimation(false);
  }
};
  
  // Handle follow status changes across all posts
  const handleFollowStatusChange = (userId, status) => {
    updateFollowStatus(userId, status);
  };

  useEffect(() => {
    fetchPosts();
    loadMyMoments();
    loadVisibleMoments();
  }, []);

  // Handle search when searchTerm changes
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        fetchPosts(true);
      } else if (searchTerm === '') {
        // Reset to show all posts when search is cleared
        setIsSearching(true);
        fetchPosts(true);
      }
    }, 500); // 500ms delay

    debouncedSearch();

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  // Handle refresh when returning from CreateNewPost
  useEffect(() => {
    if (route.params?.refresh) {
      fetchPosts(true);
      // Clear the refresh parameter
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  // Handle focus events to refresh posts when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Refresh posts when screen comes into focus
      fetchPosts(true);
      loadMyMoments();
      loadVisibleMoments();
    });

    return unsubscribe;
  }, [navigation]);

  const user = useSelector((state) => state.user.user);
  console.log("User: ", user);

  const profileImageUrl = user?.image ? `${user.image}` : null;

  const filterUserId = user?._id;

  // Temporarily comment out the filter to show all posts including user's own posts
  // const filteredPosts = posts.filter(
  //   (post) => post.createdBy?._id !== filterUserId
  // );
  const filteredPosts = posts; // Show all posts for now

  const [refreshing, setRefreshing] = useState(false); // State to manage refreshing

  const onRefresh = async () => {
    setRefreshing(true); // Start the refreshing animation
    try {
      await fetchPosts(true); // Fetch the latest posts
    } catch (error) {
      console.error("Failed to refresh posts:", error);
    } finally {
      setRefreshing(false); // Stop the refreshing animation
    }
  };
  const loadMyMoments = async () => {
    try {
      const res = await getMyMoments();
      setMyMoments(res.data?.moments || []);
    } catch (e) {
      console.error("Failed to load moments", e.response?.data || e.message);
    }
  };

  const loadVisibleMoments = async () => {
    try {
      const res = await getVisibleMoments();
      setVisibleMoments(res.data?.moments || []);
    } catch (e) {
      console.error("Failed to load visible moments", e.response?.data || e.message);
    }
  };

  const pickMomentMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your gallery.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const a = result.assets[0];
        const media = {
          uri: a.uri,
          name: a.fileName || `moment_${Date.now()}.${a.type === 'video' ? 'mp4' : 'jpg'}`,
          mimeType: a.type === 'video' ? 'video/mp4' : 'image/jpeg',
          type: a.type,
        };
        setIsUploadingMoment(true);
        try {
          await uploadMoment('', media);
          await loadMyMoments();
        } finally {
          setIsUploadingMoment(false);
        }
      }
    } catch (err) {
      console.error('pickMomentMedia error', err);
    }
  };

  const handleDeleteMoment = async (id) => {
    try {
      await deleteMoment(id);
      await loadMyMoments();
    } catch (e) {
      console.error('deleteMoment error', e.response?.data || e.message);
    }
  };

  return (
    <Container style={{ backgroundColor: "white", paddingBottom: 0 }}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={{ flexShrink: 0 }}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("MainHome");
              }
            }}
          >
            <Icon name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ProfileNewScreen")}
          >
            <Image
              style={styles.userProfileImage}
              source={ profileImageUrl ? { uri: profileImageUrl } : UserImg}
            />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder={t("search")}
              placeholderTextColor="#888"
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={() => {
                setIsSearching(true);
                fetchPosts(true);
              }}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchTerm('')}
              >
                <Icon name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.iconsContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateNewPost")}
            >
              <Ionicons name="add-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.notificationIconContainer}
            onPress={() => {
              console.log("Message icon clicked - ENVELOPE");
              try {
                console.log("Attempting to navigate to MessageScreen");
                navigation.navigate("MessageScreen");
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}
          >
            <FontAwesomeIcon
              name="envelope"
              size={20}
              color="#000"
              marginLeft="auto"
            />
          </TouchableOpacity>
        </View>

        <SafeAreaView style={styles.socialFeedContainer}>
          {/* Moments bar */}
          <View style={styles.momentsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Add moment button */}
              <TouchableOpacity style={styles.momentAdd} onPress={pickMomentMedia} disabled={isUploadingMoment}>
                <Ionicons name="add-circle-outline" size={28} color={Theme.themeColor} />
                <Text style={styles.momentLabel}>{isUploadingMoment ? t("uploading") || 'Uploading...' : t("add") || 'Add'}</Text>
              </TouchableOpacity>
              {myMoments.map((m) => (
                <TouchableOpacity key={m._id} style={styles.momentItem} onPress={() => navigation.navigate('MomentViewer', { moment: m })}>
                  <Image source={{ uri: m.mediaUrl }} style={styles.momentThumb} />
                  <TouchableOpacity style={styles.momentDelete} onPress={() => handleDeleteMoment(m._id)}>
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              {visibleMoments
                .filter((m) => !myMoments.some((mine) => mine._id === m._id))
                .map((m) => (
                  <TouchableOpacity key={m._id} style={styles.momentItem} onPress={() => navigation.navigate('MomentViewer', { moment: m })}>
                    <Image source={{ uri: m.mediaUrl }} style={styles.momentThumb} />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
          {loadingAnimation === true ? (
            <ActivityIndicator
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              size={"large"}
              color={Theme.themeColor}
            />
          ) : (
            <>
              {searchTerm.trim() && filteredPosts.length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Icon name="search" size={64} color="#ccc" />
                  <Text style={styles.noResultsText}>No posts found</Text>
                  <Text style={styles.noResultsSubText}>
                    Try searching with different keywords
                  </Text>
                  <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={() => setSearchTerm('')}
                  >
                    <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={filteredPosts}
                  renderItem={({ item }) => {
                    // Handle deleted users by providing fallback values
                    const createdBy = item.createdBy || {};
                    const profileImageUri = createdBy.image
                      ? `${createdBy.image}`
                      : "";

                    const postImages = item.images || [];

                    return (
                      <NewSocialCard
                        post={item}
                        userId={createdBy?._id || 'unknown'}
                        posts={posts}
                        firstName={createdBy?.firstName || "Deleted"}
                        lastName={createdBy?.lastName || "User"}
                        profileImageUri={profileImageUri}
                        description={item.content}
                        video={item.video}
                        source="SocialHomeScreen"
                        filteredPosts={filteredPosts}
                        fetchPosts={fetchPosts}
                        postImages={postImages}
                        profileImageUrl={profileImageUrl}
                        currentFollowStatus={item.followStatus || getFollowStatus(createdBy?._id)}
                        onFollowStatusChange={handleFollowStatusChange}
                      />
                    );
                  }}
                  keyExtractor={(item, index) => `${item?._id || 'post'}_${index}`}
                  onEndReached={fetchPosts}
                  onEndReachedThreshold={0.5}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing} // Control the refreshing state
                      onRefresh={onRefresh} // Triggered when user pulls to refresh
                    />
                  }
                />
              )}
            </>
          )}
        </SafeAreaView>
      </View>
      <BottomNavigation navigation={navigation} currentScreen="home" />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    top: 10,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 3,
    marginHorizontal: 3,
    paddingVertical: 8,
    gap: 8, // Add consistent gap between elements
  },
  userProfileImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    flexShrink: 0, // Don't allow shrinking
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
    minWidth: 0, // Allow shrinking
  },
  searchBar: {
    flex: 1,
    height: 35,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 14,
    minWidth: 120, // Minimum width to ensure usability
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    marginLeft: 5,
    flexShrink: 0, // Don't allow shrinking
  },
  iconText: {
    fontSize: 24,
    color: "#555",
  },
  notificationIconContainer: {
    position: "relative",
    flexShrink: 0, // Don't allow shrinking
    marginLeft: 5,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  notificationBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "#ff0000",
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
  },
  socialFeedContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  momentsContainer: {
    paddingVertical: 8,
    paddingLeft: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  momentAdd: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Theme.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  momentLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  momentItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
  },
  momentThumb: {
    width: '100%',
    height: '100%',
  },
  momentDelete: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 10,
    padding: 2,
  },
  bottomMenuContainer: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#fff",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomMenuTab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
    color: "#000",
  },
  activeIcon: {
    color: "#007aff",
  },
  bottomBarContainer: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },

  iconText: {
    marginTop: 4,
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
    marginLeft: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  noResultsSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
     clearSearchButton: {
     marginTop: 20,
     backgroundColor: Theme.themeColor,
     paddingVertical: 10,
     paddingHorizontal: 20,
     borderRadius: 8,
   },
  clearSearchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SocialHomeScreen;