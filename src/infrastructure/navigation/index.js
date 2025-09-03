

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { PreLoginNavigator } from "./prelogin.navigator";
import { DashboardNavigator } from "./dashboard.navigator";
import Icons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";

import {
  initialUser,
  Isloading,
  ErrorToggle,
  generateToken,
} from "../../store/user";
import { Snackbar } from "react-native-paper";
import {
  ActivityIndicator,
  Text,
  Platform,
  View,
  useColorScheme,
} from "react-native";
import {
  GetNotification,
  GetSocialData,
} from "../../store/Handlers/Reducer.Handler";
import { logoutSuccess } from "../../store/user";
export const Navigation = () => {
  // Use Redux hooks at the top level - hooks must be called consistently
  let userState, dispatch;
  
  try {
    userState = useSelector((state) => state?.user) || {
      token: null,
      loading: false,
      error: { toggle: false, msg: '', type: '' },
      user: null
    };
    dispatch = useDispatch();
  } catch (error) {
    console.error("Redux store access error:", error);
    // Fallback state if Redux fails
    userState = {
      token: null,
      loading: false,
      error: { toggle: false, msg: '', type: '' },
      user: null
    };
    dispatch = () => console.warn("Dispatch not available");
  }

  const { token, loading, error, user } = userState;

  const errorsize = Platform.OS === "ios" ? 16 : 12;
  const errorVerticalPadding = Platform.OS === "ios" ? 5 : 0;
  const errorMarginBottom = Platform.OS === "ios" ? 0 : 40;
  const errorPaddingTop = Platform.OS === "ios" ? 10 : 0;

 
  const IsLoggedIn = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem("loggedIn");
      console.log("Logged in: ", loggedIn);
  
      if (loggedIn === "true") {
        const accessToken = await AsyncStorage.getItem("token");
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        const userData = await AsyncStorage.getItem("user");
  
        if (accessToken && userData) {
          console.log("Access Token and user data found, navigating to Dashboard");
          dispatch(Isloading(false)); 
          return true;
        } else if (refreshToken) {
          // Attempt to refresh the token here
          try {
            const response = await dispatch(generateToken(refreshToken));
            
            if (response && response.accessToken) {
              // Save new access token to AsyncStorage
              await AsyncStorage.setItem("token", response.accessToken);
              await AsyncStorage.setItem("loggedIn", "true");
              dispatch(Isloading(false));
              return true;
            } else {
              console.log("Token refresh failed, logging out");
              await AsyncStorage.clear();
              dispatch(logoutSuccess());
              dispatch(Isloading(false));
              return false;
            }
          } catch (refreshError) {
            console.error("Token refresh error:", refreshError);
            await AsyncStorage.clear();
            dispatch(logoutSuccess());
            dispatch(Isloading(false));
            return false;
          }
        } else {
          console.log("No valid tokens found, logging out");
          await AsyncStorage.clear();
          dispatch(logoutSuccess());
          dispatch(Isloading(false));
          return false;
        }
      } else {
        console.log("User is not logged in, hiding loader");
        dispatch(Isloading(false));
        return false;
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      try {
        await AsyncStorage.clear();
      } catch (clearError) {
        console.error("Error clearing storage:", clearError);
      }
      dispatch(logoutSuccess());
      dispatch(Isloading(false));
      return false;
    }
  };
  
  
 
  
  useEffect(() => {
    dispatch(initialUser());
  }, []);

  useEffect(() => {
    try {
      IsLoggedIn();
      dispatch(GetSocialData());
      dispatch(GetNotification());
    } catch (error) {
      dispatch(Isloading(false));
      // return;x/
    }
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        style={{
          display: "flex",
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
        size={"large"}
        color={"#FF9933"}
      />
    );
  else
    return (
      <NavigationContainer>
        <>
          {/* <DashboardNavigator /> */}
          {token ? <DashboardNavigator /> : <PreLoginNavigator />}

          <Snackbar
            visible={error.toggle}
            onDismiss={() =>
              dispatch(
                ErrorToggle({ toggle: false, msg: error.msg, type: error.type })
              )
            }
            action={{
              label: <Icons name="close" size={22} color="white" />,
              color: "white",
              onPress: () => {
                // Do something
                dispatch(
                  ErrorToggle({
                    toggle: false,
                    msg: error.msg,
                    type: error.type,
                  })
                );
              },
            }}
            duration={2000}
            style={{
              backgroundColor: "#364135",
              color: "white",
              marginBottom: errorMarginBottom,
              paddingVertical: errorVerticalPadding,
              display: "flex",
              alignSelf: "center",
              alignItems: "center",
              paddingHorizontal: 5,
              paddingTop: errorPaddingTop,
            }}
          >
            {/* Add Success Icon */}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Icons
                name="info"
                size={errorsize + 5}
                color="white"
                // style={{ marginTop: 50 }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: errorsize,
                  textTransform: "capitalize",
                  marginLeft: 10,
                  width: "95%",
                  flexWrap: "wrap",
                }}
              >
                {error.msg}
              </Text>
            </View>
          </Snackbar>
        </>
      </NavigationContainer>
    );
};
