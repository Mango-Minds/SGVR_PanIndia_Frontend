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
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { SearchField } from "../../styles/common.styles";
import SearchResults from "./SearchResults";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import Theme from "../../styles/theme";
const MyNetwork = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("Sent");
  const [selectedFilter, setSelectedFilter] = useState("People");
  const token = useSelector((state) => state.user.token);
  const [requests, setRequests] = useState(null);
  const [sentRequests, setSentRequests] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/social/list-requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDeleteRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/social/update-request/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rejected",
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Request rejected successfully.");
        fetchRequests();
      } else {
        const responseText = await response.text();
        console.error(
          "Failed to reject request:",
          response.status,
          responseText
        );
        throw new Error("Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };
  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/social/update-request/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "approved",
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Request accepted successfully.");
        fetchRequests();
      } else {
        const responseText = await response.text();
        console.error(
          "Failed to accept request:",
          response.status,
          responseText
        );
        throw new Error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await fetch(`${BASEAPIURL}/social/sent-requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSentRequests(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentRequests();
  }, []);

  const handleWithdrawRequest = async (toUserId) => {
    try {
      const response = await fetch(
        `${BASEAPIURL}/social/cancel-request/${toUserId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Your invitation to connect is withdrawn successfully");
        fetchSentRequests();
      } else {
        const responseText = await response.text();
        console.error(
          "Failed to delete request:",
          response.status,
          responseText
        );
        throw new Error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const renderItem = ({ item }) => {
    const isSentTab = selectedTab === "Sent";

    const user = isSentTab ? item.to : item.from;
    const image = `${BASEIMGURL}${user.image}`;
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
              title="Withdraw"
              onPress={() => {
                const toUserId = item.to._id;

                handleWithdrawRequest(toUserId);
              }}
              color={Theme.themeColor}
            />
          ) : (
            <View style={styles.confirmDeleteContainer}>
              <Button
                title="Confirm"
                onPress={() => {
                  const requestId = item._id;

                  handleAcceptRequest(requestId);
                }}
                color={Theme.themeColor}
              />
              <View style={{ width: 10 }} />
              <Button
                title="Delete"
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
              Received
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab("Sent")}>
            <Text
              style={[styles.tab, selectedTab === "Sent" && styles.activeTab]}
            >
              Sent
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
