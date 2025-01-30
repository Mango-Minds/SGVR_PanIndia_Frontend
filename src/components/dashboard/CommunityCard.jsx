import React from "react";
import { ImageBackground, StyleSheet, Image, View } from "react-native";

import { Card } from "react-native-paper";
import {
  HallDetailsContainer,
  HallImageContainer,
  Heading,
  JobLocation,
  Rating,
  Row,
  TopHeader,
  ViewDetails,
} from "../../styles/dashboard.styles";
import { useNavigation } from "@react-navigation/native";
export default function CommunityCard(props) {
  const navigation = useNavigation();
  const { name, city, state, community, idx, _id } = props;

  const uri = { uri: community[idx] ? community[idx] : undefined };
  return (
    <Card
      style={{
        marginVertical: 5,
        shadowOffset: { width: 3, height: 3 },
        elevation: 4,
        shadowColor: "gray",
        marginHorizontal: 0,
        // width : "100%",
      }}
      onPress={() => {
        navigation.navigate("CommunityProfile", { communityId: _id });
      }}
    >
      <Card.Content style={{ flexDirection: "row" }}>
        <HallImageContainer>
          {uri.uri ? (
            <ImageBackground blurRadius={5} source={uri} style={[styles.bgDiv]}>
              <Image source={uri} resizeMode="contain" style={styles.imgg} />
              <View style={styles.overlay} />
            </ImageBackground>
          ) : (
            <>
              <Image
                source={require("../../assets/images/general/community.png")}
                resizeMode="contain"
                style={{ width: "100%", height: 100 }}
              />
            </>
          )}
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
  bgDiv: {
    width: "100%",
    display: "flex",
  },
  imgg: {
    zIndex: 9,
    width: "100%",
    height: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.363)",
  },
});
