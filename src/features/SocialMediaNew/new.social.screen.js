import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
  useWindowDimensions,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { setAudioModeAsync } from "expo-audio";
import { Container } from "../../styles/common.styles";
import Theme from "../../styles/theme";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from "expo-image-picker";
import BottomNavigation from "../../components/social/BottomNavigation";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import Icon from "react-native-vector-icons/Ionicons";
import NewSocialCard from "./NewSocialCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { fetchAllPosts, getMyMoments, uploadMoment, deleteMoment, getVisibleMoments } from "./SocialMediaAPIs";
// import { FlatList } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import { useFollowStatus } from "./FollowStatusContext";
import { useFocusEffect } from "@react-navigation/native";
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
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("trending");
  /** Only one feed video mounts an ExoPlayer — prevents Android OOM / crash */
  const [activeVideoPostId, setActiveVideoPostId] = useState(null);
  const [showCategoryTabs, setShowCategoryTabs] = useState(false);
  const flatListRef = useRef(null);
  const categoryTabsAnim = useRef(new Animated.Value(0)).current;
  const { getFollowStatus, updateFollowStatus } = useFollowStatus();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const topBarPaddingTop = Math.max(6, Math.min(22, insets.top * 0.6));

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 120,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const firstVideo = viewableItems.find(
      (v) => v.isViewable && v.item?.video
    );
    const nextId = firstVideo?.item?._id ?? null;
    setActiveVideoPostId((prev) => (prev === nextId ? prev : nextId));
  }).current;

  const FEED_HEADER_HEIGHT = 120;
  const TOP_BAR_HEIGHT = 52;
  const POST_CARD_HEADER_HEIGHT = 54;
  const BOTTOM_NAV_HEIGHT = 72;
  const CATEGORY_TABS_HEIGHT = 48;
  const SCROLL_REVEAL_THRESHOLD = 40;

  const firstPostMediaSize = Math.min(
    windowWidth,
    Math.max(
      200,
      windowHeight
        - insets.top
        - insets.bottom
        - TOP_BAR_HEIGHT
        - FEED_HEADER_HEIGHT
        - POST_CARD_HEADER_HEIGHT
        - BOTTOM_NAV_HEIGHT
    )
  );

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
  if (allLoaded && !isRefresh) return;

  try {
    if (!isRefresh) setLoadingAnimation(true);

    const pageToFetch = isRefresh ? 1 : page;

    const response = await fetchAllPosts(pageToFetch, 10, '', '');
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

    if (isRefresh) {
      setPosts(postsWithImages);
      setPage(2);
      setAllLoaded(postsWithImages.length < 10);
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

  useEffect(() => {
    Animated.timing(categoryTabsAnim, {
      toValue: showCategoryTabs ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [showCategoryTabs, categoryTabsAnim]);

  useFocusEffect(
    useCallback(() => {
      setShowCategoryTabs(false);
      categoryTabsAnim.setValue(0);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [categoryTabsAnim])
  );

  // Prime Android media audio session so social videos can unmute with sound
  useEffect(() => {
    if (Platform.OS !== "android") return;
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
      allowsRecording: false,
    }).catch(() => {});
  }, []);

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

  const displayName = [
    user?.firstName || user?.fname,
    user?.lastName || user?.lname,
  ].filter(Boolean).join(' ') || tr('guest', 'Guest');

  const filterUserId = user?._id;

  // Temporarily comment out the filter to show all posts including user's own posts
  // const filteredPosts = posts.filter(
  //   (post) => post.createdBy?._id !== filterUserId
  // );
  const feedCategories = [
    { key: "trending", label: tr("trending", "Trending") },
    { key: "news", label: tr("news", "News") },
    { key: "ads", label: tr("ads", "Ads") },
    { key: "shared_videos", label: tr("shared_videos", "Shared Videos") },
  ];

  const hasHashtag = (post, tags) => {
    const postTags = (post?.hashtags || []).map((t) => String(t).toLowerCase());
    return tags.some((tag) => postTags.includes(tag));
  };

  const filteredPosts = (() => {
    switch (selectedCategory) {
      case "news":
        return posts.filter((post) => hasHashtag(post, ["news"]));
      case "ads":
        return posts.filter((post) => hasHashtag(post, ["ads", "ad", "advertisement"]));
      case "shared_videos":
        return posts.filter(
          (post) => !!post?.video || post?.type === "text+video"
        );
      case "trending":
      default:
        // Engagement-first ordering for Trending; keep API order as a stable fallback
        return [...posts].sort(
          (a, b) => (b?.likesCount || 0) - (a?.likesCount || 0)
        );
    }
  })();

  const handleSelectCategory = (key) => {
    if (key === selectedCategory) return;
    setSelectedCategory(key);
    setActiveVideoPostId(null);
    flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
  };

  // #region agent log
  useEffect(() => {
    const videoPosts = filteredPosts.filter((p) => !!p.video);
    fetch('http://127.0.0.1:7929/ingest/e8d6d600-8e18-4aff-9023-e6b7ca98ea87',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'873502'},body:JSON.stringify({sessionId:'873502',location:'new.social.screen.js:postsLoaded',message:'Social feed posts loaded',data:{platform:Platform.OS,totalPosts:filteredPosts.length,videoPostCount:videoPosts.length,videoUrls:videoPosts.map((p)=>p.video?.replace(/\\/g,'/'))},timestamp:Date.now(),hypothesisId:'B,C'})}).catch(()=>{});
  }, [filteredPosts]);
  // #endregion

  const [refreshing, setRefreshing] = useState(false); // State to manage refreshing

  const onRefresh = async () => {
    setRefreshing(true); // Start the refreshing animation
    try {
      await Promise.all([
        fetchPosts(true),
        (async () => {
          try { await loadMyMoments(); } catch (e) { console.error('refresh loadMyMoments', e?.response?.data || e.message); }
        })(),
        (async () => {
          try { await loadVisibleMoments(); } catch (e) { console.error('refresh loadVisibleMoments', e?.response?.data || e.message); }
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
    setShowScrollToTop(offsetY > 300);
    if (offsetY > SCROLL_REVEAL_THRESHOLD) {
      setShowCategoryTabs((prev) => (prev ? prev : true));
    }
  };

  const categoryTabsAnimatedHeight = categoryTabsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, CATEGORY_TABS_HEIGHT],
  });
  const categoryTabsAnimatedOpacity = categoryTabsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const categoryTabsAnimatedTranslateY = categoryTabsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });
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
        } catch (uploadErr) {
          console.error('pickMomentMedia error', uploadErr);
          // Handle different error types
          let errorMessage = 'Failed to upload moment. Please try again.';
          
          if (uploadErr.response) {
            // Server responded with error status
            const status = uploadErr.response.status;
            const serverMessage = uploadErr.response?.data?.message;
            
            if (status === 500) {
              errorMessage = serverMessage || 'Server error occurred. Please try again later.';
            } else if (status === 413) {
              errorMessage = 'File is too large. Please choose a smaller file.';
            } else if (status === 400) {
              errorMessage = serverMessage || 'Invalid file format. Please choose an image or video.';
            } else if (status === 401) {
              errorMessage = 'Session expired. Please log in again.';
            } else {
              errorMessage = serverMessage || `Upload failed (${status}). Please try again.`;
            }
          } else if (uploadErr.request) {
            // Request was made but no response received
            errorMessage = 'Network error. Please check your internet connection.';
          } else {
            // Something else happened
            errorMessage = uploadErr.message || 'An unexpected error occurred.';
          }
          
          Alert.alert('Upload Failed', errorMessage);
        } finally {
          setIsUploadingMoment(false);
        }
      }
    } catch (err) {
      console.error('pickMomentMedia error', err);
      // Handle permission or image picker errors
      if (err.code === 'E_PERMISSION_DENIED') {
        Alert.alert('Permission Denied', 'We need access to your gallery to upload moments.');
      } else {
        Alert.alert('Error', 'Failed to pick media. Please try again.');
      }
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
          <View style={styles.leftCluster}>
            {navigation.canGoBack() && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                  else navigation.navigate("MainHome");
                }}
              >
                <Icon name="arrow-back" size={20} color="black" />
              </TouchableOpacity>
            )}
            <Text style={styles.leftTitle}>In Bharat</Text>
          </View>
          <TouchableOpacity
            style={styles.rightCluster}
            onPress={() => navigation.navigate("ProfileNewScreen")}
          >
            <Text style={styles.headerUserName} numberOfLines={1} ellipsizeMode="tail">
              {displayName}
            </Text>
            <Image
              style={styles.userProfileImage}
              source={profileImageUrl ? { uri: profileImageUrl } : UserImg}
            />
          </TouchableOpacity>
        </View>

        <SafeAreaView style={styles.socialFeedContainer}>
          {/* Compact stories row */}
          <View style={styles.momentsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.momentsScrollContent}>
              <TouchableOpacity
                style={styles.momentAdd}
                onPress={pickMomentMedia}
                disabled={isUploadingMoment}
                accessibilityLabel={tr("add_story", "Add Story")}
              >
                <Ionicons name="add" size={18} color={Theme.themeColor} />
              </TouchableOpacity>
              {myMoments.map((m) => (
                <View key={m._id} style={styles.momentWrapper}>
                  <TouchableOpacity
                    style={styles.momentItem}
                    onPress={() => navigation.navigate('MomentViewer', { moment: m })}
                    accessibilityLabel={tr("you", "You")}
                  >
                    {m?.mediaType === 'image' && m?.mediaUrl ? (
                      <Image source={{ uri: m.mediaUrl }} style={styles.momentThumb} />
                    ) : (
                      <View style={[styles.momentThumb, styles.momentVideoThumb]}>
                        <Ionicons name="play" size={16} color="#fff" />
                      </View>
                    )}
                    <TouchableOpacity style={styles.momentDelete} onPress={() => handleDeleteMoment(m._id)}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              ))}
              {visibleMoments
                .filter((m) => !myMoments.some((mine) => mine._id === m._id))
                .map((m) => (
                  <View key={m._id} style={styles.momentWrapper}>
                    <TouchableOpacity
                      style={styles.momentItem}
                      onPress={() => navigation.navigate('MomentViewer', { moment: m })}
                      accessibilityLabel={m?.createdBy?.firstName || ''}
                    >
                      {m?.mediaType === 'image' && m?.mediaUrl ? (
                        <Image source={{ uri: m.mediaUrl }} style={styles.momentThumb} />
                      ) : (
                        <View style={[styles.momentThumb, styles.momentVideoThumb]}>
                          <Ionicons name="play" size={16} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
            </ScrollView>
          </View>

          {/* Slim composer with gradient */}
          <LinearGradient
            colors={[
              'rgba(212,175,55,0.40)',
              'rgba(212,175,55,0.30)',
              'rgba(212,175,55,0.20)',
            ]}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.composerBar}
          >
            <TouchableOpacity
              style={styles.composerTouchable}
              onPress={() => navigation.navigate("CreateNewPost")}
            >
              <Text style={styles.composerPlaceholder} numberOfLines={1}>
                {tr("whats_on_your_mind", "What's on your mind?")}
              </Text>
              <View style={styles.composerIcons}>
                <Ionicons name="image-outline" size={22} color="#2B2B2B" />
                <Ionicons name="videocam-outline" size={22} color="#2B2B2B" />
              </View>
            </TouchableOpacity>
          </LinearGradient>

          <Animated.View
            style={[
              styles.categoryTabsContainer,
              {
                height: categoryTabsAnimatedHeight,
                opacity: categoryTabsAnimatedOpacity,
                transform: [{ translateY: categoryTabsAnimatedTranslateY }],
              },
            ]}
            pointerEvents={showCategoryTabs ? 'auto' : 'none'}
          >
            <View style={styles.categoryTabsInner}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
                {feedCategories.map((cat) => {
                  const isActive = selectedCategory === cat.key;
                  return (
                    <View key={cat.key} style={{ marginRight: 10 }}>
                      <TouchableOpacity
                        onPress={() => handleSelectCategory(cat.key)}
                        style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                      >
                        <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </Animated.View>

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
                      <View style={index === 0 ? styles.firstPostWrapper : undefined}>
                      <NewSocialCard
                        post={item}
                        isFirst={index === 0}
                        mediaSize={index === 0 ? firstPostMediaSize : undefined}
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
                        isActiveVideo={!!item.video && item._id === activeVideoPostId}
                      />
                      </View>
                    );
                  }}
                  keyExtractor={(item, index) => `${item?._id || 'post'}_${index}`}
                  contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 12 }}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                  windowSize={5}
                  maxToRenderPerBatch={4}
                  initialNumToRender={3}
                  removeClippedSubviews={Platform.OS === "android"}
                  ListEmptyComponent={() => {
                    const emptyCopy = {
                      news: tr("no_news_posts", "No news posts yet. Tag posts with #news."),
                      ads: tr("no_ads_posts", "No ad posts yet. Tag posts with #ads."),
                      shared_videos: tr("no_shared_videos", "No shared videos yet."),
                      trending: tr("no_posts", "No posts yet."),
                    };
                    return (
                      <View style={styles.noResultsContainer}>
                        <Icon name="albums-outline" size={56} color="#ccc" />
                        <Text style={styles.noResultsText}>
                          {emptyCopy[selectedCategory] || emptyCopy.trending}
                        </Text>
                      </View>
                    );
                  }}
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
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftCluster: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    paddingRight: 8,
  },
  leftTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.themeColor,
    marginLeft: 4,
  },
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 8,
  },
  headerUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2B2B2B",
    maxWidth: 120,
  },
  userProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    flexShrink: 0,
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
  socialFeedContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  momentsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  momentsScrollContent: {
    alignItems: 'center',
    gap: 10,
  },
  momentWrapper: {
    marginRight: 10,
  },
  momentAdd: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  momentItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.6)',
    backgroundColor: 'transparent',
  },
  momentThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
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
  composerBar: {
    marginHorizontal: 12,
    marginBottom: 2,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  composerTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  composerPlaceholder: {
    flex: 1,
    color: '#2B2B2B',
    fontSize: 16,
    fontWeight: '600',
  },
  composerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTabsContainer: {
    overflow: 'hidden',
  },
  categoryTabsInner: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  firstPostWrapper: {
    marginTop: -4,
  },
  categoryTab: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabActive: {
    backgroundColor: Theme.themeBackgroundColor,
    borderColor: Theme.themeColor,
  },
  categoryTabText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
  },
  categoryTabTextActive: {
    color: Theme.themeColor,
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
});

export default SocialHomeScreen;