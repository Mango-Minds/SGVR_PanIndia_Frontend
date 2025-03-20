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
  updateTokens,
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
import Theme from "../../styles/theme";
import store from "../../store";

export const Navigation = () => {
  const { token, loading, error, user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const errorsize = Platform.OS === "ios" ? 16 : 12;
  const errorVerticalPadding = Platform.OS === "ios" ? 5 : 0;
  const errorMarginBottom = Platform.OS === "ios" ? 0 : 40;
  const errorPaddingTop = Platform.OS === "ios" ? 10 : 0;

  // const IsLoggedIn = async () => {
  //   // await AsyncStorage.removeItem("firsttime");
  //   // await dispatch(Isloading(true));

  //   const refreshtoken = await AsyncStorage.getItem("refresh_token");
  //   if (refreshtoken) {
  //     await dispatch(
  //       generateToken(await AsyncStorage.getItem("refresh_token"))
  //     );
  //     dispatch(Isloading(false));
  //   } else {
  //     dispatch(Isloading(false));
  //   }
  // };


  // const IsLoggedIn = async () => {
  //   try {
  //     const loggedIn = await AsyncStorage.getItem("loggedIn");
  //     console.log("Logged in: ", loggedIn);
  
  //     if (loggedIn === "true") {
  //       const accessToken = await AsyncStorage.getItem("token");
  //       const refreshToken = await AsyncStorage.getItem("refresh_token");
  
  //       if (accessToken) {
  //         console.log("Access Token found, navigating to Dashboard");
  //         dispatch(Isloading(false)); 
        
  //         return true;
  //       } else if (refreshToken) {
  //         await dispatch(generateToken(refreshToken)); 
  //       } else {
  //         dispatch(logoutSuccess()); // Log out if no token found
  //         dispatch(Isloading(false)); // Hide loader
  //       }
  //     } else {
  //       console.log("User is not logged in, hiding loader");
  //       dispatch(Isloading(false)); 
  //     }
  //   } catch (error) {
  //     console.error("Error checking login status:", error);
  //     dispatch(Isloading(false)); 
  //   }
  // };
  

  
  
  const IsLoggedIn = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem("loggedIn");
      console.log("Logged in: ", loggedIn);
  
      if (loggedIn === "true") {
        const accessToken = await AsyncStorage.getItem("token");
        const refreshToken = await AsyncStorage.getItem("refresh_token");
  
        if (accessToken) {
          console.log("Access Token found, navigating to Dashboard");
          dispatch(Isloading(false)); 
          return true;
        } else if (refreshToken) {
          // Attempt to refresh the token here
          const response = await dispatch(generateToken(refreshToken));
          
          if (response && response.accessToken) {
            // Save new access token to AsyncStorage
            await AsyncStorage.setItem("token", response.accessToken);
            dispatch(Isloading(false));
            return true;
          } else {
            dispatch(logoutSuccess()); // Log out if refresh token fails
            dispatch(Isloading(false));
          }
        } else {
          dispatch(logoutSuccess()); // Log out if no token found
          dispatch(Isloading(false));
        }
      } else {
        console.log("User is not logged in, hiding loader");
        dispatch(Isloading(false)); 
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      dispatch(Isloading(false));
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
        color={Theme.themeColor}
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
