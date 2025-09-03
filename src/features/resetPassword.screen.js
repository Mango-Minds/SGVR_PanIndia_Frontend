import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Theme from "../styles/theme";
import { Checkbox } from "react-native-paper";
import { SafeArea } from "../components/utility/safe-area.component";
import {
  FormButton,
  FormSection,
  FormSectionSubtitle,
  FormSectionTitle,
  LoginInputField,
} from "../styles/prelogin.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { ErrorToggle, setLoadingInBtn } from "../store/user";
import { changeForgotPassword } from "../services/auth.service";

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
    marginTop: "20%",
  },
});

export default function ResetPasswordScreen({ route, navigation }) {
  const { loadingInBtn } = useSelector((state) => state.user);

  const [hidePass, setHidePass] = useState(true);
  const [hideConfirmPass, setHideConfirmPass] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { userid } = route.params;
  const dispatch = useDispatch();

  const handleShowPassword = () => {
    setHidePass((prevState) => !prevState);
  };

  const handleShowConfirmPassword = () => {
    setHideConfirmPass((prevState) => !prevState);
  };

  const handleSignUp = async () => {
    if (password !== "" && confirmPassword !== "") {
      if (password !== confirmPassword) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "Password and Confirm Password does not match",
            type: "error",
          })
        );
      } else {
        const data = {
          phone: route.params.phone,
          newPassword: password,
        };
        dispatch(setLoadingInBtn(true));
        const res = await changeForgotPassword(data);
        dispatch(setLoadingInBtn(false));
        if (res.status === 0) {
          dispatch(
            ErrorToggle({
              toggle: true,
              msg: "Password changed successfully",
              type: "success",
            })
          );
          navigation.navigate("Login");
        } else {
          dispatch(
            ErrorToggle({
              toggle: true,
              msg: res.message || "Failed to change password",
              type: "error",
            })
          );
        }
      }
    } else {
      dispatch(
        ErrorToggle({
          toggle: true,
          msg: "Password and Confirm Password field cannot be empty",
          type: "error",
        })
      );
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
          <FormSectionTitle>Reset Password</FormSectionTitle>
          <FormSectionSubtitle>Please set the new password</FormSectionSubtitle>

          <View style={{ position: "relative" }}>
            <LoginInputField
              placeholderTextColor="#9B9B9B"
              underlineColor="transparent"
              placeholder="New Password"
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              secureTextEntry={hidePass ? true : false}
              onChangeText={(text) => setPassword(text)}
              value={password}
              returnKeyType="next"
              blurOnSubmit={false}
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

          <View style={{ position: "relative" }}>
            <LoginInputField
              placeholderTextColor="#9B9B9B"
              underlineColor="transparent"
              placeholder="Confirm Password"
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              secureTextEntry={hideConfirmPass ? true : false}
              onChangeText={(text) => setConfirmPassword(text)}
              value={confirmPassword}
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
              <TouchableOpacity onPress={handleShowConfirmPassword}>
                {!hideConfirmPass ? (
                  <Icon name="eye-outline" size={20} />
                ) : (
                  <Icon name="eye-off-outline" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <FormButton onPress={handleSignUp}>
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
                "Change Password"
              )}
            </Text>
          </FormButton>
        </FormSection>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
}
