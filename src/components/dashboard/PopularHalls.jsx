import React from "react";
import PopularHallCard from "./PopularHallCard";
import Carousel from "react-native-snap-carousel";
import { Dimensions } from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function PopularHalls(props) {
  const _renderItem = ({ item, index }) => {
    return <PopularHallCard {...item} key={index} />;
  };

  // const navigation = props.navigation
  return (
    <>
      <Carousel
        layout={"default"}
        data={props.data}
        renderItem={_renderItem}
        itemWidth={windowWidth * 0.65}
        sliderWidth={windowWidth}
        activeSlideAlignment={"start"}
      />
    </>
  );
}
