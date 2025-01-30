import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Divider, IconButton } from "react-native-paper";
import {
  Container,
  RowBetween,
  SearchField,
  View,
} from "../styles/common.styles";
import { TopText } from "../styles/social.styles";
import SettingCard from "../components/social/SettingCard";

export default function SettingScreen({ navigation }) {
  const searchData = [
    {
      name: "Terms & Conditions",
      callback: () => {
        navigation.navigate("TermsAndConditions");
      },
    },
    {
      name: "Privacy",
      callback: () => {
        navigation.navigate("PrivacyPolicy");
      },
    },
    {
      name: "Contact Us",
      callback: () => {
        navigation.navigate("Contactus");
      },
    },
    {
      name: "Report",
      callback: () => {
        navigation.navigate("ReportScreen");
      },
    },
  ];
  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <TopText
            style={{ color: "#000000", fontSize: 22, fontWeight: "bold" }}
          >
            Settings
          </TopText>
        </View>
      </RowBetween>
      <ScrollView
        style={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Divider />
        {searchData.map((item, index) => (
          <SettingCard {...item} key={index} />
        ))}
      </ScrollView>
    </Container>
  );
}
