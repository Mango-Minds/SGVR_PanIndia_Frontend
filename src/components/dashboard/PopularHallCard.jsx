import React, { useState, useEffect } from "react";
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import {
  Heading,
  JobLocation,
  Rating,
  Row,
  TopHeader,
} from "../../styles/dashboard.styles";
import { getImageUrl } from "../../services/socialMedia.services";
export default function PopularHallCard(props) {
  // console.log(props, "props");
  const [imgUrl, setImg] = useState();
  const {
    _id,
    name,
    emailId,
    city,
    state,
    images,
    rating,
    timing,
    services,
    address,
    about,
    contactNo,
  } = props || {};

  // const [image, setImage] = React.useState();
  // const image = React.useRef(null);
  useEffect(() => {
    (async () => {
      // // console.log(images[0],'popular card');
      try {
        if (images && images[0] !== undefined) {
          const res = await getImageUrl(images[0]);
          setImg(res.url);
        }
      } catch (error) {
        console.warn("Error loading image:", error);
      }
    })();
  }, []);
  // // console.log(props,'popular card');

  const navigation = useNavigation();
  return (
    <Card
      onPress={() =>
        navigation.navigate("Vendor", {
          _id,
          name,
          state,
          imgUrl,
          images,
          rating,
          timing,
          services,
          city,
          address,
          about,
          contactNo,
          emailId,
          navigation,
        })
      }
      style={{
        marginVertical: 8,
        shadowOffset: { width: 3, height: 5 },
        elevation: 2,
        shadowColor: "gray",
      }}
    >
      <Card.Cover
        source={
          imgUrl
            ? { uri: imgUrl }
            : require("../../assets/images/matrimony/default.png")
        }
        // source={{uri:imgUrl}}
        resizeMode="cover"
      />
      <Card.Content style={{ paddingTop: 16 }}>
        <TopHeader>
          <Heading style={{ color: "goldenrod", fontSize: 18 }}>{name}</Heading>
          {/* <Rating style={{ backgroundColor: "transparent", color: "#D4AF37" }}>
            {rating ? rating : "NA"}
          </Rating> */}
        </TopHeader>
        <Row>
          <JobLocation
            style={{ fontSize: 10, color: "gray", fontWeight: "500" }}
          >
            {city}, {state}
          </JobLocation>
        </Row>
        <Row
          style={{
            justifyContent: "space-between",
            marginTop: 8,
            display: "flex",
            flexDirection: "row",
          }}
        >
          <JobLocation
            style={{
              backgroundColor: "#F7EFD5",
              padding: 5,
              borderColor: "#D4AF37",
              borderWidth: 1,
              borderRadius: 4,
              fontSize: 10,
            }}
          >
            {services && services.length > 0 ? services : "Service provider"}
          </JobLocation>
          {/* <Timings>{timing}</Timings> */}
        </Row>
      </Card.Content>
    </Card>
  );
}
