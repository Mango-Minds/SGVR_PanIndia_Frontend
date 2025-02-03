import axios from "axios";
import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SafeArea } from "../components/utility/safe-area.component";
import { BASEAPIURL } from "../infrastructure/constants";
import { ErrorToggle, setLoadingInBtn } from "../store/user";
import {
  FormButton,
  FormSection,
  FormSectionSubtitle,
  FormSectionTitle,
  MainContainer,
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
    dispatch(setLoadingInBtn(true));
    axios
      .post(BASEAPIURL + "/auth/send-otp", {
        userid: phone,
      })
      .then((res) => {
        if (res.data.status === 0) {
          dispatch(
            ErrorToggle({
              toggle: true,
              msg: "OTP sent to your number",
              type: "success",
            })
          );
          dispatch(setLoadingInBtn(false));
          navigation.navigate("Verify", {
            phone: res.data.data.phone,
            id: res.data.data.id,
            type: "forgot",
          });
        } else {
          dispatch(setLoadingInBtn(false));
          dispatch(
            ErrorToggle({
              toggle: true,
              msg: res.data.msg,
              type: "error",
            })
          );
        }
      })
      .catch((err) => {
        const status = err.response.data.status;
        const msg = err.response.data.message;
        if (status === 1) {
          dispatch(
            ErrorToggle({
              toggle: true,
              msg: msg,
              type: "error",
            })
          );
        } else {
          dispatch(
            ErrorToggle({
              toggle: true,
              msg: "There was some error while sending OTP. Please Try Again!",
              type: "error",
            })
          );
        }
      });
  };
  return (
    <SafeArea>
      <MainContainer>
        <Image
          style={styles.logo}
          source={require("../assets/images/pre-login/logo-small.png")}
        />

        <FormSection>
          <FormSectionTitle>Forgot Password</FormSectionTitle>
          <FormSectionSubtitle>
            Please Enter Details to get OTP
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
                "Send OTP"
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
      </MainContainer>
    </SafeArea>
  );
}
