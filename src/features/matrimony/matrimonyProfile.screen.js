import React, { useState, useEffect } from "react";
import {
  Pressable,
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import ParallaxScrollView from "react-native-parallax-scroll-view";
import { useNavigation } from "@react-navigation/native";
import { SafeArea } from "../../components/utility/safe-area.component";
import { RowBetween } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Row } from "../../styles/dashboard.styles";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";
import { useQueryClient } from "react-query";
import moment from "moment";
import { Button, IconButton } from "react-native-paper";
import {
  deactivateAccountHandler,
  activateAccountHandler,
} from "../../services/matrimony.services";
import { RadioButton } from "react-native-paper";
import { useSelector } from "react-redux";

export default function MatrimonyViewUser({ route }) {
  const { myMatrimonyProfile } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const [checked, setChecked] = useState("yes");
  const [showPopUp, setShowPopUp] = useState(false);
  const [isMatch, setIsMatch] = useState(true);
  const HEADER_EXPANDED_HEIGHT = 400;
  const HEADER_COLLAPSED_HEIGHT = 60;
  const [showViewer, setShowViewer] = React.useState(false);
  let scrollY = new Animated.Value(0);
  const [images, setImages] = useState([]);
  const queryClient = useQueryClient();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: "clamp",
  });

  useEffect(() => {
    setImages(myMatrimonyProfile.photos);
  }, [myMatrimonyProfile]);

  const deactivateAccount = async () => {
    setShowPopUp(false);
    const res = await deactivateAccountHandler(
      myMatrimonyProfile.createdBy,
      checked
    );
    await queryClient.invalidateQueries("get-my-matrimony-profile");
  };

  const activateAccount = async () => {
    setShowPopUp(false);
    const res = await activateAccountHandler(myMatrimonyProfile.createdBy);
    await queryClient.invalidateQueries("get-my-matrimony-profile");
  };

  const renderBackground = (user) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => setShowViewer(true)}>
        {images.length > 0 &&
          images.map((item, i) => {
            return (
              <Animated.View style={{ height: headerHeight }}>
                <Image
                  source={{ uri: item.url }}
                  resizeMode="cover"
                  style={{ width: "100%", height: "100%" }}
                />
              </Animated.View>
            );
          })}
      </TouchableOpacity>
    );
  };

  const renderContentBackground = (user) => {
    return (
      <View style={styles.scrollContainer}>
        <RowBetween>
          <View>
            <Text style={styles.title}>
              {`${user?.fname} ${user?.midname} ${user?.lname}`}, {user?.age}
            </Text>
            <Text style={styles.content}>{user?.job}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Editmyprofile");
            }}
            style={{ backgroundColor: "#D4AF37", padding: 8, borderRadius: 4 }}
          >
            <Icon name="account-edit" size={24} color="white" />
          </TouchableOpacity>
        </RowBetween>

        <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
          Picture
        </Text>
        <Row style={{ paddingTop: 16, paddingBottom: 16 }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {images.length > 0 &&
              images.map((item, i) => {
                return (
                  <Image
                    source={{ uri: item.url }}
                    resizeMode="cover"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      marginRight: 10,
                    }}
                    key={i}
                  />
                );
              })}
          </ScrollView>
        </Row>

        <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: "#F7EFD5",
              padding: 8,
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="calendar" size={20} color="#D4AF37" />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#656565",
              marginLeft: 12,
              marginRight: 16,
              width: "90%",
            }}
          >
            {moment(user.dob).format("MMMM DD YYYY")}
            {/* 23/12/2019 */}
          </Text>
        </View>
        {/* <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: '#F7EFD5',
              padding: 8,
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="account-hard-hat" size={20} color="#D4AF37" />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: '#656565',
              marginLeft: 12,
              marginRight: 16,
              width: '90%',
            }}
          >
            Studied at National College
          </Text>
        </View> */}
        <View style={styles.contentContainer}>
          <View
            style={{
              backgroundColor: "#F7EFD5",
              padding: 8,
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="map-marker" size={20} color="#D4AF37" />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#656565",
              marginLeft: 12,
              marginRight: 16,
              width: "90%",
            }}
          >
            {user.currentcity}
          </Text>
        </View>
        {isMatch === true && (
          <View>
            <View style={styles.contentContainer}>
              <View
                style={{
                  backgroundColor: "#F7EFD5",
                  padding: 8,
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="email" size={20} color="#D4AF37" />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#656565",
                  marginLeft: 12,
                  marginRight: 16,
                  width: "90%",
                }}
              >
                {user.email}
              </Text>
            </View>
            <View style={styles.contentContainer}>
              <View
                style={{
                  backgroundColor: "#F7EFD5",
                  padding: 8,
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="phone" size={20} color="#D4AF37" />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#656565",
                  marginLeft: 12,
                  marginRight: 16,
                  width: "90%",
                }}
              >
                {`${user.phone}`}
              </Text>
            </View>
          </View>
        )}
        <Text style={{ marginTop: 16, fontSize: 14, fontWeight: "bold" }}>
          Interest
        </Text>
        <Row style={{ flexWrap: "wrap" }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingBottom: 5,
            }}
          >
            {user?.hobbies?.map((hobby, i) => (
              <Text
                style={{
                  fontSize: 14,
                  color: "#B98C13",
                  backgroundColor: "#D4AF371A",
                  marginTop: 20,
                  marginRight: 16,
                  padding: 8,
                  textAlign: "center",
                  borderRadius: 5,
                  borderColor: "#D4AF37",
                  borderWidth: 1,
                }}
                key={i}
              >
                {hobby}
              </Text>
            ))}
          </View>
        </Row>
        {isMatch && (
          <View style={styles.familyDetails}>
            <View style={styles.fatherDetails}>
              <Text style={styles.famD}>Personal Details</Text>
              <View style={styles.fatherFamilyData}>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Highest Education</Text>
                  <Text style={styles.txtDataValue}>: {user.education}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Job Type</Text>
                  <Text style={styles.txtDataValue}>: {user.jobType} </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Job Title</Text>
                  <Text style={styles.txtDataValue}>: {user.job}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Gotra</Text>
                  <Text style={styles.txtDataValue}>: {user.gottra}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Rashi</Text>
                  <Text style={styles.txtDataValue}>: {user.rashi}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Marital Status</Text>
                  <Text style={styles.txtDataValue}>
                    : {user.maritalStatus}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Birth Place</Text>
                  <Text style={styles.txtDataValue}>: {user.birthPlace}</Text>
                </View>
              </View>
            </View>

            <View style={styles.fatherDetails}>
              <Text style={styles.famD}>Family Details</Text>
              <Text
                style={{
                  fontSize: 15,
                  paddingTop: "3%",
                  fontWeight: "500",
                  color: "#78849E",
                }}
              >
                Father :{" "}
              </Text>
              <View style={styles.fatherFamilyData}>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Name</Text>
                  <Text style={styles.txtDataValue}>: {user.father.name}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Occupation</Text>
                  <Text style={styles.txtDataValue}>
                    : {user.father.occupation}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Phone No</Text>
                  <Text style={styles.txtDataValue}>: {(user.father.phone) ? user.father.phone : "Not Available"}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Email Id</Text>
                  <Text style={styles.txtDataValue}>: {(user.father.email) ? user.father.email : "Not Available"}</Text>
                </View>
               
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Birth Place</Text>
                  <Text style={styles.txtDataValue}>
                    : {(user.father.birthPlace) ? user.father.birthPlace : "Not Available"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.fatherDetails}>
              <Text
                style={{
                  fontSize: 15,
                  paddingTop: "3%",
                  fontWeight: "500",
                  color: "#78849E",
                }}
              >
                Mother :{" "}
              </Text>
              <View style={styles.fatherFamilyData}>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Name</Text>
                  <Text style={styles.txtDataValue}>: {user.mother.name}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Occupation</Text>
                  <Text style={styles.txtDataValue}>
                    : {user.mother.occupation}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Phone No</Text>
                  <Text style={styles.txtDataValue}>: {(user.mother.phone)? user.mother.phone : "Not Available"}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Email Id</Text>
                  <Text style={styles.txtDataValue}>: {(user.mother.email) ? user.mother.email : "Not Available"}</Text>
                </View>
               
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Birth Place</Text>
                  <Text style={styles.txtDataValue}>
                    : {(user.mother.birthPlace) ? user.mother.birthPlace : "Not Available"}
                  </Text>
                </View>
              </View>
            </View>
            {user.siblings.length > 0 &&
              user.siblings.map((sibling, i) => (
                <View style={styles.fatherDetails}>
                  <Text
                    style={{
                      fontSize: 15,
                      paddingTop: "3%",
                      fontWeight: "500",
                      color: "#78849E",
                    }}
                  >
                    Siblings :{" "}
                  </Text>
                  <View style={styles.fatherFamilyData}>
                    <View style={styles.oneDetail}>
                      <Text style={styles.txtData}>Name</Text>
                      <Text style={styles.txtDataValue}>: {sibling.name}</Text>
                    </View>
                    <View style={styles.oneDetail}>
                      <Text style={styles.txtData}>Job</Text>
                      <Text style={styles.txtDataValue}>: {sibling.job}</Text>
                    </View>
                    <View style={styles.oneDetail}>
                      <Text style={styles.txtData}>Age</Text>
                      <Text style={styles.txtDataValue}>: {sibling.age}</Text>
                    </View>
                    <View style={styles.oneDetail}>
                      <Text style={styles.txtData}>Martial Status</Text>
                      <Text style={styles.txtDataValue}>
                        : {sibling.maritalStatus}
                      </Text>
                    </View>
                    <View style={styles.oneDetail}>
                      <Text style={styles.txtData}>Relation</Text>
                      <Text style={styles.txtDataValue}>
                        : {sibling.relation}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            <View style={styles.fatherDetails}>
              <Text style={styles.famD}>Address</Text>
              <Text
                style={{
                  fontSize: 15,
                  paddingTop: "3%",
                  fontWeight: "600",
                  color: "#78849E",
                  paddingBottom: 5,
                }}
              >
                Current Address :{" "}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: "#656565",
                  lineHeight: 20,
                  marginLeft: 10,
                  textTransform: "capitalize",
                }}
              >
                {`${user.currentAddress} , ${user.currentcity} , ${user.currentstate} ,${user.currentcountry}, ${user.currentpincode}`}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  paddingTop: "3%",
                  fontWeight: "600",
                  color: "#78849E",
                  paddingBottom: 5,
                }}
              >
                Permanent Address :{" "}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: "#656565",
                  lineHeight: 20,
                  marginLeft: 10,
                  textTransform: "capitalize",
                }}
              >
                {`${user.permanentAddress} , ${user.permanentcity} , ${user.permanentstate} ,${user.permanentcountry}, ${user.permanentpincode}`}
              </Text>
            </View>

            <Modal
              animationType="slide"
              transparent={true}
              visible={showPopUp}
              onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setShowPopUp(!showPopUp);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  {myMatrimonyProfile.isActive ? (
                    <View>
                      <Text style={styles.modalText}>Deactivate Account</Text>
                      <Text style={styles.modalTextSub}>
                        Are you sure you want to deactivate the account?
                      </Text>
                      <Text style={styles.modalTextSub2}>
                        Were we helpful to find a suitable partner for you?
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.modalText}>Activate Account</Text>
                      <Text style={{ marginBottom: "8%", color: "#454F63" }}>
                        Welcome back to matrimony
                      </Text>
                    </View>
                  )}

                  {myMatrimonyProfile.isActive ? (
                    <View>
                      <RadioButton.Group
                        onValueChange={(e) => {
                          setChecked(e);
                        }}
                        value={checked}
                      >
                        <View>
                          <View style={{ flexDirection: "row" }}>
                            <RadioButton.Android
                              status={
                                checked === "yes" ? "checked" : "unchecked"
                              }
                              uncheckedColor="#d4af37"
                              color="#d4af37"
                              value="yes"
                            />
                            <Text style={{ color: "#9b9b9b", margin: "2%" }}>
                              yes
                            </Text>
                          </View>
                          <View style={{ flexDirection: "row" }}>
                            <RadioButton.Android
                              status={
                                checked === "no" ? "checked" : "unchecked"
                              }
                              uncheckedColor="#d4af37"
                              color="#d4af37"
                              value="no"
                            />
                            <Text style={{ color: "#9b9b9b", margin: "2%" }}>
                              no
                            </Text>
                          </View>
                        </View>
                      </RadioButton.Group>

                      <View style={styles.twoBtns}>
                        <Pressable
                          style={{ justifyContent: "center" }}
                          onPress={() => setShowPopUp(!showPopUp)}
                        >
                          <Text style={styles.cancelBtn}>Cancel</Text>
                        </Pressable>

                        <Pressable
                          style={[styles.button, styles.buttonClose]}
                          onPress={() => deactivateAccount()}
                        >
                          <Text style={styles.textStyle}>Deactivate</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.twoBtns}>
                        <Pressable
                          style={{ justifyContent: "center" }}
                          onPress={() => setShowPopUp(!showPopUp)}
                        >
                          <Text style={styles.cancelBtn}>Cancel</Text>
                        </Pressable>

                        <Pressable
                          style={[styles.button, styles.buttonClose]}
                          onPress={() => activateAccount()}
                        >
                          <Text style={styles.textStyle}>Activate</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </Modal>

            <Button
              onPress={() => setShowPopUp(true)}
              style={{
                backgroundColor: "#D8AE25",
                color: "white",
                margin: "5%",
              }}
            >
              <Text style={{ color: "white" }}>
                {user.isActive ? "Deactivate" : "Activate"}
              </Text>
            </Button>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeArea>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          backgroundColor: "white",
        }}
      >
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={() => navigation.goBack()}
        />
        <Text
          style={{
            color: "#242424",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Matrimony
        </Text>
      </View>
      {images.length > 0 && (
        <Modal visible={showViewer} transparent={true}>
          <ImageViewerScreen images={images} setShowViewer={setShowViewer} />
        </Modal>
      )}
      <ParallaxScrollView
        renderBackground={renderBackground}
        renderContentBackground={() =>
          renderContentBackground(myMatrimonyProfile)
        }
        parallaxHeaderHeight={400}
        renderForeground={() => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowViewer(true)}
            style={{ height: "100%" }}
          ></TouchableOpacity>
        )}
      ></ParallaxScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  cancelBtn: {
    fontSize: 14,
    fontWeight: "700",
    color: "gray",
    marginRight: "3%",
  },
  twoBtns: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalTextSub2: {
    marginTop: "8%",
    marginBottom: "3%",
    fontSize: 14,
    color: "#454F63",
  },
  modalTextSub: {
    fontSize: 14,
    color: "#454F63",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: "90%",
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    // alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    margin: "2%",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: "40%",
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#D8AE25",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    color: "#D4AF37",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "left",
  },
  popup: {
    position: "absolute",
    width: "100%",
    backgroundColor: "red",
  },
  txtData: {
    color: "#656565",
    fontSize: 13,
    width: "30%",
    fontWeight: "400",
  },
  txtDataValue: {
    color: "#656565",
    fontSize: 13,
    fontWeight: "600",
    flexWrap: "wrap",
    width: "75%",
  },
  oneDetail: {
    marginBottom: 12,
    display: "flex",
    flexDirection: "row",
  },
  familyDetails: {
    paddingTop: "6%",
  },
  fatherFamilyData: {
    marginTop: "4%",
    paddingTop: "1%",
  },
  fatherDetails: {
    paddingTop: "5%",
    borderTopColor: "#D4AF371A",
    borderTopWidth: 1,
  },
  famD: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  content: { color: "#898E92" },
  contentContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
});
