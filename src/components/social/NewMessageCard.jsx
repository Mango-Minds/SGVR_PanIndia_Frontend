import React, { useEffect } from "react";
import { Card, Button, Divider } from "react-native-paper";
import { Image, Text, View } from "react-native";
import { getImageUrl } from "../../services/socialMedia.services";
import { useNavigation } from "@react-navigation/native";
export default function NewMessageCard(props) {
  const [tempTxt, setTempTxt] = React.useState("");
  const navigation = useNavigation();
  const [dp, setDp] = React.useState();
  const [type, setType] = React.useState(props.status);
  const userId = props._id;
  React.useEffect(async () => {
    const res = await getImageUrl(props.dp);
    if (res.status === 0) {
      setDp(res.url);
    }
  }, []);
  return (
    <Card
      style={{
        marginVertical: 8,
        shadowColor: "#00000014",
        backgroundColor: "white",
      }}
      onPress={() => {
        navigation.navigate("ChatScreen", {
          toid: props._id,
          toName: props.fname + " " + props.lname,
        });
      }}
    >
      <Card.Title
        style={{ paddingBottom: 10 }}
        title={props.fname + " " + props.lname}
        subtitle={"@" + props.username}
        titleStyle={{
          fontSize: 16,
          // height: 0,
          // marginBottom: 4,
          textTransform: "capitalize",
        }}
        subtitleStyle={{ fontSize: 12, color: "#D4AF37" }}
        left={(props) => {
          return (
            <Image
              source={
                dp
                  ? { uri: dp }
                  : require("../../assets/images/general/user.png")
              }
              style={{ width: 46, height: 46, borderRadius: 6 }}
              resizeMode="contain"
            />
          );
        }}
      />
      <Divider />
    </Card>
  );
}
