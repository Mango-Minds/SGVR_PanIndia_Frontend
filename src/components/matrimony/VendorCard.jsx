import React from "react";
import { Image, Text } from "react-native";
import { View } from "../../styles/common.styles";

export default function VendorCard() {
  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../../assets/images/matrimony/halls.png")}
        // style={{ width: 70, height: 70 }}
      />
      <Text style={{ color: "#686868", fontSize: 10 }}>Function hall</Text>
    </View>
  );
}
