import React from "react";
import { Card, Button, Divider } from "react-native-paper";
import { Image, Text, View } from "react-native";
import { FollowingButton } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import {
  SendFriendRequest,
  unfollowUser,
} from "../../services/socialMedia.services";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { ErrorToggle } from "../../store/user";

export default function SearchScreenUserThumb(props) {
  const dispatch = useDispatch();

  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const [requested, setRequested] = React.useState(props.item.isrequested);
  const [following, setFollowing] = React.useState(props.item.isFollowing);
  const [loading, setLoading] = React.useState(false);

  const addFriendMutation = useMutation(SendFriendRequest, {
    onSuccess: (data) => {
      setRequested(true);
      setLoading(false);
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

  const handleFollow = async (e) => {
    setLoading(true);
    await addFriendMutation.mutateAsync({ userid: props.item._id });
  };
  const handleUnfollow = async () => {
    setLoading(true);
    id = props.item._id;
    await unfollowUser({ userId: id });
    setFollowing(false);
    setLoading(false);
  };

  return (
    <View>
      <Card
        style={{
          marginVertical: 8,
          shadowColor: "#00000014",
          backgroundColor: "white",
        }}
        onPress={() => {
          navigation.navigate(
            user?._id === props.item._id ? "Main" : "ViewUserScreen",
            user._id !== props.item._id && {
              username: props.item.username,
              userid: props.item._id,
              setRequested: setRequested,
              userdp: props.item.dp,
              userprofile: { fname: props.item.fname, lname: props.item.lname },
            }
          );
        }}
      >
        <Card.Title
          style={{ paddingBottom: 10 }}
          title={props.item.fname + " " + props.item.lname}
          subtitle={"@" + props.item.username}
          titleStyle={{ fontSize: 16, textTransform: "capitalize" }}
          subtitleStyle={{ fontSize: 12, color: "#454F63" }}
          left={() => {
            return (
              <Image
                source={
                  props?.item?.dp
                    ? { uri: props.item.dp }
                    : require("../../assets/images/general/user.png")
                }
                style={{ width: 46, height: 46, borderRadius: 6 }}
                resizeMode="contain"
              />
            );
          }}
          right={() => (
            <>
              {loading ? (
                <FollowingButton
                  style={{
                    backgroundColor: "#B98C13",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "white",
                      fontSize: 11,
                    }}
                  >
                    {following ? "Unfollowing..." : "Requesting..."}
                  </Text>
                </FollowingButton>
              ) : following ? (
                <FollowingButton onPress={handleUnfollow}>
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
              ) : requested ? (
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
                  style={{
                    backgroundColor: "#B98C13",
                    display: user._id === props.item._id ? "none" : "flex",
                  }}
                  onPress={handleFollow}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#fff",
                      fontSize: 11,
                    }}
                  >
                    Follow
                  </Text>
                </FollowingButton>
              )}
            </>
          )}
        />
        <Divider />
      </Card>
    </View>
  );
}
