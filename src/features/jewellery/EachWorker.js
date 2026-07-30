import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import React from "react";
import { Row } from "../../styles/dashboard.styles";
import { Divider, IconButton } from "react-native-paper";
import { useState, useEffect } from "react";

import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import UserImg from "../../assets/images/general/user.png";
import { useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { BASEIMGURL } from "../../infrastructure/constants";
import { BASEAPIURL } from "../../infrastructure/constants";

const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const EachWorker = ({ route }) => {
  const navigation = useNavigation();
  const {workerId} = route.params || {};
  const fromWorker = route.params?.worker || {};
  const workerUserId =
    fromWorker?.owner?._id ||
    (typeof fromWorker?.owner === "string" ? fromWorker.owner : null) ||
    fromWorker?._id;
  console.log(workerId)

  const token = useSelector((state) => state.user.token);
  const { user } = useSelector((state) => state.user);
  const isFocused = useIsFocused();
  const [worker, setWorker] = useState({});

  const [userData, setUserData] = useState({});

  const handleMessagePress = () => {
    const conversationId = [user._id, workerUserId].sort().join("_");
    const toName =
      `${worker?.firstName || ""} ${worker?.lastName || ""}`.trim() || "Worker";
    navigation.navigate("ChatScreen", {
      toid: workerUserId,
      toName,
      index: 0,
      conversationId,
    });
  };

  const fetchUser = async () => {
    try {
      // setLoadingAnimation(true);
      const response = await fetch(`${BASEAPIURL}/user/${workerUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User Data: ", data);

        setWorker(data.user);
        setUserData(data);
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
    }
  };
  useEffect(() => {
    fetchUser();
  }, [isFocused]);

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
          >
            Worker Details
          </TopText>
        </View>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleMessagePress}
        >
          <IconButton icon="chat" size={30}></IconButton>

          {/* <Text style={style.chatButtonText}>Chat</Text> */}
        </TouchableOpacity>
      </RowBetween>
      {worker && (
        <View style={{ padding: "4%" }}>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 22,
              opacity: 0.8,
              color: "#D4AF37",
              padding: 10,
            }}
          >
            {worker.firstName} {worker.lastName}
          </Text>
          <Image
            source={
              worker.image
                ? {
                    uri: `${BASEIMGURL}${worker.image}`,
                  }
                : UserImg
            }
            style={styles.ImageStyle}
            resizeMode="contain"
          />
          <View style={{ marginTop: "4%" }}>
            <View style={{ marginTop: "2%" }}>
              <Text
                style={{
                  fontWeight: "700",
                  opacity: 1,
                  fontSize: 16,
                  marginBottom: "2%",
                }}
              >
                Experience
              </Text>
              <Text>
                {worker?.roleData?.description || "No description available"}
              </Text>
            </View>

            <View style={{ padding: "2%", marginTop: "4%" }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ fontWeight: "bold", opacity: 0.8 }}>Call</Text>
                  <Text style={{ opacity: 0.7 }}>{worker.phone}</Text>
                </View>
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ fontWeight: "bold", opacity: 0.8 }}>
                    Email
                  </Text>
                  <Text style={{ opacity: 0.7 }}>{worker.email}</Text>
                </View>
              </View>
              <View style={{ marginTop: "8%" }}>
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ fontWeight: "bold", opacity: 0.7 }}>
                    Location
                  </Text>

                  <Text style={{ opacity: 1 }}>{worker.city}</Text>
                </View>
              </View>
              {user.userType == "superadmin" && (
                <TouchableOpacity
                  style={styles.EditButton}
                  onPress={() =>
                    navigation.navigate("EditJewelleryUserRegisterScreen", {
                      userData,
                      user,
                      userId: workerUserId,
                    })
                  }
                >
                  <Text style={styles.EditButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

        </View>
      )}

      <Pressable style={styles.footer}>
        <View style={styles.eachJewelleryCardFooter}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
            Call
          </Text>
        </View>
      </Pressable>
    </Container>
  );
};

export default EachWorker;

const styles = StyleSheet.create({
  ImageStyle: {
    width: "100%",
    height: 250,
    borderRadius: 10,
  },
  footer: {
    position: "absolute",
    height: 50,
    left: 0,
    bottom: -2,
    width: WINDOW_WIDTH,
  },
  oldPrice: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    opacity: 0.9,
    fontSize: 13,
    color: "#D4AF37",
    margin: "1%",
  },
  qq: {
    margin: "3%",
    backgroundColor: "#f7f1d5",
    padding: "2%",
    borderRadius: 9,
  },
  qqtxt: {
    fontSize: 12,
    color: "#D4AF37",
  },
  eachJewelleryCardFooter: {
    backgroundColor: "#D4AF37",
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
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
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  chatButton: {
    marginLeft: "auto",
    marginRight: 10,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  sendRequestButton: {
    marginTop: 20,
    backgroundColor: "#D4AF37",
    padding: 10,
    borderRadius: 5,
  },
  sendRequestButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },

});
