import React from "react";
import { Card, Button, Divider } from "react-native-paper";
import { Image, Text } from "react-native";
import { FollowingButton } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import {
  getImageUrl,
  getSocialMediaProfile,
  SendFriendRequest,
} from "../../services/socialMedia.services";
import { useSelector } from "react-redux";
import { useMutation } from "react-query";
import { ErrorToggle } from "../../store/user";
import { useDispatch } from "react-redux";

export default function ProfileCard(props) {
  const navigation = useNavigation();

  const { user, socialData } = useSelector((state) => state.user);

  const dispatch = useDispatch;

  const { username, onUnfollow } = props;

  // const [following, setFollowing] = React.useState(false);
  const [dp, setDp] = React.useState();
  const [myFriend, setMyFriend] = React.useState();
  const [requested, setRequested] = React.useState();

  React.useEffect(async () => {
    // await getSocialMediaProfile(user._id).then((res) => {
    socialData.friends.map((friendId, index) => {
      if (friendId._id === username._id) {
        setMyFriend(true);
      }
    });
    // });

    const res = await getImageUrl(username.dp);
    if (res.status === 0) {
      setDp(res.url);
    }

    if (username?.requests?.includes(user._id)) {
      setRequested(true);
    }
  }, []);

  const addFriendMutation = useMutation(SendFriendRequest, {
    onSuccess: (data) => {
      dispatch(
        ErrorToggle({
          msg: "Request sent!!!!",
          type: "error",
          toggle: true,
        })
      );
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          msg: "Might be a network issue",
          type: "error",
          toggle: true,
        })
      );
    },
  });

  const handleFollow = async (e) => {
    setRequested(true);
    await addFriendMutation.mutateAsync({ userid: username._id });
  };

  return (
    <Card
      style={{
        marginVertical: 8,
        shadowColor: "#00000014",
        backgroundColor: "white",
      }}
      onPress={() => {
        navigation.navigate(
          user._id === username._id ? "Main" : "ViewUserScreen",
          user._id !== username._id && {
            username: username.username,
            userid: username._id,
            userdp: dp,
            userprofile: username,
          }
        );
      }}
    >
      <Card.Title
        style={{ paddingBottom: 10 }}
        title={username.fname + " " + username.lname}
        subtitle={username.city}
        titleStyle={{ fontSize: 16, textTransform: "capitalize", margin: 0 }}
        subtitleStyle={{
          fontSize: 12,
          color: "#454F63",
          textTransform: "capitalize",
          margin: 0,
        }}
        left={() => {
          return (
            <Image
              source={
                dp
                  ? {
                      uri: dp,
                    }
                  : require("../../assets/images/general/user.png")
              }
              style={{ width: 46, height: 46, borderRadius: 6 }}
              resizeMode="contain"
            />
          );
        }}
        right={() => {
          return user._id !== username._id ? (
            myFriend && myFriend === true ? (
              <FollowingButton
                onPress={() => {
                  onUnfollow(username._id);
                  // setFollowing(false);
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#78849E",
                    fontSize: 11,
                  }}
                >
                  Unfollow
                </Text>
              </FollowingButton>
            ) : requested && requested === true ? (
              <FollowingButton>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#78849E",
                    fontSize: 11,
                  }}
                >
                  Requested
                </Text>
              </FollowingButton>
            ) : (
              <FollowingButton
                onPress={() => {
                  handleFollow();
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#78849E",
                    fontSize: 11,
                  }}
                >
                  Follow
                </Text>
              </FollowingButton>
            )
          ) : (
            <></>
          );
        }}
      />
      <Divider />
    </Card>
  );
}
