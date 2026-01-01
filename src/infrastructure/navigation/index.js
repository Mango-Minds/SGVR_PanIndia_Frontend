

import React, { useEffect, useRef } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
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
} from "react-native";
import {
  GetNotification,
  GetSocialData,
} from "../../store/Handlers/Reducer.Handler";
import { logoutSuccess } from "../../store/user";
import Theme from "../../styles/theme";
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

  const { token, loading, error } = userState;

  const errorsize = Platform.OS === "ios" ? 16 : 14;
  const errorVerticalPadding = Platform.OS === "ios" ? 12 : 8;
  const errorMarginBottom = Platform.OS === "ios" ? 20 : 40;
  const errorPaddingTop = Platform.OS === "ios" ? 8 : 0;

  // CRITICAL FIX: If token is null, loading must be false immediately
  // This prevents the loading screen from showing after logout, especially from jewelry module
  const effectiveLoading = !token ? false : loading;

 
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
  
  
 
  
  // Use a ref to track if initialUser has been called to prevent multiple calls
  const initialUserCalledRef = useRef(false);
  
  useEffect(() => {
    // Only call initialUser once on mount
    // This prevents re-initialization after logout or when navigating between modules
    if (!initialUserCalledRef.current) {
      initialUserCalledRef.current = true;
      dispatch(initialUser());
    }
  }, []);

  useEffect(() => {
    const checkLoginAndLoadData = async () => {
      try {
        const isLoggedIn = await IsLoggedIn();
        // Only load social data and notifications if user is logged in
        if (isLoggedIn) {
          dispatch(GetSocialData());
          dispatch(GetNotification());
        }
      } catch (error) {
        dispatch(Isloading(false));
        // return;x/
      }
    };
    checkLoginAndLoadData();
  }, []);

  // Ensure loading is false when token is null (after logout)
  // This is critical for fixing the loading screen issue after logout
  useEffect(() => {
    if (!token && loading) {
      console.log("Token is null but loading is true after logout, setting loading to false");
      dispatch(Isloading(false));
    }
  }, [token, loading]);

  // CRITICAL FIX: Don't show loading screen if token is null (user is logged out)
  // This is especially important when navigating back from jewelry module
  if (effectiveLoading)
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
  
  // Navigation ref to reset navigation state when token becomes null
  const navigationRef = useNavigationContainerRef();
  
  // Reset navigation when token becomes null (after logout)
  useEffect(() => {
    if (!token && navigationRef.isReady()) {
      // Navigation will be handled by the conditional render below
    }
  }, [token]);
  
  // CRITICAL: Separate returns for logged out vs logged in states
  // This ensures clean unmounting/remounting of navigators
  if (!token) {
    return (
      <NavigationContainer ref={navigationRef} key="prelogin-container">
        <PreLoginNavigator key="prelogin" />
        <Snackbar
            visible={error.toggle}
            onDismiss={() =>
              dispatch(
                ErrorToggle({ toggle: false, msg: error.msg, type: error.type })
              )
            }
            action={{
              label: "✕",
              labelStyle: { 
                color: "white", 
                fontSize: 18, 
                fontWeight: "bold" 
              },
              onPress: () => {
                dispatch(
                  ErrorToggle({
                    toggle: false,
                    msg: error.msg,
                    type: error.type,
                  })
                );
              },
            }}
            duration={3000}
            style={{
              backgroundColor: error.type === "Success" ? "#4CAF50" : "#364135",
              marginBottom: errorMarginBottom,
              borderRadius: 8,
            }}
            wrapperStyle={{
              bottom: errorMarginBottom,
              left: 16,
              right: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: Platform.OS === "ios" ? 4 : 2,
              }}
            >
              <Icons
                name={error.type === "Success" ? "check-circle" : "info"}
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: errorsize,
                  fontWeight: Platform.OS === "ios" ? "600" : "normal",
                  flex: 1,
                }}
              >
                {error.msg}
              </Text>
            </View>
          </Snackbar>
      </NavigationContainer>
    );
  }
  
  // User is logged in - show DashboardNavigator
  return (
    <NavigationContainer ref={navigationRef} key="dashboard-container">
      <>
        <DashboardNavigator key="dashboard" />
        <Snackbar
          visible={error.toggle}
          onDismiss={() =>
            dispatch(
              ErrorToggle({ toggle: false, msg: error.msg, type: error.type })
            )
          }
          action={{
            label: "✕",
            labelStyle: { 
              color: "white", 
              fontSize: 18, 
              fontWeight: "bold" 
            },
            onPress: () => {
              dispatch(
                ErrorToggle({
                  toggle: false,
                  msg: error.msg,
                  type: error.type,
                })
              );
            },
          }}
          duration={3000}
          style={{
            backgroundColor: error.type === "Success" ? "#4CAF50" : "#364135",
            marginBottom: errorMarginBottom,
            borderRadius: 8,
          }}
          wrapperStyle={{
            bottom: errorMarginBottom,
            left: 16,
            right: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: Platform.OS === "ios" ? 4 : 2,
            }}
          >
            <Icons
              name={error.type === "Success" ? "check-circle" : "info"}
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: "white",
                fontSize: errorsize,
                fontWeight: Platform.OS === "ios" ? "600" : "normal",
                flex: 1,
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
