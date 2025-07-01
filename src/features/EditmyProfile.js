import React, { useState } from "react";
import { initialUser, setLoadingInBtn } from "../store/user";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";
import Theme from "../styles/theme";
import { editMyProfile } from "../store/user";
import { Provider, RadioButton, IconButton } from "react-native-paper";
import { SafeArea } from "../components/utility/safe-area.component";
import { useSelector, useDispatch } from "react-redux";
import { TopText } from "../styles/social.styles";
import SelectDropdown from "react-native-select-dropdown";
import { ErrorToggle } from "../store/user";
import {
  FormButton,
  MainContainer,
  Row,
  LoginInputField,
} from "../styles/prelogin.styles";
import { statesData } from "../assets/data/statesAndCities";

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
export default function EditProfileDetails({ navigation }) {
  const { user, loadingInBtn } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.user);
  const [date, setDate] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [year, setYear] = React.useState("");

  const dispatch = useDispatch();

  // const stateindex = Object.keys(statesData).indexOf(
  //   user.state.substring(0, 1).toUpperCase() + user.state.substring(1)
  // );

  // const state = Object.keys(statesData)[stateindex];

  const [registerDetails, setRegisterDetails] = useState({
    fname: user.fname,
    midname: user.midname,
    lname: user.lname,
    username: user.username,
    email: user.email,
    phone: user.phone,
    suggestedBy: user.suggestedBy,
    // dob:
    //   new Date(user.dob.split("/").reverse().join("/")).getFullYear() +
    //   "-" +
    //   (new Date(user.dob.split("/").reverse().join("/")).getMonth() + 1) +
    //   "-" +
    //   new Date(user.dob.split("/").reverse().join("/")).getDate(),

    gender: user.gender,
    address: user.address,
    // state: state,
    pincode: user.pincode,
    city: user.city,
  });

  const [selectGender, setSelectGender] = useState(user.gender);
  // const [selectDOB, setSelectedDOB] = useState(
  //   new Date(user.dob.split("/").reverse().join("/")).getFullYear() +
  //     "-" +
  //     (new Date(user.dob.split("/").reverse().join("/")).getMonth() + 1) +
  //     "-" +
  //     new Date(user.dob.split("/").reverse().join("/")).getDate()
  // );

  // const cities = statesData[Object.keys(statesData)[stateindex]];

  // const cityindex =
  //   user.city.substring(0, 1).toUpperCase() + user.city.substring(1);

  const handleUpdateProfile = async () => {
    let yearInNumber = parseInt(year);
    if (yearInNumber < 1900 || yearInNumber > 2100) {
      await dispatch(
        ErrorToggle({
          toggle: true,
          msg: "Enter a valid Birth year",
          type: "error",
        })
      );
      return;
    }
    if (date === "" || year === "" || month === "") {
      await dispatch(
        ErrorToggle({
          toggle: true,
          msg: "Enter a valid Date of Birth",
          type: "error",
        })
      );
    }
    delete registerDetails["suggestedBy"];
    delete registerDetails["dob"];

    await dispatch(setLoadingInBtn(true));
    await dispatch(
      editMyProfile({
        ...registerDetails,
        dob: year + "-" + month + "-" + date,
      })
    );
    await dispatch(initialUser(token));
    await dispatch(setLoadingInBtn(false));

    navigation.navigate("ViewProfile");
  };

  return (
    <SafeArea>
      <Provider>
        <ScrollView showsVerticalScrollIndicator={false}>
          <MainContainer
            style={{ paddingBottom: 56, paddingLeft: 15, paddingRight: 15 }}
          >
            <View
              style={{
                alignItems: "center",
                paddingVertical: 16,
                flexDirection: "row",
              }}
            >
              <IconButton
                icon="chevron-left"
                onPress={() => navigation.goBack()}
              />
              <TopText
                style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
              >
                My Profile Update
              </TopText>
            </View>
            <LoginInputField
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              style={styles.input}
              placeholder="Username*"
              underlineColor="transparent"
              placeholderTextColor="#9B9B9B"
              value={registerDetails.username}
              onChangeText={(text) =>
                setRegisterDetails({ ...registerDetails, username: text })
              }
            />

            <LoginInputField
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              style={styles.input}
              placeholder="First Name*"
              underlineColor="transparent"
              placeholderTextColor="#9B9B9B"
              value={registerDetails.fname}
              onChangeText={(text) =>
                setRegisterDetails({ ...registerDetails, fname: text })
              }
            />

            <LoginInputField
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              style={styles.input}
              placeholder="Middle Name"
              underlineColor="transparent"
              placeholderTextColor="#9B9B9B"
              value={registerDetails.midname}
              onChangeText={(text) =>
                setRegisterDetails({ ...registerDetails, midname: text })
              }
            />

            <LoginInputField
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              style={[styles.input , {opacity : 0.5 , textTransform : "capitalize"}]}
              placeholder="Last Name*"
              underlineColor="transparent"
              placeholderTextColor="#9B9B9B"
              editable={false}
              value={registerDetails.lname}
              onChangeText={(text) =>
                setRegisterDetails({ ...registerDetails, lname: text })
              }
            />
            <LoginInputField
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              style={styles.input}
              placeholder="Phone Number*"
              underlineColor="transparent"
              placeholderTextColor="#9B9B9B"
              keyboardType="numeric"
              maxLength={10}
              value={registerDetails.phone}
              onChangeText={(text) =>
                setRegisterDetails({ ...registerDetails, phone: text })
              }
            />

            <LoginInputField
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              style={styles.input}
              placeholder="Email*"
              underlineColor="transparent"
              placeholderTextColor="#9B9B9B"
              keyboardType="email-address"
              value={registerDetails.email}
              onChangeText={(text) =>
                setRegisterDetails({ ...registerDetails, email: text })
              }
              autoCapitalize="none"
            />
            <Row>
              <Text style={{ color: Theme.themeColor, fontSize: 14, marginRight: 8 }}>
                I am*
              </Text>
              <RadioButton.Group
                onValueChange={(e) => {
                  setSelectGender(e);
                  setRegisterDetails({ ...registerDetails, gender: e });
                }}
                value={selectGender}
              >
                <Row>
                  <RadioButton.Android
                    uncheckedColor={Theme.themeColor}
                    color={Theme.themeColor}
                    value="male"
                  />
                  <Text style={{ color: "#9b9b9b", marginRight: 8 }}>Male</Text>
                  <RadioButton.Android
                    uncheckedColor={Theme.themeColor}
                    color={Theme.themeColor}
                    value="female"
                  />
                  <Text style={{ color: "#9b9b9b", marginRight: 8 }}>
                    Female
                  </Text>
                </Row>
              </RadioButton.Group>
            </Row>
            {/* <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                opacity: 0.35,
              }}
            >
              Date of Birth :
            </Text>

            <View
              style={{
                flexDirection: "row",
              }}
            >
              <LoginInputField
                maxLength={2}
                keyboardType="numeric"
                returnKeyType="done"
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { width: "28%", marginRight: "2%" }]}
                placeholder="DD*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={date}
                onChangeText={(text) => {
                  if (Number(text) > -1 && Number(text) < 32 && text !== "00") {
                    setDate(text);
                  } else {
                    setDate("");
                    dispatch(
                      ErrorToggle({
                        toggle: true,
                        msg: "Enter valid date",
                        type: "error",
                      })
                    );
                  }
                }}
              />
              <LoginInputField
                keyboardType="numeric"
                returnKeyType="done"
                maxLength={2}
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { width: "28%", marginRight: "2%" }]}
                placeholder="MM*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={month}
                onChangeText={(text) => {
                  if (Number(text) > -1 && Number(text) < 13 && text !== "00") {
                    setMonth(text);
                  } else {
                    setMonth("");
                    dispatch(
                      ErrorToggle({
                        toggle: true,
                        msg: "Enter valid month",
                        type: "error",
                      })
                    );
                  }
                }}
              />
              <LoginInputField
                keyboardType="numeric"
                returnKeyType="done"
                maxLength={4}
                selectionColor={Theme.themeColor}
                activeUnderlineColor={Theme.themeColor}
                style={[styles.input, { width: "38%", marginRight: "2%" }]}
                placeholder="YYYY*"
                underlineColor="transparent"
                placeholderTextColor="#9B9B9B"
                value={year}
                onChangeText={(text) => {
                  setYear(text);
                }}
              />
            </View> */}
            <LoginInputField
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              style={styles.input}
              placeholder="Address*"
              underlineColor="transparent"
              placeholderTextColor="#9B9B9B"
              value={registerDetails.address}
              onChangeText={(text) =>
                setRegisterDetails({ ...registerDetails, address: text })
              }
            />

            {/* <SelectDropdown
              buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
              buttonTextStyle={{
                textAlign: "left",
                color: "#9B9B9B",
                fontSize: 16,
              }}
              data={Object.keys(statesData)}
              defaultButtonText="Enter State*"
              value={registerDetails.state}
              onSelect={(selectedItem) => {
                setRegisterDetails({
                  ...registerDetails,
                  state: selectedItem,
                });
              }}
              defaultValueByIndex={stateindex}
            />

            <SelectDropdown
              buttonStyle={{ width: "100%", height: 50, marginTop: 24 }}
              buttonTextStyle={{
                textAlign: "left",
                color: "#9B9B9B",
                fontSize: 16,
              }}
              data={statesData[registerDetails.state] || []}
              defaultButtonText="Enter City*"
              onSelect={(selectedItem) => {
                setRegisterDetails({
                  ...registerDetails,
                  city: selectedItem,
                });
              }}
              defaultValueByIndex={cityindex}
            /> */}

            <LoginInputField
              selectionColor={Theme.themeColor}
              activeUnderlineColor={Theme.themeColor}
              style={styles.input}
              placeholder="Pincode*"
              underlineColor="transparent"
              placeholderTextColor="#9B9B9B"
              keyboardType="numeric"
              value={registerDetails.pincode}
              maxLength={6}
              onChangeText={(text) =>
                setRegisterDetails({ ...registerDetails, pincode: text })
              }
            />

            <FormButton onPress={handleUpdateProfile}>
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
                    // size={"large"}
                    color={"white"}
                  />
                ) : (
                  "Update"
                )}
              </Text>
            </FormButton>
          </MainContainer>
        </ScrollView>
      </Provider>
    </SafeArea>
  );
}
