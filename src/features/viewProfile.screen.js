import React from "react";
import {
  Image,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "../services/auth.header";
import { useNavigation } from "@react-navigation/native";
import { SafeArea } from "../components/utility/safe-area.component";
import { LoginInputField, MainContainer } from "../styles/prelogin.styles";
import { View } from "../styles/common.styles";
import { IconButton, Subheading } from "react-native-paper";
import { TopText } from "../styles/social.styles";
import { useQuery } from "react-query";
import { getMyCommunities } from "../services/community.services";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/FontAwesome5";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getImageUrl } from "../services/socialMedia.services";
import { stylesPostCard } from "../components/profile/Posts";
import SelectDropdown from "react-native-select-dropdown";
import { ErrorToggle, deleteAccountHandler } from "../store/user";
import { useDispatch } from "react-redux";

export default function ViewProfileScreen() {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const { width } = Dimensions.get("window");
  const [dp, setDp] = React.useState();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [password, setPassword] = React.useState("");
  console.log("userprofile", user);
  // const reasonsOfDeletion = [
  //   "Privacy Concerns",
  //   "Want to remove Something",
  //   "Trouble getting started",
  //   "Something else",
  // ];
  // const [selectedReason, setSelectedReason] = React.useState();
  const dispatch = useDispatch();
  React.useEffect(async () => {
    const res = await getImageUrl(user.dp);
    if (res.status === 0) {
      setDp(res.url);
    }
  }, []);
  const getDeleteMyAccount = async () => {
    // navigation.replace("PrivacyPolicy");
    if (password.length > 0) {
      try {
        const res = await axios.post(
          `${BASEAPIURL}/auth/delete-user`,
          {
            cpassword: password,
          },
          {
            headers: await authHeader(),
          }
        );
        if (res.data === true) {
          dispatch(deleteAccountHandler());
        }
      } catch (error) {}
    } else {
      dispatch(ErrorToggle(true));
    }
  };

  console.log(user, "user data");
  return (
    <SafeArea>
      <MainContainer>
        <View style={{ alignItems: "center", paddingVertical: 16 }}>
          <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
          >
            My Profile
          </TopText>
        </View>
        <View style={stylesPostCard.centeredView}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setModalVisible(!modalVisible);
            }}
          >
            <View style={stylesPostCard.centeredView}>
              <View
                style={[
                  styles.modalView,
                  {
                    flexDirection: "column",
                    height: 260,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    opacity: 0.6,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Everything associated with this account will be permanently
                  lost
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    opacity: 0.6,
                    fontWeight: "700",
                  }}
                >
                  Are you sure?
                </Text>
                {/* <SelectDropdown
                  buttonStyle={styles.dropdown1BtnStyle}
                  renderDropdownIcon={isOpened => {
                    return <FontAwesome name={isOpened ? 'angle-up' : 'angle-down'} color={'#444'} size={22} />;
                  }}
                  buttonTextStyle={{
                    textAlign: "left",
                    color: "#9B9B9B",
                    fontSize: 16,
                  }}
                  data={reasonsOfDeletion}
                  defaultButtonText="Select*"
                  value={"Select"}
                  onSelect={(selectedItem) => {
                    setSelectedReason(selectedItem)
                  }}
                  dropdownStyle={styles.dropdown1DropdownStyle}
                  dropdownIconPosition={'right'}
                  // rowStyle={styles.dropdown1RowStyle}
                  // rowTextStyle={styles.dropdown1RowTxtStyle}

                /> */}
                <LoginInputField
                  selectionColor="#d4af37"
                  activeUnderlineColor="#d4af37"
                  style={styles.input}
                  placeholder="password*"
                  underlineColor="transparent"
                  placeholderTextColor="#9B9B9B"
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                />
                <View style={{ flexDirection: "row", marginTop: "5%" }}>
                  <Pressable
                    style={[stylesPostCard.buttonCloseCancel, { height: 40 }]}
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Text
                      style={[
                        stylesPostCard.textStyle,
                        { color: "black", opacity: 0.6 },
                      ]}
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[stylesPostCard.delButton, { height: 40 }]}
                    onPress={() => getDeleteMyAccount()}
                  >
                    <Text style={stylesPostCard.textStyle}>Yes, Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            backgroundColor: "#D4AF371A",
            padding: 10,
            borderRadius: 10,
            margin: "auto",
          }}
        >
          <Image
            source={
              dp ? { uri: dp } : require("../assets/images/general/user.png")
            }
            resizeMode="contain"
            style={{
              borderRadius: 10,
              width: width * 0.9,
              height: 200,
            }}
          />
        </View>

        <View
          style={{
            padding: 16,
            paddingVertical: 0,
            flexDirection: "column",
            marginTop: 30,
            marginBottom: 20,
          }}
        >
          <TopText
            style={{
              fontSize: 22,
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {user.firstName + " " + user.lastName}
          </TopText>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Icon name="user" color="#D4AF37" size={20} />
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 20,
              fontWeight: "500",
              color: "#898E92",
            }}
          >
            {user.username}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Icons name="email-edit" color="#D4AF37" size={20} />
          <Text
            style={{ paddingHorizontal: 8, fontSize: 14, color: "#898E92" }}
          >
            {user.email}
          </Text>
        </View>

        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Ionicons name="call" color="#D4AF37" size={20} />
          <Text
            style={{ paddingHorizontal: 8, fontSize: 14, color: "#898E92" }}
          >
            +91-{user.phone}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          {user.gender === "Male" ? (
            <Icons name="gender-male" color="#D4AF37" size={22} />
          ) : (
            <Icons name="gender-female" color="#D4AF37" size={22} />
          )}
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 14,
              color: "#898E92",
              textTransform: "capitalize",
            }}
          >
            {user.gender}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Icon name="birthday-cake" color="#D4AF37" size={22} />
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 14,
              color: "#898E92",
              textTransform: "capitalize",
            }}
          >
            {user.dob !== "undefined-undefined-undefined"
              ? user.dob
              : "Not Available"}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Image
            source={require("../assets/images/community/network.png")}
            style={{ width: 22, height: 22 }}
          />
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 14,
              color: "#898E92",
              textTransform: "uppercase",
            }}
          >
            {user.referalCode}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Icon name="address-card" color="#D4AF37" size={22} />
          <Text
            style={{
              paddingHorizontal: 8,
              fontSize: 14,
              color: "#898E92",
              textTransform: "capitalize",
            }}
          >
            {user.address +
              ", " +
              user.city +
              ", " +
              user.state +
              " - " +
              user.pincode}{" "}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            display: "flex",
            justifyContent: "center",
            marginTop: 26,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfileDetails")}
          >
            <View
              style={{
                fontSize: 18,
                backgroundColor: "#D4AF37",
                textTransform: "capitalize",

                paddingHorizontal: 8,
                paddingVertical: 15,
                borderRadius: 4,
                fontWeight: "bold",
                width: Dimensions.get("window").width * 0.8,
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 17,
                  fontWeight: "500",
                  letterSpacing: 0.3,
                }}
              >
                Update Profile
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            display: "flex",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View
              style={{
                fontSize: 18,
                backgroundColor: "white",
                textTransform: "capitalize",

                paddingHorizontal: 8,
                paddingVertical: 15,
                borderRadius: 4,
                fontWeight: "bold",
                width: Dimensions.get("window").width * 0.8,
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
                borderWidth: 1.5,
                borderColor: "rgba(172, 3, 3, 0.8)",
                marginBottom: "3%",
              }}
            >
              <Text
                style={{
                  color: "rgba(172, 3, 3, 0.8)",
                  fontSize: 17,
                  fontWeight: "600",
                  letterSpacing: 0.3,
                }}
              >
                Delete account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </MainContainer>
    </SafeArea>
  );
}
export const styles = StyleSheet.create({
  input: {
    marginTop: 24,
    backgroundColor: "#F0F0F0",
    borderColor: "#E6E6E6",
    borderRadius: 4,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdown1BtnStyle: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "gray",
  },
  dropdown1DropdownStyle: { backgroundColor: "#EFEFEF" },
  dropdown1RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },
  dropdown1RowTxtStyle: { color: "#444", textAlign: "left" },
});
