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
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import Theme from "../styles/theme";
export default function Contactus({ navigation }) {
  const { width } = Dimensions.get("window");

  return (
    <SafeArea>
      <MainContainer>
        <View style={{ alignItems: "center", paddingVertical: 16 }}>
          <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
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
              source={require("../assets/images/pre-login/logoo-small.png")}
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
            marginTop: 10,
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
          {/* <Image
            source={require("../assets/images/community/email.png")}
            style={{ width: 20, height: 20 }}
          /> */}
           <MaterialIcon name="email" size={18} color={Theme.themeColor} />
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
          {/* <Image
            source={require("../assets/images/community/location.png")}
            style={{ width: 20, height: 20 }}
          /> */}
          <MaterialIcon name="location-on" size={18} color={Theme.themeColor} />

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
          {/* <Image
            source={require("../assets/images/community/phone.png")}
            style={{ width: 20, height: 20 }}
          /> */}
          <MaterialIcon name="phone" size={18} color={Theme.themeColor} />
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
