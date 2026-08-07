import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Checkbox } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { SafeArea } from "../components/utility/safe-area.component";
import {
  BottomText,
  CheckboxContainer,
  ForgotText,
  FormButton,
  FormSection,
  FormSectionSubtitle,
  FormSectionTitle,
  LoginInputField,
} from "../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ErrorToggle, IsBttnloading, login, enterGuestMode } from "../store/user";
import { useDispatch, useSelector } from "react-redux";
import Theme from "../styles/theme";
import { BASEAPIURL } from "../infrastructure/constants";
const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginTop: "10%",
  },
  logoText: {
    alignSelf: "center",
    marginTop: "10%",
    fontSize: 36,
    fontWeight: "bold",
    color: Theme.themeColor,
    letterSpacing: 1,
    textAlign: "center",
  },
});

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loadingInBtn } = useSelector((state) => state.user);
  const [tcCheck, setTcCheck] = React.useState(true);
  const [hidePass, setHidePass] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleShowPassword = () => {
    setHidePass((prevState) => !prevState);
  };

  const handleLogin = async () => {
    try {
      if (!email) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: t("enter_correct_email"),
            type: "error",
          })
        );
        return;
      }
      if (!password) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: t("enter_password"),
            type: "error",
          })
        );
        return;
      }
      if (!tcCheck) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: t("must_agree_terms"),
            type: "error",
          })
        );
        return;
      }
      await dispatch(IsBttnloading(true));
      const data = await dispatch(login({ email, password, isAdmin: "false" }));
      console.log("BASEAPIURL: ", BASEAPIURL);
      await dispatch(IsBttnloading(false));
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
              source={require("../assets/images/pre-login/indiayoua-smallLogo.png")}
            />
            <FormSection>
              <FormSectionTitle>{t("login")}</FormSectionTitle>

              <FormSectionSubtitle>{t("login_subtitle")}</FormSectionSubtitle>

              <LoginInputField
                placeholderTextColor="#9B9B9B"
                underlineColor="transparent"
                borderBottomWidth={0}
                autoCapitalize="none"
                placeholder={t("email_or_phone")}
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                onChangeText={(e) => setEmail(e)}
                value={email}
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <View style={{ position: "relative" }}>
                <LoginInputField
                  placeholderTextColor="#9B9B9B"
                  underlineColor="transparent"
                  placeholder={t("password")}
                  selectionColor={Theme.themeColor}
                  activeUnderlineColor={Theme.themeColor}
                  secureTextEntry={hidePass ? true : false}
                  onChangeText={(e) => setPassword(e)}
                  value={password}
                  returnKeyType="done"
                  blurOnSubmit={true}
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
                {t("forgot_password")}
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
                  {t("agree_terms_prefix")}{" "}
                  <ForgotText style={{ color: Theme.themeColor, fontSize: 16 }}>
                    {t("terms_and_conditions_link")}
                  </ForgotText>
                </FormSectionSubtitle>
              </CheckboxContainer>
              <FormButton onPress={handleLogin}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  {loadingInBtn === true ? (
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
                    t("login")
                  )}
                </Text>
              </FormButton>
              <TouchableOpacity
                onPress={() => dispatch(enterGuestMode())}
                style={{ marginTop: 16, alignItems: "center" }}
              >
                <Text
                  style={{
                    color: Theme.themeColor,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {t("continue_without_account")}
                </Text>
              </TouchableOpacity>
            </FormSection>

            <BottomText style={{ marginTop: 30, marginBottom: 20 }}>
              {t("no_account")}{" "}
              <ForgotText
                onPress={() => {
                  navigation.navigate("Register");
                }}
                style={{
                  color: Theme.themeColor,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {t("signup")}
              </ForgotText>
            </BottomText>
            <BottomText style={{ marginTop: 0, marginBottom: 30 }}>
              {t("having_trouble_login")}{" "}
              <ForgotText
                onPress={() => {
                  navigation.navigate("Contactus");
                }}
                style={{
                  color: Theme.themeColor,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {t("contact_us")}
              </ForgotText>
            </BottomText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
}
