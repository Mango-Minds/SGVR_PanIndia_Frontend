import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";

import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import UserImg from "../../assets/images/general/user.png";
import { BASEAPIURL, BASEIMGURL } from "../../infrastructure/constants";
import { Alert } from "react-native";
import { decode } from "base-64";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { sendConnectionRequest } from "./matrimonyAPIs";
export default function MatrimonyProfileNew({ route, navigation }) {
  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const userType = decodedPayload.userType;
  console.log("User Type: ", userType);
  const { groomsData } = route.params;
  console.log("GroomsData in new Screen: ", groomsData);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [viewerState, setViewerState] = useState({
    showViewer: false,
    currentIndex: 0,
    modelImages: [
      {
        url: route.params.matrimonyData.image,
        props: { style: { width: "100%", height: "100%" } },
      },
    ],
  });

  const dateToText = (manDate) => {
    const date = new Date(manDate);

    // Get month names
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Get day with ordinal suffix (e.g., 1st, 2nd, 3rd, 4th, etc.)
    const day = date.getDate();
    const ordinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th"; // for 11th to 19th
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const dayWithSuffix = day + ordinalSuffix(day);

    const month = months[date.getMonth()]; // Get month name from the array
    const year = date.getFullYear(); // Get the full year

    return `${month} ${dayWithSuffix}, ${year}`;
  };

  const [clickedButton, setClickedButton] = useState("ABOUT");
  const handleButtonPress = (buttonName) => {
    setClickedButton(buttonName);
  };

  console.log(route.params.matrimonyData);
  const renderContent = () => {
    switch (clickedButton) {
      case "ABOUT":
        return (
          <View style={styles.about}>
            <View style={styles.aboutContent1}>
              <Text style={styles.aboutLabel1}>BIO</Text>
              <Text style={styles.aboutText1}>
                {route.params.matrimonyData.aboutMe}
              </Text>
            </View>

            {route.params.matrimonyData.socials.visible && (
              <View style={styles.aboutContent2}>
                <Text style={styles.aboutLabel2}>REACH ME AT</Text>
                <View style={{ flexDirection: "row" }}>
                  <Link to={`/${route.params.matrimonyData.socials.instagram}`}>
                    <IconButton icon="instagram" />
                  </Link>
                  <Link to={`/${route.params.matrimonyData.socials.linkedin}`}>
                    <IconButton icon="linkedin" />
                  </Link>
                  <Link to={`/${route.params.matrimonyData.socials.whatsapp}`}>
                    <IconButton icon="whatsapp" />
                  </Link>
                </View>
              </View>
            )}

            <View style={styles.aboutContent3}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>WEBSITE</Text>
                <Text style={styles.aboutText3}>
                  {route.params.matrimonyData.email}
                </Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>CONTACT</Text>
                <Text style={styles.aboutText3}>
                  {route.params.matrimonyData.phone}
                </Text>
              </View>
            </View>
          </View>
        );
      case "WORK":
        return (
          <View style={styles.work}>
            <View style={styles.work1}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}
              >
                TITLE
              </Text>
              <Text style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                {route.params.matrimonyData.occupation}
              </Text>

              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}
              >
                DESCRIPTION
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  paddingHorizontal: 10,
                  paddingBottom: 10,
                }}
              >
                {route.params.matrimonyData.occupationDescription}.
              </Text>
            </View>
          </View>
        );
      case "ACTIVITY":
        return (
          <View style={styles.work}>
            <View style={styles.work1}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}
              >
                ACTIVITY
              </Text>
              {/* Add more ACTIVITY section content here */}
              <Text
                style={{
                  fontSize: 14,
                  paddingHorizontal: 10,
                  paddingBottom: 10,
                }}
              >
                {route.params.matrimonyData.hobbies.join(", ")}
              </Text>
              {/* Hardcoded hobbies text */}
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.about}>
            <View style={styles.aboutContent1}>
              <Text style={styles.aboutLabel1}>BIO</Text>
              <Text style={styles.aboutText1}>
                {route.params.matrimonyData.aboutMe}
              </Text>
            </View>

            {route.params.matrimonyData.socials.visible && (
              <View style={styles.aboutContent2}>
                <Text style={styles.aboutLabel2}>REACH ME AT</Text>
                <View style={{ flexDirection: "row" }}>
                  <Link to={`/${route.params.matrimonyData.socials.instagram}`}>
                    <IconButton icon="instagram" />
                  </Link>
                  <Link to={`/${route.params.matrimonyData.socials.linkedin}`}>
                    <IconButton icon="linkedin" />
                  </Link>
                  <Link to={`/${route.params.matrimonyData.socials.whatsapp}`}>
                    <IconButton icon="whatsapp" />
                  </Link>
                </View>
              </View>
            )}

            <View style={styles.aboutContent3}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>WEBSITE</Text>
                <Text style={styles.aboutText3}>
                  {route.params.matrimonyData.email}
                </Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Text style={styles.aboutLabel3}>CONTACT</Text>
                <Text style={styles.aboutText3}>
                  {route.params.matrimonyData.phone}
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  const receiverId = route.params.matrimonyData._id;
  const senderId = user?.roleData?._id;
  console.log("SID: ", senderId);



  // const handleConnect = async () => {
  //   if (isRequestSent) {
  //     Alert.alert(
  //       "Request Already Sent",
  //       "You have already sent a connection request."
  //     );
  //     return;
  //   }
  
  //   try {
  //     const token = await AsyncStorage.getItem("token");
  
  //     console.log("Rec ID:", receiverId);
  //     console.log("Sender id:", senderId);
  //     console.log("usertype:", userType);
  
  //     const response = await apiClient.post(
  //       `${BASEAPIURL}/matrimony/connection/send-request`,
  //       {
  //         senderId: senderId,
  //         receiverId: receiverId,
  //         createdBy: userType,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  
  //     if (response.status === 200 || response.status === 201) {
  //       setIsRequestSent(true);
  //       Alert.alert("Success", "Connection request sent successfully", [
  //         { text: "OK" },
  //       ]);
  //     } else {
  //       console.error("Failed to send connection request", response);
  //     }
  //   } catch (error) {
  //     console.error("Error connecting to user:", error);
  //   }
  // };
  
  const handleConnect = async () => {
    if (isRequestSent) {
      Alert.alert(
        "Request Already Sent",
        "You have already sent a connection request."
      );
      return;
    }

    try {
     

      console.log("Rec ID:", receiverId);
      console.log("Sender id:", senderId);
      console.log("usertype:", userType);

      const payload = {
        senderId: senderId?.trim(),
        receiverId: receiverId?.trim(),
        createdBy: userType,
      };
      console.log("Sending:", payload);
      
      const response = await sendConnectionRequest(payload);

      if (response.status === 200 || response.status === 201) {
        setIsRequestSent(true);
        Alert.alert("Success", "Connection request sent successfully", [
          { text: "OK" },
        ]);
      } else {
        console.error("Failed to send connection request", response);
      }
    }  catch (error) {
      if (error.response) {
        console.error("Backend response error:", error.response.data);
        Alert.alert(
          "Error",
          error.response.data?.message || "Something went wrong while sending request."
        );
      } else {
        console.error("Error connecting to user:", error);
        Alert.alert("Error", "Unable to send connection request.");
      }
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.headerImageContainer}>
          <Image
            source={
              route.params.matrimonyData.images
                ? {
                    uri: `${route.params.matrimonyData.images[0]}`,
                  }
                : UserImg
            }
            style={styles.headerImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradientOverlay}
          />
          <TouchableOpacity style={styles.backButton}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          </TouchableOpacity>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.nameAndLocationContainer}>
            <Text style={styles.headerTitle}>
              {route.params.matrimonyData.name}
            </Text>
            <View style={styles.locationContainer}>
              <MaterialIcon name="location-on" size={18} color={Theme.themeColor} />
              <Text style={styles.homeTown}>
                {route.params.matrimonyData.homeTown}
              </Text>
            </View>
          </View>

          <View style={styles.eventDetails}>
            <Text style={styles.detailItem}>
              {dateToText(route.params.matrimonyData.dateOfBirth)} |{" "}
              {route.params.matrimonyData.occupation}
            </Text>
          </View>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.eventDetails}>
            <Text style={styles.priceText}>Personal Info</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Caste</Text>
              <Text style={styles.infoValue}>
                {route.params.matrimonyData.subcaste}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gothra</Text>
              <Text style={styles.infoValue}>
                {route.params.matrimonyData.gothra}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Family Type</Text>
              <Text style={styles.infoValue}>
                {route.params.matrimonyData.familyType}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Family Status</Text>
              <Text style={styles.infoValue}>
                {route.params.matrimonyData.familyStatus}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Work Location</Text>
              <Text style={styles.infoValue}>
                {route.params.matrimonyData.workLocation}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>
                {route.params.matrimonyData.height} cm
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Marital Status</Text>
              <Text style={styles.infoValue}>
                {route.params.matrimonyData.maritalStatus}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hobbies</Text>
              {/* <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail"> */}
              <Text style={styles.infoValue}>
              {route.params.matrimonyData.hobbies.join(", ")}

              </Text>
            </View>

            {/* <View style={styles.hobbiesContainer}>
              <Text style={styles.hobbiesHeader}>Hobbies</Text>
              <View style={styles.tags}>
                {route.params.matrimonyData.hobbies &&
                route.params.matrimonyData.hobbies.length > 0 ? (
                  route.params.matrimonyData.hobbies.map((hobby, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{hobby}</Text>
                    </View>
                  ))
                ) : (
                  <Text>No hobbies listed</Text>
                )}
              </View>
            </View> */}
          </View>
        </View>

        <View style={styles.eventInfoContainer}>
          <View style={styles.eventDetails}>
            <Text style={styles.priceText}>Bio</Text>
            <Text style={styles.bioText}>
              {route.params.matrimonyData.aboutMe}
            </Text>
          </View>
        </View>
      </ScrollView>

      {senderId !== receiverId && (
        <View style={styles.bottomBarContainer}>
          <View style={styles.bottomBar}>
            <View style={styles.ticketInfoContainer}>
              <Text style={styles.priceText}>Interested</Text>

              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => {
                  handleConnect(senderId, receiverId, userType);
                }}
              >
                <Text style={styles.bookNowButtonText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerImageContainer: {
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: 400,
  },
  gradientOverlay: {
    position: "",
    top: "20px",
    left: 0,
    right: 0,
    bottom: "150px",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: Theme.themeColor,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    bottom: 10,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
  },
  headerTitle: {
    bottom: 10,
    left: 0,
    color: Theme.themeColor,
    fontSize: 26,
    fontWeight: "bold",
  },
  contact: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1C1C1C",
    marginLeft: 10,
    lineHeight: 20,
  },
  homeTown: {
    fontSize: 13,
    fontWeight: "400",
    color: Theme.themeColor,
    marginLeft: 5,
    lineHeight: 20,
  },
  nameAndLocationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventInfoContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    fontFamily: "Courier New",
    padding: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  interestedText: {
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  interestedButton: {
    borderWidth: 1,
    borderColor: "#f44336",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  interestedButtonText: {
    color: "#f44336",
    fontWeight: "bold",
  },
  eventDetails: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
  },

  ticketInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "white",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  phoneDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
  },
  fillingFast: {
    color: "orange",
    fontWeight: "bold",
  },
  bookNowButton: {
    backgroundColor: Theme.themeColor,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  bookNowButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 2,
  },
  hobbiesContainer: {
    marginTop: 10,
  },
  bottomBarContainer: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  hobbiesHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: Theme.themeColor,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    padding: 5,
    margin: 2,
  },
  tagText: {
    color: "#fff",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: "black",
    width: 150,
  },
  infoValue: {
    fontSize: 16,
    color: "grey",
    flex: 1,
  },
});
