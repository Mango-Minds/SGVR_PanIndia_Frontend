import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import HeaderBar from "../../components/B2b/HeaderBar";
import Product from "../../features/B2b/Product.home";
import Property from "../../features/B2b/Property.home";
import BottomNavigation from "../../components/community/BottomNavigation";

const B2bHome = (navigation) => {
  const [screen, setScreen] = useState("Product");
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <HeaderBar title="B2B" />
      <View
        style={{
          justifyContent: "space-evenly",
          alignItems: "center",
          flexDirection: "row",
          marginTop: 0,
          paddingHorizontal: 15,
        }}
      >
        <TouchableOpacity
          onPress={() => setScreen("Product")}
          style={{
            borderBottomColor: screen === "Product" ? "#D4AF37" : "white",
            borderBottomWidth: 2,
            width: "50%",
            paddingVertical: 20,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: screen === "Product" ? "#D4AF37" : "#9C9C9C",
              textAlign: "center",
            }}
          >
            Product
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setScreen("Property")}
          style={{
            borderBottomColor: screen === "Property" ? "#D4AF37" : "white",
            borderBottomWidth: 2,
            width: "50%",
            paddingVertical: 20,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: screen === "Property" ? "#D4AF37" : "#9C9C9C",
              textAlign: "center",
            }}
          >
            Property
          </Text>
        </TouchableOpacity>
      </View>
      {screen === "Product" ? <Product /> : <Property />}
      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
};

export default B2bHome;
