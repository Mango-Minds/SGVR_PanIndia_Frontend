import React, { useState, useEffect } from "react";
import { Card, Button, Divider } from "react-native-paper";
import { Image, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SearchResultVcard(props) {
  //   const [dp,setDp] = useState();
  const {
    _id,
    name,
    state,
    images,
    rating,
    timing,
    services,
    city,
    address,
    about,
    contactNo,
    emailId,
  } = props;

  //   useEffect(async() => {
  //    const res = await getImageUrl(photos[0])
  //    setDp(res.url)
  //   }, [photos[0]])
  const navigation = useNavigation();
  return (
    <Card
      style={{
        marginVertical: 8,
        shadowColor: "#00000014",
        backgroundColor: "white",
      }}
      onPress={() =>
        navigation.navigate("Vendor", {
          _id,
          name,
          state,
          images,
          rating,
          timing,
          services,
          city,
          address,
          about,
          contactNo,
          navigation,
          emailId,
        })
      }
      key={props.index}
    >
      <Card.Title
        style={{ paddingBottom: 10 }}
        title={name}
        subtitle={city}
        titleStyle={{ fontSize: 16 }}
        subtitleStyle={{ fontSize: 12, color: "#454F63" }}
        left={(props) => {
          return (
            <Image
              source={{
                uri: "data:image/png;base64,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",
              }}
              style={{ width: 46, height: 46, borderRadius: 6, opacity: 0.4 }}
            />
          );
        }}
      />
      <Divider />
    </Card>
  );
}
