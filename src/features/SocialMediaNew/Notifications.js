import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Theme from "../../styles/theme";
import { SearchField } from "../../styles/common.styles";
import { useSelector } from "react-redux";
import { BASEAPIURL } from "../../infrastructure/constants";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";

const NotificationsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("All");
  const token = useSelector((state) => state.user.token);
  const [notifications, setNotifications] = useState(null);

  // const fetchNotifications = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("token");

  //     const response = await apiClient.get(`${BASEAPIURL}/notifications/`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     console.log("notification data", response.data);
  //     setNotifications(response.data.notifications);
  //   } catch (error) {
  //     console.error("Failed to fetch notifications:", error);
  //     setError("Unable to fetch notifications. Please try again later.");
  //   }
  // };
  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const selectedLanguage =
        (await AsyncStorage.getItem("user-language")) || "en";

      const response = await apiClient.get(`${BASEAPIURL}/notifications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
      const notificationsData = response.data.notifications;
      console.log("notificationsData: ",notificationsData);
      

     // If language is not English, translate the posts
      if (selectedLanguage !== "en" && Array.isArray(notificationsData)) {
        const translationResponse = await apiClient.post("/translate", {
          data: notificationsData, // Only pass the posts
          targetLang: selectedLanguage,
        });

        if (translationResponse?.data?.translatedData?.length) {
           setNotifications(translationResponse.data.translatedData);

        } else {
           setNotifications(notificationsData);
        }
      } 
      else {
         setNotifications(notificationsData);
      }
    } else {
      throw new Error("Network response was not ok");
    }
      
    }catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Unable to fetch notifications. Please try again later.");
    }
  }

    
  

  useEffect(() => {
    fetchNotifications();
  }, []);

  // const getNotificationType = (type) => {
  //   switch (type) {
  //     case "followRequest":
  //       return "Follow Request";
  //     // Add more cases if needed for other types
  //     default:
  //       return "Unknown Notification"; // Fallback for undefined types
  //   }
  // };
  const getNotificationType = (type) => {
    switch (type) {
      case "followRequest":
        return t("follow_request");

      default:
        return t("unknown_notification");
    }
  };

  const getTimeAgo = (createdAt) => {
    return moment(createdAt).fromNow();
  };

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      {/* Replace the Image with the Ionicons icon */}
      <Icon
        name="notifications-circle"
        size={styles.profileImage.width}
        color={Theme.themeColor}
        style={styles.profileImage}
      />

      <View style={styles.notificationTextContainer}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationSource}>
            {getNotificationType(item.type)}
          </Text>
          <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
    </View>
  );

  const renderEmptyMessage = () => {
    if (activeTab === t("my_posts")) {
      return <Text style={styles.emptyMessage}>{t("no_posts_added")}</Text>;
    }
    return null;
  };
  const tabs = [t("all"), t("connects") /*, t("my_posts"), t("mentions")*/];
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
        <View style={styles.searchContainer}>
          <SearchField
            placeholder={t("search")}
            style={styles.searchField}
            onFocus={() => navigation.navigate("SearchResults")}
          />
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="settings" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.notificationContainer}>
        <View style={styles.tabsContainer}>
          {/* {['All', 'Connects',
          //  'My Posts', 'Mentions'
          ].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={activeTab === tab ? styles.tabActive : styles.tab}
            >
              <Text style={activeTab === tab ? styles.tabTextActive : styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))} */}
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={activeTab === tab ? styles.tabActive : styles.tab}
            >
              <Text
                style={
                  activeTab === tab ? styles.tabTextActive : styles.tabText
                }
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={renderEmptyMessage}
          style={styles.notificationsList}
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
    borderRadius: 0, // Removes rounded corners
  },
  searchField: {
    height: 40,
    width: "100%",
    backgroundColor: "#eeeeee",
    paddingHorizontal: 15,
    marginHorizontal: 10,
    fontSize: 16,
    borderRadius: 0, // Removes rounded corners
  },
  notificationContainer: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  time: {
    fontSize: 18,
    fontWeight: "bold",
  },
  icon: {
    marginHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  tabActive: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    // backgroundColor: '#2a8cd3',
    backgroundColor: Theme.themeColor,
  },
  tabText: {
    fontSize: 14,
    color: "#333",
  },
  tabTextActive: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  notificationsList: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 2,
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationSource: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 14,
  },
  timeAgo: {
    color: "#888",
    fontSize: 12,
  },
  notificationMessage: {
    color: "#666",
    marginTop: 3,
  },
  emptyMessage: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginVertical: 20,
  },
});

export default NotificationsScreen;
