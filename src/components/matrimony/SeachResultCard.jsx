import React, { useState, useEffect } from "react";
import { Card, Button, Divider } from "react-native-paper";
import { Image, Text } from "react-native";
import { FollowingButton } from "../../styles/social.styles";
import { useNavigation } from "@react-navigation/native";
import { getImageUrl } from "../../services/socialMedia.services";
export default function SearchResult(props) {
  const [dp, setDp] = useState();
  const { _id, fname, lname, photos, currentcity } = props;

  useEffect(async () => {
    const res = await getImageUrl(photos[0]);
    setDp(res.url);
  }, [photos[0]]);
  const navigation = useNavigation();
  return (
    <Card
      style={{
        marginVertical: 8,
        shadowColor: "#00000014",
        backgroundColor: "white",
      }}
      onPress={() => {
        navigation.navigate("MatrimonyViewUser", { userId: _id });
      }}
      key={props.index}
    >
      <Card.Title
        style={{ paddingBottom: 10 }}
        title={fname + lname}
        subtitle={currentcity}
        titleStyle={{ fontSize: 16 }}
        subtitleStyle={{ fontSize: 12, color: "#454F63" }}
        left={(props) => {
          return (
            <Image
              source={{
                uri: dp ?? "https://i.pravatar.cc/100",
              }}
              style={{ width: 46, height: 46, borderRadius: 6 }}
            />
          );
        }}
      />
      <Divider />
    </Card>
  );
}
