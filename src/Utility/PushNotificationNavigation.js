import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, Alert, Linking } from "react-native";
import axios from "axios";
import authHeader from "../services/auth.header";
import { BASEAPIURL } from "../infrastructure/constants";

const EAS_PROJECT_ID =
  Constants?.easConfig?.projectId ||
  Constants?.expoConfig?.extra?.eas?.projectId ||
  "4ccd9861-35c9-4d00-95d7-d8fcece82a80";

let registrationInFlight = null;
let hasRegisteredThisSession = false;
let hasPromptedDeniedThisSession = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const openNotificationSettings = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    Linking.openSettings();
  }
};

const promptOpenSettings = () => {
  Alert.alert(
    "Enable Notifications",
    "Notifications are turned off. Open Settings and allow alerts so you can receive updates on your phone.",
    [
      { text: "Not Now", style: "cancel" },
      { text: "Open Settings", onPress: openNotificationSettings },
    ]
  );
};

export const registerForPushNotificationsAsync = async ({
  promptIfDenied = true,
} = {}) => {
  if (hasRegisteredThisSession) {
    return null;
  }
  if (registrationInFlight) {
    return registrationInFlight;
  }

  registrationInFlight = (async () => {
    try {
      if (!Device.isDevice) {
        return null;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        if (existingStatus === "denied") {
          if (promptIfDenied && !hasPromptedDeniedThisSession) {
            hasPromptedDeniedThisSession = true;
            promptOpenSettings();
          }
          return null;
        }

        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        if (promptIfDenied && !hasPromptedDeniedThisSession) {
          hasPromptedDeniedThisSession = true;
          promptOpenSettings();
        }
        return null;
      }

      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: EAS_PROJECT_ID,
      });
      const token = pushToken?.data;
      if (!token) {
        return null;
      }

      await sendPushNotificationHandler(token);
      hasRegisteredThisSession = true;
      return token;
    } catch (error) {
      return null;
    } finally {
      registrationInFlight = null;
    }
  })();

  return registrationInFlight;
};

const sendPushNotificationHandler = async (token) => {
  try {
    await axios(`${BASEAPIURL}/device-id`, {
      method: "POST",
      headers: await authHeader(),
      data: { token },
    });
  } catch (err) {
    // Token save failed; will retry on next login/session.
  }
};
