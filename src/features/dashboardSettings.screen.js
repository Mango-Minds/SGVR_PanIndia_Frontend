import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { Divider, IconButton } from "react-native-paper";
import { Container, RowBetween, View } from "../styles/common.styles";
import SettingCard from "../components/social/SettingCard";
import { logout } from "../store/user";
import { useDispatch } from "react-redux";
import Theme from "../styles/theme";
export default function DashboardSettingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const searchData = [
    {
      name: "View Profile",
      callback: () => {
        navigation.navigate("ViewProfile");
      },
    },
    {
      name: "Change Password",
      callback: () => {
        navigation.navigate("ChangePassword");
      },
    },
    {
      name: "Terms & Conditions",
      callback: () => {
        navigation.navigate("TermsAndConditions");
      },
    },
    {
      name: "Privacy Policy",
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

    {
      name: "Logout",
      callback: async () => {
        dispatch(logout());
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
          <Text style={{ color: Theme.themeColor, fontSize: 18 }}>Profile</Text>
        </View>
      </RowBetween>
      <ScrollView
        style={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Divider />
        {searchData.map((item, index) => (
          <TouchableOpacity activeOpacity={0.25} key={index}>
            <SettingCard {...item} key={index} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Container>
  );
}
