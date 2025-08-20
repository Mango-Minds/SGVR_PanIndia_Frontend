import React from "react";
import PopularHallCard from "./PopularHallCard";
import { Dimensions, ScrollView, View } from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function PopularHalls(props) {
  const _renderItem = ({ item, index }) => {
    return <PopularHallCard {...item} key={index} />;
  };

  // const navigation = props.navigation
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {props.data && props.data.map((item, index) => (
          <View key={index} style={{ marginRight: 16, width: windowWidth * 0.65 }}>
            <PopularHallCard {...item} />
          </View>
        ))}
      </ScrollView>
    </>
  );
}
