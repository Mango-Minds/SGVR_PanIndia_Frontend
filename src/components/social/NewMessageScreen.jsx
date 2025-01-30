import React from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { Divider, IconButton } from "react-native-paper";
import {
  Container,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NewMessageCard from "./NewMessageCard";
import { useSelector } from "react-redux";

export default function NewMessageScreen({ navigation }) {
  const { user, socialData } = useSelector((state) => state.user);

  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton
            icon="arrow-left"
            onPress={() => {
              navigation.goBack();
            }}
          />
          <TopText
            style={{ color: "#000000", fontSize: 22, fontWeight: "bold" }}
          >
            New Message
          </TopText>
        </View>
      </RowBetween>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="Search" />
      </Row>
      <ScrollView
        style={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Divider />
        {socialData.friends.length > 0 ? (
          socialData.friends.map((item, index) => (
            <NewMessageCard {...item} key={index} navigation={navigation} />
          ))
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 250,
            }}
          >
            <Icon name="account-search" size={30} color="#0000001A" />
            <Text
              style={{
                fontSize: 25,
                fontWeight: "800",
                color: "#0000001A",
              }}
            >
              Search Friends
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}
