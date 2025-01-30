import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
const PostCreated = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image
        source={require("../../assets/images/social/success-tick.png")}
        style={{ width: 100, height: 100 }}
      />
      <Text
        style={{
          color: "#D4AF37",
          fontSize: 18,
          fontWeight: "bold",
          marginTop: 26,
        }}
      >
        Post Successfully Created
      </Text>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Home");
        }}
      >
        <Text
          style={{
            color: "white",
            backgroundColor: "#D4AF37",
            fontSize: 16,
            padding: 14,
            width: 180,
            borderRadius: 10,
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Keep Scrolling
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PostCreated;
