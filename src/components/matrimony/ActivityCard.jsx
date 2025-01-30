import React, { useState } from "react";
import { Card, Button, Divider } from "react-native-paper";
import { Image, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LikeButton } from "../../styles/matrimony.styles";
import { Row } from "../../styles/dashboard.styles";
import {
  deleteLike,
  getMatrimonyOneUser,
} from "../../services/matrimony.services";
import { getImageUrl } from "../../services/socialMedia.services";
import { likeBackHandler } from "../../services/matrimony.services";
export default function ActivityCard(props) {
  //user id here is the id of person that liked currentLoggedin user
  const user = props.item;
  const myPhoto = props.myPhoto;
  const [myDp, setMyDp] = useState();
  const type = "request";
  const navigation = useNavigation();
  const [dp, setDp] = useState();
  const [name, setName] = useState();
  const [city, setCity] = useState();

  React.useEffect(() => {
    const insertData = async () => {
      // console.log(user , 'user');
      setName(user.fname + " " + user.lname);
      setCity(user.birthPlace);

      const res = await getImageUrl(user.photos[0]);
      setDp(res.url);
      const res2 = await getImageUrl(myPhoto);
      setMyDp(res2.url);
    };
    insertData();
  }, [user._id]);

  const likeBackHandlerHelper = async () => {
    const res = await likeBackHandler(user._id);
    navigation.navigate("MatrimonyMatch", { dp: dp, myDp: myDp });
  };

  const deleteLikeHandler = async () => {
    const res = await deleteLike(user._id);
  };
  return (
    <Card
      style={{
        marginVertical: 8,
        shadowColor: "#00000014",
        backgroundColor: "white",
      }}
      onPress={() => {
        navigation.navigate("MatrimonyViewUser", { userId: user._id });
      }}
    >
      <Card.Title
        style={{ paddingBottom: 10 }}
        title={name + " , " + city}
        subtitle="liked your profile"
        titleStyle={{ fontSize: 16, height: 0, marginBottom: 4 }}
        subtitleStyle={{ fontSize: 9, color: "#D4AF37" }}
        left={(props) => {
          return (
            <Image
              source={{
                uri:
                  dp ??
                  "https://img.icons8.com/office/344/gender-neutral-user.png",
              }}
              style={{ width: 46, height: 46, borderRadius: 6 }}
            />
          );
        }}
        right={(props) => (
          <>
            {type === "request" ? (
              <Row>
                <LikeButton
                  onPress={() => {
                    likeBackHandlerHelper();
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
                  onPress={() => deleteLikeHandler()}
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
            ) : (
              <LikeButton>
                <Text
                  style={{ fontWeight: "bold", color: "#FFF", fontSize: 11 }}
                >
                  Liked
                </Text>
              </LikeButton>
            )}
          </>
        )}
      />
      <Divider />
    </Card>
  );
}
