import React, { useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  RefreshControl,
} from "react-native";
import { Divider, IconButton } from "react-native-paper";
import {
  Container,
  InputField,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { TopText } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { getAllRequest } from "../../services/matrimony.services";
import NewConnection from "../../components/matrimony/Newconnection";

export default function MatrimonyMessageScreen({ navigation }) {
  const [requestsGot, setRequestsGot] = React.useState();
  const [refreshing, setRefreshing] = React.useState(false);
  const [refetch, setRefetch] = React.useState(0);
  useEffect(async () => {
    const res = await getAllRequest();
    setRequestsGot(res.fullProfileRequestsGot);
  }, [refetch]);

  const OnRefresh = async () => {
    setRefreshing(true);
    setRefetch(refetch + 1);
    setRefreshing(false);
  };

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
            Chat
          </TopText>
        </View>
      </RowBetween>

      <Row style={{ alignItems: "center", marginLeft: 16, marginRight: 16 }}>
        <SearchField placeholder="Search your message" />
        <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
          <TouchableOpacity>
            <Icon name="magnify" size={24} />
          </TouchableOpacity>
        </View>
      </Row>
      <Row>
        {/* <MatrimonyMessageSwitch
          uppercase={false}
          color={chatSection ? '#D4AF37' : '#D4D4D4'}
          style={{
            borderBottomWidth: chatSection ? 1 : 0,
          }}
          labelStyle={{
            color: chatSection ? '#B88B13' : '#898E92',
            letterSpacing: 0,
            fontSize: 16,
          }}
          onPress={() => setChatSection(true)}
        >
          Chat
        </MatrimonyMessageSwitch> */}
        {/* <MatrimonyMessageSwitch
          uppercase={false}
          color={!chatSection ? '#D4AF37' : '#D4D4D4'}
          style={{
            borderBottomWidth: !chatSection ? 1 : 0,
          }}
          labelStyle={{
            color: !chatSection ? '#B88B13' : '#898E92',
            letterSpacing: 0,
            fontSize: 16,
          }}
          onPress={() => setChatSection(false)}
        >
          New Connection
        </MatrimonyMessageSwitch> */}
      </Row>

      <View>
        {requestsGot && requestsGot.length !== 0 ? (
          <ScrollView
            style={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
            }
          >
            {requestsGot.map((item, index) => (
              <NewConnection {...item} key={index} />
            ))}
          </ScrollView>
        ) : (
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
              No Request found
            </Text>
          </View>
        )}
      </View>
    </Container>
  );
}
