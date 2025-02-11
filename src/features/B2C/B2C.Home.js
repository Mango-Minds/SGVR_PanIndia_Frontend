import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import PageComingSoon from "./B2c.PageComingSoon";
import BuySellScreen from "./B2C.homeScreen";

const B2CHome = (navigation) => {
 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <PageComingSoon/>
      {/* <BuySellScreen/> */}
     
    </SafeAreaView>
  );
};

export default B2CHome;
