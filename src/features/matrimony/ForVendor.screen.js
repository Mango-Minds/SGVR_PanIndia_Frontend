import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import { RowBetween } from "../../styles/common.styles";
import { useNavigation } from "@react-navigation/native";
import MatrimonyVendorsScreen from "./matrimonyVendors";

const ForVendor = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <View>
        <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <IconButton
              icon="arrow-left"
              size={28}
              onPress={() => navigation.goBack()}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
              }}
            >
              Matrimony Vendors
            </Text>
          </View>
        </RowBetween>
        <View
          style={{
            marginTop: 30,
          }}
        >
          <MatrimonyVendorsScreen />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForVendor;
