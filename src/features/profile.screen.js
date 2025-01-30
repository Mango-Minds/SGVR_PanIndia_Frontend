import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  FlatList,
} from "react-native";
import { Divider, IconButton } from "react-native-paper";
import Friends from "../components/profile/MyFriends";
import Requests from "../components/profile/Requests";
import OptionsModal from "../components/modals/OptionsModal";
import {
  getImageUrl,
  editSocialMediaProfile,
} from "../services/socialMedia.services";
import { Container, RowBetween, View } from "../styles/common.styles";
import { useSelector, useDispatch } from "react-redux";
import { ProfileContainer, ProfileStats } from "../styles/profile.styles";
import { TopText } from "../styles/social.styles";
import { useQueryClient } from "react-query";
import { capitalize } from "../components/utility/capitalize";
import { logout, ErrorToggle, IsBttnloading, initialUser } from "../store/user";
import { ProfilePosts } from "../components/profile/Posts";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function ProfileScreen({ navigation }) {
  const { user, socialData, token } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const slideUpRef = useRef();

  const [limit, setLimit] = useState(1);
  const [section, setSection] = useState("posts");
  const [dp, setDp] = useState("");
  const [refreshing, setRefreshing] = React.useState(false);

  const options = [
    {
      title: "Edit Profile",
      function: () => {
        slideUpRef.current.close();
        navigation.navigate("EditProfileScreen");
      },
    },
    {
      title: "Settings",
      function: () => {
        navigation.navigate("SettingsScreen");
      },
    },
    {
      title: "Logout",
      function: () => {
        dispatch(logout());
      },
    },
  ];

  const OnRefresh = async () => {
    setRefreshing(true);
    setLimit((limit) => limit + 1);
    queryClient.invalidateQueries("social-profile-posts");
    setRefreshing(false);
  };

  const _pickDocument = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissions.granted === false) {
      alert("Permission is required");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      crop: true,
    });

    if (result.cancelled === true) return;
    // setImage(result);
    setDp(result.uri);
    handleSubmit(result);
  };

  const handleSubmit = async (image) => {
    dispatch(IsBttnloading(true));
    const formdata = new FormData();
    if (image) {
      let uriParts = image.uri.split(".");
      formdata.append("file", {
        uri: image.uri,
        name: image.uri.split("/").pop(),
        type: "image/" + uriParts[uriParts.length - 1],
      });
    }
    await editSocialMediaProfile(formdata)
      .then((res) => {
        if (res.msg === "Updated") {
          setDp(image.uri);
        }
        // setImage("");
        dispatch(initialUser(token));
        dispatch(IsBttnloading(false));
      })
      .catch((err) => {
        console.log("catch");
        dispatch(
          ErrorToggle({
            msg: "Problem while fetching your data",
            type: "error",
            toggle: true,
          })
        );
        dispatch(IsBttnloading(false));
      });
  };

  useEffect(async () => {
    if (user.dp) {
      await getImageUrl(user.dp).then((res) => {
        setDp(res.url);
      });
    }
  }, []);

  const renderItem = ({ item }) => (
    <ProfilePosts
      datas={item}
      user={{ ...user, dp: dp ? dp : null }}
      navigation={navigation}
    />
  );

  return (
    <Container style={{ backgroundColor: "#FAFAFA" }}>
      <RowBetween
        style={{ paddingTop: 24, paddingBottom: 8, paddingRight: 16 }}
      >
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={{ alignItems: "center" }}>
          <TopText style={{ color: "#000000", fontWeight: "bold" }}>
            Meetups Profile
          </TopText>
        </View>
        <IconButton
          icon="menu"
          size={24}
          onPress={() => slideUpRef.current.open()}
        />
      </RowBetween>

      <LinearGradient colors={["#363534", "#0a0a0a"]}>
        <ImageBackground
          blurRadius={5}
          style={{ width: "100%", height: 160 }}
          imageStyle={{ opacity: 0.15 }}
          source={
            dp && dp !== ""
              ? { uri: dp }
              : require("../assets/images/general/user.png")
          }
          resizeMode="cover"
        >
          <ProfileContainer
            style={{ flexDirection: "column", position: "relative" }}
          >
            <View
              style={{
                position: "absolute",
                zIndex: 10,
                borderWidth: 3,
                borderColor: "#FFF",
                borderRadius: 5,
                left: 20,
                top: 40,
              }}
            >
              <Image
                source={
                  dp && dp !== ""
                    ? { uri: dp }
                    : require("../assets/images/general/user.png")
                }
                resizeMode="contain"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 5,
                  backgroundColor: "white",
                }}
              />
              <TouchableOpacity onPress={_pickDocument} style={{}}>
                <MaterialCommunityIcons
                  name="circle-edit-outline"
                  color="#b98c13"
                  size={25}
                  style={{
                    position: "absolute",
                    right: -3,
                    bottom: 1.5,
                    backgroundColor: "white",
                  }}
                />
              </TouchableOpacity>
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
                style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
              >
                {capitalize(user.fname + " " + user.lname)}
              </Text>
              <Text style={{ color: "white", fontSize: 12, marginTop: 5 }}>
                {user.bio === "undefined" ? "No Bio" : user.bio}
              </Text>
              <Text style={{ color: "white", fontSize: 12, marginTop: 3 }}>
                {capitalize(user.city) + ", " + capitalize(user.state)}
              </Text>
            </ProfileContainer>
          </ProfileContainer>
        </ImageBackground>
      </LinearGradient>
      <ProfileContainer
        style={{
          paddingTop: 10,
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
            marginTop: 0,
            color: "#b98c13",
          }}
        >
          @{user.username}
        </Text>
        <View style={{ flex: 2, justifyContent: "flex-end", marginTop: 20 }}>
          <ProfileStats
            onPress={() => setSection("posts")}
            style={
              section === "photos" ||
              section === "posts" ||
              section === "timeline"
                ? { borderColor: "#b98c13" }
                : { borderColor: "transparent" }
            }
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {socialData.mypostlist.length}
            </Text>
            <Text style={{ fontSize: 12 }}>My Posts</Text>
          </ProfileStats>

          <ProfileStats
            onPress={() => setSection("friends")}
            style={
              section === "friends"
                ? { borderColor: "#b98c13", marginLeft: 8 }
                : { marginLeft: 8, borderColor: "transparent" }
            }
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {socialData.friends.length}
            </Text>
            <Text style={{ fontSize: 12 }}>Friends</Text>
          </ProfileStats>

          <ProfileStats
            onPress={() => setSection("requests")}
            style={
              section === "requests"
                ? { borderColor: "#b98c13", marginLeft: 8 }
                : { marginLeft: 8, borderColor: "transparent" }
            }
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {socialData.friendRequest.length}
            </Text>
            <Text style={{ fontSize: 12 }}>Requests</Text>
          </ProfileStats>
        </View>
      </ProfileContainer>

      <Divider style={{ height: 2 }} />

      {section === "posts" ? (
        socialData.mypostlist && socialData.mypostlist.length > 0 ? (
          <FlatList
            // inverted
            data={socialData.mypostlist}
            initialNumToRender={10}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            onEndReachedThreshold={1}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
            }
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                width: 200,
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Image
                style={{
                  width: 100,
                  height: 100,
                  opacity: 0.3,
                }}
                source={{
                  uri: "data:image/png;base64,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",
                }}
              ></Image>
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
        <></>
      )}

      {section === "friends" && (
        <Friends navigation={navigation} friends={socialData.friends} />
      )}
      {section === "requests" && (
        <Requests requests={socialData.friendRequest} />
      )}
      {/* </ScrollView> */}

      <OptionsModal slideUpRef={slideUpRef} options={options} />
    </Container>
  );
}
