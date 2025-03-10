import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Checkbox } from "react-native-paper";
import { SafeArea } from "../components/utility/safe-area.component";
import {
  BottomText,
  CheckboxContainer,
  ForgotText,
  FormButton,
  FormSection,
  FormSectionSubtitle,
  FormSectionTitle,
  MainContainer,
  LoginInputField,
} from "../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ErrorToggle, IsBttnloading, login } from "../store/user";
import { useDispatch, useSelector } from "react-redux";
import Theme from "../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginTop: "10%",
  },
});

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loadingInBtn } = useSelector((state) => state.user);
  const [tcCheck, setTcCheck] = React.useState(true);
  const [hidePass, setHidePass] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAnimation, setLoadingAnimation] = useState(false);

  const handleShowPassword = () => {
    setHidePass((prevState) => !prevState);
  };

  // const handleLogin = async () => {
  //   try {
  //     if (!email) {
  //       dispatch(
  //         ErrorToggle({
  //           toggle: true,
  //           msg: "Enter your correct email",
  //           type: "error",
  //         })
  //       );
  //       return;
  //     }
  //     if (!password) {
  //       dispatch(
  //         ErrorToggle({
  //           toggle: true,
  //           msg: "Enter your password",
  //           type: "error",
  //         })
  //       );
  //       return;
  //     }
  //     if (!tcCheck) {
  //       dispatch(
  //         ErrorToggle({
  //           toggle: true,
  //           msg: "You must agree to the terms and conditions",
  //           type: "error",
  //         })
  //       );
  //       return;
  //     }
  //     await dispatch(IsBttnloading(true));
  //     const data = await dispatch(login({ email, password, isAdmin: "false" }));
  //     await dispatch(IsBttnloading(false));
  //     if (data !== true)
  //       if (data.msgCode === 1) {
  //         navigation.navigate("Register");
  //       } else if (data.msgCode === 4) {
  //       } else if (data.msgCode === 5) {
  //         navigation.navigate("Verify", {
  //           phone: data.phone,
  //           id: data.data.id,
  //           password: password,
  //           type: "login",
  //         });
  //       }
  //   } catch (err) {
  //     console.log("Error");
  //     console.log(err);
  //     dispatch(IsBttnloading(false));
  //     dispatch(ErrorToggle({ toggle: true, msg: err.message, type: "error" }));
  //   }
  // };

  const handleLogin = async () => {
    try {
      if (!email) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "Enter your correct email",
            type: "error",
          })
        );
        return;
      }
      if (!password) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "Enter your password",
            type: "error",
          })
        );
        return;
      }
      if (!tcCheck) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "You must agree to the terms and conditions",
            type: "error",
          })
        );
        return;
      }
  
      await dispatch(IsBttnloading(true));
      
      const data = await dispatch(login({ email, password, isAdmin: "false" }));
      
      await dispatch(IsBttnloading(false));
  
      if (data !== true) {
        if (data.msgCode === 1) {
          navigation.navigate("Register");
        } else if (data.msgCode === 4) {
          // Handle case where msgCode is 4
        } else if (data.msgCode === 5) {
          navigation.navigate("Verify", {
            phone: data.phone,
            id: data.data.id,
            password: password,
            type: "login",
          });
        }
        return;
      }
  
      
      const userData = {
        email,
        token: data.token,
        user: data.user,  // Storing the user object
      };
      
  
    } catch (err) {
      console.log("Login Error:", err);
      dispatch(IsBttnloading(false));
      dispatch(ErrorToggle({ toggle: true, msg: err.message, type: "error" }));
    }
  };
  const logAsyncStorageData = async () => {
    try {
     

      const allKeys = await AsyncStorage.getAllKeys();
      console.log("All Keys in AsyncStorage: ", allKeys);
      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`Key: ${key}, Value: ${value}`);
      }
    } catch (error) {
      console.error("Error reading AsyncStorage: ", error);
    }
  };
  logAsyncStorageData();

  const handleAdminLogin = async () => {
    try {
      if (!email) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "Enter your correct email",
            type: "error",
          })
        );
        return;
      }
      if (!password) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "Enter your password",
            type: "error",
          })
        );
        return;
      }
      if (!tcCheck) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "You must agree to the terms and conditions",
            type: "error",
          })
        );
        return;
      }
      setLoadingAnimation(true);
      const data = await dispatch(login({ email, password, isAdmin: "true" }));
      setLoadingAnimation(false);
      if (data !== true)
        if (data.msgCode === 1) {
          navigation.navigate("Register");
        } else if (data.msgCode === 4) {
        } else if (data.msgCode === 5) {
          navigation.navigate("Verify", {
            phone: data.phone,
            id: data.data.id,
            password: password,
            type: "login",
          });
        }
    } catch (err) {
      console.log("Error");
      console.log(err);
      dispatch(IsBttnloading(false));
      dispatch(ErrorToggle({ toggle: true, msg: err.message, type: "error" }));
    }
  };

  return (
    <SafeArea>
      <MainContainer>
        <Image
          style={styles.logo}
          source={require("../assets/images/pre-login/miLogo-small.png")}
        />

        <FormSection>
          <FormSectionTitle>Login</FormSectionTitle>

          <FormSectionSubtitle>Please sign in to continue</FormSectionSubtitle>

          <LoginInputField
            placeholderTextColor="#9B9B9B"
            underlineColor="transparent"
            borderBottomWidth={0}
            autoCapitalize="none"
            placeholder="Email or Phone No."
            selectionColor={Theme.themeColor}
            activeUnderlineColor={Theme.themeColor}
            onChangeText={(e) => setEmail(e)}
            value={email}
          />

          <View style={{ position: "relative" }}>
            <LoginInputField
              placeholderTextColor="#9B9B9B"
              underlineColor="transparent"
              placeholder="Password"
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              secureTextEntry={hidePass ? true : false}
              onChangeText={(e) => setPassword(e)}
              value={password}
            />
            <View
              style={{
                position: "absolute",
                top: "51%",
                right: "5%",
                elevation: 3,
              }}
            >
              <TouchableOpacity onPress={handleShowPassword}>
                {!hidePass ? (
                  <Icon name="eye-outline" size={20} />
                ) : (
                  <Icon name="eye-off-outline" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ForgotText
            style={{ marginTop: 16 }}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            Forgot Password?
          </ForgotText>

          <CheckboxContainer>
            <Checkbox
              uncheckedColor={Theme.themeColor}
              color={Theme.themeColor}
              status={tcCheck ? "checked" : "unchecked"}
              onPress={() => setTcCheck(!tcCheck)}
            />
            <FormSectionSubtitle
              onPress={() => {
                navigation.navigate("TermsAndConditions");
              }}
            >
              I agree to the{" "}
              <ForgotText style={{ color: Theme.themeColor, fontSize: 16 }}>
                terms & Conditions
              </ForgotText>
            </FormSectionSubtitle>
          </CheckboxContainer>
          <FormButton onPress={handleLogin}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              {loadingInBtn === true ? (
                <ActivityIndicator
                  style={{
                    display: "flex",
                    alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                  }}
                  // size={"large"}
                  color={"white"}
                />
              ) : (
                "Login"
              )}
            </Text>
          </FormButton>
          <FormButton onPress={handleAdminLogin}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              {loadingAnimation === true ? (
                <ActivityIndicator
                  style={{
                    display: "flex",
                    alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                  }}
                  // size={"large"}
                  color={"white"}
                />
              ) : (
                "Login as Super Admin"
              )}
            </Text>
          </FormButton>
        </FormSection>

        <BottomText style={{ marginTop: 30, marginBottom: 20 }}>
          Don’t have an account?{" "}
          <ForgotText
            onPress={() => {
              navigation.navigate("Register");
            }}
            style={{ color: Theme.themeColor, fontSize: 14, fontWeight: "600" }}
          >
            Signup
          </ForgotText>
        </BottomText>
        <BottomText style={{ marginTop: 0, marginBottom: 30 }}>
          Having Trouble with Login ?{" "}
          <ForgotText
            onPress={() => {
              navigation.navigate("Contactus");
            }}
            style={{ color: Theme.themeColor, fontSize: 14, fontWeight: "600" }}
          >
            Contact Us
          </ForgotText>
        </BottomText>
      </MainContainer>
    </SafeArea>
  );
}
