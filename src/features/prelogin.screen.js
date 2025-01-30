import React, { useCallback, useRef, useState } from "react";
import { MainContainer, MainCarousel } from "../styles/prelogin.styles";
import { Dimensions } from "react-native";
import { Slide } from "../components/prelogin/Slide.component";
import { slideList } from "../components/prelogin/slideList";

const windowWidth = Dimensions.get("window").width;

const CarouselScreen = () => {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  indexRef.current = index;
  const onScroll = useCallback((event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const indexCount = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(indexCount);
    const distance = Math.abs(roundIndex - indexCount);
    const isNoMansLand = distance > 0.4;

    if (roundIndex !== indexRef.current && !isNoMansLand) {
      setIndex(roundIndex);
    }
  }, []);

  const flatListOptimizationProps = {
    initialNumToRender: 0,
    maxToRenderPerBatch: 1,
    removeClippedSubviews: true,
    scrollEventThrottle: 16,
    windowSize: 2,
    keyExtractor: useCallback((e) => e.id, []),
    getItemLayout: useCallback(
      // eslint-disable-next-line no-shadow
      (_, index) => ({
        index,
        length: windowWidth,
        offset: index * windowWidth,
      }),
      []
    ),
  };

  return (
    <>
      <MainContainer>
        <MainCarousel
          data={slideList}
          renderItem={({ item }) => {
            return (
              <Slide
                data={slideList[index]}
                setIndex={setIndex}
                index={index}
              />
            );
          }}
          pagingEnabled
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          {...flatListOptimizationProps}
        />
      </MainContainer>
    </>
  );
};

export default CarouselScreen;
