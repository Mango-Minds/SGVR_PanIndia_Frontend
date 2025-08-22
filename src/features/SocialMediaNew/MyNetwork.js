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
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import UserImg from "../../assets/images/general/user.png";
import BottomNavigation from "../../components/social/BottomNavigation";
import { useSelector } from "react-redux";

import Theme from "../../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";
import { 
  getListRequests, 
  getSentRequests, 
  updateRequestStatus, 
  cancelRequest 
} from "./SocialMediaAPIs";

const MyNetwork = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("Received");
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getListRequests();
      if (response.status === 200) {
        setRequests(response.data.requests || []);
      }
    } catch (err) {
      console.log("Error fetching requests:", err);
      Alert.alert("Error", "Failed to fetch incoming requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      setLoading(true);
      const response = await getSentRequests();
      if (response.status === 200) {
        setSentRequests(response.data.sentRequests || []);
      }
    } catch (err) {
      console.log("Error fetching sent requests:", err);
      Alert.alert("Error", "Failed to fetch sent requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedTab === "Received") {
      await fetchRequests();
    } else {
      await fetchSentRequests();
    }
    setRefreshing(false);
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      const response = await updateRequestStatus(requestId, "rejected");
      if (response.status === 200) {
        Alert.alert("Success", "Request rejected successfully.");
        fetchRequests();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      Alert.alert("Error", "Failed to reject request");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await updateRequestStatus(requestId, "approved");
      if (response.status === 200) {
        Alert.alert("Success", "Request accepted successfully.");
        fetchRequests();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept request");
    }
  };

  const handleWithdrawRequest = async (toUserId) => {
    try {
      const response = await cancelRequest(toUserId);
      if (response.status === 200) {
        Alert.alert("Success", "Your invitation to connect is withdrawn successfully");
        fetchSentRequests();
        
        // Notify the parent component or navigation to refresh follow status
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
      console.error("Error withdrawing request:", error);
      Alert.alert("Error", "Failed to withdraw request");
    }
  };

  useEffect(() => {
    if (selectedTab === "Received") {
      fetchRequests();
    } else {
      fetchSentRequests();
    }
  }, [selectedTab]);

  const renderItem = ({ item }) => {
    const isSentTab = selectedTab === "Sent";
    const user = isSentTab ? item.to : item.from;
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
          <Text style={styles.role}>{user?.role || "User"}</Text>
          <Text style={styles.timeSent}>
            {new Date(item.sentAt || item.createdAt).toLocaleString()}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          {isSentTab ? (
            <Button
              title={t("withdraw")}
              onPress={() => handleWithdrawRequest(user._id)}
              color={Theme.themeColor}
            />
          ) : (
            <View style={styles.confirmDeleteContainer}>
              <Button
                title={t("confirm")}
                onPress={() => handleAcceptRequest(item._id)}
                color={Theme.themeColor}
              />
              <View style={{ width: 10 }} />
              <Button
                title={t("delete")}
                onPress={() => handleDeleteRequest(item._id)}
                color="gray"
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>
        {selectedTab === "Received" 
          ? "No incoming connection requests" 
          : "No sent connection requests"}
      </Text>
    </View>
  );

  const data = selectedTab === "Sent" ? sentRequests : requests;

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow, Search Bar, and Settings Icon */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setSelectedTab("Received")}>
            <Text
              style={[
                styles.tab,
                selectedTab === "Received" && styles.activeTab,
              ]}
            >
              {t("received")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab("Sent")}>
            <Text
              style={[styles.tab, selectedTab === "Sent" && styles.activeTab]}
            >
              {t("sent")}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Icon name="settings" size={24} color="#000" />
        </TouchableOpacity>
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
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 30,
  },
  flatListcontainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
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
    backgroundColor: "#f8f8f8",
  },
  iconButton: {
    padding: 8,
  },
  confirmDeleteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "80%",
    marginHorizontal: 5,
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
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
  },
});

export default MyNetwork;
