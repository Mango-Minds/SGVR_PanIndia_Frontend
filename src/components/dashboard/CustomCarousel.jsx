import React from "react";
import Carousel from "react-native-snap-carousel";
import { Dimensions } from "react-native";

const windowWidth = Dimensions.get("window").width;

export default function CustomCarousel(props) {
 return (
    <>
      <Carousel
        layout={"default"}
        data={props.data}
        renderItem={props.renderItem}
        itemWidth={props.itemWidth ?? windowWidth * 0.65}
        sliderWidth={props.sliderWidth ?? windowWidth}
        activeSlideAlignment={"start"}
        // autoplay={true}
        // loop={true}
       />
    </>
  );
}
