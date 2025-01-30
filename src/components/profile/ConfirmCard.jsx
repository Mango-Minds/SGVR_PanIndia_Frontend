import React from "react";
import { Card, Button, Divider, IconButton } from "react-native-paper";
import { Image, Text } from "react-native";
import { FormButton, Row } from "../../styles/prelogin.styles";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../services/socialMedia.services";

export default function ConfirmCard(props) {
  const { user } = useSelector((state) => state.user);
  const navigation = useNavigation();

  const { username, onAcceptReq, onDeleteReq } = props;

  const [loading, setLoading] = React.useState(false);
  const [dp, setDp] = React.useState();
  const [show, setShow] = React.useState(true);

  React.useEffect(async () => {
    if (username.dp) {
      await getImageUrl(username.dp).then((res) => {
        setDp(res.url);
      });
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
        subtitle={username.city + ", " + username.state}
        titleStyle={{ fontSize: 16, textTransform: "capitalize" }}
        subtitleStyle={{
          fontSize: 12,
          color: "#454F63",
          textTransform: "capitalize",
        }}
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
        right={(props) => (
          <Row style={{ alignItems: "center" }}>
            {!loading ? (
              <IconButton
                icon="close"
                style={{
                  backgroundColor: "#E9EBEF",
                  marginRight: 8,
                  marginLeft: 8,
                  borderRadius: 4,
                }}
                onPress={async () => {
                  setLoading(true);
                  await onDeleteReq(username._id);
                  setLoading(false);
                  // setShow(false);
                }}
              />
            ) : null}
            <FormButton
              style={{
                marginRight: 8,
                marginRight: 16,
                paddingLeft: 16,
                paddingRight: 16,
                height: 36,
                marginTop: 0,
              }}
              onPress={async () => {
                setLoading(true);
                await onAcceptReq(username._id);
                setLoading(false);
                // setShow(false);
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#FFF", fontSize: 11 }}>
                {loading ? "Processing..." : "Accept"}
              </Text>
            </FormButton>
          </Row>
        )}
      />
      <Divider />
    </Card>
  );
}
