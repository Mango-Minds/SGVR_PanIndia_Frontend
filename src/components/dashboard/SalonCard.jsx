import React from "react";
import { Card } from "react-native-paper";
import {
  JobHeading,
  JobLocation,
  Rating,
  Row,
  TopHeader,
} from "../../styles/dashboard.styles";
export default function SalonCard(props) {
  const { title, location, img, rating } = props;
  return (
    <Card style={{ marginVertical: 8, shadowColor: "#00000014" }}>
      <Card.Cover source={img} resizeMode="contain" />

      <Card.Content>
        <TopHeader style={{ paddingTop: 16 }}>
          <JobHeading>{title}</JobHeading>
          <Rating>{rating}</Rating>
        </TopHeader>
        <Row>
          <JobLocation>{location}</JobLocation>
        </Row>
      </Card.Content>
    </Card>
  );
}
