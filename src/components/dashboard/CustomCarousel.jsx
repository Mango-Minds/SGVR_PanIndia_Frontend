import React from "react";
import { Dimensions, ScrollView, View } from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function CustomCarousel(props) {
 return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {props.data && props.data.map((item, index) => (
          <View key={index} style={{ marginRight: 16, width: props.itemWidth ?? windowWidth * 0.65 }}>
            {props.renderItem({ item, index })}
          </View>
        ))}
      </ScrollView>
    </>
  );
}
