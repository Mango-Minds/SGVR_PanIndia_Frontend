import axios from "axios";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeArea } from "../components/utility/safe-area.component";
import { BASEAPIURL } from "../infrastructure/constants";
import { ErrorToggle, setLoadingInBtn } from "../store/user";
import {
  FormButton,
  FormSection,
  FormSectionSubtitle,
  FormSectionTitle,
  LoginInputField,
  BottomText,
  ForgotText,
} from "../styles/prelogin.styles";
import Theme from "../styles/theme";
const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginTop: "20%",
  },
});

export default function ForgotPasswordScreen({ navigation }) {
  const { loadingInBtn } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [phone, setPhone] = useState("");

  const forgotPassword = async () => {
    if (!phone) {
      dispatch(
        ErrorToggle({
          toggle: true,
          msg: "Please enter your phone number or email",
          type: "error",
        })
      );
      return;
    }

    dispatch(setLoadingInBtn(true));
    try {
      // Skip OTP verification and go directly to reset password
      const res = await axios.post(BASEAPIURL + "/user/forgot-password/verify-user", {
        phone: phone,
      });

      if (res.data.status === 0) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "User verified successfully. Please set your new password.",
            type: "success",
          })
        );
        dispatch(setLoadingInBtn(false));
        navigation.navigate("ResetPassword", {
          userid: res.data.userId,
          phone: phone,
        });
      } else {
        dispatch(setLoadingInBtn(false));
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: res.data.message || "User not found",
            type: "error",
          })
        );
      }
    } catch (err) {
      dispatch(setLoadingInBtn(false));
      const status = err.response?.data?.status;
      const msg = err.response?.data?.message;
      if (status === 1) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: msg || "User not found",
            type: "error",
          })
        );
      } else {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "There was some error. Please try again!",
            type: "error",
          })
        );
      }
    }
  };
  return (
    <SafeArea>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
        <Image
          style={styles.logo}
          source={require("../assets/images/pre-login/miLogo-small.png")}
        />

        <FormSection>
          <FormSectionTitle>Forgot Password</FormSectionTitle>
          <FormSectionSubtitle>
            Please Enter Your Phone Number or Email
          </FormSectionSubtitle>
          <LoginInputField
            placeholderTextColor="#9B9B9B"
            underlineColor="transparent"
            borderBottomWidth={0}
            autoCapitalize="none"
            placeholder="Email/ Phone/ username"
            selectionColor={Theme.themeColor}
            activeUnderlineColor={Theme.themeColor}
            value={phone}
            keyboardType="default"
            onChangeText={(e) => setPhone(e)}
            returnKeyType="done"
            blurOnSubmit={true}
          />

          <FormButton onPress={forgotPassword}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              {loadingInBtn ? (
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
                "Continue"
              )}
            </Text>
          </FormButton>
        </FormSection>
        <BottomText style={{ marginTop: 30, marginBottom: 30 }}>
          Go back to{" "}
          <ForgotText
            onPress={() => {
              navigation.navigate("Login");
            }}
            style={{ color: "#4191DF", fontSize: 13 }}
          >
            Login
          </ForgotText>
        </BottomText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
}
