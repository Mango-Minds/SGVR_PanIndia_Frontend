import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateNotification, updateSocialData, updateTemple } from "../user";

export const UpdateSocialData = (data) => async (dispatch) => {
  await AsyncStorage.setItem("socialdata", JSON.stringify(data));
  await dispatch(updateSocialData(data));
};

export const GetSocialData = () => async (dispatch) => {
  const data = await AsyncStorage.getItem("socialdata");
  if (data) {
    await dispatch(updateSocialData(JSON.parse(data)));
  }
};

export const UpdateNotification = (data) => async (dispatch) => {
  await AsyncStorage.setItem("notifications", JSON.stringify(data));
  await dispatch(updateNotification(data));
};

export const GetNotification = () => async (dispatch) => {
  const data = await AsyncStorage.getItem("notifications");
  if (data) {
    await dispatch(updateNotification(JSON.parse(data)));
  }
};

export const InitiateLogout = () => async (dispatch) => {
  await AsyncStorage.removeItem("notifications");
  await AsyncStorage.removeItem("socialdata");
};

export const UpdateTemple = (data) => async (dispatch) => {
  await AsyncStorage.setItem("temple", JSON.stringify(data));
  if (data) {
    await dispatch(updateTemple(data));
  }
};
