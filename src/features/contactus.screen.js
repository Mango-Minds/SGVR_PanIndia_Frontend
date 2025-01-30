import React from "react";
import {
  Image,
  Dimensions,
  Text,
  TouchableOpacity,
  Linking,
  Button,
  Pressable,
} from "react-native";
import { SafeArea } from "../components/utility/safe-area.component";
import { MainContainer } from "../styles/prelogin.styles";
import { View } from "../styles/common.styles";
import { IconButton, Subheading } from "react-native-paper";
import { TopText } from "../styles/social.styles";
import { useSelector } from "react-redux";

export default function Contactus({ navigation }) {
  const { width } = Dimensions.get("window");

  return (
    <SafeArea>
      <MainContainer>
        <View style={{ alignItems: "center", paddingVertical: 16 }}>
          <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
          >
            Contact Us
          </TopText>
        </View>
        <View
          style={{
            padding: 10,
            shadowColor: "grey",
          }}
        >
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              padding: 10,
              borderRadius: 10,
              margin: "auto",
            }}
          >
            <Image
              source={require("../assets/images/pre-login/logo-small.png")}
              resizeMode="contain"
              style={{
                width: width * 0.9,
                height: 200,
              }}
            />
          </View>
        </View>

        <View
          style={{
            padding: 16,
            paddingVertical: 0,
            flexDirection: "column",
            marginTop: 30,
            marginBottom: 20,
          }}
        ></View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Image
            source={require("../assets/images/community/email.png")}
            style={{ width: 20, height: 20 }}
          />
          <View
            style={{ backgroundColor: "white", padding: "1%", borderRadius: 4 }}
          >
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:support@sgvrtech.com")}
            >
              <Text
                style={{
                  paddingHorizontal: 8,
                  fontSize: 16,
                  color: "#898E92",
                  textTransform: "lowercase",
                }}
              >
                support@sgvrtech.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Image
            source={require("../assets/images/community/location.png")}
            style={{ width: 20, height: 20 }}
          />

          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 16,
              color: "#898E92",
              textTransform: "capitalize",
            }}
          >
            Bengaluru, Karnataka, India
          </Text>
        </View>

        <View
          style={{
            borderRadius: 4,
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Image
            source={require("../assets/images/community/phone.png")}
            style={{ width: 20, height: 20 }}
          />
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${+919449179443}`)}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: "1%",
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  paddingHorizontal: 8,
                  fontSize: 16,
                  color: "#898E92",
                  textTransform: "capitalize",
                }}
              >
                +91-9449179443
              </Text>
            </View>
          </TouchableOpacity>
        </View>
       </MainContainer>
    </SafeArea>
  );
}
