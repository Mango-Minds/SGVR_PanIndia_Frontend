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
import BannerImg from "../../assets/images/general/golden_banner.png";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import ProfileHeader from "../Temple/Header";
import Theme from "../../styles/theme";

const MyB2CProfile = ({ route }) => {
  const navigation = useNavigation();

  const isFocused = useIsFocused();

  const token = useSelector((state) => state.user.token);

  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  console.log("decoded payload", decodedPayload);

  const user = useState(useSelector((state) => state.user.user));
  console.log("userrr", user);
  const userId = useSelector(
    (state) =>
      state.user.user &&
      state.user.user.roleData &&
      state.user.user.roleData.owner
  );
  console.log("userId: ",userId);

  console.log("userid: ", user[0]._id);
 const user2 = useSelector((state) => state.user.user);
  console.log("User 2: ", user2);
  console.log("user?.roleData?.owner:", user2?.roleData?.owner);
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
          console.log("userdata", data);
        } else {
          throw new Error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoadingAnimation(false); // End loading
      }
    };

    console.log("User data: ", userData);

  return (
    <>
      <View style={styles.container}>
        <View style={{ alignItems: "center", flexDirection: "row", paddingVertical: 25}}>
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
      
      {user && (
        <View
          style={{
            paddingHorizontal: 20,
            flex: 1,
            
          }}
        >
          <ImageBackground
            source={
              user.image
                ? {
                    uri: `${BASEIMGURL}${user[0].image}`,
                  }
                : UserImg
            }
            style={style.backgroundImage}
          ></ImageBackground>
          <View style={style.whiteContainer}>
            <Text style={style.loginText}></Text>
          </View>

          <Divider />
          <View style={style.contactDetails}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: Theme.themeColor,
              }}
            >
              Owner Details :
            </Text>
            <Text style={style.contact}>
              {user[0].firstName} {user[0].lastName}
            </Text>
          </View>
          <View style={style.contactDetails}>
            <MaterialIcon name="email" size={18} color={Theme.themeColor} />
            <Text style={style.contact}>{user[0].email}</Text>
          </View>
          <View style={style.contactDetails}>
            <MaterialIcon name="phone" size={18} color={Theme.themeColor} />
            <Text style={style.contact}>{user[0].phone}</Text>
          </View>
          <View style={style.contactDetails}>
            <MaterialIcon
              name="location-on"
              size={18}
              color={Theme.themeColor}
            />
            <Text style={style.contact}>{user[0].address}</Text>
          </View>

          <View style={style.contactDetails}>
            <TouchableOpacity
              style={style.EditButton}
              onPress={() =>
                navigation.navigate("EditJewelleryUserRegisterScreen", {
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

          <Divider />
        </View>
      )}
    </>
  );
};

export default MyB2CProfile;

const style = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
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
    marginTop: 15,
  },
  contact: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1C1C1C",
    marginLeft: 10,
    lineHeight: 20,
  },
  EditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.themeBackgroundColor,
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
    height: 250,
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
  },
  loginText: {
    fontSize: 16,
    color: "black",
    bottom: -50,
    position: "relative",
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
