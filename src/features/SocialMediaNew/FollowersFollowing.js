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
} from "react-native";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";

import { Ionicons } from "react-native-vector-icons";
import BottomNavigation from "../../components/social/BottomNavigation";
import {
  BASEAPIURL,
  BASEIMGURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import NewSocialCard from "./NewSocialCard";
import { FlatList } from "react-native-gesture-handler";
import { debounce } from "lodash";

const FollowersFollowing = ({ navigation, route }) => {
  const { type } = route.params; // 'Followers' or 'Following'
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const [searchTerm, setSearchTerm] = useState("");
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
  const [followersPage, setFollowersPage] = useState(1); // Track the current page
  const [allFollowersLoaded, setAllFollowersLoaded] = useState(false);
  const [loadingFollowersAnimation, setLoadingFollowersAnimation] =
    useState(true);
  const [followersRefreshing, setFollowersRefreshing] = useState(false);

  const fetchFollowers = async (querystring) => {
    if (allFollowersLoaded) return;
    try {
      setLoadingFollowersAnimation(true);
      console.log(
        `${BASEAPIURL}/social/${userId}/followers?page=${followersPage}&limit=10?${querystring}`
      );
      const response = await fetch(
        `${BASEAPIURL}/social/${userId}/followers?page=${followersPage}&limit=10?${querystring}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      // console.log("Followers:", data);
      console.log(data.followers);
      if (data.followers.length < 10) setAllFollowersLoaded(true);
      setFollowers((prevPosts) => [...prevPosts, ...data.followers]);
      setFollowersPage((prevPage) => prevPage + 1);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoadingFollowersAnimation(false);
    }
  };

  //variables for user following data
  const [following, setFollowing] = useState([]);
  const [followingPage, setFollowingPage] = useState(1);
  const [allFollowingLoaded, setAllFollowingLoaded] = useState(false);
  const [loadingFollowingAnimation, setLoadingFollowingAnimation] =
    useState(true);
  const [followingRefreshing, setFollowingRefreshing] = useState(false);

  const fetchFollowing = async (querystring) => {
    if (allFollowingLoaded) return;
    try {
      setLoadingFollowingAnimation(true);
      console.log(
        `${BASEAPIURL}/social/${userId}/following?page=${followingPage}&limit=10?${querystring}`,
      );
      const response = await fetch(
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Following:", data);

      if (data.following.length < 10) setAllFollowingLoaded(true);
      setFollowing((prevPosts) => [...prevPosts, ...data.following]);
      setFollowingPage((prevPage) => prevPage + 1);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoadingFollowingAnimation(false);
    }
  };

  const followersFollowingdata = type === "Followers" ? followers : following;
  console.log("followers:", following);

  const renderItem = ({ item }) => (
    <TouchableOpacity
    onPress={() =>
      navigation.navigate("EachProfile", { 
        userId: item._id,  // Use the userId from the item object
      })
    }
  >
    <View style={styles.itemContainer}>
      <Image
        source={
          item.image === ""
            ?  UserImg 
            : { uri: `${BASEIMGURL}${item.image}` }
        }
        style={styles.image}
      />
      <Text style={styles.name}>
        {item.firstName} {item.lastName}
      </Text>
    </View>
    </TouchableOpacity>
  );

  //debounce
  // Debounced fetch function to avoid unnecessary API calls
  const debouncedFetchData = useCallback(
    debounce((searchTerm) => {
      console.log("Fetching data for tab:", "with searchTerm:", searchTerm);
      type === "Followers"
        ? setLoadingFollowersAnimation(false)
        : setLoadingFollowingAnimation(false);
      const queryParams = new URLSearchParams();
      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm);
      }

      const queryString = queryParams.toString();

      type === "Followers"
        ? fetchFollowers(queryString)
        : fetchFollowing(queryString);
    }, 1200), // Adjust debounce delay as needed
    []
  );

  useEffect(() => {
    debouncedFetchData(searchTerm);
  }, [searchTerm]);

  return (
    <>
      <View style={styles.container}>
        <Header />
        {isSearchVisible && (
          <View
            style={{
              alignItems: "center",
              marginLeft: 16,
              marginRight: 16,
              marginBottom: 10,
            }}
          >
            <SearchField placeholder="Search" onChangeText={handleSearch} />
          </View>
        )}
        {loadingFollowersAnimation && loadingFollowingAnimation ? (
          <ActivityIndicator
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            size="large"
            color="#b98c13"
          />
        ) : followersFollowingdata.length === 0 ? (
          <View
            style={{
              flex: 1, // Takes up the full screen
              justifyContent: "center", // Centers vertically
              alignItems: "center", // Centers horizontally
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold", // Makes the text bold
                color: "black", // Sets the text color to black
                fontSize: 16, // Optional: Adjust font size
              }}
            >
              {type === "Followers"
                ? "You have no Followers"
                : "You have no users Following you"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={followersFollowingdata} // Use followersFollowingdata here
            renderItem={renderItem}
            keyExtractor={(item) => item._id} // Ensure keyExtractor uses a unique string
            showsVerticalScrollIndicator={false}
            onEndReached={() =>
              type === "Followers" && !allFollowersLoaded
                ? setFollowersPage((prev) => prev + 1)
                : !allFollowingLoaded && setFollowingPage((prev) => prev + 1)
            }
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginVertical: 15,
    height: 60,
    backgroundColor: "#f9f9f9",
  },
  headerLeftIcon: {
    flex: 1,
  },
  headerTitle: {
    flex: 2,
    textAlign: "center",
    color: Theme.themeColor,
    fontSize: 20,
    fontWeight: "bold",
  },
  headerRightContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flex: 1,
  },
  headerRightIcon: {
    marginLeft: 15,
  },
});

export default FollowersFollowing;
