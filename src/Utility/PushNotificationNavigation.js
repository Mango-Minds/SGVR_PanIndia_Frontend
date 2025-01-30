import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import axios from "axios";
import authHeader from "../services/auth.header";
import { BASEAPIURL } from "../infrastructure/constants";

export const registerForPushNotificationsAsync = async () => {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert(
        "For notification go to settings and change the permisson to allow!"
      );
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        experienceId: "@sgvrtech/DaivajnyaBrahmin",
      })
    ).data;
    sendPushNotificationHandler(token);
  } else {
    alert("Physical Device is required for push notification!");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  return;
};

const sendPushNotificationHandler = async (token) => {
  await axios(`${BASEAPIURL}/device-id`, {
    method: "POST",
    headers: await authHeader(),
    data: { token: token },
  })
    .then((res) => {})
    .catch((err) => {});
};
