import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import { decode } from "base-64";
import Icon from "react-native-vector-icons/Ionicons";
import UserImg from "../../assets/images/general/user.png";
import BottomNavigation from "../../components/social/BottomNavigation";
import { useSelector } from "react-redux";

import Theme from "../../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";
import { Container } from "../../styles/common.styles";
import { 
  getFriendRequests, 
  getSentFriendRequests, 
  updateFriendRequestStatus, 
  cancelFriendRequest,
  getUserFriends,
  removeFriend,
  getNonFriends,
  sendFriendRequest
} from "./SocialMediaAPIs";
import { GetAllFriends } from "../../services/socialMedia.services";

const MyNetwork = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("Friends");
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [nonFriends, setNonFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getFriendRequests();
      if (response.status === 200) {
        setRequests(response.data.requests || []);
      }
    } catch (err) {
      console.log("Error fetching friend requests:", err);
      Alert.alert("Error", "Failed to fetch incoming friend requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      setLoading(true);
      const response = await getSentFriendRequests();
      if (response.status === 200) {
        setSentRequests(response.data.sentRequests || []);
      }
    } catch (err) {
      console.log("Error fetching sent friend requests:", err);
      Alert.alert("Error", "Failed to fetch sent friend requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchNonFriends = async () => {
    try {
      setLoading(true);
      const response = await getNonFriends();
      if (response.status === 200) {
        setNonFriends(response.data.nonFriends || []);
      }
    } catch (err) {
      console.log("Error fetching non-friends:", err);
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchSentRequests()]);
    } catch (err) {
      console.log("Error fetching all requests:", err);
      Alert.alert("Error", "Failed to fetch friend requests");
    } finally {
      setLoading(false);
    }
  };

    const fetchFriends = async () => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem("token");
      const tokenPayload = token.split(".")[1];
      const decodedPayload = JSON.parse(decode(tokenPayload));
      const userId = decodedPayload.id;
      setCurrentUserId(userId);
      
      console.log("Fetching friends for userId:", userId);
      
      let friendsData = [];
      
      // Try the new endpoint first
      try {
        const response = await GetAllFriends({ userid: userId });
        console.log("GetAllFriends API response:", response);
        
        if (response && response.success) {
          if (response.data && Array.isArray(response.data)) {
            friendsData = response.data;
          } else if (response.friends && Array.isArray(response.friends)) {
            friendsData = response.friends;
          } else if (response.data && response.data.friends && Array.isArray(response.data.friends)) {
            friendsData = response.data.friends;
          }
          
          console.log("Processed friends data from GetAllFriends:", friendsData);
          if (friendsData.length > 0) {
            setFriends(friendsData);
            return;
          }
        }
      } catch (getAllFriendsError) {
        console.log("GetAllFriends failed, trying getUserFriends:", getAllFriendsError);
      }
      
      // Fallback to the original endpoint
      try {
        const response = await getUserFriends(userId);
        console.log("Friends API response:", response);
        console.log("Friends data:", response.data);
        
        if (response.status === 200) {
          if (response.data.friends) {
            friendsData = response.data.friends;
          } else if (response.data.users) {
            friendsData = response.data.users;
          } else if (Array.isArray(response.data)) {
            friendsData = response.data;
          }
          
          console.log("Processed friends data from getUserFriends:", friendsData);
          if (friendsData.length > 0) {
            setFriends(friendsData);
            return;
          }
        }
      } catch (getUserFriendsError) {
        console.log("getUserFriends failed:", getUserFriendsError);
      }
      
      // If both APIs fail, set empty friends list
      console.log("Both APIs failed, setting empty friends list...");
      setFriends([]);
      
    } catch (err) {
      console.log("Error fetching friends:", err);
      Alert.alert("Error", "Failed to fetch friends list");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const response = await removeFriend(friendId);
      if (response.status === 200) {
        Alert.alert("Success", "Friend removed successfully.");
        fetchFriends();
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Failed to remove friend");
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      const response = await sendFriendRequest(userId);
      if (response.status === 200) {
        Alert.alert("Success", "Friend request sent successfully.");
        fetchNonFriends(); // Refresh the list
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", "Failed to send friend request");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    if (selectedTab === "Requests") {
      await fetchAllRequests();
    } else if (selectedTab === "Friends") {
      await fetchFriends();
    } else if (selectedTab === "Add Friend") {
      await fetchNonFriends();
    }
    setRefreshing(false);
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      const response = await updateFriendRequestStatus(requestId, "rejected");
      if (response.status === 200) {
        Alert.alert("Success", "Friend request rejected successfully.");
        fetchAllRequests(); // Refresh both received and sent requests
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      Alert.alert("Error", "Failed to reject friend request");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await updateFriendRequestStatus(requestId, "approved");
      if (response.status === 200) {
        Alert.alert("Success", "Friend request accepted successfully.");
        fetchAllRequests(); // Refresh both received and sent requests
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Alert.alert("Error", "Failed to accept friend request");
    }
  };

  const handleWithdrawRequest = async (toUserId) => {
    try {
      const response = await cancelFriendRequest(toUserId);
      if (response.status === 200) {
        Alert.alert("Success", "Your friend request is withdrawn successfully");
        fetchAllRequests(); // Refresh all requests to update the combined view
        
        // Notify the parent component or navigation to refresh friend status
        // This will help update the profile screen if it's open
        if (navigation.getState) {
          const currentRoute = navigation.getState().routes[navigation.getState().index];
          if (currentRoute.name === "EachProfile") {
            // Trigger a refresh of the profile screen
            navigation.setParams({ refresh: Date.now() });
          }
        }
      }
    } catch (error) {
      console.error("Error withdrawing friend request:", error);
      Alert.alert("Error", "Failed to withdraw friend request");
    }
  };

  useEffect(() => {
    if (selectedTab === "Requests") {
      fetchAllRequests();
    } else if (selectedTab === "Friends") {
      fetchFriends();
    } else if (selectedTab === "Add Friend") {
      fetchNonFriends();
    }
  }, [selectedTab]);

  // Initial load - fetch friends by default
  useEffect(() => {
    fetchFriends();
  }, []);

  const renderFriendsItem = ({ item }) => {
    console.log("FRIENDS RENDER ITEM CALLED:", item.firstName, item.lastName);
    
    // Simple test component with hardcoded text
    return (
      <View style={{
        backgroundColor: 'white',
        padding: 15,
        margin: 10,
        marginHorizontal: 2,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#f0f0f0',
          marginRight: 15,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 20 }}>👤</Text>
        </View>
        <TouchableOpacity 
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("EachProfile", { 
            userId: item._id,
            userName: `${item.firstName} ${item.lastName}`
          })}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 5
          }}>
            {item.firstName} {item.lastName}
          </Text>
        </TouchableOpacity>
        <View style={{
          flexDirection: 'row',
          gap: 10
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: Theme.themeColor,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => navigation.navigate("ChatScreen", { 
              toid: item._id,
              toName: `${item.firstName} ${item.lastName}`
            })}
          >
            <Icon name="chatbubble-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: 'red',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => {
              Alert.alert(
                t("removeFriend"),
                t("removeFriendConfirmation", { name: `${item.firstName} ${item.lastName}` }),
                [
                  {
                    text: t("cancel"),
                    style: "cancel"
                  },
                  {
                    text: t("remove"),
                    style: "destructive",
                    onPress: () => handleRemoveFriend(item._id)
                  }
                ]
              );
            }}
          >
            <Icon name="person-remove-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNonFriendsItem = ({ item }) => {
    return (
      <View style={{
        backgroundColor: 'white',
        padding: 15,
        margin: 10,
        marginHorizontal: 2,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#f0f0f0',
          marginRight: 15,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 20 }}>👤</Text>
        </View>
        <TouchableOpacity 
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("EachProfile", { 
            userId: item._id,
            userName: `${item.firstName} ${item.lastName}`
          })}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 5
          }}>
            {item.firstName} {item.lastName}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: Theme.themeColor,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => handleSendFriendRequest(item._id)}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>{t("Add Friend")}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRequestsItem = ({ item }) => {
    const isSentRequest = item.to; // If item has 'to' property, it's a sent request
    const user = isSentRequest ? item.to : item.from;
    const image = user?.image;
    
    return (
      <View style={styles.itemContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={image ? { uri: image } : UserImg}
            style={styles.profileImage}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.timeSent}>
            {new Date(item.sentAt || item.createdAt).toLocaleString()}
          </Text>
          <Text style={[styles.requestType, { color: isSentRequest ? '#ff9500' : '#007AFF' }]}>
            {isSentRequest ? t("sent") : t("received")}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          {isSentRequest ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.withdrawButton]}
              onPress={() => handleWithdrawRequest(user._id)}
            >
              <Text style={styles.actionButtonText}>{t("withdraw")}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.confirmDeleteContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAcceptRequest(item._id)}
              >
                <Text style={styles.actionButtonText}>{t("accept")}</Text>
              </TouchableOpacity>
              <View style={{ width: 10 }} />
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleDeleteRequest(item._id)}
              >
                <Text style={[styles.actionButtonText, styles.rejectButtonText]}>{t("reject")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    console.log("Rendering empty state for tab:", selectedTab);
    return (
      <View style={styles.emptyContainer}>
        <Icon name="people-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>
          {selectedTab === "Requests" 
            ? t("noFriendRequests")
            : selectedTab === "Add Friend"
            ? t("noUsersToAdd")
            : t("noFriendsFound")}
        </Text>
      </View>
    );
  };

  const getData = () => {
    let data;
    if (selectedTab === "Requests") {
      // Combine received and sent requests
      const receivedWithType = requests.map(req => ({ ...req, type: 'received' }));
      const sentWithType = sentRequests.map(req => ({ ...req, type: 'sent' }));
      data = [...receivedWithType, ...sentWithType];
    } else if (selectedTab === "Friends") {
      data = friends;
      console.log("Friends tab selected, friends data:", friends);
      console.log("Friends array length:", friends.length);
    } else if (selectedTab === "Add Friend") {
      data = nonFriends;
      console.log("Add Friend tab selected, non-friends data:", nonFriends);
      console.log("Non-friends array length:", nonFriends.length);
    }
    
    console.log("getData for tab:", selectedTab, "Data length:", data ? data.length : 0);
    return data;
  };

  return (
    <Container style={{ backgroundColor: "white", paddingBottom: 0 }}>
      {/* Header with Back Arrow and Tabs */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setSelectedTab("Friends")}>
            <Text
              style={[styles.tab, selectedTab === "Friends" && styles.activeTab]}
            >
              {t("friends")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab("Add Friend")}>
            <Text
              style={[styles.tab, selectedTab === "Add Friend" && styles.activeTab]}
            >
              {t("addFriendTab")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab("Requests")}>
            <Text
              style={[
                styles.tab,
                selectedTab === "Requests" && styles.activeTab,
              ]}
            >
              {t("requests")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.flatListcontainer}>
        {loading ? (
          <ActivityIndicator 
            size="large" 
            color={Theme.themeColor} 
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={getData()}
            renderItem={
              selectedTab === "Friends" 
                ? renderFriendsItem 
                : selectedTab === "Add Friend"
                ? renderNonFriendsItem
                : renderRequestsItem
            }
            keyExtractor={(item) => `${item._id}-${selectedTab}-${item.type || 'default'}`}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            key={`${selectedTab}-${Date.now()}-${Math.random()}`} // Force complete re-render when tab changes
            onLayout={() => console.log("FlatList layout changed for tab:", selectedTab)}
            onContentSizeChange={() => console.log("FlatList content size changed for tab:", selectedTab)}
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </View>
      <BottomNavigation navigation={navigation} currentScreen="myNetwork" />
    </Container>
  );
};

const styles = StyleSheet.create({
  flatListcontainer: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
    marginRight: 20,
  },
  confirmDeleteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
    borderRadius: 10,
    padding: 2,
  },
  tab: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    color: "#333",
  },
  activeTab: {
    color: "#fff",
    backgroundColor: Theme.themeColor,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  role: {
    fontSize: 14,
    color: "#666",
  },
  timeSent: {
    fontSize: 12,
    color: "#888",
  },
  requestType: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  acceptButton: {
    backgroundColor: Theme.themeColor,
  },
  withdrawButton: {
    backgroundColor: '#ff9500',
  },
  rejectButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rejectButtonText: {
    color: 'white',
  },
});

export default MyNetwork;
