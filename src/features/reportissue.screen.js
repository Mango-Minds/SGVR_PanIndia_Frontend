import React from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  Pressable,
} from "react-native";
import Theme from "../styles/theme";
import Logo from "../assets/images/pre-login/newLogo-med.png";
import { IconButton } from "react-native-paper";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../store/user";
import { reportIssue } from "../services/auth.service";
import { Platform } from "react-native";
const UselessTextInput = (props) => {
  return <TextInput {...props} editable maxLength={1000} />;
};

const Reportscreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [value, onChangeText] = React.useState({
    report: "",
  });

  const onHandleSubmit = async () => {
    const res = await reportIssue(value.report);
    dispatch(
      ErrorToggle({
        msg: "Report Submitted Successfully",
        type: "success",
        toggle: true,
      })
    );
    navigation.replace("Dashboard");
  };

  return (
    <View
      style={{
        padding: 10,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={true}
      >
        <View style={{ paddingTop: 30, paddingVertical: 16 }}>
          <IconButton
            icon="chevron-left"
            size={30}
            onPress={() => navigation.goBack()}
          />
        </View>
        <ScrollView>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 0,
              padding: 10,
            }}
          >
            <Image source={Logo} alt="Pan India" />
          </View>

          <View
            style={{
              marginTop: 15,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: Theme.themeColor,
              }}
            >
              Any Issue / Feedback For Us???
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#C4C4C4",
                marginTop: 2,
              }}
            >
              Please Share With Us Below..
            </Text>
          </View>
          <View
            style={{
              marginTop: 15,
            }}
            onPress={Keyboard.dismiss}
          >
            <UselessTextInput
              multiline
              numberOfLines={3}
              name="report"
              placeholder="Write to us here.."
              onChangeText={(report) => onChangeText({ report })}
              value={value.report}
              style={{
                padding: 10,
                borderColor: Theme.themeColor,
                borderWidth: 1,
                borderRadius: 5,
                height: 100,
                color: "gray",
                fontWeight: "500",
              }}
            />

            <TouchableOpacity activeOpacity={1}>
              <View
                style={{
                  marginTop: 30,
                  borderRadius: 5,
                }}
              >
                <Pressable
                  style={{
                    padding: "3.5%",
                    backgroundColor: Theme.themeColor,
                  }}
                  onPress={onHandleSubmit}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "white",
                      textAlign: "center",
                    }}
                  >
                    Submit
                  </Text>
                </Pressable>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Reportscreen;
