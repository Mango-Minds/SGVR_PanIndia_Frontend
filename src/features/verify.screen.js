import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeArea } from "../components/utility/safe-area.component";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

const styleNew = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  title: { fontSize: 30 },
  codeFieldRoot: { marginTop: 20, justifyContent: "flex-start" },
  cell: {
    marginRight: 16,
    width: 51,
    height: 51,
    fontSize: 24,
    borderWidth: 2,
    borderRadius: 4,
    lineHeight: 44,
    backgroundColor: "#F0F0F0",
    borderColor: "#E6E6E6",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "gray",
  },
  focusCell: {
    borderColor: "#e5e5e5",
  },
});

const CELL_COUNT = 4;

import {
  BottomText,
  EditMobileText,
  EnterCodeText,
  ForgotText,
  FormButton,
  FormSection,
  FormSectionTitle,
  MainContainer,
  MobileText,
  Row,
  VerificationSectionSubtitle,
} from "../styles/prelogin.styles";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ErrorToggle,
  login,
  setLoading,
  setLoadingInBtn,
  verifyOTP,
} from "../store/user";
import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginTop: "20%",
  },
  input: {
    marginTop: 24,
    backgroundColor: "#F0F0F0",
    borderColor: "#E6E6E6",
    borderRadius: 4,
  },
});
export default function VerifyScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { loadingInBtn } = useSelector((state) => state.user);

  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const dispatch = useDispatch();
  const { phone, id, type } = route.params;
  const [disabled, setDisabled] = useState(true);
  const [otpid, setOtpid] = useState(id);

  // create timer for 60 seconds
  const [time, setTime] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((time) => time - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const signUpHandler = async () => {
    try {
      const body = {
        otp: value,
        id: otpid,
        type: type,
      };
      await dispatch(setLoadingInBtn(true));
      const data = await dispatch(verifyOTP(body));
      await dispatch(setLoadingInBtn(false));
      if (
        (data.status === 0 && type === "login") ||
        (data.status === 0 && type === "register")
      ) {
        const { password } = route.params;
        await dispatch(setLoading(true));
        await dispatch(login({ email: phone, password }));
        await dispatch(setLoading(false));
        return;
      } else if (data.status === 0 && type !== "forgot") {
        navigation.navigate("Login");
      } else if (data.status === 0 && type === "forgot") {
        navigation.navigate("ResetPassword", {
          userid: data.user,
        });
      } else {
        dispatch(
          ErrorToggle({
            toggle: true,
            message: data.message,
            type: "error",
          })
        );
      }
      setValue("");
    } catch (error) {
      await dispatch(setLoadingInBtn(false));
      await dispatch(
        ErrorToggle({
          toggle: true,
          msg: t("something_went_wrong"),
          type: "error",
        })
      );
      setValue("");
      navigation.navigate("Login");
    }
  };

  const resendOTP = async () => {
    try {
      setTime(60);
      axios
        .post(BASEAPIURL + "/user/forgot-password/request-otp", {
          phone: phone,
        })
        .then((res) => {
          if (res.data.status === 0) {
            dispatch(
              ErrorToggle({
                toggle: true,
                msg: t("otp_sent"),
                type: "success",
              })
            );
            setOtpid(res.data.data.id);
            const interval = setInterval(() => {
              setTime((time) => time - 1);
            }, 1000);
          } else {
            setTime(0);
            dispatch(
              ErrorToggle({
                toggle: true,
                msg: data.msg,
                type: "error",
              })
            );
          }
        });
    } catch (error) {
      setTime(0);
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
          <FormSectionTitle>{t("user_verification")}</FormSectionTitle>
          <VerificationSectionSubtitle>
            {t("enter_otp_sent")}
          </VerificationSectionSubtitle>
          <Row style={{ justifyContent: "space-between" }}>
            <MobileText>+91 {phone}</MobileText>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("ForgotPassword");
              }}
            >
              <EditMobileText>{t("edit_number")}</EditMobileText>
            </TouchableOpacity>
          </Row>

          <EnterCodeText>{t("enter_the_code")}</EnterCodeText>

          <CodeField
            ref={ref}
            {...props}
            // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
            value={value}
            caretHidden={false}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styleNew.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <Text
                key={index}
                style={[styleNew.cell, isFocused && styleNew.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            )}
          />

          <Row style={{ justifyContent: "space-between" }}>
            {time <= 0 && (
              <TouchableOpacity onPress={resendOTP}>
                <EditMobileText style={time > 0 && { color: "grey" }}>
                  {t("resend_otp")}
                </EditMobileText>
              </TouchableOpacity>
            )}
            {time > 0 && (
              <MobileText>
                {t("resend_otp_in", {
                  time: time < 10 ? "0" + time : String(time),
                })}
              </MobileText>
            )}
          </Row>
          <KeyboardAvoidingView behavior="height" enabled>
            <FormButton onPress={signUpHandler}>
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
                  t("verify_otp")
                )}
              </Text>
            </FormButton>
          </KeyboardAvoidingView>
        </FormSection>
      </MainContainer>
    </SafeArea>
  );
}
