import React, { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import {
  View,
  ImageBackground,
  FlatList,
  Text,
  RefreshControl,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { decode } from "base-64";
import { TopText } from "../../styles/social.styles";
import Theme from "../../styles/theme";
import { Card, IconButton } from "react-native-paper";
import { TouchableOpacity, ScrollView } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Profile from "../../assets/images/B2b/profile.png";
import Icon from "react-native-vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateTemple } from "../../store/Handlers/Reducer.Handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
const ChatHome = ({ navigation }) => {
  // get userdata for apis
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const isFocused = useIsFocused();
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const user = useState(useSelector((state) => state.user.user));
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const userId = decodedPayload.id;
  const [userData, setUserData] = useState({});
  const [userRooms, setUserRooms] = useState([]);

  // const fetchUser = async () => {
  //   try {
  //     const response = await fetch(`${BASEAPIURL}/user/${userId}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();

  //       setUserData(data);
  //     } else {
  //       throw new Error("Failed to fetch user");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user:", error);
  //   } finally {
  //   }
  // };

  // const fetchUserRooms = async () => {
  //   try {
  //     setLoadingAnimation(true);
  //     const response = await fetch(`${BASEAPIURL}/chat/rooms/`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       setUserRooms(data);
  //     } else {
  //       throw new Error("Failed to fetch rooms");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching room:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
  
      const response = await apiClient.get(`/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setUserData(response.data);
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      Alert.alert("Error", "Unable to fetch user data.");
    }
  };
  
  const fetchUserRooms = async () => {
    try {
      setLoadingAnimation(true);
      const token = await AsyncStorage.getItem("token");
  
      const response = await apiClient.get("/chat/rooms/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setUserRooms(response.data);
      } else {
        throw new Error("Failed to fetch rooms");
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      Alert.alert("Error", "Unable to fetch chat rooms.");
    } finally {
      setLoadingAnimation(false);
    }
  };
  useEffect(() => {
    if (isFocused) {
      fetchUser();
      fetchUserRooms();
    }
  }, [isFocused]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e);
  };

  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Chats</Text>
        </View>

        <View style={styles.headerRight}>
          {/* <IconButton icon="plus" style={{ marginRight: 10 }} /> */}
          <Icon
            name="search"
            size={24}
            style={styles.searchIcon}
            onPress={toggleSearch}
          />
          {/* <TouchableOpacity onPress={() => navigation.navigate("MyProfile")}>
            <Image source={Profile} style={styles.profileImage} />
          </TouchableOpacity> */}
        </View>
      </View>

      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <SearchField placeholder="Search" onChangeText={handleSearch} />
        </View>
      )}

      {loadingAnimation ? (
        <ActivityIndicator
          style={styles.loadingIndicator}
          size={"large"}
          color={"#b98c13"}
        />
      ) : (
        <View style={styles.container}>
          {userRooms?.rooms?.map((room) => (
            <TouchableOpacity
              key={room.roomId}
              onPress={() =>
                navigation.navigate("ChatScreenNew", {
                  user_auth_token: token,
                  room: room,
                  participant_name: room.groupName
                    ? room.groupName
                    : room?.participants?.[0]
                    ? `${room.participants[0].firstName} ${room.participants[0].lastName}`
                    : 'Chat',
                })
              }
            >
              <View style={styles.chatContainer}>
                <Image
                  source={Profile}
                  style={styles.avatar}
                />
                <View style={styles.chatInfo}>
                  <Text style={styles.participantName}>
                    {room.groupName
                      ? room.groupName
                      : room?.participants?.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                  </Text>
                  <Text style={styles.lastMessage}>Last message preview...</Text>
                </View>
                <Text style={styles.timestamp}>2:45 PM</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default ChatHome;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom:10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: Theme.themeColor,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 15,
    color: "grey",
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  searchContainer: {
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  chatContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  lastMessage: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
});