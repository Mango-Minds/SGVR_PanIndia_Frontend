import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Divider, IconButton } from "react-native-paper";
import {
  Container,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import ActivityCard from "./ActivityCard";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserMatrimonyprofile } from "../../services/matrimony.services";
import { useNavigation } from "@react-navigation/native";

export default function ActivityScreen({}) {
  const navigation = useNavigation();
  const [myPhoto, setMyPhoto] = useState();
  const [likesGot, setLikesGot] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const queryClient = useQueryClient();
  useQuery(["matrimony-one-user"], getCurrentUserMatrimonyprofile, {
    onSuccess: async (data) => {
      // console.log(data);
      setLikesGot(data.data.like_got);
      setMyPhoto(data.data.photos[0]);
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          type: "error",
          msg: err.response.data.error,
          toggle: true,
        })
      );
    },
  });

  const OnRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries("matrimony-one-user");
    setRefreshing(false);
  };

  // if (isLoading)
  //   return (
  //     <ActivityIndicator
  //       style={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         flex: 1,
  //       }}
  //       size={"large"}
  //       color={"#b98c13"}
  //     />
  //   );
  // else
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
            style={{ color: "#D4AF37", fontSize: 22, fontWeight: "bold" }}
          >
            Activity
          </TopText>
        </View>
      </RowBetween>
      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="Search" />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <TouchableOpacity>
            <Icon name="magnify" size={24} />
          </TouchableOpacity>
        </View>
      </Row>
      {likesGot.length === 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
          }
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "50%",
              opacity: 0.2,
            }}
          >
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/3050/3050431.png",
              }}
              style={{ width: 120, height: 120, borderRadius: 6 }}
            />
            <Text style={{ marginTop: "5%", fontWeight: "bold", fontSize: 20 }}>
              No Recent activity
            </Text>
            <Text style={{ marginTop: "5%", fontWeight: "bold", fontSize: 14 }}>
              Pull down to refresh
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
          }
        >
          <Divider />
          {likesGot &&
            likesGot.length > 0 &&
            likesGot.map((item, index) => {
              return <ActivityCard item={item} myPhoto={myPhoto} key={index} />;
            })}
        </ScrollView>
      )}
    </Container>
  );
}
