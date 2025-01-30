import React from "react";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import { Chip, Divider, IconButton } from "react-native-paper";
import {
  Container,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function CommunityHomeScreen({ navigation }) {
  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center" }}>
          <IconButton icon="chevron-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
          >
            Community
          </TopText>
        </View>
        {/* <IconButton icon="bell-outline" style={{ marginLeft: 'auto' }}></IconButton> */}
        <IconButton
          icon="account-circle"
          onPress={() => navigation.navigate("SettingsScreen")}
        ></IconButton>
      </RowBetween>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="Search Community" />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <TouchableOpacity>
            <Icon name="magnify" size={24} />
          </TouchableOpacity>
        </View>
      </Row>
      <Row
        style={{
          alignItems: "center",
          marginLeft: 16,
          marginRight: 16,
          marginVertical: 16,
          height: 40,
        }}
      >
        <Image
          source={require("../../assets/images/community/location.png")}
          style={{ width: 24, height: 24 }}
        />
        <Chip
          style={{
            alignItems: "center",
            backgroundColor: "#F7EFD5",
            marginLeft: 8,
          }}
          closeIcon="close"
        >
          Bangalore
        </Chip>

        <Chip
          style={{
            alignItems: "center",
            backgroundColor: "#F7EFD5",
            marginLeft: 8,
          }}
          closeIcon="close"
        >
          Hubi
        </Chip>
      </Row>
      <ScrollView
        style={{ paddingVertical: 16, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* {hallData.map((hall, idx) => (
          <CommunityCard {...hall} key={idx} />
        ))} */}
      </ScrollView>
    </Container>
  );
}
