import React from "react";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "../services/auth.header";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../store/user";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { LoginInputField } from "../styles/prelogin.styles";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Logo from "../assets/images/pre-login/miLogo-small.png";
import { TopText } from "../styles/social.styles";
import { Divider, IconButton } from "react-native-paper";
import { changePassword } from "../services/auth.service";
import Theme from "../styles/theme";
export default function ChangePassword({ navigation }) {
  const dispatch = useDispatch();
  const [hidePass, setHidePass] = React.useState(true);
  const [changepassword, setChangepassword] = React.useState({
    oldpassword: "",
    password: "",
    cpassword: "",
  });
  const handleShowPassword = () => {
    setHidePass((prevState) => !prevState);
  };

  const onHandlesubmit = async () => {
    if (!changepassword.oldpassword || !changepassword.password || !changepassword.cpassword) {
      dispatch(
        ErrorToggle({
          toggle: true,
          msg: "Please fill all fields",
          type: "error",
        })
      );
      return;
    }

    if (changepassword.password !== changepassword.cpassword) {
      dispatch(
        ErrorToggle({
          toggle: true,
          msg: "New password and confirm password do not match",
          type: "error",
        })
      );
      return;
    }

    try {
      const res = await changePassword({
        oldPassword: changepassword.oldpassword,
        newPassword: changepassword.password
      });
      
      if (res.status === 0) {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: "Password Changed Successfully",
            type: "success",
          })
        );
        navigation.navigate("Dashboard");
      } else {
        dispatch(
          ErrorToggle({
            toggle: true,
            msg: res.message || "Failed to change password",
            type: "error",
          })
        );
      }
    } catch (err) {
      dispatch(
        ErrorToggle({
          toggle: true,
          msg: err.response?.data?.message || "Something went wrong",
          type: "error",
        })
      );
    }
  };
  return (
    <View
      style={{
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 50,
      }}
    >
      <View
        style={{
          alignItems: "center",
          paddingVertical: 16,
          flexDirection: "row",
        }}
      >
        <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
        <TopText style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}>
          Change Password
        </TopText>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 30,
          marginBottom: 50,
        }}
      >
        <Image source={Logo} />
      </View>
      <View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "500",
            marginBottom: 15,
            color: "#999999",
          }}
        >
          Change Your Password Below..
        </Text>
      </View>
      <Divider />
      <View style={{ position: "relative" }}>
        <LoginInputField
          placeholderTextColor="#9B9B9B"
          underlineColor="transparent"
          placeholder="Old Password*"
          selectionColor={Theme.themeColor}
          activeUnderlineColor={Theme.themeColor}
          value={changepassword.oldpassword}
          secureTextEntry={hidePass ? true : false}
          onChangeText={(text) =>
            setChangepassword({ ...changepassword, oldpassword: text })
          }
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
          placeholder="New Password*"
          selectionColor={Theme.themeColor}
          activeUnderlineColor={Theme.themeColor}
          value={changepassword.password}
          secureTextEntry={hidePass ? true : false}
          onChangeText={(text) =>
            setChangepassword({ ...changepassword, password: text })
          }
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
          placeholder="Confirm Password*"
          selectionColor={Theme.themeColor}
          activeUnderlineColor={Theme.themeColor}
          value={changepassword.cpassword}
          secureTextEntry={hidePass ? true : false}
          onChangeText={(text) =>
            setChangepassword({ ...changepassword, cpassword: text })
          }
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
      <TouchableOpacity
        style={{
          marginTop: 30,
          marginBottom: 30,
          backgroundColor: Theme.themeColor,
          borderRadius: 10,
          padding: 10,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: 50,
          elevation: 3,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
        }}
        onPress={onHandlesubmit}
      >
        <View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#fff",
            }}
          >
            Change Password
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
