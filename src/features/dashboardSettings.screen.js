import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
// import { useSelector } from "react-redux";
import { Divider, IconButton } from "react-native-paper";
import { Container, RowBetween, View } from "../styles/common.styles";
import SettingCard from "../components/social/SettingCard";
import { logout } from "../store/user";
import { useDispatch } from "react-redux";
import Theme from "../styles/theme";
import { useTranslation } from "react-i18next"; 

export default function DashboardSettingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  // const userType = useSelector((state) => state.user.user.userType[0]);
  // console.log("usertype in dasboard");
  
  // const searchData = [
  //   {
  //     name: "View Profile",
  //     callback: () => {
  //       navigation.navigate("ViewProfile");
  //     },
  //   },
  //   {
  //     name: "Change Language",
  //     callback: () => {
  //       navigation.navigate("ChangeLanguage");
  //     },
  //   },
  //   {
  //     name: "Change Password",
  //     callback: () => {
  //       navigation.navigate("ChangePassword");
  //     },
  //   },
  //   {
  //     name: "Terms & Conditions",
  //     callback: () => {
  //       navigation.navigate("TermsAndConditions");
  //     },
  //   },
  //   {
  //     name: "Privacy Policy",
  //     callback: () => {
  //       navigation.navigate("PrivacyPolicy");
  //     },
  //   },
  //   {
  //     name: "Contact Us",
  //     callback: () => {
  //       navigation.navigate("Contactus");
  //     },
  //   },
  //   {
  //     name: "Report",
  //     callback: () => {
  //       navigation.navigate("ReportScreen");
  //     },
  //   },

  //   {
  //     name: "Logout",
  //     callback: async () => {
  //       dispatch(logout());
  //     },
  //   },
  // ];
  const mainOptions = [
    {
      name: t("change_language"),
      callback: () => {
        navigation.navigate("ChangeLanguage");
      },
    },
    {
      name: t("change_password"),
      callback: () => {
        navigation.navigate("ChangePassword");
      },
    },
    {
      name: t("terms_conditions"),
      callback: () => {
        navigation.navigate("TermsAndConditions");
      },
    },
    {
      name: t("privacy_policy"),
      callback: () => {
        navigation.navigate("PrivacyPolicy");
      },
    },
    {
      name: t("contact_us"),
      callback: () => {
        navigation.navigate("Contactus");
      },
    },
    {
      name: t("report"),
      callback: () => {
        navigation.navigate("ReportScreen");
      },
    },
    {
      name: t("delete_account"),
      callback: () => {
        navigation.navigate("DeleteAccount");
      },
      isDestructive: true,
    },
  ];

  const logoutOption = {
    name: t("logout"),
    callback: async () => {
      dispatch(logout());
    },
    isLogout: true,
  };
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
        {mainOptions.map((item, index) => (
          <TouchableOpacity activeOpacity={0.25} key={index}>
            <SettingCard {...item} key={index} />
          </TouchableOpacity>
        ))}
        
        {/* Separator before logout */}
        <View style={{ marginVertical: 20 }}>
          <Divider />
        </View>
        
        {/* Logout option at bottom */}
        <TouchableOpacity 
          activeOpacity={0.25} 
          style={{
            backgroundColor: Theme.themeColor,
            marginHorizontal: 16,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={logoutOption.callback}
        >
          <Text style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            {logoutOption.name}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}
