import React, { useRef } from "react";
import {
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Modal,
  st,
} from "react-native";
import Theme from "../styles/theme";
import { ChatTextInput } from "../styles/social.styles";
import { IconButton, Text } from "react-native-paper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import OptionsModal from "../components/modals/OptionsModal";
import ShareModal from "../components/modals/ShareModal";
import SinglePostCard from "../components/social/SignlePostcard";
import {
  getSinglePost,
  getSocialMediaTimeline,
} from "../services/socialMedia.services";
import { Container, RowBetween, View } from "../styles/common.styles";
import { TopText } from "../styles/social.styles";
import messageIcon from "../assets/images/social/message.png";
import { useDispatch, useSelector } from "react-redux";
import {
  ErrorToggle,
  setLoadingInBtn,
  updateSocialDataFriends,
} from "../store/user";
import Icon from "react-native-vector-icons/Ionicons";
import CommentCard from "../components/social/CommentCard";

export default function SinglePostScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const slideUpRef = useRef();
  const shareRef = useRef();
  const followRef = useRef(null);
  // const shareOptionsRef = useRef();
  // const page = useRef(1);

  // const { socialData } = useSelector((state) => state.user);
  // const queryClient = useQueryClient();
  // const [showPopUp, setShowPopUp] = React.useState(false);
  const [modalData, setModalData] = React.useState({});
  // const [selectedId, setSelectedId] = React.useState(null);
  const [commentText, setCommentText] = React.useState("");

  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["getSinglePost"],
    queryFn: () => getSinglePost(route.params.meetupPost._id),
    onSuccess: (data) => {},
    onError: (err) => {
      // console.log(err);
      dispatch(
        ErrorToggle({
          msg: err.response.data.message,
          type: "error",
          toggle: true,
        })
      );
    },
  });

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
  ];

  return (
    <Container style={{ backgroundColor: "#FAFAFA", paddingBottom: 0 }}>
      <RowBetween style={{ paddingTop: 24, paddingRight: 16 }}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={{ alignItems: "center" }}>
          <TopText style={{ color: "#000000", fontWeight: "bold" }}>
            Meetups
          </TopText>
        </View>
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
          {/* <Icon name="profile" color="#00000029" size={100} /> */}
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
      ) : (
        <>
          <ScrollView
            style={{ paddingVertical: 5 }}
            showsVerticalScrollIndicator={false}
          >
            <SinglePostCard
              item={data.post}
              navigation={navigation}
              shareRef={shareRef}
              // shareOptionsRef={shareOptionsRef}
              shareOptionsRef={followRef}
              slideUpRef={slideUpRef}
              updateModalData={setModalData}
            />

          </ScrollView>
        </>
      )}

      <ShareModal slideUpRef={shareRef} />

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
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.2)",
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "column",
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
