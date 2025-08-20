import React from "react";
import { Card, Button, Divider } from "react-native-paper";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { FollowingButton } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import {
  getImageUrl,
  SendFriendRequest,
} from "../../services/socialMedia.services";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { ErrorToggle } from "../../store/user";

export default function LikeCard(props) {
  const dispatch = useDispatch();
  const { username, _id, fname, isFollowing, isrequested, midname, lname, dp } =
    props.cameFrom === "searchScreen" ? props.item : props.item.user;
  const userid = _id;
  const [dpUrl, setDpUrl] = React.useState();
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.user);
  const [requested, setRequested] = React.useState(isrequested);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(async () => {
    const res = await getImageUrl(dp);
    if (res.status === 0 && dp) {
      setDpUrl(res.url);
    }
  }, []);
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
    await addFriendMutation.mutateAsync({ userid });
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
            user?._id === userid ? "Main" : "ViewUserScreen",
            user._id !== userid && {
              username: username,
              userid: userid,
              setRequested: setRequested,
              userdp: dp,
              userprofile: { fname: fname, lname: lname },
            }
          );
        }}
      >
        <Card.Title
          style={{ paddingBottom: 10 }}
          title={fname + " " + lname}
          subtitle={"@" + username}
          titleStyle={{ fontSize: 16, textTransform: "capitalize" }}
          subtitleStyle={{ fontSize: 12, color: "#454F63" }}
          left={(props) => {
            return (
              <Image
                source={
                  dpUrl
                    ? { uri: dpUrl }
                    : require("../../assets/images/general/user.png")
                }
                style={{ width: 46, height: 46, borderRadius: 6 }}
                resizeMode="contain"
              />
            );
          }}
          right={(props) => (
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
                    Requesting...
                  </Text>
                </FollowingButton>
              ) : isFollowing ? (
                <FollowingButton>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#78849E",
                      fontSize: 11,
                    }}
                  >
                    Following
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
                    display: user._id === userid ? "none" : "flex",
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
