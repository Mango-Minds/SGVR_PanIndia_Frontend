import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CarouselScreen from "../../features/prelogin.screen";
import LoginScreen from "../../features/login.screen";
import RegisterScreen from "../../features/register.screen";
import VerifyScreen from "../../features/verify.screen";
import DashboardScreen from "../../features/dashboard.screen";
import ReverifyScreen from "../../features/reverify.screen";
import ForgotPasswordScreen from "../../features/forgotPassword.screen";
import ResetPasswordScreen from "../../features/resetPassword.screen";
import EditNumberScreen from "../../features/editNumber.screen";
import TermsAndConditions from "../../features/terms&conditions";
import Contactus from "../../features/contactus.screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Reportscreen from "../../features/reportissue.screen";
import { useDispatch } from "react-redux";
import { DashboardNavigator } from "./dashboard.navigator";

const Stack = createStackNavigator();

export const PreLoginNavigator = () => {
  const [firstTime, setFirstTime] = React.useState(null);
  const [subs, setSubs] = React.useState(true);

  const dispatch = useDispatch();

  React.useEffect(() => {
    let subs = true;
    const firstAccess = async () => {
      if (subs) {
        const data = await AsyncStorage.getItem("firsttime");
        if (!data && subs) {
          setFirstTime(false);
        } else {
          if (subs) setFirstTime(Boolean(data));
        }
      }
      return;
    };
    if (subs) firstAccess();
    return () => {
      subs = false;
    };
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      {/* {firstTime && firstTime === true ? (
        <Stack.Screen name="Main" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={CarouselScreen} />
      )} */}
      <Stack.Screen name="Main" component={LoginScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ReportScreen" component={Reportscreen} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
      <Stack.Screen name="Contactus" component={Contactus} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      {/* <Stack.Screen name="EditNumber" component={EditNumberScreen} /> */}
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Dashboard" component={DashboardNavigator} />
      {/* <Stack.Screen name="Reverify" component={ReverifyScreen} /> */}
    </Stack.Navigator>
  );
};
