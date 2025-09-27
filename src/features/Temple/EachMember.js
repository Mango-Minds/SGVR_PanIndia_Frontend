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
  Alert,
} from "react-native";
import Theme from "../../styles/theme";
import { useSelector } from "react-redux";
import { Row } from "../../styles/dashboard.styles";
import { decode } from "base-64";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import UserImg from "../../assets/images/general/user.png";
import { BASEAPIURL } from "../../infrastructure/constants";
import apiClient from "../../store/apiClient";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { useTranslation } from "react-i18next";

const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const EachMember = ({ route }) => {
  const navigation = useNavigation();
  const { member, userType, templeinfo } = route.params;
   const { t } = useTranslation();
  console.log("Member Detail: ", member);
  const token = useSelector((state) => state.user.token);
  const tokenPayload = token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  console.log("temple info:", templeinfo);
  console.log("decodedpayload:", decodedPayload);

  const [loadingAnimation, setLoadingAnimation] = useState(true);
  
  // const deleteMember = async () => {
  //   try {
  //     const response = await fetch(
  //       `${BASEAPIURL}/temple/${templeinfo._id}/members/${member._id}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log("member deletion response", response);
  //     if (!response.ok) {
  //       throw new Error("Failed to delete member");
  //     }

  //     Alert.alert(
  //       "Success",
  //       "Member deleted successfully",
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             navigation.goBack();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   } catch (error) {
  //     console.error("Error deleting member:", error);
  //   }
  // };
  const deleteMember = async () => {
    try {
      const response = await apiClient.delete(
        `/temple/${templeinfo._id}/members/${member._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("member deletion response", response);
  
      if (!response || response.status !== 200) {
        throw new Error("Failed to delete member");
      }
  
      Alert.alert(
        "Success",
        "Member deleted successfully",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };
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
            {t("memberDetails")}
          </TopText>
        </View>
        {userType.includes("templeAdmin") &&
          templeinfo.createdBy === decodedPayload.id && (
            <>
              <IconButton
                icon="trash-can-outline"
                style={{ marginLeft: "auto" }}
                onPress={deleteMember}
              />
              <IconButton
                icon="pencil-outline"
                onPress={() =>
                  navigation.navigate("EditMember", {
                    member: member,
                    templeinfo: templeinfo,
                  })
                }
              />
            </>
          )}
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
          <Text
            style={{
              fontWeight: "700",
              fontSize: 22,
              opacity: 0.8,
              color:Theme.themeColor,
              padding: 10,
            }}
          >
            {member.name}
          </Text>
          <Image
            style={{
              width: "100%",
              height: 240,
              marginTop: "4%",
              borderRadius: 5,
            }}
            resizeMode="contain"
            source={
              member && member.profileImage
                ? {
                    uri: `${member.profileImage}`,
                  }
                : UserImg
            }
          ></Image>
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
               {t("memberDescription")}
              </Text>
              <Text>{member.description}</Text>
            </View>

            <View style={{ padding: "2%", marginTop: "4%" }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ fontWeight: "bold", opacity: 0.8 }}>{t("memberCall")}</Text>
                  <Text style={{ opacity: 0.7 }}>{member.phone}</Text>
                </View>
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ fontWeight: "bold", opacity: 0.8 }}>
                   { t("memberEmail")}
                  </Text>
                  <Text style={{ opacity: 0.7 }}>{member.email}</Text>
                </View>
              </View>
              <View style={{ marginTop: "8%" }}>
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ fontWeight: "bold", opacity: 0.7 }}>
                   { t("memberLocation")}
                  </Text>

                  <Text style={{ opacity: 1 }}>{member.location}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </Container>
  );
};

export default EachMember;

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
    color:Theme.themeColor,
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
    backgroundColor:Theme.themeColor,
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },
});
