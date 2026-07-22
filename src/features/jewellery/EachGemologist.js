import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";

import { IconButton } from "react-native-paper";

import { TopText } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import { Container, RowBetween } from "../../styles/common.styles";
const WINDOW_WIDTH = Dimensions.get("window").width;
import { BASEIMGURL } from "../../infrastructure/constants";
import UserImg from "../../assets/images/general/user.png";
import { useSelector } from "react-redux";

const EachGemologist = ({ route }) => {
  const navigation = useNavigation();
  const { gemologist } = route.params;

  const { user } = useSelector((state) => state.user);

  const GemologistUserId = gemologist.owner._id;

  const handleMessagePress = () => {
    const conversationId = [user._id, GemologistUserId].sort().join("_");
    const toName =
      `${gemologist.owner.firstName || ""} ${gemologist.owner.lastName || ""}`.trim() ||
      "Gemologist";
    navigation.navigate("ChatScreen", {
      toid: GemologistUserId,
      toName,
      index: 0,
      conversationId,
    });
  };

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
            Gemologist Details
          </TopText>
        </View>
        <TouchableOpacity
          style={style.chatButton}
          onPress={handleMessagePress}
        >
          <IconButton icon="chat" size={30}></IconButton>
        </TouchableOpacity>
      </RowBetween>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: "4%" }}>
          <Text style={{ fontWeight: "700", fontSize: 22, opacity: 0.8 }}>
            {gemologist.owner.firstName} {gemologist.owner.lastName}
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
              gemologist.owner && gemologist.profileImage
                ? {
                    uri: `${BASEIMGURL}${gemologist.profileImage}`,
                  }
                : UserImg
            }
          ></Image>

          <View style={{ marginTop: "2%" }}>
            <Text
              style={{
                fontWeight: "700",
                opacity: 1,
                fontSize: 16,
                marginBottom: "2%",
              }}
            >
              About Gemologist
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#7E7E7E",
                lineHeight: 20,
                fontWeight: "500",
              }}
            >
              {gemologist.certifications}
            </Text>
          </View>

          <View style={{ flexDirection: "column", marginTop: "8%" }}>
            <Text style={{ fontWeight: "bold", opacity: 0.8 }}>Email</Text>
            <Text style={{ opacity: 0.7 }}>{gemologist.owner.email}</Text>
          </View>

          <View style={{ flexDirection: "column", marginTop: "8%" }}>
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontWeight: "bold", opacity: 0.7 }}>Phone No</Text>

              <Text style={{ opacity: 1 }}>{gemologist.owner.phone}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default EachGemologist;

const style = StyleSheet.create({
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
    marginTop: "3%",
    backgroundColor: "#f7f1d5",
    padding: "2%",
    borderRadius: 9,
    marginRight: "2%",
  },
  qqtxt: {
    fontSize: 15,
    color: "#D4AF37",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  eachJewelleryCardFooter: {
    backgroundColor: "#D4AF37",
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },

  chatButton: {
    marginLeft: "auto",
    marginRight: 10,
  },
});
