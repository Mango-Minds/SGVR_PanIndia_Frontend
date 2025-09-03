import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomNavigation from "../../components/social/BottomNavigation";

import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import NewSocialCard from "./NewSocialCard";
import { FlatList } from "react-native-gesture-handler";
import { debounce } from "lodash";
import { useFollowStatus } from "./FollowStatusContext";
import { getFollowing, getFollowers, unfollowUserAPI } from "./SocialMediaAPIs";

const FollowersFollowing = ({ navigation, route }) => {
  const { type } = route.params; // 'Followers' or 'Following'
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const { updateFollowStatus } = useFollowStatus();

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const handleSearch = (e) => {
    setSearchTerm(e);
    console.log("Search term: ", e);
  };

  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const userId = user._id;

  const Header = () => {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerLeftIcon}
        >
          <IconButton
            icon="arrow-left"
            style={{ color: "grey" }}
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{type}</Text>
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={toggleSearch}
            style={styles.headerRightIcon}
          >
            <Icon
              name="search"
              size={24}
              style={{ marginRight: 15, color: "grey" }}
              onPress={toggleSearch}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerRightIcon}>
            <Ionicons name="person" size={24} color="grey" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // variables for user followers
  const [followers, setFollowers] = useState([]);
  const [followersPage, setFollowersPage] = useState(1);
  const [allFollowersLoaded, setAllFollowersLoaded] = useState(false);
  const [loadingFollowersAnimation, setLoadingFollowersAnimation] = useState(true);
  const [followersRefreshing, setFollowersRefreshing] = useState(false);

  // variables for user following data
  const [following, setFollowing] = useState([]);
  const [followingPage, setFollowingPage] = useState(1);
  const [allFollowingLoaded, setAllFollowingLoaded] = useState(false);
  const [loadingFollowingAnimation, setLoadingFollowingAnimation] = useState(true);
  const [followingRefreshing, setFollowingRefreshing] = useState(false);

  const fetchFollowers = async (querystring = "", isRefresh = false) => {
    if (allFollowersLoaded && !isRefresh) return;
    
    try {
      setLoadingFollowersAnimation(true);
      setError(null);
      
      const page = isRefresh ? 1 : followersPage;
      const { data } = await getFollowers(userId, page, querystring);
      
      if (data.followers.length < 10) {
        setAllFollowersLoaded(true);
      }
      
      if (isRefresh) {
        setFollowers(data.followers);
        setFollowersPage(2);
        setAllFollowersLoaded(false);
      } else {
        setFollowers((prev) => [...prev, ...data.followers]);
        setFollowersPage((prevPage) => prevPage + 1);
      }
    } catch (err) {
      console.log("Error fetching followers:", err.message);
      setError("Failed to fetch followers");
    } finally {
      setLoadingFollowersAnimation(false);
    }
  };

  const fetchFollowing = async (querystring = "", isRefresh = false) => {
    if (allFollowingLoaded && !isRefresh) return;
    
    try {
      setLoadingFollowingAnimation(true);
      setError(null);
      
      const page = isRefresh ? 1 : followingPage;
      const { data } = await getFollowing(userId, page, querystring);
      
      if (data.following.length < 10) {
        setAllFollowingLoaded(true);
      }
      
      if (isRefresh) {
        setFollowing(data.following);
        setFollowingPage(2);
        setAllFollowingLoaded(false);
      } else {
        setFollowing((prev) => [...prev, ...data.following]);
        setFollowingPage((prevPage) => prevPage + 1);
      }
    } catch (err) {
      console.log("Error fetching following:", err.message);
      setError("Failed to fetch following");
    } finally {
      setLoadingFollowingAnimation(false);
    }
  };

  const handleRefresh = async () => {
    if (type === "Followers") {
      setFollowersRefreshing(true);
      await fetchFollowers("", true);
      setFollowersRefreshing(false);
    } else {
      setFollowingRefreshing(true);
      await fetchFollowing("", true);
      setFollowingRefreshing(false);
    }
  };

  const followersFollowingdata = type === "Followers" ? followers : following;
  const isLoading = type === "Followers" ? loadingFollowersAnimation : loadingFollowingAnimation;
  const isRefreshing = type === "Followers" ? followersRefreshing : followingRefreshing;

  const handleUnfollow = async (userId) => {
    try {
      const response = await unfollowUserAPI(userId);
      if (response.status === 200) {
        // Update global follow status
        updateFollowStatus(userId, "none");
        
        // Remove from local following list
        setFollowing(prev => prev.filter(user => user._id !== userId));
        
        Alert.alert("Success", "User unfollowed successfully.");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      Alert.alert("Error", "Failed to unfollow user.");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("EachProfile", { 
          userId: item._id,
        })
      }
      style={styles.itemContainer}
    >
      <Image
        source={
          item.image === "" || !item.image
            ? UserImg 
            : { uri: `${item.image}` }
        }
        style={styles.image}
      />
      <View style={styles.userInfo}>
        <Text style={styles.name}>
          {item.firstName} {item.lastName}
        </Text>
      </View>
      {type === "Following" && (
        <TouchableOpacity 
          style={styles.unfollowButton}
          onPress={() => handleUnfollow(item._id)}
        >
          <Text style={styles.unfollowText}>Unfollow</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>
        {type === "Followers"
          ? "You have no followers yet"
          : "You are not following anyone yet"}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle" size={64} color="#ff6b6b" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => {
          if (type === "Followers") {
            fetchFollowers("", true);
          } else {
            fetchFollowing("", true);
          }
        }}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Debounced fetch function to avoid unnecessary API calls
  const debouncedFetchData = useCallback(
    debounce((searchTerm) => {
      console.log("Fetching data for tab:", type, "with searchTerm:", searchTerm);
      
      const queryParams = new URLSearchParams();
      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm);
      }
      const queryString = queryParams.toString();

      if (type === "Followers") {
        setFollowers([]);
        setFollowersPage(1);
        setAllFollowersLoaded(false);
        fetchFollowers(queryString, true);
      } else {
        setFollowing([]);
        setFollowingPage(1);
        setAllFollowingLoaded(false);
        fetchFollowing(queryString, true);
      }
    }, 800),
    [type]
  );

  useEffect(() => {
    debouncedFetchData(searchTerm);
  }, [searchTerm, type]);

  useEffect(() => {
    if (type === "Followers") {
      fetchFollowers();
    } else {
      fetchFollowing();
    }
  }, [type]);

  const handleLoadMore = () => {
    if (type === "Followers") {
      fetchFollowers();
    } else {
      fetchFollowing();
    }
  };

  if (error && followersFollowingdata.length === 0) {
    return (
      <View style={styles.container}>
        <Header />
        {renderErrorState()}
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Header />
        {isSearchVisible && (
          <View style={styles.searchContainer}>
            <SearchField 
              placeholder="Search" 
              onChangeText={handleSearch}
              value={searchTerm}
            />
          </View>
        )}
        
        {isLoading && followersFollowingdata.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.themeColor} />
            <Text style={styles.loadingText}>Loading {type.toLowerCase()}...</Text>
          </View>
        ) : (
          <FlatList
            data={followersFollowingdata}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[Theme.themeColor]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={
              isLoading && followersFollowingdata.length > 0 ? (
                <ActivityIndicator size="small" color={Theme.themeColor} style={styles.footerLoader} />
              ) : null
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerLeftIcon: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRightIcon: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Theme.themeColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#666",
    fontSize: 16,
    marginTop: 16,
  },
  listContainer: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: "#666",
  },
  messageButton: {
    padding: 8,
  },
  unfollowButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  unfollowText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  footerLoader: {
    paddingVertical: 16,
  },
});

export default FollowersFollowing;
