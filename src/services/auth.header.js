import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function authHeader() {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  } else {
    return {
      "Content-Type": "application/json",
    };
  }
}
