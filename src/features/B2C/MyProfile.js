import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  ImageBackground,
} from "react-native";
import Theme from "../../styles/theme";
import { TopText } from "../../styles/social.styles";
import { RowBetween } from "../../styles/common.styles";
import { IconButton } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Divider } from "react-native-paper";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { BASEAPIURL } from "../../infrastructure/constants";
import { BASEIMGURL } from "../../infrastructure/constants";
import { styles } from "../../features/jewellery/JewelleryMainScreen";
import { decode } from "base-64";
import ActivityIndicator from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import UserImg from "../../assets/images/general/user.png";
import BottomNavigation from "./BottomNavigation";

const MyB2CProfile = ({ route }) => {
  const navigation = useNavigation();

  const isFocused = useIsFocused();

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  const user = useState(useSelector((state) => state.user.user));
  console.log("User: ", user);

  const userId = decodedPayload.id;

  const [userData, setUserData] = useState({});

  const fetchUser = async () => {
    try {
      setLoadingAnimation(true);
      const response = await fetch(`${BASEAPIURL}/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setUserData(data);
        console.log("data.user", data.user);
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoadingAnimation(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUser();
    }
  }, [isFocused]);

  const [loadingAnimation, setLoadingAnimation] = useState(true);

  return (
    <>
      <View style={styles.container}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            paddingVertical: 25,
          }}
        >
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{
              color: Theme.themeColor,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            My Profile
          </TopText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        ></View>
      </View>
      {userData && userData.user && (
        <View
          style={{
            paddingHorizontal: 20,
            flex: 1,
          }}
        >
          <ImageBackground
            source={
              userData.user.image
                ? {
                    uri: `${userData.user.image}`,
                  }
                : UserImg
            }
           
            style={style.backgroundImage}
            resizeMode="contain"
          ></ImageBackground>

          <View style={style.contactDetails}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: Theme.themeColor,
                bottom: 30,
              }}
            >
              Owner Details
            </Text>
          </View>

          <View style={style.nameDetails}>
            <MaterialIcon name="people" size={18} color={Theme.themeColor} />
            <Text style={style.contact}>
              {userData.user.firstName} {userData.user.lastName}
            </Text>
          </View>

          <View style={style.contactDetails}>
            <MaterialIcon name="email" size={18} color={Theme.themeColor} />
            <Text style={style.contact}>{userData.user.email}</Text>
          </View>

          <View style={style.phoneDetails}>
            <MaterialIcon name="phone" size={18} color={Theme.themeColor} />
            <Text style={style.contact}>{userData.user.phone}</Text>
          </View>

          <View style={style.phoneDetails}>
            <MaterialIcon
              name="location-on"
              size={18}
              color={Theme.themeColor}
            />
            <Text style={style.contact}>{userData.user.address}</Text>
          </View>

          <View style={style.contactButtonDetails}>
            <TouchableOpacity
              style={style.EditButton}
              onPress={() =>
                navigation.navigate("EditProfile", {
                  userData,
                  fetchUser,
                  userId,
                  user,
                })
              }
            >
              <Text style={style.EditButtonText}>Edit My Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Divider />
    </>
  );
};

export default MyB2CProfile;

const style = StyleSheet.create({
  ProfileHeading: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 15,
    color: "#141414",
    letterSpacing: 0.3,
  },
  ImageStyle: {
    width: "100%",
    height: 250,
    borderRadius: 20,
    marginTop: 20,
  },
  Aboutus: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
    color: "#141414",
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 5,
    marginBottom: 5,
    color: "#7E7E7E",
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  ownerdetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
  },
  ownerhead: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 20,
    marginBottom: 5,
    color: Theme.themeColor,
  },
  ownerName: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 20,
    color: Theme.themeColor,
    textAlign: "center",
  },
  whiteContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  contactDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 35,
  },
  phoneDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
  },
  contactButtonDetails: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
  },
  contact: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1C1C1C",
    marginLeft: 10,
    lineHeight: 20,
  },
  nameDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 0,
    marginBottom: -30,
  },
  EditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4AF3733",
    borderRadius: 10,
    width: "100%",
    padding: "3%",
    marginVertical: 10,
  },
  EditButtonText: {
    color: Theme.themeColor,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: 350,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profileContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    position: "absolute",
    bottom: -50,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "white",
    borderWidth: 3,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  whiteContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    bottom: -50,
  },
  loginText: {
    color: "black",
    bottom: -50,
    position: "relative",
    fontSize: 20,
    fontWeight: "500",

    color: Theme.themeColor,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "lightgrey",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  loginButtonText: {
    fontSize: 16,
    color: "black",
  },
});
