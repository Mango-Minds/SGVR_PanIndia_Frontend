import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CommingSoon from "../../features/Comming.soon";

const Stack = createStackNavigator();

export const CareerStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CommingSoon" component={CommingSoon} />
  </Stack.Navigator>
);
