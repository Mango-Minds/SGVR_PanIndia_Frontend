import React, { useState } from "react";
import {
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { IconButton } from "react-native-paper";
import { getMyProfile } from "../../services/matrimony.services";
import { SafeArea } from "../../components/utility/safe-area.component";
import { Container, RowBetween } from "../../styles/common.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Row } from "../../styles/dashboard.styles";
import ImageViewerScreen from "../../components/matrimony/ImageViewerScreen";
import { render } from "react-dom";
import {
  fullProfileRequest,
  getMatrimonyOneUser,
} from "../../services/matrimony.services";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { getImageUrl } from "../../services/socialMedia.services";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";
import { likeHandler } from "../../services/matrimony.services";

export default function MatrimonyViewUser({ navigation, route }) {
  const dispatch = useDispatch();
  const { userId } = route.params;

  const [RequestsIhaveSent, setRequestsIhaveSent] = useState([]);
  const [isMatch, setIsMatch] = useState(false);
  const [showViewer, setShowViewer] = React.useState(false);
  const [requestAccepted, setRequestAccepted] = useState([]);
  const [likes, setLikes] = useState([]);
  const [reqData, setreqData] = useState({ item: 1 });
  // const [requesttext, setRequesttext] = useState("Request Full Profile")

  const HEADER_EXPANDED_HEIGHT = 400;
  const HEADER_COLLAPSED_HEIGHT = 60;
  const [images, setImages] = useState([]);
  let scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: "clamp",
  });

  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["matrimony-one-user", userId],
    queryFn: () => getMatrimonyOneUser(userId),
    onSuccess: async (data) => {
      // console.log(data , "user profile");
      let images = [];
      for await (let item of data.photos) {
        const res = await getImageUrl(item);
        images.push(res);
      }
      setImages(images);
      if (data.phone !== undefined) {
        setIsMatch(true);
      }
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          type: "error",
          msg: err.response.data.error,
          toggle: true,
        })
      );
    },
  });

  const { temp } = useQuery({
    queryKey: ["me-user"],
    queryFn: getMyProfile,
    onSuccess: async (data) => {
      setRequestAccepted(data.request_accepted);
      let temp = [];
      data.fullProfileRequestsSent.map((item, index) => {
        // temp.push(item.user)
        if (item.user === userId) {
          setreqData(item);
        }
      });
      setRequestsIhaveSent(temp);
      setLikes(data.likes);
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          type: "error",
          msg: err.response.data.error,
          toggle: true,
        })
      );
    },
  });

  const alreadyLiked = () => {
    dispatch(
      ErrorToggle({
        msg: "You Already Liked This Profile",
        type: "success",
        toggle: true,
      })
    );
  };

  const likeHandlerHelper = async () => {
    const res = await likeHandler(userId);
  };

  const fullProfileRequestHandler = async () => {
    const res = await fullProfileRequest(userId);
    navigation.navigate("ReqSentScreen");
    // setRequesttext("Request Sent Successfully")
  };
  const renderBackground = () => {
    return (
      <>
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
      </>
    );
  };

  const renderContentBackground = (user) => {
    return (
      <View style={styles.scrollContainer}>
        <RowBetween>
          <View>
            <Text style={styles.title}>
              {`${user.fname} ${user.midname} ${user.lname}`}, {user.age}
            </Text>
            <Text style={styles.content}>{user.job}</Text>
          </View>
          {requestAccepted.includes(userId) ? (
            <TouchableOpacity
              //  onPress={() => {likeHandlerHelper()}} chat screen
              style={{
                backgroundColor: "#D4AF37",
                padding: 8,
                borderRadius: 4,
              }}
            >
              <Icon name="chat" size={24} color="white" />
            </TouchableOpacity>
          ) : likes.includes(userId) ? (
            <TouchableOpacity
              onPress={() => {
                alreadyLiked();
              }}
              style={{
                backgroundColor: "#D4AF37",
                padding: 8,
                borderRadius: 4,
              }}
            >
              <Icon name="thumb-up" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                likeHandlerHelper();
              }}
              style={{
                backgroundColor: "#D4AF37",
                padding: 8,
                borderRadius: 4,
              }}
            >
              <Icon name="thumb-up-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
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
            <Icon name="account-hard-hat" size={20} color="#D4AF37" />
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
            {user.education}
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
            {user.birthPlace}
          </Text>
        </View>
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
                  marginTop: 10,
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
                {user.phone}
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
                {moment(user.dob).format("MMMM Do YYYY")}
              </Text>
            </View>
          </View>
        )}

        {isMatch === true && (
          <View style={styles.familyDetails}>
            <View style={styles.fatherDetails}>
              <Text style={styles.famD}>Personal Details</Text>
              <View style={styles.fatherFamilyData}>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Highest Education</Text>
                  <Text style={styles.txtDataValue}>
                    {":  " + user.education}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Job Type</Text>
                  <Text style={styles.txtDataValue}>
                    {":  " + user.jobType}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Job Title</Text>
                  <Text style={styles.txtDataValue}>{":  " + user.job}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Gotra</Text>
                  <Text style={styles.txtDataValue}>{":  " + user.gottra}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Rashi</Text>
                  <Text style={styles.txtDataValue}>{":  " + user.rashi}</Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Marital Status</Text>
                  <Text style={styles.txtDataValue}>
                    {":  " + user.maritalStatus}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Birth Place</Text>
                  <Text style={styles.txtDataValue}>
                    {":  " + user.birthPlace}
                  </Text>
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
                  <Text style={styles.txtDataValue}>
                    {":  " + user.father.name}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Occupation</Text>
                  <Text style={styles.txtDataValue}>
                    {":  " + user.father.occupation}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Phone No</Text>
                  <Text style={styles.txtDataValue}>: {(user.father?.phone) ? user.father?.phone : "Not Available"}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Email Id</Text>
                  <Text style={styles.txtDataValue}>: {(user.father.email) ? user.father.email : "Not Available"}
                  </Text>
                </View>
               
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Birth Place</Text>
                  <Text style={styles.txtDataValue}>: {(user.father.birthPlace)? user.father.birthPlace : "Not Available"}
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
                  <Text style={styles.txtDataValue}>
                    {":  " + user.mother.name}
                  </Text>
                </View>
                 <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Occupation</Text>
                  <Text style={styles.txtDataValue}>
                    {":  " + user.mother.occupation}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Phone No</Text>
                  <Text style={styles.txtDataValue}>: {(user.mother.phone) ? user.mother.phone : "Not Available"}
                  </Text>
                </View>
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Email Id</Text>
                  <Text style={styles.txtDataValue}>: {(user.mother.email) ? user.mother.email : "Not Available"}
                  </Text>
                </View>
               
                <View style={styles.oneDetail}>
                  <Text style={styles.txtData}>Birth Place</Text>
                  <Text style={styles.txtDataValue}>: {(user.mother.birthPlace)? user.mother.birthPlace : "Not Available"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.fatherDetails}>
              {user.siblings.length === 0 ? (
                <View>
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

                  <View>
                    <Text>No siblings</Text>
                  </View>
                </View>
              ) : (
                <View>
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

                  {user.siblings.map((item, index) => {
                    return (
                      <View style={styles.fatherFamilyData} key={index}>
                        <View style={styles.oneDetail}>
                          <Text style={styles.txtData}>Name</Text>
                          <Text style={styles.txtDataValue}>: {item.name}</Text>
                        </View>
                        <View style={styles.oneDetail}>
                          <Text style={styles.txtData}>Job</Text>
                          <Text style={styles.txtDataValue}>: {item.job}</Text>
                        </View>
                        <View style={styles.oneDetail}>
                          <Text style={styles.txtData}>Age</Text>
                          <Text style={styles.txtDataValue}>: {item.age}</Text>
                        </View>
                        <View style={styles.oneDetail}>
                          <Text style={styles.txtData}>Martial Status</Text>
                          <Text style={styles.txtDataValue}>
                            : {item.maritalStatus}
                          </Text>
                        </View>
                        <View style={styles.oneDetail}>
                          <Text style={styles.txtData}>Relation</Text>
                          <Text style={styles.txtDataValue}>
                            : {item.relation}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
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
                }}
              >
                {user.currentAddress +
                  ", " +
                  user.currentcity +
                  " " +
                  user.currentstate +
                  " " +
                  user.currentcountry}
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
                }}
              >
                {user.permanentAddress +
                  ", " +
                  user.permanentcity +
                  " " +
                  user.permanentstate +
                  " " +
                  user.permanentcountry}
              </Text>
            </View>
          </View>
        )}
        {isMatch === false && reqData.item !== 1 && (
          <View>
            {reqData.status === "pending" && (
              <TouchableOpacity
                style={{
                  backgroundColor: "green",
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 10,
                  marginBottom: 10,
                  marginLeft: 2,
                  marginRight: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#fff",
                    paddingTop: 5,
                    paddingBottom: 5,
                    textAlign: "center",
                  }}
                >
                  Request already sent!!!
                </Text>
              </TouchableOpacity>
            )}
            {reqData.status === "rejected" && (
              <TouchableOpacity
                style={{
                  backgroundColor: "red",
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 10,
                  marginBottom: 10,
                  marginLeft: 2,
                  marginRight: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#fff",
                    paddingTop: 5,
                    paddingBottom: 5,
                    textAlign: "center",
                  }}
                >
                  Request rejected
                </Text>
              </TouchableOpacity>
            )}
            {reqData.status === "accepted" && (
              <TouchableOpacity
                style={{
                  backgroundColor: "green",
                  borderRadius: 5,
                  padding: 10,
                  marginTop: 10,
                  marginBottom: 10,
                  marginLeft: 2,
                  marginRight: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#fff",
                    paddingTop: 5,
                    paddingBottom: 5,
                    textAlign: "center",
                  }}
                >
                  Request Accepted
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {/* just added this item.1 as a flag  */}
        {reqData.item === 1 && (
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: "#B98C13",
                borderRadius: 5,
                padding: 10,
                marginTop: 10,
                marginBottom: 10,
                marginLeft: 2,
                marginRight: 2,
              }}
              onPress={() => {
                fullProfileRequestHandler();
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "500",
                  color: "#fff",
                  paddingTop: 5,
                  paddingBottom: 5,
                  textAlign: "center",
                }}
              >
                Request Full Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }
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
      <Modal visible={showViewer} transparent={true}>
        <ImageViewerScreen images={images} setShowViewer={setShowViewer} />
      </Modal>
      <ScrollView
        renderBackground={renderBackground}
        renderContentBackground={() => renderContentBackground(data)}
        parallaxHeaderHeight={400}
        renderForeground={() => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowViewer(true)}
            style={{ height: "100%" }}
          ></TouchableOpacity>
        )}
      ></ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
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
