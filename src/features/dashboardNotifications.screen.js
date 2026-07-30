import React from "react";
import {
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { IconButton } from "react-native-paper";

import { Container, RowBetween, View } from "../styles/common.styles";
import { TopText } from "../styles/social.styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import Theme from "../styles/theme";
import { cloneDeep } from "lodash";
import { UpdateNotification } from "../store/Handlers/Reducer.Handler";
import { readNotification } from "../services/notification.services";
import { ScrollView } from "react-native-gesture-handler";
import DashboardBottomNavigation from "../components/dashboard/DashboardBottomNavigation";
// import LikeCard from './LikeCard';

export default function DashboardNotificationScreen({ navigation, route }) {
  // const { notification } = useSelector((state) => state.user);
  // const queryclient = useQueryClient();
  // const dispatch = useDispatch();

  const { token, notification } = useSelector((state) => state.user);
  const paramNotifications = route.params?.notifications;
  const notifications = Array.isArray(paramNotifications)
    ? paramNotifications
    : Array.isArray(notification?.homescreen)
      ? notification.homescreen
      : [];

  const [refreshing, setRefreshing] = React.useState(false);

  // const getNotification = async () => {
  //   setRefreshing(true);
  //   queryclient.invalidateQueries("homeScreenNotification");
  //   setRefreshing(false);
  // };

  // React.useEffect(() => {
  //   readNotification("central");
  //   let newNotification = [];

  //   for (let i = 0; i < notification.homescreen.length; i++) {
  //     const item = notification.homescreen[i];
  //     if (item.isRead === false) {
  //       const newItem = { ...item, isRead: true };
  //       newNotification.push(newItem);
  //     } else {
  //       newNotification.push(item);
  //     }
  //   }

  //   dispatch(
  //     UpdateNotification({ ...notification, homescreen: newNotification })
  //   );
  // }, []);

  return (
    <Container style={styles.container}>
      <RowBetween style={styles.headerRow}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <TopText style={styles.headerText}>Notifications</TopText>
        </View>
      </RowBetween>

      {notifications.length > 0 ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {notifications
            .slice()
            .reverse()
            .map((item, index) => {
              const formattedTimestamp = new Date(
                item.timestamp
              ).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              });

              return (
                <TouchableOpacity
                key={index}
                onPress={() => {
                  // Log the entire item to see if it's defined at the time of click
                  console.log("Clicked item:", item);
              
                  if (item && item.roomId && token) {
                    // Log roomId and token to verify
                    console.log("Navigating to ChatScreenNew with roomId:", item.roomId);
                    console.log("Token:", token);
              
                    navigation.navigate("ChatScreenNew", {
                      user_auth_token: token,
                      room: item,
                      participant_name: item.sender.firstName+" "+item.sender.lastName
                    });
                  } else {
                    // Warn if roomId or token is missing
                    console.warn("Missing token or roomId", item);
                  }
                }}
              >
                  <View style={styles.notificationContainer}>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.messageBody}>{item.messageBody}</Text>
                    <Text style={styles.timestamp}>{formattedTimestamp}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      ) : (
        <View style={styles.noNotificationsContainer}>
          <Ionicons
            name="notifications"
            size={90}
            color="black"
            style={styles.noNotificationsIcon}
          />
          <Text style={styles.noNotificationsText}>No Notifications</Text>
        </View>
      )}
      <DashboardBottomNavigation
        navigation={navigation}
        currentScreen="alerts"
      />
    </Container>
  );
}
const styles = StyleSheet.create({
  container: {
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: "#FAFAFA",
    flex: 1,
  },
  headerRow: {
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "bold",
  },
  notificationContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Theme.themeColor,
    display: "flex",
    flexDirection: "column",
  },
  senderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 5,
  },
  messageBody: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: Theme.themeColor,
    textAlign: "right",
  },
  noNotificationsContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  noNotificationsIcon: {
    opacity: 0.2,
  },
  noNotificationsText: {
    fontSize: 18,
    opacity: 0.2,
    fontWeight: "bold",
    marginTop: 10,
  },
});
