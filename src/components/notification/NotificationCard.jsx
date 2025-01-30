import React from "react";
import { Card, Divider } from "react-native-paper";
import { Image, Pressable, Text } from "react-native";
import { RowBetween, View } from "../../styles/common.styles";
import { getImageUrl } from "../../services/socialMedia.services";
import SelectDropdown from "react-native-select-dropdown";
import { useNavigation } from "@react-navigation/native";

export default function NotificationCard(props) {
  const navigation = useNavigation();
  const { name, profileImage, remarks, data, title, body, user, cameFrom } =
    props;
  console.log(props);
  const [dp, setDp] = React.useState(null);
  const username = React.useRef();

  React.useEffect(() => {
    if (data.statusCode === "NOT001") {
      username.current = data.user.fname;
      setDp({ uri: data.user.dp });
    } else if (data.statusCode === "NOT002") {
      username.current = data.userId.fname;
      setDp({ uri: data.userId.dp });
    } else if (data.statusCode === "NOT009" || data.statusCode === "NOT010") {
      username.current = title;
      setDp(null);
    } else if (data.statusCode === "NOT006") {
      console.log(data.event);
      username.current = title;
      setDp(
        data.event.images.length > 0
          ? { uri: data.event.images[0] }
          : require("../../assets/images/general/events-default.png")
      );
    } else if (data.statusCode === "NOT007") {
      username.current = title;
      setDp(
        data.community.images.length > 0
          ? { uri: data.community.images[0] }
          : require("../../assets/images/general/community.png")
      );
    }
  }, []);

  return (
    <Card
      style={{
        marginHorizontal: 0,
        marginBottom: 4,
        shadowColor: "transparent",
        backgroundColor: "transparent",
      }}
      onPress={async () => {
        if (data.statusCode === "NOT001") {
          if (data.meetupPost) {
            navigation.navigate("ViewSinglePost", {
              meetupPost: data.meetupPost,
            });
          } else {
            alert("Post has been deleted");
          }
        } else if (data.statusCode === "NOT002") {
          navigation.navigate("ViewUserScreenForNotification", {
            username: props.data.userId.username,
            userid: props.data.userId._id,
            userdp: props.data.userId.dp,
            userprofile: props.data.userId,
          });
        } else if (
          data.statusCode === "NOT009" ||
          data.statusCode === "NOT010"
        ) {
          navigation.navigate("Main");
        } else if (data.statusCode === "NOT007") {
          navigation.navigate("CommunityProfile", {
            communityId: data.community._id,
          });
        } else if (data.statusCode === "NOT006") {
          navigation.navigate("Event", {
            imgUrl: data.event.images,
            eventName: data.event.eventName,
            description: data.event.description,
            startdate: data.event.startdate,
            starttime: data.event.starttime,
            endtime: data.event.endtime,
            enddate: data.event.enddate,
            location: data.event.location,
            organizer: data.event.organizer,
            organizerPhone: data.event.organizerPhone,
            createdAt: data.event.createdAt,
          });
        }
      }}
    >
      <Card.Content>
        <RowBetween style={{ paddingBottom: 8 }}>
          <View style={{ alignItems: "center" }}>
            {/* {(cameFrom === "notificationScreen" ||
              cameFrom === "CommunityScreen" ||
              cameFrom === "socialNotifications") && (
              <Image
                source={
                  dp
                    ? { uri: dp }
                    : {
                        uri: "https://www.freeiconspng.com/thumbs/profile-icon-png/profile-icon-9.png",
                      }
                }
                style={{ width: 48, height: 48, borderRadius: 6 }}
              />
            )} */}

            {dp ? (
              <Image
                source={dp}
                style={{ width: 48, height: 48, borderRadius: 6 }}
              />
            ) : null}

            <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#454F63",
                  fontWeight: "bold",
                  marginLeft: 16,
                  textTransform: "capitalize",
                  lineHeight: 24,
                }}
              >
                {username.current}{" "}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#454F63",
                  marginLeft: 16,
                  fontWeight: "500",
                  lineHeight: 18,
                }}
              >
                {body}
              </Text>
            </View>
          </View>
        </RowBetween>
      </Card.Content>
      <Divider style={{ marginTop: 8 }} />
    </Card>
  );
}
