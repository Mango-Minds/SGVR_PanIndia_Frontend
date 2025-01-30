import React from "react";
import { Image } from "react-native";
import { Button, Card } from "react-native-paper";
import {
  HallDetailsContainer,
  HallImageContainer,
  Heading,
  JobHeading,
  JobLocation,
  Rating,
  Row,
  Timings,
  TopHeader,
} from "../../styles/dashboard.styles";
export default function HallCard(props) {
  const { title, location, img, rating, timings } = props;
  return (
    <Card
      style={{
        marginVertical: 8,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginHorizontal: 2,
        elevation: 3,
      }}
    >
      <Card.Content style={{ flexDirection: "row" }}>
        <HallImageContainer>
          <Image
            source={img}
            resizeMode="contain"
            style={{ width: "100%", height: 100 }}
          />
        </HallImageContainer>
        <HallDetailsContainer>
          <TopHeader>
            <Heading>{title}</Heading>
            <Rating
              style={{ backgroundColor: "transparent", color: "#D4AF37" }}
            >
              {rating}
            </Rating>
          </TopHeader>
          <Row>
            <JobLocation>{location}</JobLocation>
          </Row>
          <Row>
            {timings.map((time, idx) => (
              <Timings key={idx}>{time}</Timings>
            ))}
          </Row>
        </HallDetailsContainer>
      </Card.Content>
    </Card>
  );
}
