import React from "react";
import {
  SlideContainer,
  SlideTitle,
  SlideBottom,
  SlideTop,
  SlideText,
  SlideBottomMain,
  NextButton,
  SlideBottomButtons,
} from "../../styles/prelogin.styles";
import { Pagination } from "./Pagination-component";
import Icon from "react-native-vector-icons/MaterialIcons";
import SlideHeader from "./SlideHeader.component";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const Slide = ({ data, index, setIndex, click }) => {
  const navigation = useNavigation();

  const onNextClick = () =>
    setIndex((prev) => {
      if (prev === 4) {
        return 0;
      }
      return prev + 1;
    });

  const onSkipClick = async () => {
    await AsyncStorage.setItem("firsttime", "true");
    navigation.navigate("Login");
  };

  return (
    <SlideContainer>
      <SlideTop source={data.image}></SlideTop>
      <SlideHeader onSkip={onSkipClick} showSkip={index === 4 ? false : true} />
      <SlideBottom>
        <SlideBottomMain>
          <SlideTitle>{data.title}</SlideTitle>
          {/* <SlideText>{data.text}</SlideText> */}
        </SlideBottomMain>
        <SlideBottomButtons>
          <Pagination index={index} />
          <NextButton
            mode="contained"
            uppercase={false}
            labelStyle={{
              color: "#2B2B2B",
              fontSize: 18,
              fontWeight: "bold",
            }}
            onPress={async () => {
              console.log(index);
              if (index === 5) {
                await AsyncStorage.setItem("firsttime", "true");
                navigation.navigate("Login");
              } else {
                onNextClick();
              }
            }}
          >
            {index === 5 ? "Get Started" : "Next"}
            <Icon size={13} name="arrow-forward-ios" />
          </NextButton>
        </SlideBottomButtons>
      </SlideBottom>
    </SlideContainer>
  );
};
