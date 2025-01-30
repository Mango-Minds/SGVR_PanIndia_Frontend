import React from "react";
import { Card, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function CommunitySearchCard({ community }) {
  const navigation = useNavigation();
  const { _id } = community;

  return (
    <Card
      style={{
        marginVertical: 8,
        shadowColor: "#00000014",
        backgroundColor: "white",
      }}
      onPress={() => {
        navigation.navigate("CommunityProfile", { communityId: _id });
      }}
    >
      <Card.Title
        style={{ paddingBottom: 10 }}
        title={community.name}
        subtitle={community.address + ", " + community.city}
        titleStyle={{ fontSize: 16 }}
        subtitleStyle={{ fontSize: 12, color: "#454F63" }}
      />
      <Divider />
    </Card>
  );
}
