import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import MyJewelleryProfile from "../../components/Jewellery/MyProfile";
import ProfileHeader from "../../components/Jewellery/Header";
import { useNavigation } from "@react-navigation/native";

const MyProfile = ({route}) => {
  const navigation = useNavigation();
  const [screen, setScreen] = React.useState("Product");
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <ProfileHeader title="My Profile" />
        <ScrollView>
          <MyJewelleryProfile  route={route} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default MyProfile;

const styles = StyleSheet.create({
  Aboutus: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
    color: "#141414",
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 5,
    marginBottom: 5,
    color: "#7E7E7E",
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  contactDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
  },
  contact: {
    fontSize: 13,
    fontWeight: "400",
    color: "#1C1C1C",
    marginLeft: 10,
    lineHeight: 20,
    width: "95%",
  },
  eachJewelleryCard: {
    width: 185,
    marginRight: "1%",
    padding: "4%",
    marginBottom: "3%",
  },
  eachJewelleryCardImg: {
    width: 170,
    height: 110,
    borderRadius: 4,
  },
  eachJewelleryCardFooter: {
    backgroundColor: "#D4AF37",
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },
  eachJewelleryCardContainer: {
    marginTop: "4%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  shadowProp: {
    backgroundColor: "white",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
