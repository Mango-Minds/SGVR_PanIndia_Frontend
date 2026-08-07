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
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { loadingInBtn } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [phone, setPhone] = useState("");

  const forgotPassword = async () => {
    if (!phone) {
      dispatch(
        ErrorToggle({
          toggle: true,
          msg: t("enter_phone_or_email"),
          type: "error",
        })
      );
      return;
    }

    dispatch(setLoadingInBtn(true));
    try {
      const res = await axios.post(
        BASEAPIURL + "/user/forgot-password/verify-user",
        {
          phone: phone,
        }
      );

      if (res.data.status === 0) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: t("user_verified_set_password"),
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
            msg: res.data.message || t("user_not_found"),
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
            msg: msg || t("user_not_found"),
            type: "error",
          })
        );
      } else {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: t("try_again_error"),
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
              <FormSectionTitle>{t("forgot_password_title")}</FormSectionTitle>
              <FormSectionSubtitle>
                {t("forgot_password_subtitle")}
              </FormSectionSubtitle>
              <LoginInputField
                placeholderTextColor="#9B9B9B"
                underlineColor="transparent"
                borderBottomWidth={0}
                autoCapitalize="none"
                placeholder={t("email_phone_username")}
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                value={phone}
                keyboardType="default"
                onChangeText={(e) => setPhone(e)}
                returnKeyType="done"
                blurOnSubmit={true}
              />

              <FormButton onPress={forgotPassword}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  {loadingInBtn ? (
                    <ActivityIndicator
                      style={{
                        display: "flex",
                        alignSelf: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                      }}
                      color={"white"}
                    />
                  ) : (
                    t("continue")
                  )}
                </Text>
              </FormButton>
            </FormSection>
            <BottomText style={{ marginTop: 30, marginBottom: 30 }}>
              {t("go_back_to")}{" "}
              <ForgotText
                onPress={() => {
                  navigation.navigate("Login");
                }}
                style={{ color: "#4191DF", fontSize: 13 }}
              >
                {t("login")}
              </ForgotText>
            </BottomText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
}
