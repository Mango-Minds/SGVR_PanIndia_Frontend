import React, { useEffect, useState } from "react";
import { Card, Checkbox } from "react-native-paper";
import { Image, Text } from "react-native";

export default function ShareCard(props) {
  const {
    username,
    fname,
    lname,
    midname,
    setBufferArray,
    bufferArray,
    bufferArrayNames,
    setBufferArrayNames,
  } = props;
  const [tcCheck, setTcCheck] = React.useState(
    bufferArray.includes(props._id) ? true : false
  );
  useEffect(() => {
    if (tcCheck) {
      setBufferArray([...bufferArray, props._id]);
      setBufferArrayNames([...bufferArrayNames, props.username]);
    } else {
      let temp = [];
      let temp2 = [];
      temp = bufferArray.filter((item, index) => {
        return item !== props._id && item;
      });
      temp2 = bufferArrayNames.filter((item, index) => {
        return item !== props.username && item;
      });
      setBufferArray(temp);
      setBufferArrayNames(temp2);
    }
  }, [tcCheck]);

  return (
    <Card
      style={{
        marginVertical: 3,
        shadowColor: "#00000014",
        backgroundColor: "white",
        margin: 0,
      }}
    >
      <Card.Title
        style={{ paddingBottom: 10 }}
        title={fname + " " + midname + (midname ? " " : "") + lname}
        subtitle={"@" + username}
        titleStyle={{ fontSize: 16, textTransform: "capitalize" }}
        subtitleStyle={{ fontSize: 12, color: "#454F63" }}
        // left={(props) => {
        //   return (t
        //     <Image
        //       source={{
        //         uri: dp,
        //       }}
        //       style={{ width: 46, height: 46, borderRadius: 6 }}
        //     />
        //   );
        // }}
        right={(props) => (
          <Checkbox.Android
            uncheckedColor="#d4af37"
            color="#d4af37"
            style={{ marginRight: 12 }}
            status={tcCheck ? "checked" : "unchecked"}
            onPress={() => setTcCheck(!tcCheck)}
          />
        )}
      />
    </Card>
  );
}
