import React, { useEffect } from "react";
import { Card, Button, Divider } from "react-native-paper";
import { Image, Text, View } from "react-native";
import { getImageUrl } from "../../services/socialMedia.services";
import { Row } from "../../styles/dashboard.styles";
import { LikeButton } from "../../styles/matrimony.styles";
import {
  fullProfileRequestAccept,
  fullProfileRequestReject,
} from "../../services/matrimony.services";
import { useNavigation } from "@react-navigation/native";

export default function NewConnection(props) {
  const [tempTxt, setTempTxt] = React.useState("");
  const navigation = useNavigation();
  const [dp, setDp] = React.useState();
  const [type, setType] = React.useState(props.status);
  const userId = props.user._id;

  useEffect(async () => {
    const res = await getImageUrl(props.user.photos[0]);
    setDp(res.url);
  }, []);

  const acceptRequestHandler = async () => {
    const res = await fullProfileRequestAccept(props.user._id);
    setType("accepted");
    navigation.navigate("MatrimonyViewUser", { userId: userId });
  };

  const deleteRequestHandler = async () => {
    const res = await fullProfileRequestReject(props.user._id);
    setType("rejected");
    navigation.navigate("Home");
  };

  return (
    <Card
      style={{
        marginVertical: 8,
        shadowColor: "#00000014",
        backgroundColor: "white",
      }}
      onPress={() => {
        navigation.navigate("MatrimonyViewUser", { userId: userId });
      }}
    >
      <Card.Title
        style={{ paddingBottom: 10 }}
        title={props.user.fname + " " + props.user.lname}
        subtitle={props.user.birthPlace}
        titleStyle={{
          fontSize: 16,
          height: 0,
          marginBottom: 4,
          textTransform: "capitalize",
        }}
        subtitleStyle={{ fontSize: 9, color: "#D4AF37" }}
        left={(props) => {
          return (
            <Image
              source={
                dp
                  ? { uri: dp }
                  : require("../../assets/images/general/user.png")
              }
              style={{ width: 50, height: 50, borderRadius: 6 }}
              resizeMode="cover"
            />
          );
        }}
        right={() => (
          <>
            {type === "pending" ? (
              <Row>
                <LikeButton
                  onPress={() => {
                    acceptRequestHandler();
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: 11,
                      borderColor: "#D4AF37",
                      borderWidth: 1,
                    }}
                  >
                    Confirm
                  </Text>
                </LikeButton>

                <LikeButton
                  onPress={() => {
                    deleteRequestHandler();
                  }}
                  style={{
                    backgroundColor: "white",
                    borderColor: "#D4AF37",
                    borderWidth: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "#D4AF37",
                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                  >
                    Delete
                  </Text>
                </LikeButton>
              </Row>
            ) : type === "rejected" ? (
              <View style={{ opacity: 0.4 }}>
                <LikeButton
                  style={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderWidth: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "black",
                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                  >
                    Rejected
                  </Text>
                </LikeButton>
              </View>
            ) : (
              <View style={{ opacity: 0.4 }}>
                <LikeButton
                  style={{
                    backgroundColor: "white",
                    borderColor: "green",
                    borderWidth: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "green",
                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                  >
                    Accepted
                  </Text>
                </LikeButton>
              </View>
            )}
          </>
        )}
      />
      <Divider />
    </Card>
  );
}
