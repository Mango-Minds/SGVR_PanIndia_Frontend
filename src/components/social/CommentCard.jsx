import React from "react";
import { Card, Button, Divider, IconButton } from "react-native-paper";
import { Image, Text } from "react-native";
import { RowBetween, View } from "../../styles/common.styles";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../services/socialMedia.services";
import { useNavigation } from "@react-navigation/native";

export default function CommentCard(props) {
  const { user } = useSelector((state) => state.user);

  const { username, content, userid, fname } = props;

  console.log(props);
  const navigation = useNavigation();

  const [dp, setDp] = React.useState();

  React.useEffect(async () => {
    const res = await getImageUrl(props.userid.dp);
    if (res.status === 0 && props.userid.dp) {
      setDp(res.url);
    }
  }, []);

  return (
    <Card
      style={{
        marginHorizontal: 0,
        shadowColor: "transparent",
        backgroundColor: "transparent",
        borderBottomWidth: 0.5,
        borderBottomColor: "#EFEFEF",
        opacity: userid !== null ? 1 : 0.5,
      }}
      onPress={() => {
        userid !== null &&
          navigation.navigate(
            user._id === props.userid._id ? "Profile" : "ViewUserScreen",
            user._id !== props.userid._id && {
              username: props.username,
              userid: props.userid._id,
              userprofile: props.userid,
              userdp: dp,
            }
          );
      }}
    >
      <Card.Content>
        <RowBetween>
          <View style={{ alignItems: "center" }}>
            <Image
              source={
                dp
                  ? { uri: dp }
                  : require("../../assets/images/general/user.png")
              }
              resizeMode="contain"
              style={{ width: 46, height: 46, borderRadius: 6 }}
            />
            <View
              style={{
                flexDirection: "column",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: "#454F63",
                  fontWeight: "bold",
                  marginLeft: 8,
                  marginRight: 16,
                }}
              >
                {userid !== null
                  ? username === user.username
                    ? "You"
                    : "@" + username
                  : "@user_not_found"}
                {"  "}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  marginLeft: 12,
                  marginTop: 4,
                  color: "#454F63",
                  fontWeight: "normal",
                }}
              >
                {content}
              </Text>
            </View>
          </View>
          {/* <Image
            source={require("../../assets/images/social/heart-filled.png")}
            style={{ width: 17, height: 14, marginRight: 8 }}
          /> */}
          {/* <Image
            source={require('../../assets/images/social/heart-transparent.png')}
            style={{ width: 17, height: 14, marginRight: 8 }}
          /> */}
        </RowBetween>
      </Card.Content>
      {/* <Divider /> */}
    </Card>
  );
}
