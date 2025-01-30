import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FormButton, MainContainer, Row } from "../../styles/prelogin.styles";
import { SafeArea } from "../utility/safe-area.component";

export default function RequestSent({ navigation }) {
  return (
    <SafeArea>
      <View
        style={{
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image source={require("../../assets/images/matrimony/tick.png")} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "normal",
              marginTop: 20,
              color: "#D4AF37",
            }}
          >
            Your request has been sent!
          </Text>
          <Text
            style={{
              fontSize: 11,
              marginTop: 10,
              color: "#BCBCBC",
              textAlign: "center",
              marginHorizontal: 40,
            }}
          >
            You will get the notification once the person Accept your request.
          </Text>

          <FormButton
            style={{
              paddingLeft: 24,
              paddingRight: 24,
              marginTop: 40,
              borderRadius: 5,
            }}
            onPress={() => {
              navigation.navigate("Main");
            }}
          >
            <Text style={{ color: "white", fontSize: 14 }}>Go Back</Text>
          </FormButton>
        </View>
      </View>
    </SafeArea>
  );
}
