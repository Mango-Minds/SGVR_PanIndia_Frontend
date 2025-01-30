import React, { useState, useEffect } from "react";
import { Text, View, Image, Dimensions, TouchableOpacity } from "react-native";
import {
  JobType,
  NewsContainer,
  NewsContentContainer,
  NewsImage,
  NewsPreview,
  Row,
} from "../../styles/dashboard.styles";
import { getImageUrl } from "../../services/socialMedia.services";

export const NewsComponent = ({
  navigation,
  images,
  eventName,
  description,
  startdate,
  starttime,
  endtime,
  enddate,
  location,
  organizer,
  organizerPhone,
  createdAt,
}) => {
  const [img, setImg] = useState();
  useEffect(async () => {
    const res = await getImageUrl(images[0]);
    setImg(res.url);
  }, []);
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Event", {
          imgUrl: img,
          navigation: navigation,
          eventName: eventName,
          description: description,
          startdate: startdate,
          starttime: starttime,
          endtime: endtime,
          enddate: enddate,
          location: location,
          organizer: organizer,
          organizerPhone: organizerPhone,
          createdAt: createdAt,
        })
      }
    >
      <NewsContainer>
        <Image
          style={{
            borderRadius: 5,
            width: Dimensions.get("screen").width - 50,
            height: 150,
            resizeMode: "cover",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f7f7f7",
            flex: 1,
          }}
          source={{
            uri: img,
          }}
        />
        <NewsContentContainer>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "goldenrod",
                fontSize: 18,
                fontWeight: "bold",
                width: "80%",
                marginBottom: 0,
              }}
            >
              {eventName}
            </Text>
            <Text
              style={{
                color: "#797777",
                fontSize: 12,
                fontWeight: "600",
                // width: "40%",
              }}
            >
              {new Date(startdate).toLocaleDateString()}
            </Text>
          </View>
          <NewsPreview>
            {/* {description.length > 1000
            ? description.slice(0, 1000) + "..."
            : description} */}
            {description.slice(0, 200) + "..."}
          </NewsPreview>
        </NewsContentContainer>
      </NewsContainer>
    </TouchableOpacity>
  );
};
