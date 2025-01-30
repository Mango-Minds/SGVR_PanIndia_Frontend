import React from "react";
import { Card } from "react-native-paper";
import { Image, Text } from "react-native";
import {
  JobDetails,
  JobHeading,
  JobLocation,
  JobSalary,
  JobType,
  Rating,
  Row,
  TopHeader,
} from "../../styles/dashboard.styles";
export default function JobCard(props) {
  const {
    title,
    salary,
    type,
    workType,
    location,
    requirement,
    posted,
    img,
    rating,
  } = props;
  return (
    <Card
      style={{
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,

        elevation: 3,
      }}
    >
      <Card.Content>
        <TopHeader>
          <Image source={img} style={{ width: 84, resizeMode: "contain" }} />
          <Rating>{rating}</Rating>
        </TopHeader>

        <JobDetails>
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <JobHeading>{title}</JobHeading>
            <JobSalary>
              <Text style={{ color: "#898e92" }}>{salary}</Text>
            </JobSalary>
          </Row>
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <JobType>{type}</JobType>

            <JobSalary style={{ marginTop: 8 }}>
              <Text style={{ color: "#898e92" }}>{workType}</Text>
            </JobSalary>
          </Row>
          <JobLocation>{location}</JobLocation>
        </JobDetails>

        <Row
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            marginTop: 12,
          }}
        >
          <JobHeading>{requirement}</JobHeading>
          <JobType>{posted}</JobType>
        </Row>
      </Card.Content>
    </Card>
  );
}
