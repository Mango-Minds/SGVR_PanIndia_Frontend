import React, { useState, useRef } from "react";
import { Image, Text, StyleSheet } from "react-native";
import { SafeArea } from "../components/utility/safe-area.component";
import PhoneInput from "react-native-phone-number-input";

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
  LoginInputField,
  MainContainer,
  MobileText,
  Row,
  VerificationSectionSubtitle,
} from "../styles/prelogin.styles";

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
export default function ReverifyScreen() {
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  // const [valid, setValid] = useState(false);
  // const [showMessage, setShowMessage] = useState(false);
  const phoneInput = useRef(null);

  return (
    <SafeArea>
      <MainContainer>
        <Image
          style={styles.logo}
          source={require("../assets/images/pre-login/logo-small.png")}
        />

        <FormSection>
          <FormSectionTitle>Verification Code</FormSectionTitle>
          <VerificationSectionSubtitle>
            We have sent a verification code to your mobile number
          </VerificationSectionSubtitle>

          {/* <LoginInputField
            selectionColor="#d4af37"
            activeUnderlineColor="#d4af37"
            style={styles.input}
            placeholder="Phone no."
            underlineColor="transparent"
            placeholderTextColor="#9B9B9B"
            keyboardType="numeric"
            maxLength={10}
            onChangeText={(text) => setRegisterDetails({ ...registerDetails, phone: text })}
          /> */}
          <PhoneInput
            ref={phoneInput}
            defaultValue={value}
            defaultCode="IN"
            layout="second"
            onChangeText={(text) => {
              setRegisterDetails({ ...registerDetails, phone: text });
            }}
            onChangeFormattedText={(text) => {
              setFormattedValue(text);
            }}
            // withDarkTheme
            withShadow
            autoFocus
            codeTextStyle={{ color: "#d4af37" }}
            containerStyle={{ borderRadius: 8, width: "100%", marginTop: 24 }}
            style={{ width: "100%" }}
          />

          <FormButton>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Send OTP
            </Text>
          </FormButton>
        </FormSection>
      </MainContainer>
    </SafeArea>
  );
}
