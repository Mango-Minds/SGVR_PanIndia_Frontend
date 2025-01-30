import React, { useRef } from "react";
import { Card, Button, Divider } from "react-native-paper";
import { ActivityIndicator, Image, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../services/socialMedia.services";
import Icons from "react-native-vector-icons/Ionicons";

export default function MessageCard(props) {
  const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();
  const [dp, setDp] = React.useState();
  const profile = useRef();
  React.useEffect(async () => {
    for (let i = 0; i < props.user.length; i++) {
      const item = props.user[i];
      if (item._id === user._id) {
      } else {
        profile.current = item;
        const res = await getImageUrl(item.dp);
        if (res.status === 0 && item.dp) {
          setDp(res.url);
        }
        return;
      }
    }
  }, []);

  if (profile.current)
    return (
      <Card
        style={{
          marginVertical: 10,
          shadowColor: "#00000014",
          backgroundColor: "white",
        }}
        onPress={() => {
          navigation.navigate("ChatScreen", {
            toid: profile.current._id,
            toName: profile.current.fname + " " + profile.current.lname,
            index: props.index,
          });
        }}
      >
        <Card.Title
          style={{ paddingBottom: 10 }}
          title={profile.current?.fname + " " + profile.current?.lname}
          subtitle={
            props?.lastmsg?.sender === user._id.toString() ? (
              <>
                <Icons name="checkmark-done" size={16} color="#454F63" />{" "}
                {props?.lastmsg?.msg}
              </>
            ) : (
              props?.lastmsg?.msg
            )
          }
          titleStyle={{
            fontWeight: "bold",
            fontSize: 16,
            marginLeft: 16,
            color: "#454F63",
            textTransform: "capitalize",
          }}
          subtitleStyle={{
            fontSize: 12,
            color: "#454F63",
            marginLeft: 16,
            fontWeight: "500",
          }}
          subtitleNumberOfLines={2}
          left={(props) => {
            return (
              <Image
                source={
                  dp
                    ? { uri: dp }
                    : require("../../assets/images/general/user.png")
                }
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 10,
                  backgroundColor: "#fff",
                }}
                resizeMode="contain"
              />
            );
          }}
          // right={(props) => {
          //   return <NotificationAlertCircle />;
          // }}
        />
        <Divider style={{ marginTop: 5 }} />
      </Card>
    );
  else
    return (
      <ActivityIndicator
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
        size={"large"}
        color={"#b98c13"}
      />
    );
}
