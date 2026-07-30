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
import { Platform, Linking, Alert } from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { CHILD_SAFETY_STANDARDS_URL, CHILD_SAFETY_EMAIL } from "../infrastructure/constants";

const UselessTextInput = (props) => {
  return <TextInput {...props} editable maxLength={1000} />;
};

const Reportscreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [value, onChangeText] = React.useState({
    report: "",
  });
  const [reportType, setReportType] = React.useState("general");

  const onHandleSubmit = async () => {
    if (!value.report.trim()) {
      dispatch(
        ErrorToggle({
          msg: "Please provide details for your report",
          type: "error",
          toggle: true,
        })
      );
      return;
    }

    const reportText = reportType === "general" 
      ? value.report 
      : `[${reportType.toUpperCase()}] ${value.report}`;

    const res = await reportIssue(reportText);
    dispatch(
      ErrorToggle({
        msg: "Report Submitted Successfully",
        type: "success",
        toggle: true,
      })
    );
    navigation.replace("Dashboard");
  };

  const handleChildSafetyReport = (category) => {
    Alert.alert(
      "Report Child Safety Concern",
      `You are about to report a ${category} concern. This will be reviewed immediately by our safety team.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            setReportType(category.toLowerCase().replace(/\s+/g, "_"));
            onChangeText({ report: `Category: ${category}\n\n` });
          },
        },
      ]
    );
  };

  const openSafetyStandards = () => {
    Linking.openURL(CHILD_SAFETY_STANDARDS_URL).catch((err) => {
      Alert.alert("Error", "Unable to open safety standards page. Please check your internet connection.");
    });
  };

  const openChildSafetyEmail = () => {
    Linking.openURL(`mailto:${CHILD_SAFETY_EMAIL}?subject=Child Safety Concern`).catch((err) => {
      Alert.alert("Error", "Unable to open email client.");
    });
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
            <Image source={Logo} alt="Indiyoura" />
          </View>

          {/* Child Safety Reporting Section */}
          <View
            style={{
              backgroundColor: "#FFF3CD",
              borderLeftWidth: 4,
              borderLeftColor: "#FFC107",
              padding: 16,
              marginHorizontal: 10,
              marginTop: 15,
              marginBottom: 20,
              borderRadius: 4,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <MaterialIcon name="security" size={20} color="#856404" />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#856404",
                  marginLeft: 8,
                }}
              >
                Report Child Safety Concern
              </Text>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: "#856404",
                marginBottom: 12,
                lineHeight: 18,
              }}
            >
              If you encounter content involving child safety issues, please report immediately:
            </Text>
            
            <View style={{ marginBottom: 12 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 4,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#FFC107",
                }}
                onPress={() => handleChildSafetyReport("Child Sexual Abuse Material (CSAM)")}
              >
                <Text style={{ fontSize: 14, color: "#856404", fontWeight: "600" }}>
                  🚨 CSAM / Child Exploitation
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 4,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#FFC107",
                }}
                onPress={() => handleChildSafetyReport("Inappropriate Content Involving Minors")}
              >
                <Text style={{ fontSize: 14, color: "#856404", fontWeight: "600" }}>
                  ⚠️ Inappropriate Content
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 4,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "#FFC107",
                }}
                onPress={() => handleChildSafetyReport("Grooming or Predatory Behavior")}
              >
                <Text style={{ fontSize: 14, color: "#856404", fontWeight: "600" }}>
                  🛡️ Grooming / Predatory Behavior
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <TouchableOpacity
                onPress={openSafetyStandards}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <MaterialIcon name="description" size={16} color="#856404" />
                <Text style={{ fontSize: 12, color: "#856404", marginLeft: 4, textDecorationLine: "underline" }}>
                  View Safety Standards
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={openChildSafetyEmail}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <MaterialIcon name="email" size={16} color="#856404" />
                <Text style={{ fontSize: 12, color: "#856404", marginLeft: 4, textDecorationLine: "underline" }}>
                  Email Directly
                </Text>
              </TouchableOpacity>
            </View>
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
