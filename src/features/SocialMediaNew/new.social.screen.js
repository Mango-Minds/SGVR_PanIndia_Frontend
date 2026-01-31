import React, { useEffect, useState, useRef } from "react";
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
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from "expo-image-picker";
import BottomNavigation from "../../components/social/BottomNavigation";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import NewSocialCard from "./NewSocialCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { fetchAllPosts, getMyMoments, uploadMoment, deleteMoment, getVisibleMoments, getPopularHashtags, searchHashtags } from "./SocialMediaAPIs";
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
  const [selectedTags, setSelectedTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [tagQuery, setTagQuery] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = useRef(null);
  const { getFollowStatus, updateFollowStatus } = useFollowStatus();
  const insets = useSafeAreaInsets();
  const topBarPaddingTop = Math.max(6, Math.min(22, insets.top * 0.6));

  // Safe translation helper: uses fallback when key is missing
  const tr = (key, fallback) => {
    try {
      const val = t(key);
      return val === key ? fallback : val;
    } catch (e) {
      return fallback;
    }
  };


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

    const hashtagsCsv = selectedTags.join(',');
    const response = await fetchAllPosts(pageToFetch, 10, searchTerm, hashtagsCsv);
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
    // Load popular tags initially
    getPopularHashtags(20)
      .then((res) => setPopularTags(res.data?.tags || []))
      .catch(() => setPopularTags([]));
  }, []);

  // Handle search when searchTerm changes
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (searchTerm.trim() || selectedTags.length > 0) {
        setIsSearching(true);
        fetchPosts(true);
      } else if (searchTerm === '' && selectedTags.length === 0) {
        // Reset to show all posts when search is cleared
        setIsSearching(true);
        fetchPosts(true);
      }
    }, 500); // 500ms delay

    debouncedSearch();

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, selectedTags]);

  // Debounced hashtag suggestions search
  useEffect(() => {
    const d = debounce(() => {
      if (tagQuery.trim()) {
        searchHashtags(tagQuery, 10)
          .then((res) => setTagSuggestions(res.data?.tags || []))
          .catch(() => setTagSuggestions([]));
      } else {
        setTagSuggestions([]);
      }
    }, 300);
    d();
    return () => d.cancel();
  }, [tagQuery]);

  const toggleTag = (tag) => {
    const normalized = String(tag).toLowerCase();
    setSelectedTags((prev) =>
      prev.includes(normalized) ? prev.filter((t) => t !== normalized) : [...prev, normalized]
    );
  };

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
      await Promise.all([
        fetchPosts(true), // latest posts
        (async () => {
          try { await loadMyMoments(); } catch (e) { console.error('refresh loadMyMoments', e?.response?.data || e.message); }
        })(),
        (async () => {
          try { await loadVisibleMoments(); } catch (e) { console.error('refresh loadVisibleMoments', e?.response?.data || e.message); }
        })(),
        (async () => {
          try {
            const res = await getPopularHashtags(20);
            setPopularTags(res.data?.tags || []);
          } catch (e) {
            console.error('refresh getPopularHashtags', e?.response?.data || e.message);
          }
        })(),
      ]);
    } catch (error) {
      console.error("Failed to refresh posts:", error);
    } finally {
      setRefreshing(false); // Stop the refreshing animation
    }
  };

  const handleScrollToTop = async () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      // Refresh posts when scrolling to top
      await onRefresh();
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Show button when scrolled down more than 300 pixels
    setShowScrollToTop(offsetY > 300);
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
        {/* Top bar only; composer moved below stories */}
        <View style={[styles.topBar, { paddingTop: topBarPaddingTop }]}>
          {/* Left cluster: back (if available) + logo pinned left */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {navigation.canGoBack() && (
              <TouchableOpacity
                style={{ paddingRight: 8, marginLeft: 14, marginTop: 6 }}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                  else navigation.navigate("MainHome");
                }}
              >
                <Icon name="arrow-back" size={20} color="black" />
              </TouchableOpacity>
            )}
          </View>
          {/* Centered text logo */}
          <View style={styles.centerTitleContainer}>
            <Text style={styles.centerTitle}>In Bharat</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity 
            style={[styles.notificationIconContainer, { marginRight: 10 }]}
            onPress={() => navigation.navigate("NotificationsScreen")}
          >
            <Ionicons name="notifications-outline" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationIconContainer}
            onPress={() => navigation.navigate("MessageScreen")}
          >
            <FontAwesomeIcon name="envelope" size={20} color="#000" marginLeft="auto" />
          </TouchableOpacity>
        </View>

        <SafeAreaView style={styles.socialFeedContainer}>
          {/* Composer directly under top bar */}
          <LinearGradient
            colors={[
              'rgba(212,175,55,0.40)',   // deep yellow-gold
              'rgba(212,175,55,0.30)',   // mid yellow-gold
              'rgba(212,175,55,0.20)'    // light yellow-gold
            ]}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 14,
              marginHorizontal: 12,
              padding: 16,
              marginBottom: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderWidth: 0,
              borderColor: 'transparent',
              shadowColor: 'transparent',
              shadowOpacity: 0,
              shadowRadius: 0,
              shadowOffset: { width: 0, height: 0 },
              elevation: 0,
            }}
          >
            <TouchableOpacity onPress={() => navigation.navigate("ProfileNewScreen")}>
              <Image
                style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'transparent' }}
                source={ profileImageUrl ? { uri: profileImageUrl } : UserImg}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}
              onPress={() => navigation.navigate("CreateNewPost")}
            >
              <Text style={{ color: '#2B2B2B', fontSize: 16, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                {tr("whats_on_your_mind", "What’s on your mind?")}
              </Text>
              <Ionicons name="image-outline" size={22} color="#2B2B2B" style={{ marginRight: 6 }} />
              <Ionicons name="videocam-outline" size={22} color="#2B2B2B" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Category tabs moved below moments - now rendered inside FlatList header to scroll with feed */}
          {/* Composer removed from below stories */}
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
                <>
                <FlatList
                  ref={flatListRef}
                  data={filteredPosts}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  renderItem={({ item, index }) => {
                    // Handle deleted users by providing fallback values
                    const createdBy = item.createdBy || {};
                    const profileImageUri = createdBy.image
                      ? `${createdBy.image}`
                      : "";

                    const postImages = item.images || [];

                    return (
                      <NewSocialCard
                        post={item}
                        isFirst={index === 0}
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
                  contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 12 }}
                  ListHeaderComponent={() => (
                    <>
                      {/* Hashtag search box (now scrollable with feed) */}
                      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <TextInput
                            style={{ flex: 1, height: 36, backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 10, fontSize: 13 }}
                            placeholder={tr('search_tags', 'Search tags (e.g. travel, food)')}
                            value={tagQuery}
                            onChangeText={setTagQuery}
                            returnKeyType="search"
                          />
                          {(selectedTags.length > 0 || tagQuery.trim()) && (
                            <TouchableOpacity
                              onPress={() => { setSelectedTags([]); setTagQuery(''); setTagSuggestions([]); fetchPosts(true); }}
                              style={{ marginLeft: 8, paddingHorizontal: 10, height: 36, borderRadius: 8, backgroundColor: Theme.themeBackgroundColor, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.themeColor }}
                            >
                              <Text style={{ color: Theme.themeColor, fontSize: 12, fontWeight: '600' }}>{tr('clear', 'Clear')}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        
                        {/* Show tag suggestions while typing */}
                        {tagSuggestions.length > 0 && (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                            {tagSuggestions.map((s) => (
                              <TouchableOpacity
                                key={s.tag}
                                onPress={() => { toggleTag(s.tag); setTagQuery(''); setTagSuggestions([]); }}
                                style={{ height: 30, paddingHorizontal: 10, borderRadius: 15, marginRight: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef6ff', borderWidth: 1, borderColor: '#cce4ff' }}
                              >
                                <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '600' }}>#{s.tag}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}

                        {/* Show selected tags with 'x' button */}
                        {selectedTags.length > 0 && (
                          <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            style={{ marginTop: 4 }}
                            contentContainerStyle={{ paddingRight: 8 }}
                          >
                            {selectedTags.map((tag) => (
                              <View key={tag} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8 }}>
                                <Text style={{ marginRight: 6, color: '#444', fontWeight: '600' }}>#{tag}</Text>
                                <TouchableOpacity onPress={() => toggleTag(tag)}>
                                  <Ionicons name="close" size={14} color="#444" />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                      {/* Moments bar */}
                      <View style={styles.momentsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {/* Add Story */}
                          <View style={{ alignItems: 'center', marginRight: 10 }}>
                            <TouchableOpacity style={styles.momentAdd} onPress={pickMomentMedia} disabled={isUploadingMoment}>
                              <Ionicons name="add" size={20} color={Theme.themeColor} />
                            </TouchableOpacity>
                            <Text style={styles.momentLabel}>{tr("add_story", "Add Story")}</Text>
                          </View>
                          {myMoments.map((m) => (
                            <View key={m._id} style={{ alignItems: 'center', marginRight: 10 }}>
                              <TouchableOpacity style={styles.momentItem} onPress={() => navigation.navigate('MomentViewer', { moment: m })}>
                                {m?.mediaType === 'image' && m?.mediaUrl ? (
                                  <Image source={{ uri: m.mediaUrl }} style={styles.momentThumb} />
                                ) : (
                                  <View style={[styles.momentThumb, styles.momentVideoThumb]}>
                                    <Ionicons name="play" size={20} color="#fff" />
                                  </View>
                                )}
                                <TouchableOpacity style={styles.momentDelete} onPress={() => handleDeleteMoment(m._id)}>
                                  <Ionicons name="close" size={16} color="#fff" />
                                </TouchableOpacity>
                              </TouchableOpacity>
                              <Text numberOfLines={1} style={styles.momentLabel}>{tr("you", "You")}</Text>
                            </View>
                          ))}
                          {visibleMoments
                            .filter((m) => !myMoments.some((mine) => mine._id === m._id))
                            .map((m) => (
                              <View key={m._id} style={{ alignItems: 'center', marginRight: 10 }}>
                                <TouchableOpacity style={styles.momentItem} onPress={() => navigation.navigate('MomentViewer', { moment: m })}>
                                  {m?.mediaType === 'image' && m?.mediaUrl ? (
                                    <Image source={{ uri: m.mediaUrl }} style={styles.momentThumb} />
                                  ) : (
                                    <View style={[styles.momentThumb, styles.momentVideoThumb]}>
                                      <Ionicons name="play" size={20} color="#fff" />
                                    </View>
                                  )}
                                </TouchableOpacity>
                                <Text numberOfLines={1} style={styles.momentLabel}>{m?.createdBy?.firstName || ''}</Text>
                              </View>
                            ))}
                        </ScrollView>
                      </View>
                      {/* Category tabs (Trending/News/Ads/Shared Videos) */}
                      <View style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 12, paddingBottom: 12 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
                          {[
                            tr("trending", "Trending"),
                            tr("news", "News"),
                            tr("ads", "Ads"),
                            tr("shared_videos", "Shared Videos"),
                          ].map((label, idx) => (
                            <View key={idx} style={{ marginRight: 12 }}>
                              <TouchableOpacity style={{ height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: idx === 0 ? Theme.themeBackgroundColor : "#f2f2f2", borderWidth: 1, borderColor: idx === 0 ? Theme.themeColor : "#e6e6e6", alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ color: idx === 0 ? Theme.themeColor : "#555", fontSize: 14, fontWeight: "600", includeFontPadding: false }}>{label}</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Hashtag chips removed from ListHeaderComponent to keep input focus */}
                    </>
                  )}
                  onEndReached={fetchPosts}
                  onEndReachedThreshold={0.5}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing} // Control the refreshing state
                      onRefresh={onRefresh} // Triggered when user pulls to refresh
                    />
                  }
                />
                {/* Scroll to top button */}
                {showScrollToTop && (
                  <TouchableOpacity
                    style={[styles.scrollToTopButton, { bottom: 80 + insets.bottom }]}
                    onPress={handleScrollToTop}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="arrow-up" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
                </>
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
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 3,
    marginHorizontal: 3,
    paddingVertical: 8,
    gap: 8, // Add consistent gap between elements
  },
  centerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none", // allow taps to pass through
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.themeColor,
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
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  momentAdd: {
    width: 60,
    height: 60,
    borderRadius: 12, // square with subtle rounding
    borderWidth: 4,
    borderColor: 'rgba(212,175,55,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
    shadowColor: Theme.themeColor,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  momentLabel: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
  },
  momentItem: {
    width: 60,
    height: 60,
    borderRadius: 12, // square with subtle rounding
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
    borderWidth: 4,
    borderColor: 'rgba(212,175,55,0.6)',
    shadowColor: Theme.themeColor,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    backgroundColor: 'transparent',
  },
  momentThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  momentVideoThumb: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
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
  scrollToTopButton: {
    position: "absolute",
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.themeColor,
    opacity: 0.85,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
});

export default SocialHomeScreen;