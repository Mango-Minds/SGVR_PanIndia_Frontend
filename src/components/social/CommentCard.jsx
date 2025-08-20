import React from "react";
import { Card, Button, Divider, IconButton } from "react-native-paper";
import { Image, Text } from "react-native";
import { RowBetween, View } from "../../styles/common.styles";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../services/socialMedia.services";
import { useNavigation } from "@react-navigation/native";

export default function CommentCard(props) {
  const { user } = useSelector((state) => state.user);

  const { comment } = props;
  
  // Add safety checks
  if (!comment) {
    console.warn("CommentCard: No comment data provided");
    return null;
  }

  const { userId, content, createdAt } = comment;

  console.log("Comment data:", comment);
  const navigation = useNavigation();

  const [dp, setDp] = React.useState();

  React.useEffect(() => {
    const fetchUserImage = async () => {
      if (userId && userId.image) {
        try {
          const res = await getImageUrl(userId.image);
          if (res.status === 0 && userId.image) {
            setDp(res.url);
          }
        } catch (error) {
          console.error("Error fetching user image:", error);
        }
      }
    };
    
    fetchUserImage();
  }, [userId]);

  const handleUserPress = () => {
    if (userId && userId._id) {
      navigation.navigate(
        user._id === userId._id ? "Profile" : "ViewUserScreen",
        user._id !== userId._id && {
          username: userId.firstName,
          userid: userId._id,
          userprofile: userId,
          userdp: dp,
        }
      );
    }
  };

  // Safety check for required data
  if (!userId || !content) {
    console.warn("CommentCard: Missing required data", { userId, content });
    return null;
  }

  return (
    <Card
      style={{
        marginHorizontal: 0,
        shadowColor: "transparent",
        backgroundColor: "transparent",
        borderBottomWidth: 0.5,
        borderBottomColor: "#EFEFEF",
        opacity: userId !== null ? 1 : 0.5,
      }}
      onPress={handleUserPress}
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
                {userId !== null
                  ? userId.firstName === user?.firstName
                    ? "You"
                    : (userId.firstName || "Unknown") + " " + (userId.lastName || "")
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
        </RowBetween>
      </Card.Content>
    </Card>
  );
}
