import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  ImageBackground,
  SafeAreaView,
  ScrollView,
} from "react-native";
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
//import ProfileHeader from "../../components/Jewellery/Header";
import ProfileHeader from "./ProfileHeader";
import Theme from "../../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { fetchMatrimonyUserProfile } from "./matrimonyAPIs";
const MyMatrimonyProfile = ({ route }) => {
  const [userDetails, setUserDetails] = useState({});
  const [userRoleData, setUserRoleData] = useState({});

  const navigation = useNavigation();
  const userType = useSelector((state) => state.user.user.userType);

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  const user = useState(useSelector((state) => state.user.user));

  const userId = decodedPayload.id;

  const [userData, setUserData] = useState({});
//correct
  // const fetchUser = async () => {
  //   try {
  //     setLoadingAnimation(true);
  //     const response = await fetch(`${BASEAPIURL}/user/${userId}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();

  //       setUserData(data);
  //       setUserDetails(data.user.roleData);
  //       console.log("user matrimony data", data)
  //     } else {
  //       throw new Error("Failed to fetch user");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };
  // const fetchUser = async () => {
  //   const token = await AsyncStorage.getItem("token");
  
  //   try {
  //     setLoadingAnimation(true);
  
  //     const response = await apiClient.get(`${BASEAPIURL}/user/${userId}`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  
  //     const data = response.data;
  
  //     setUserData(data);
  //     setUserDetails(data.user.roleData);
  //     console.log("user matrimony data", data);
  //   } catch (error) {
  //     console.error("Error fetching user:", error);
  //   } finally {
  //     setLoadingAnimation(false);
  //   }
  // };
  const fetchUser = async () => {
    try {
      setLoadingAnimation(true);
  
      const data = await fetchMatrimonyUserProfile(userId);
  
      setUserData(data);
      setUserDetails(data.user.roleData);
      console.log("user matrimony data", data);
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

  console.log("User details: ", userDetails);

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <ProfileHeader title="My Profile" />
        <ScrollView>
          {userData && userData.user && (
            <View
              style={{
                paddingHorizontal: 20,
                flex: 1,
              }}
            >
              <ImageBackground
                source={
                  userDetails?.images
                    ? {
                        uri: `${userDetails.images[0]}`,
                      }
                    : UserImg
                }
                style={style.backgroundImage}
              >
                <View style={style.profileContainer}>
                  <Image
                    source={
                      userData.user.image
                        ? {
                            uri: `${userData.user.image}`,
                          }
                        : UserImg
                    }
                    style={style.profileImage}
                  />
                </View>
              </ImageBackground>
              {/* {userData && userData.user && (
            <View
              style={{
                paddingHorizontal: 20,
                flex: 1,
              }}
            >
              <ImageBackground
                source={
                  userDetails?.images
                    ? {
                        uri: `${BASEIMGURL}${userDetails.images}`,
                      }
                    : UserImg
                }
                style={style.backgroundImage}
              >
                
                {[
                  "decorator",
                  "planner",
                  "caterer",
                  "venue",
                  "matrimonyVendor",
                ].includes(userData.user.type) && (
                  <View style={style.profileContainer}>
                    <Image
                      source={
                        userData.user.image
                          ? {
                              uri: `${BASEIMGURL}${userData.user.image}`,
                            }
                          : UserImg
                      }
                      style={style.profileImage}
                    />
                  </View>
                )}
              </ImageBackground>

              
              {["matrimonyMan", "matrimonyWoman"].includes(userData.user.type) && (
                <ImageBackground
                  source={
                    userData.user.image
                      ? {
                          uri: `${BASEIMGURL}${userData.user.image}`,
                        }
                      : UserImg
                  }
                  style={style.backgroundImage}
                />
              )} */}

              <View style={style.contactDetails}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: Theme.themeColor,
                    bottom: -30,
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
                <MaterialIcon name="location-on" size={18} color={Theme.themeColor} />
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
                {(userType === "matrimonyWoman" ||
                  userType === "matrimonyMan") && (
                  <TouchableOpacity
                    style={style.EditButton}
                    onPress={() =>
                      navigation.navigate("MatrimonyProfileNew", {
                        matrimonyData: userDetails,
                      })
                    }
                  >
                    <Text style={style.EditButtonText}>
                      View Your Matrimony Profile
                    </Text>
                  </TouchableOpacity>
                )}
                {(userType === "matrimonyWoman" ||
                  userType === "matrimonyMan") && (
                  <TouchableOpacity
                    style={style.EditButton}
                    onPress={() => {
                      navigation.navigate("MyMatrimonyProfileEdit", {
                        user_details: userDetails,
                      });
                    }}
                  >
                    <Text style={style.EditButtonText}>
                      Edit Your Matrimony Profile
                    </Text>
                  </TouchableOpacity>
                )}
                {[
                  "matrimonyVendor",
                  "decorator",
                  "caterer",
                  "planner",
                  "venue",
                ].includes(userType) && (
                  <TouchableOpacity
                    style={style.EditButton}
                    onPress={() => {
                      navigation.navigate("MatrimonyShopProfile", userDetails);
                    }}
                  >
                    <Text style={style.EditButtonText}>View Shop Profile</Text>
                  </TouchableOpacity>
                )}
                {[
                  "matrimonyVendor",
                  "decorator",
                  "caterer",
                  "planner",
                  "venue",
                ].includes(userType) && (
                  <TouchableOpacity
                    style={style.EditButton}
                    onPress={() => {
                      navigation.navigate("MyMatrimonyShopProfileEdit", {
                        user_details: userDetails,
                      });
                    }}
                  >
                    <Text style={style.EditButtonText}>Edit Shop Profile</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default MyMatrimonyProfile;

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
    marginTop: 35,
    marginBottom: -30,
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
