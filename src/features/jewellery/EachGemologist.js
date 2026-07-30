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
import { BASEIMGURL } from "../../infrastructure/constants";
import UserImg from "../../assets/images/general/user.png";
import { useSelector } from "react-redux";

const WINDOW_WIDTH = Dimensions.get("window").width;

const resolveOwner = (gemologist = {}) => {
  if (gemologist.owner && typeof gemologist.owner === "object") {
    return gemologist.owner;
  }
  return {
    _id: gemologist.owner || gemologist._id || gemologist.id,
    firstName:
      gemologist.firstName ||
      gemologist.name?.split?.(" ")?.[0] ||
      gemologist.username?.split?.(" ")?.[0] ||
      "",
    lastName:
      gemologist.lastName ||
      gemologist.name?.split?.(" ")?.slice(1).join(" ") ||
      gemologist.username?.split?.(" ")?.slice(1).join(" ") ||
      "",
    email: gemologist.email || "",
    phone: gemologist.phone || "",
    image: gemologist.image || gemologist.profileImage || "",
    address: gemologist.address || "",
  };
};

const EachGemologist = ({ route }) => {
  const navigation = useNavigation();
  const gemologist = route?.params?.gemologist ?? {};
  const owner = resolveOwner(gemologist);
  const { user } = useSelector((state) => state.user);

  const gemologistUserId = owner?._id;
  const displayName =
    `${owner.firstName || ""} ${owner.lastName || ""}`.trim() ||
    gemologist.username ||
    gemologist.name ||
    "Gemologist";

  const profileImage =
    gemologist.profileImage || owner.image || gemologist.image || null;

  const handleMessagePress = () => {
    if (!user?._id || !gemologistUserId) return;
    const conversationId = [user._id, gemologistUserId].sort().join("_");
    navigation.navigate("ChatScreen", {
      toid: gemologistUserId,
      toName: displayName,
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
        {gemologistUserId ? (
          <TouchableOpacity style={style.chatButton} onPress={handleMessagePress}>
            <IconButton icon="chat" size={30} />
          </TouchableOpacity>
        ) : null}
      </RowBetween>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: "4%" }}>
          <Text style={{ fontWeight: "700", fontSize: 22, opacity: 0.8 }}>
            {displayName}
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
              profileImage
                ? {
                    uri: profileImage.startsWith("http")
                      ? profileImage
                      : `${BASEIMGURL}${profileImage}`,
                  }
                : UserImg
            }
          />

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
              {gemologist.certifications ||
                gemologist.location ||
                owner.address ||
                "No details available"}
            </Text>
          </View>

          <View style={{ flexDirection: "column", marginTop: "8%" }}>
            <Text style={{ fontWeight: "bold", opacity: 0.8 }}>Email</Text>
            <Text style={{ opacity: 0.7 }}>{owner.email || "Not available"}</Text>
          </View>

          <View style={{ flexDirection: "column", marginTop: "8%" }}>
            <Text style={{ fontWeight: "bold", opacity: 0.7 }}>Phone No</Text>
            <Text style={{ opacity: 1 }}>{owner.phone || "Not available"}</Text>
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
  chatButton: {
    marginLeft: "auto",
    marginRight: 10,
  },
});
