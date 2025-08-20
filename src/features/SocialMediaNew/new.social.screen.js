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
} from "react-native";
import { IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import { Container, RowBetween } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";
import Theme from "../../styles/theme";
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomNavigation from "../../components/social/BottomNavigation";

import { useSelector } from "react-redux";
import UserImg from "../../assets/images/general/user.png";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import NewSocialCard from "./NewSocialCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { fetchAllPosts } from "./SocialMediaAPIs";
// import { FlatList } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
const SocialHomeScreen = ({ navigation, route }) => {
  const token = useSelector((state) => state.user.token);
const { t } = useTranslation();
  // const profileImageUrl =
  //   "https://media.istockphoto.com/id/2143311599/photo/a-cheerful-asian-woman-enjoys-a-walk-during-a-summer-night.webp?a=1&b=1&s=612x612&w=0&k=20&c=D7Yb-GG6xR5vPDF40d5pL8OtDGHbav2AOZmg9q6nEXg=";

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1); // Track the current page
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState(true);


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

    const response = await fetchAllPosts(pageToFetch);
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
    setError(err.message);
  } finally {
    if (!isRefresh) setLoadingAnimation(false);
  }
};
  
  useEffect(() => {
    fetchPosts();
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
  return (
    <Container style={{ backgroundColor: "white", paddingBottom: 0 }}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
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
          <TextInput
            style={styles.searchBar}
            placeholder={t("search")}
            placeholderTextColor="#888"
          />
          <View style={styles.iconsContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateNewPost")}
            >
              <Ionicons name="add-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.notificationIconContainer}>
            <FontAwesomeIcon
              name="envelope"
              size={20}
              color="#000"
              marginLeft="auto"
            />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>

        <SafeAreaView style={styles.socialFeedContainer}>
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
                    userId={createdBy._id}
                    posts={posts}
                    firstName={createdBy.firstName || "Deleted"}
                    lastName={createdBy.lastName || "User"}
                    profileImageUri={profileImageUri}
                    description={item.content}
                    video={item.video}
                    source="SocialHomeScreen"
                    filteredPosts={filteredPosts}
                    fetchPosts={fetchPosts}
                    postImages={postImages}
                    profileImageUrl={profileImageUrl}
                  />
                );
              }}
              keyExtractor={(item) => item?._id.toString()}
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
        </SafeAreaView>
      </View>
      <BottomNavigation navigation={navigation} />
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
  },
  userProfileImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    left: 3,
  },
  searchBar: {
    flex: 1,
    height: 35,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    right: 5,
    padding: 5,
  },
  iconText: {
    fontSize: 24,
    color: "#555",
  },
  notificationIconContainer: {
    position: "relative",
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
});

export default SocialHomeScreen;








// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   TextInput,
//   ActivityIndicator,
//   FlatList,
//   RefreshControl,
// } from "react-native";
// import { IconButton } from "react-native-paper";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Container, RowBetween } from "../../styles/common.styles";
// import { TopText } from "../../styles/social.styles";
// import messageIcon from "../../assets/images/social/message.png";
// import Theme from "../../styles/theme";
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import BottomNavigation from "../../components/social/BottomNavigation";

// import { useSelector } from "react-redux";
// import UserImg from "../../assets/images/general/user.png";
// import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
// import NewSocialCard from "./NewSocialCard";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import apiClient from "../../store/apiClient";
// // import { FlatList } from "react-native-gesture-handler";

// const SocialHomeScreen = ({ navigation, route }) => {
//   const token = useSelector((state) => state.user.token);

//   // const profileImageUrl =
//   //   "https://media.istockphoto.com/id/2143311599/photo/a-cheerful-asian-woman-enjoys-a-walk-during-a-summer-night.webp?a=1&b=1&s=612x612&w=0&k=20&c=D7Yb-GG6xR5vPDF40d5pL8OtDGHbav2AOZmg9q6nEXg=";

//   const [posts, setPosts] = useState([]);
//   const [page, setPage] = useState(1); // Track the current page
//   const [allLoaded, setAllLoaded] = useState(false);
//   const [loadingAnimation, setLoadingAnimation] = useState(true);

//   // const fetchPosts = async (isRefresh = false) => {
//   //   if (allLoaded && !isRefresh) return; // Stop fetching if all data is loaded and not a refresh
//   //   console.log("inside fetch posts");
//   //   try {
//   //     if (!isRefresh) setLoadingAnimation(true);

//   //     const pageToFetch = isRefresh ? 1 : page; // Reset page if refreshing
//   //     const response = await fetch(
//   //       `${BASEAPIURL}/social/post/all?page=${pageToFetch}&limit=10`,
//   //       {
//   //         method: "GET",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );

//   //     if (!response.ok) {
//   //       throw new Error("Network response was not ok");
//   //     }

//   //     const data = await response.json();
//   //     console.log("post data", data);
//   //     if (isRefresh) {
//   //       // Clear posts on refresh
//   //       setPosts(data.posts);
//   //       setPage(2); // Reset page to 2 for subsequent requests
//   //       setAllLoaded(data.posts.length < 10); // Mark allLoaded if fewer than 10 posts
//   //     } else {
//   //       if (data.posts.length < 10) setAllLoaded(true);
//   //       setPosts((prevPosts) => [...prevPosts, ...data.posts]);
//   //       setPage((prevPage) => prevPage + 1);
//   //     }
//   //   } catch (err) {
//   //     setError(err.message);
//   //   } finally {
//   //     if (!isRefresh) setLoadingAnimation(false);
//   //   }
//   // };
//   const fetchPosts = async (isRefresh = false) => {
//     if (allLoaded && !isRefresh) return;
  
//     try {
//       if (!isRefresh) setLoadingAnimation(true);
  
//       const token = await AsyncStorage.getItem("token");
//       const pageToFetch = isRefresh ? 1 : page;
  
//       const response = await apiClient.get(
//         `/social/post/all?page=${pageToFetch}&limit=10`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
  
//       const data = response.data;
//       console.log("post data", data);
  
//       if (isRefresh) {
//         setPosts(data.posts);
//         setPage(2);
//         setAllLoaded(data.posts.length < 10);
//       } else {
//         if (data.posts.length < 10) setAllLoaded(true);
//         setPosts((prevPosts) => [...prevPosts, ...data.posts]);
//         setPage((prevPage) => prevPage + 1);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       if (!isRefresh) setLoadingAnimation(false);
//     }
//   };
  
//   useEffect(() => {
//     fetchPosts();
//   }, []);

//   const user = useSelector((state) => state.user.user);
//   console.log("User: ", user);

//   const profileImageUrl = user?.image ? `${user.image}` : null;

//   const filterUserId = user?._id;

//   const filteredPosts = posts.filter(
//     (post) => post.createdBy?._id !== filterUserId
//   );

//   const [refreshing, setRefreshing] = useState(false); // State to manage refreshing

//   const onRefresh = async () => {
//     setRefreshing(true); // Start the refreshing animation
//     try {
//       await fetchPosts(true); // Fetch the latest posts
//     } catch (error) {
//       console.error("Failed to refresh posts:", error);
//     } finally {
//       setRefreshing(false); // Stop the refreshing animation
//     }
//   };
//   return (
//     <Container style={{ backgroundColor: "white", paddingBottom: 0 }}>
//       <View style={styles.container}>
//         <View style={styles.topBar}>
//           <TouchableOpacity
//             onPress={() => {
//               if (navigation.canGoBack()) {
//                 navigation.goBack();
//               } else {
//                 navigation.navigate("MainHome");
//               }
//             }}
//           >
//             <Icon name="arrow-back" size={20} color="black" />
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => navigation.navigate("ProfileNewScreen")}
//           >
//             <Image
//               style={styles.userProfileImage}
//               source={ profileImageUrl ? { uri: profileImageUrl } : UserImg}
//             />
//           </TouchableOpacity>
//           <TextInput
//             style={styles.searchBar}
//             placeholder="Search"
//             placeholderTextColor="#888"
//           />
//           <View style={styles.iconsContainer}>
//             <TouchableOpacity
//               onPress={() => navigation.navigate("CreateNewPost")}
//             >
//               <Ionicons name="add-circle-outline" size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <TouchableOpacity style={styles.notificationIconContainer}>
//             <FontAwesomeIcon
//               name="envelope"
//               size={20}
//               color="#000"
//               marginLeft="auto"
//             />
//             <View style={styles.notificationBadge}>
//               <Text style={styles.badgeText}>1</Text>
//             </View>
//           </TouchableOpacity>
//         </View>

//         <SafeAreaView style={styles.socialFeedContainer}>
//           {loadingAnimation === true ? (
//             <ActivityIndicator
//               style={{
//                 flex: 1,
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//               size={"large"}
//               color={Theme.themeColor}
//             />
//           ) : (
//             <FlatList
//               data={filteredPosts}
//               renderItem={({ item }) => {
//                 const profileImageUri = item.createdBy.image
//                   ? `${item.createdBy.image}`
//                   : "";

//                 const postImages =
//                   item.type === "text+image" ? item.images : [];

//                 return (
//                   <NewSocialCard
//                     post={item}
//                     userId={item.createdBy?._id}
//                     posts={posts}
//                     firstName={item.createdBy.firstName}
//                     lastName={item.createdBy.lastName}
//                     profileImageUri={profileImageUri}
//                     description={item.content}
//                     video={item.video}
//                     source="SocialHomeScreen"
//                     filteredPosts={filteredPosts}
//                     fetchPosts={fetchPosts}
//                     postImages={postImages}
//                     profileImageUrl={profileImageUrl}
//                   />
//                 );
//               }}
//               keyExtractor={(item) => item?._id.toString()}
//               onEndReached={fetchPosts}
//               onEndReachedThreshold={0.5}
//               refreshControl={
//                 <RefreshControl
//                   refreshing={refreshing} // Control the refreshing state
//                   onRefresh={onRefresh} // Triggered when user pulls to refresh
//                 />
//               }
//             />
//           )}
//         </SafeAreaView>
//       </View>
//       <BottomNavigation navigation={navigation} />
//     </Container>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: "#fff",
//     top: 10,
//     paddingHorizontal: 0,
//     marginHorizontal: 0,
//   },
//   topBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//     paddingHorizontal: 3,
//     marginHorizontal: 3,
//   },
//   userProfileImage: {
//     width: 35,
//     height: 35,
//     borderRadius: 17.5,
//     left: 3,
//   },
//   searchBar: {
//     flex: 1,
//     height: 35,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 5,
//     marginHorizontal: 10,
//     paddingHorizontal: 10,
//     fontSize: 14,
//   },
//   iconsContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     right: 5,
//     padding: 5,
//   },
//   iconText: {
//     fontSize: 24,
//     color: "#555",
//   },
//   notificationIconContainer: {
//     position: "relative",
//   },
//   notificationIcon: {
//     width: 24,
//     height: 24,
//   },
//   notificationBadge: {
//     position: "absolute",
//     right: -5,
//     top: -5,
//     backgroundColor: "#ff0000",
//     borderRadius: 10,
//     width: 16,
//     height: 16,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badgeText: {
//     color: "#fff",
//     fontSize: 10,
//   },
//   socialFeedContainer: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   bottomMenuContainer: {
//     flexDirection: "row",
//     height: 60,
//     backgroundColor: "#fff",
//     justifyContent: "space-around",
//     alignItems: "center",
//   },
//   bottomMenuTab: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   icon: {
//     fontSize: 24,
//     color: "#000",
//   },
//   activeIcon: {
//     color: "#007aff",
//   },
//   bottomBarContainer: {
//     backgroundColor: "#ffffff",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   bottomBar: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//   },
//   iconContainer: {
//     flex: 1,
//     alignItems: "center",
//   },

//   iconText: {
//     marginTop: 4,
//   },
//   icon: {
//     marginRight: 10,
//     marginTop: 3,
//     marginLeft: 20,
//   },
// });

// export default SocialHomeScreen;