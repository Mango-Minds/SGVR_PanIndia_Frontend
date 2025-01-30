
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Row } from "../../../styles/dashboard.styles";
import { Divider, IconButton } from "react-native-paper";
import { TopText } from "../../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import {
  Container,
  RowBetween,
  SearchField,
} from "../../../styles/common.styles";
const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const ToolsProduct = ({ route }) => {
  const navigation = useNavigation();
  const { tool } = route.params;
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
            Tool Details
          </TopText>
        </View>
        <IconButton icon="trash-can-outline" style={{ marginLeft: "auto" }} />
        <IconButton
          icon="pencil-outline"
          onPress={() => navigation.navigate("EditTools", { tool })}
        />
      </RowBetween>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: "4%" }}>
          <Text style={{ fontWeight: "700", fontSize: 22, opacity: 0.8 }}>
            {tool.name}
          </Text>
          <Image
            style={{
              width: "100%",
              height: 240,
              marginTop: "4%",
              borderRadius: 5,
            }}
            source={{ uri: tool.image }}
          ></Image>
          <View style={{ marginTop: "4%" }}>
            <Text
              style={{
                fontWeight: "700",
                opacity: 1,
                fontSize: 16,
                marginBottom: "2%",
              }}
            >
              Tools Pictures
            </Text>
          </View>
          {/* <View style={{ flexDirection: "row" }}> */}
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {[0, 1, 2, 3, 4, 5].map((item, index) => (
              <View
                style={{ margin: "3%", flex: 1, marginHorizontal: 6 }}
                key={index}
              >
                <Image
                  style={{ width: 60, height: 60, borderRadius: 5 }}
                  source={{
                    uri: "data:image/jpeg;base64,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",
                  }}
                />
              </View>
            ))}
          </ScrollView>
          {/* </View> */}
          <View style={{ marginTop: "2%" }}>
            <Text
              style={{
                fontWeight: "700",
                opacity: 1,
                fontSize: 16,
                marginBottom: "2%",
              }}
            >
              About Tool
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#7E7E7E",
                lineHeight: 20,
                fontWeight: "500",
              }}
            >
             {tool.about}
            </Text>
          </View>
          <View style={{ flexDirection: "row", marginTop: "5%" }}>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>Price : </Text>
            <Text style={{ fontSize: 15, color: "#D4AF37", fontWeight: "600" }}>
              {tool.product_price}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default ToolsProduct;

const styles = StyleSheet.create({
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
});
