import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import PageComingSoon from "./B2c.PageComingSoon";


const B2CHome = (navigation) => {
 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <PageComingSoon/>
    </SafeAreaView>
  );
};

export default B2CHome;
