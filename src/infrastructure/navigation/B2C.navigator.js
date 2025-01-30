import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import B2CHome from "../../features/B2C/B2C.Home";
import PageComingSoon from "../../features/B2b/B2b.PageComingSoon";

const Stack = createStackNavigator();

export const B2CStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="B2CHome" component={PageComingSoon} />
   
  </Stack.Navigator>
);