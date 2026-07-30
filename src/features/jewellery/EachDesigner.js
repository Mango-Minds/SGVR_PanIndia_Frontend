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

/** Normalize directory / legacy payloads that may omit populated `owner`. */
const resolveOwner = (designer = {}) => {
  if (designer.owner && typeof designer.owner === "object") {
    return designer.owner;
  }
  return {
    _id: designer.owner || designer._id || designer.id,
    firstName:
      designer.firstName ||
      designer.name?.split?.(" ")?.[0] ||
      designer.username?.split?.(" ")?.[0] ||
      "",
    lastName:
      designer.lastName ||
      designer.name?.split?.(" ")?.slice(1).join(" ") ||
      designer.username?.split?.(" ")?.slice(1).join(" ") ||
      "",
    email: designer.email || "",
    phone: designer.phone || "",
    image: designer.image || designer.profileImage || "",
    address: designer.address || "",
  };
};

const EachDesigner = ({ route }) => {
  const navigation = useNavigation();
  const designer = route?.params?.designer ?? {};
  const owner = resolveOwner(designer);
  const { user } = useSelector((state) => state.user);

  const designerUserId = owner?._id;
  const displayName =
    `${owner.firstName || ""} ${owner.lastName || ""}`.trim() ||
    designer.username ||
    designer.name ||
    "Designer";

  const profileImage =
    designer.profileImage || owner.image || designer.image || null;

  const handleMessagePress = () => {
    if (!user?._id || !designerUserId) return;
    const conversationId = [user._id, designerUserId].sort().join("_");
    navigation.navigate("ChatScreen", {
      toid: designerUserId,
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
            Designer Details
          </TopText>
        </View>
        {designerUserId ? (
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
              About Designer
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#7E7E7E",
                lineHeight: 20,
                fontWeight: "500",
              }}
            >
              {designer.specialty ||
                designer.location ||
                owner.address ||
                "No details available"}
            </Text>
          </View>

          <View style={{ flexDirection: "column", marginTop: "8%" }}>
            <Text style={{ fontWeight: "bold", opacity: 0.8 }}>Email</Text>
            <Text style={{ opacity: 0.7 }}>{owner.email || "Not available"}</Text>
          </View>

          <View style={{ flexDirection: "column", marginTop: "8%" }}>
            <Text style={{ fontWeight: "bold", opacity: 0.7 }}>Phone</Text>
            <Text style={{ opacity: 1 }}>{owner.phone || "Not available"}</Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default EachDesigner;

const style = StyleSheet.create({
  footer: {
    position: "absolute",
    height: 50,
    left: 0,
    bottom: -2,
    width: WINDOW_WIDTH,
  },
  chatButton: {},
});
