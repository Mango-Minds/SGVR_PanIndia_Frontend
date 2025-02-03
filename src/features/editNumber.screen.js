import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Checkbox } from "react-native-paper";
import { SafeArea } from "../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  FormSectionSubtitle,
  FormSectionTitle,
  MainContainer,
  LoginInputField,
} from "../styles/prelogin.styles";
import Theme from "../styles/theme";
const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginTop: "20%",
  },
});

export default function EditNumberScreen({ navigation }) {
  return (
    <SafeArea>
      <MainContainer>
        <Image
          style={styles.logo}
          source={require("../assets/images/pre-login/logo-small.png")}
        />

        <FormSection>
          <FormSectionTitle>Change Phone Number</FormSectionTitle>
          <FormSectionSubtitle>
            We have send verification code to your mobile number
          </FormSectionSubtitle>
          <LoginInputField
            placeholderTextColor="#9B9B9B"
            underlineColor="transparent"
            borderBottomWidth={0}
            autoCapitalize="none"
            placeholder="Phone No."
            selectionColor={Theme.themeColor}
            activeUnderlineColor={Theme.themeColor}
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
