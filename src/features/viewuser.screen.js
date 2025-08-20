import React, { useState } from "react";
import {
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider, IconButton } from "react-native-paper";
import Friends from "../components/profile/Friends";
import OptionsModal from "../components/modals/OptionsModal";
import messageIcon from "../assets/images/social/message.png";
import { Container, RowBetween, View } from "../styles/common.styles";
import { ProfileContainer, ProfileStats } from "../styles/profile.styles";
import { TopText } from "../styles/social.styles";
import {
  getSocialMediaProfile,
  SendFriendRequest,
} from "../services/socialMedia.services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import FriendPosts from "../components/social/FriendPosts";
import CoverImage from "../assets/images/general/cover.jpg";
import { LinearGradient } from "expo-linear-gradient";
import { ErrorToggle, logout } from "../store/user";
import { useMutation } from "@tanstack/react-query";
import Ionicons from "react-native-vector-icons/Ionicons";

const ViewUserScreen = ({ navigation, route }) => {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { username, userid, setRequested, userdp, userprofile } = route.params;

  const slideUpRef = React.useRef();
  const followRef = React.useRef(null);
  const blockRef = React.useRef(null);

  const [modalData, setModalData] = React.useState({});
  const [section, setSection] = useState("posts");
  const [showModal, setShowModal] = useState(false);
  const [userdata, setUserdata] = useState();
  const [isRequested, setIsRequested] = useState();
  const [dp, setDp] = useState(userdp);

  const { data, isError, error, isLoading } = useQuery(
    ["social-other-user-profile", userid],
    () => getSocialMediaProfile(userid),
    {
      onSuccess: async (data) => {
        setUserdata(data.result);
        data.result.data.requests.map((item, index) => {
          if (item._id === user._id) {
            setIsRequested(true);
          }
        });
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
    }
  );

  const options = [
    {
      title: "Report",
      function: () => {
        navigation.navigate("ReportScreen", { userId: userid });
      },
    },
    {
      title: "Unfollow",
      function: async (userid, username) => {
        followRef.current.data = { userid, username };
        followRef.current.open();
        // navigation.goBack()
      },
      followReff: followRef,
    },
    {
      title: "Block User",
      function: (userid, username) => {
        blockRef.current.data = { userid, username };
        blockRef.current.open();
      },
      blockReff: blockRef,
    },
  ];

  const addFriendMutation = useMutation(SendFriendRequest, {
    onSuccess: (data) => {},
    onError: (err) => {
      dispatch(
        ErrorToggle({
          msg: err.response.data.message,
          type: "error",
          toggle: true,
        })
      );
    },
  });

  const handleFollow = async (e) => {
    await addFriendMutation.mutateAsync({ userid });
    await queryClient.invalidateQueries("social-other-user-profile");
    setRequested(true);
  };

  // if (isLoading)
  //   return (
  //     <ActivityIndicator
  //       style={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         flex: 1,
  //       }}
  //       size={"large"}
  //       color={Theme.themeColor}
  //     />
  //   );
  // else

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <TopText
            style={{ color: "#000000", fontSize: 22, fontWeight: "bold" }}
          >
            Profile
          </TopText>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ChatScreen", {
              toid: userid,
              toName: userprofile.fname + " " + userprofile.lname,
              // index: ,
            })
          }
        >
          <Image
            source={messageIcon}
            style={{ width: 28, height: 28, marginRight: 8 }}
          />
        </TouchableOpacity>
        <IconButton
          icon="dots-vertical"
          color="#454F63"
          size={24}
          onPress={() => {
            slideUpRef.current.open();

            setShowModal(true);
          }}
        />
      </RowBetween>
      <LinearGradient colors={["#363534", "#0a0a0a"]}>
        <ImageBackground
          style={{ width: "100%", height: 150 }}
          imageStyle={{ opacity: 0.15 }}
          source={CoverImage}
          resizeMode="cover"
        >
          <ProfileContainer
            style={{
              flexDirection: "column",
              position: "relative",
              borderBottomWidth: 3,
              borderColor: Theme.themeColor,
              height: 150,
            }}
          >
            <View
              style={{
                position: "absolute",
                zIndex: 10,
                borderWidth: 2,
                borderColor: Theme.themeColor,
                borderRadius: 10,
                left: 20,
                top: 50,
                padding: 5,
                backgroundColor: "#FFF",
              }}
            >
              <Image
                source={
                  dp
                    ? { uri: dp }
                    : require("../assets/images/general/user.png")
                }
                resizeMode="contain"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 10,
                  zIndex: 6,
                }}
              />
            </View>
            <ProfileContainer
              style={{
                paddingTop: 24,
                height: 150,
                paddingLeft: 160,
                paddingRight: 16,
                paddingTop: 48,
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {userprofile.fname} {userprofile.lname}
              </Text>
              <Text style={{ color: "white", fontSize: 12, marginTop: 5 }}>
                {data?.result?.data.bio ? data?.result?.data.bio : "No Bio"}
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  marginTop: 3,
                  textTransform: "capitalize",
                }}
              >
                {data?.result?.data.city + ", " + "India"}
              </Text>
            </ProfileContainer>
          </ProfileContainer>
        </ImageBackground>
      </LinearGradient>
      {isLoading ? (
        <ActivityIndicator
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
          size={"large"}
          color={Theme.themeColor}
        />
      ) : (
        <>
          <ProfileContainer
            style={{
              paddingTop: 16,
              paddingLeft: 16,
              paddingRight: 4,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: Theme.themeColor,
                position: "absolute",
                left: 20,
                top: 32,
              }}
            >
              @{username}
            </Text>
            <ProfileStats
              onPress={() => setSection("posts")}
              style={
                section === "posts"
                  ? { borderColor: Theme.themeColor }
                  : { borderColor: "transparent" }
              }
            >
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {userdata?.data?.isFollowing
                  ? userdata?.posts.length
                  : userdata?.posts}
              </Text>
              <Text style={{ fontSize: 12 }}>Posts</Text>
            </ProfileStats>
            <ProfileStats
              onPress={() => setSection("friends")}
              style={
                section === "friends"
                  ? { borderColor: Theme.themeColor, marginLeft: 8 }
                  : { marginLeft: 8, borderColor: "transparent" }
              }
            >
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {userdata?.data?.friends?.length}
              </Text>
              <Text style={{ fontSize: 12 }}>Friends</Text>
            </ProfileStats>
          </ProfileContainer>
          <Divider style={{ height: 2 }} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {section === "posts" ? (
              <View style={{ flexDirection: "column" }}>
                {userdata?.data?.isFollowing ? (
                  userdata?.posts?.length > 0 ? (
                    userdata?.posts?.map((item, index) => {
                      return (
                        <FriendPosts
                          key={index}
                          item={item}
                          dp={dp}
                          userdata={userdata}
                          navigation={navigation}
                        />
                      );
                    })
                  ) : (
                    <View
                      style={{
                        // alignItems:"center",
                        justifyContent: "center",
                        flexDirection: "row",
                        marginTop: "40%",
                      }}
                    >
                      <View
                        style={{
                          width: 200,
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: "#decc90",
                          }}
                        >
                          No post
                        </Text>
                      </View>
                    </View>
                  )
                ) : (
                  <View
                    style={{
                      // alignItems:"center",
                      justifyContent: "center",
                      flexDirection: "row",
                      marginTop: "40%",
                    }}
                  >
                    <View
                      style={{
                        width: 200,
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Ionicons
                        name="ios-person-add"
                        size={90}
                        color={Theme.themeColor}
                        style={{
                          paddingLeft: "6%",
                          opacity: 0.3,
                        }}
                      >
                        {" "}
                      </Ionicons>
                      {isRequested && isRequested === true ? (
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: "#decc90",
                          }}
                        >
                          Requested
                        </Text>
                      ) : (
                        <TouchableOpacity
                          style={{
                            backgroundColor: Theme.themeColor,
                            width: "25%",
                            margin: "2%",
                            padding: "2%",
                            borderRadius: 5,
                          }}
                          onPress={() => handleFollow()}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              fontWeight: "bold",
                              color: "#fff",
                              fontSize: 18,
                            }}
                          >
                            Follow
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ) : userdata?.data?.isFollowing ? (
              <Friends
                navigation={navigation}
                friends={userdata?.data?.friends}
                whoes={"friends"}
              />
            ) : (
              <View
                style={{
                  // alignItems:"center",
                  justifyContent: "center",
                  flexDirection: "row",
                  marginTop: "40%",
                }}
              >
                <View
                  style={{
                    width: 200,
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <Ionicons
                    name="ios-person-add"
                    size={90}
                    color={Theme.themeColor}
                    style={{
                      paddingLeft: "6%",
                      opacity: 0.3,
                    }}
                  >
                    {" "}
                  </Ionicons>
                  {isRequested && isRequested === true ? (
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#decc90",
                      }}
                    >
                      Requested
                    </Text>
                  ) : (
                    <TouchableOpacity
                      style={{
                        backgroundColor: Theme.themeColor,
                        width: "25%",
                        margin: "2%",
                        padding: "2%",
                        borderRadius: 5,
                      }}
                      onPress={() => handleFollow()}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#fff",
                          fontSize: 18,
                        }}
                      >
                        Follow
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </>
      )}
      <OptionsModal
        slideUpRef={slideUpRef}
        modalVisible={showModal}
        setModalVisible={setShowModal}
        options={options}
        data={{
          id: userid,
          name: username,
        }}
      />
    </Container>
  );
};

export default ViewUserScreen;
