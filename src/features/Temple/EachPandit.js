import { React, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { Row } from "../../styles/dashboard.styles";
import { decode } from "base-64";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import UserImg from "../../assets/images/general/user.png";
import { BASEAPIURL } from "../../infrastructure/constants";
import Theme from "../../styles/theme";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";

import apiClient from "../../store/apiClient";
const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const EachPandit = ({ route }) => {
  const navigation = useNavigation();
  const { pandit, userType, templeinfo } = route.params;
  console.log("pandit Detail: ", pandit);
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];

  const decodedPayload = JSON.parse(decode(tokenPayload));
  const [loadingAnimation, setLoadingAnimation] = useState(true);
  const [userData, setUserData] = useState({});

  //get user data
  // const getUserData = async () => {
  //   const url = `${BASEAPIURL}/user/${pandit.owner}`;
  //   try {
  //     const response = await fetch(url, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setUserData(data.user);
  //     } else {
  //       console.error("Failed to get user");
  //     }
  //   } catch (error) {
  //     console.error("Error connecting to user:", error);
  //   }
  // };
  const getUserData = async () => {
    try {
      const response = await apiClient.get(`/user/${pandit.owner}`);
      setUserData(response.data.user);
    } catch (error) {
      console.error("Failed to get user data:", error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
          >
            Pandit Details
          </TopText>
        </View>
      </RowBetween>
      {loadingAnimation === false ? (
        <ActivityIndicator
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          size={"large"}
          color={"#b98c13"}
        />
      ) : (
        <View style={{ padding: "4%" }}>
          <Image
            source={
              userData?.image
                ? {
                    uri: `${userData?.image}`,
                  }
                : UserImg
            }
            style={styles.ImageStyle}
            resizeMode="contain"
          />
          <Text
            style={{
              fontWeight: "700",
              fontSize: 22,
              opacity: 0.8,
              color: Theme.themeColor,
              padding: 10,
              textAlign:"center",
            }}
          >
            {pandit?.panditName}
          </Text>
          <View style={{ marginTop: "2%" }}>
            <View style={{ padding: "2%", marginTop: "4%" }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ fontWeight: "bold", opacity: 0.8 }}>Call</Text>
                  <Text style={{ opacity: 0.7 }}>{userData?.phone}</Text>
                </View>
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ fontWeight: "bold", opacity: 0.8 }}>
                    Email
                  </Text>
                  <Text style={{ opacity: 0.7 }}>{userData?.email}</Text>
                </View>
              </View>
              <View style={{ marginTop: "8%" }}>
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ fontWeight: "bold", opacity: 0.7 }}>
                    Location
                  </Text>

                  <Text style={{ opacity: 1 }}>{userData?.address}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </Container>
  );
};

export default EachPandit;

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
    color: Theme.themeColor,
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
    color: Theme.themeColor,
  },
  eachJewelleryCardFooter: {
    backgroundColor: Theme.themeColor,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },
});
