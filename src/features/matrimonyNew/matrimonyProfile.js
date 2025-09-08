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
import { decode } from "base-64";
import { useIsFocused } from "@react-navigation/native";
import UserImg from "../../assets/images/general/user.png";
import ProfileHeader from "./ProfileHeader";
import Theme from "../../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { fetchMatrimonyUserProfile } from "./matrimonyAPIs";
import { useTranslation } from "react-i18next";
import { useSubscription } from "../../hooks/useSubscription";
import Icon from "react-native-vector-icons/Ionicons";

const MyMatrimonyProfile = ({ route }) => {
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = useState({});
  const [userRoleData, setUserRoleData] = useState({});

  // Subscription state
  const { subscriptionStatus } = useSubscription();

  const navigation = useNavigation();
  const userTypes = useSelector((state) => state.user.user.userType) || [];
  
  // Determine userType with better logic for vendor roles
  let userType;
  if (userTypes.includes("matrimonyMan")) {
    userType = "matrimonyMan";
  } else if (userTypes.includes("matrimonyWoman")) {
    userType = "matrimonyWoman";
  } else if (userTypes.includes("matrimonyVendor")) {
    userType = "matrimonyVendor";
  } else if (userTypes.includes("decorator")) {
    userType = "decorator";
  } else if (userTypes.includes("caterer")) {
    userType = "caterer";
  } else if (userTypes.includes("planner")) {
    userType = "planner";
  } else if (userTypes.includes("venue")) {
    userType = "venue";
  } else {
    userType = userTypes[0];
  }

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  const user = useState(useSelector((state) => state.user.user));

  const userId = decodedPayload.id;

  const [userData, setUserData] = useState({});

  const fetchUser = async () => {
    try {
      setLoadingAnimation(true);

      const selectedLanguage = await AsyncStorage.getItem("user-language") || "en";

      const data = await fetchMatrimonyUserProfile(userId);

      let translatedData = data;

      // Translate if the selected language is not English
      if (selectedLanguage !== "en") {
        const translateResponse = await apiClient.post("/translate", {
          data: [data], // wrap in array to match API shape
          targetLang: selectedLanguage,
        });
        translatedData = translateResponse.data.translatedData[0]; // extract from array
      }

      setUserData(translatedData);
      
      // Set userDetails based on the user's role data
      const roleData = translatedData.user.roleData;
      let userDetailsData = null;
      
      if (roleData?.MatrimonyUser) {
        userDetailsData = roleData.MatrimonyUser;
      } else if (roleData?.MatrimonyVendor) {
        userDetailsData = roleData.MatrimonyVendor;
      } else if (roleData?.Decorator) {
        userDetailsData = roleData.Decorator;
      } else if (roleData?.Caterer) {
        userDetailsData = roleData.Caterer;
      } else if (roleData?.Planner) {
        userDetailsData = roleData.Planner;
      } else if (roleData?.Venue) {
        userDetailsData = roleData.Venue;
      }
      
      setUserDetails(userDetailsData);

    } catch (error) {
      console.error("Error fetching or translating user:", error);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <ProfileHeader 
          title={t("my_profile")}
          onEditPress={() =>
            navigation.navigate("EditProfile", {
              userData,
              fetchUser,
              userId,
              user,
            })
          }
        />
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

              {subscriptionStatus.isPremium && (
                <View style={style.premiumDetailsContainer}>
                  <View style={style.premiumBadge}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={style.premiumText}>Premium</Text>
                  </View>
                  {subscriptionStatus.remainingDays && (
                    <Text style={style.premiumExpiryText}>
                      Expires in {subscriptionStatus.remainingDays} days
                    </Text>
                  )}
                </View>
              )}

              <View style={style.contactDetails}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: Theme.themeColor,
                    bottom: -30,
                  }}
                >
                 User Details
                </Text>
              </View>

              <View style={style.nameDetails}>
                <MaterialIcon
                  name="people"
                  size={18}
                  color={Theme.themeColor}
                />
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
                      {t("view_your_matrimony_profile")}
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
                      navigation.navigate("MatrimonyProfileWithConnection", userDetails || userData);
                    }}
                  >
                    <Text style={style.EditButtonText}>{t("view_shop_details")}</Text>
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
  premiumDetailsContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  premiumText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
    marginLeft: 4,
  },
  premiumExpiryText: {
    fontSize: 11,
    color: '#856404',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'right',
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

