import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StyleSheet,
  Modal,
  st,
} from "react-native";
import Theme from "../styles/theme";
import { IconButton, Text } from "react-native-paper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import OptionsModal from "../components/modals/OptionsModal";
import ShareModal from "../components/modals/ShareModal";
import SocialCard from "../components/social/SocialCard";
import {
  getImageUrl,
  getSearchUsers,
  getSocialMediaProfile,
  getSocialMediaTimeline,
} from "../services/socialMedia.services";
import { Container, RowBetween, View } from "../styles/common.styles";
import { TopText } from "../styles/social.styles";
import messageIcon from "../assets/images/social/message.png";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ErrorToggle, updateConversation } from "../store/user";
import Icon from "react-native-vector-icons/Ionicons";
import { UpdateSocialData } from "../store/Handlers/Reducer.Handler";

export default function SocialScreen({ navigation }) {
  // console.log("Called social screen");
  const { user, socialData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const slideUpRef = useRef();
  const shareRef = useRef();
  const followRef = useRef(null);
  const blockRef = useRef(null);
  const shareOptionsRef = useRef();
  const page = useRef(1);

  const socpropost = useRef(false);
  const getfriendlist = useRef(false);

  const [modalData, setModalData] = React.useState({});
  const [selectedId, setSelectedId] = React.useState(null);

  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["social-timeline"],
    queryFn: getSocialMediaTimeline,
    onSuccess: (data) => {
      socpropost.current = true;
    },
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

  useQuery({
    queryKey: ["social-profile-posts"],
    queryFn: () => getSocialMediaProfile(user._id),
    onSuccess: async (data) => {
      for await (let item of data.result.posts) {
        let posturl = [];
        if (item.post && item.post.length > 0)
          for await (const value of item.post) {
            const get = await getImageUrl(value);
            if (get.status === 0) {
              posturl.push(get.url);
            }
          }
        item.post = posturl;
      }
      console.log(data.result.data.requests);
      // console.log(data.result.requests);

      await dispatch(
        UpdateSocialData({
          ...socialData,
          mypostlist: data.result.posts,
          friends: data.result.data.friends,
          friendRequest: data.result.data.requests,
        })
      );
      getfriendlist.current = true;
    },
    enabled: socpropost.current,
  });

  useQuery({
    queryKey: ["get-friend-list"],
    queryFn: getSearchUsers,
    onSuccess: async (data) => {
      if (data.profiles.length > 0) {
        for await (const item of data.profiles) {
          if (item && item.dp) {
            const get = await getImageUrl(item.dp);
            if (get.status === 0) {
              item.dp = get.url;
            }
          }
        }
        await dispatch(
          UpdateSocialData({ ...socialData, searchList: data.profiles })
        );
      }
    },
    enabled: getfriendlist.current,
  });

  const updateStorageConvo = async () => {
    const convodata = await AsyncStorage.getItem("conversation");
    if (convodata) {
      dispatch(updateConversation(JSON.parse(convodata)));
    }
  };

  // React.useEffect(() => {
  //   updateStorageConvo();
  //   queryClient.invalidateQueries("socialScreenNotification");
  // }, []);

  const options = [
    {
      title: "Message",
      function: (id, name) => {
        slideUpRef.current.close();
        navigation.navigate("ChatScreen", {
          toid: id,
          toName: name,
        });
      },
    },
    {
      title: "Report",
      function: () => {
        navigation.navigate("ReportScreen", { userId: data.userId });
      },
    },
    {
      title: "Unfollow",
      function: (id, name) => {
        followRef.current.data = { id, name };
        followRef.current.open();
      },
      followReff: followRef,
    },
    {
      title: "Block User",
      function: (id, name) => {
        blockRef.current.data = { id, name };
        blockRef.current.open();
      },
      blockReff: blockRef,
    },
  ];

  const shareOptions = [
    {
      title: "Create Timeline",
      function: () => {
        navigation.navigate("CreateTimelineScreen");
      },
    },
    {
      title: "Share with Friends",
      function: () => {
        shareRef.current.open();
      },
    },
  ];

  // useEffect(() => {
  //   console.log("Called schreen");
  // }, []);

  return (
    <Container style={{ backgroundColor: "white", paddingBottom: 0 }}>
      <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={{ alignItems: "center" }}>
          <TopText
            style={{
              color: "#000000",
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {user.fname} {user.lname}
          </TopText>
        </View>
        {/* <TouchableOpacity onPress={() => navigation.navigate("Temple")}>
          <Image
            source={Temple}
            style={{ width: 38, height: 38, marginRight: 20 }}
          />
        </TouchableOpacity> */}
        <TouchableOpacity onPress={() => navigation.navigate("MessageScreen")}>
          <Image
            source={messageIcon}
            style={{ width: 30, height: 28, marginRight: 15 }}
          />
        </TouchableOpacity>
      </RowBetween>
      {isError ? (
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="error-outline" color="#00000029" size={100} />
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#00000029" }}>
            Error Occured
          </Text>
        </View>
      ) : isLoading ? (
        <ActivityIndicator
          size="large"
          color={Theme.themeColor}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        />
      ) : data && data.results.length > 0 ? (
        <FlatList
          data={data.results}
          renderItem={({ item, index }) => (
            <SocialCard
              item={item}
              navigation={navigation}
              shareRef={shareRef}
              // shareOptionsRef={shareOptionsRef}
              shareOptionsRef={followRef}
              slideUpRef={slideUpRef}
              updateModalData={setModalData}
            />
          )}
          extraData={selectedId}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={async () => {
                await queryClient.invalidateQueries("social-timeline");
              }}
            />
          }
          keyExtractor={(item) => item._id}
          onEndReached={({ distanceFromEnd }) => {
            console.log(distanceFromEnd);
          }}
        />
      ) : (
        <ScrollView style={{ flex: 1, paddingTop: "50%" }}>
          <View style={styles.scrollContainer}>
            <Image
              source={require("../assets/images/social/magnifier.png")}
              style={{ width: 100, height: 100 }}
            />
            <Text
              style={{
                color: "#161616",
                fontSize: 22,
                fontWeight: "bold",
                marginTop: 26,
              }}
            >
              New Here?
            </Text>
            <Text
              style={{
                color: "#BCBCBC",
                fontSize: 16,
                marginTop: 10,
              }}
            >
              Let's connect with others
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Search");
              }}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: Theme.themeColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20,
                width: 180,
                padding: 16,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Find Friends
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <ShareModal 
        slideUpRef={shareRef} 
        friends={socialData?.searchList || []}
      />
      <OptionsModal
        slideUpRef={slideUpRef}
        options={options}
        data={modalData}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    alignSelf: "center",
  },
  container: {
    backgroundColor: "lightgrey",
    zIndex: 9999,
    paddingTop: 24,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    paddingBottom: 12,
    marginTop: 300,
    width: "95%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});
