import React from "react";
import { Image, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import {
  HallDetailsContainer,
  HallImageContainer,
  Heading,
  JobLocation,
  Row,
  TopHeader,
  ViewDetails,
} from "../../styles/dashboard.styles";
import { useNavigation } from "@react-navigation/native";

export default function CommunityCard({ name, city, state, _id }) {
  const navigation = useNavigation();

  return (
    <Card style={styles.card} onPress={() => navigation.navigate("CommunityProfileNew")}>
      <Card.Content style={styles.cardContent}>
        <HallImageContainer>
          <Image
            source={require("../../assets/images/general/community.png")}
            resizeMode="contain"
            style={styles.image}
          />
        </HallImageContainer>
        <HallDetailsContainer>
          <TopHeader>
            <Heading>{name}</Heading>
          </TopHeader>
          <Row>
            <JobLocation>
              {city}, {state}
            </JobLocation>
          </Row>
          <ViewDetails>View Details</ViewDetails>
        </HallDetailsContainer>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 0,
    backgroundColor: "white",
    marginTop: 5,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  cardContent: {
    flexDirection: "row",
  },
  image: {
    width: "100%",
    height: 100,
  },
});
