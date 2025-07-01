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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import UserImg from "../../assets/images/general/user.png";
import BottomNavigation from "../../components/social/BottomNavigation";
import { useSelector } from "react-redux";

import Theme from "../../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";

const MyNetwork = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("Sent");
  const [selectedFilter, setSelectedFilter] = useState("People");
  const token = useSelector((state) => state.user.token);
  const [requests, setRequests] = useState(null);
  const [sentRequests, setSentRequests] = useState(null);
  const [loading, setLoading] = useState(true);

  

  const fetchRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await apiClient.get("/social/list-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setRequests(response.data);
    } catch (err) {
      console.log("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const handleDeleteRequest = async (requestId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await apiClient.patch(
        `/social/update-request/${requestId}`,
        { status: "rejected" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      Alert.alert("Request rejected successfully.");
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };
  
  const handleAcceptRequest = async (requestId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await apiClient.patch(
        `/social/update-request/${requestId}`,
        { status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      Alert.alert("Request accepted successfully.");
      fetchRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  
  const fetchSentRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await apiClient.get("/social/sent-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setSentRequests(response.data);
    } catch (err) {
      console.log("Error fetching sent requests:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSentRequests();
  }, []);
  
  const handleWithdrawRequest = async (toUserId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await apiClient.delete(`/social/cancel-request/${toUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      Alert.alert("Your invitation to connect is withdrawn successfully");
      fetchSentRequests();
    } catch (error) {
      console.error("Error withdrawing request:", error);
    }
  };
  const renderItem = ({ item }) => {
    const isSentTab = selectedTab === "Sent";

    const user = isSentTab ? item.to : item.from;
    const image = `${user.image}`;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={user.image ? { uri: image } : UserImg }
            style={styles.profileImage}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.role}>{user.role || "Software Engineer"}</Text>
          <Text style={styles.timeSent}>
            {new Date(item.sentAt).toLocaleString()}{" "}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          {isSentTab ? (
            <Button
              title={t("withdraw")}
              onPress={() => {
                const toUserId = item.to._id;

                handleWithdrawRequest(toUserId);
              }}
              color={Theme.themeColor}
            />
          ) : (
            <View style={styles.confirmDeleteContainer}>
              <Button
                title={t("confirm")}
                onPress={() => {
                  const requestId = item._id;

                  handleAcceptRequest(requestId);
                }}
                color={Theme.themeColor}
              />
              <View style={{ width: 10 }} />
              <Button
               title={t("delete")}
                onPress={() => {
                  const requestId = item._id;

                  handleDeleteRequest(requestId);
                }}
                color="gray"
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const data =
    selectedTab === "Sent"
      ? sentRequests?.sentRequests
      : requests?.requests || [];
  return (
    <View style={styles.container}>
      {/* Header with Back Arrow, Search Bar, and Settings Icon */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon
            name="arrow-back"
            size={24}
            color="#000"
            onPress={() => navigation.goBack()}
          />
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
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
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
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    top: 10,
  },
  filterButton: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 15,
    color: "#333",
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  activeFilter: {
    backgroundColor: Theme.themeColor,
    color: "#fff",
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
    righ: 10,
  },
  profileContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    right: 10,
  },
  textContainer: {
    flex: 1,
    right: 15,
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
    left: 8,
  },
  deleteButton: {
    backgroundColor: "#D3D3D3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MyNetwork;
