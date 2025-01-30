import React, { useEffect } from "react";
import { RefreshControl, ScrollView, Text } from "react-native";
import { IconButton } from "react-native-paper";
import { Container, RowBetween, View } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import NotificationCard from "../../components/notification/NotificationCard";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { QueryClient } from "react-query";
import {
  getNotification,
  readNotification,
} from "../../services/notification.services";
import { UpdateNotification } from "../../store/Handlers/Reducer.Handler";
import update from "react-addons-update";
// import LikeCard from './LikeCard';

export default function CommunityNotifications({ navigation }) {
  const { notification } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const queryclient = new QueryClient();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    readNotification("community");
    let newnot = [];

    for (let i = 0; i < notification.community.length; i++) {
      const item = notification.community[i];
      if (item.isRead === false) {
        const newItem = update(item, { $set: { ...item, isRead: true } });
        newnot.push(newItem);
      } else {
        newnot.push(item);
      }
    }

    dispatch(UpdateNotification({ ...notification, community: newnot }));
  }, []);

  return (
    <Container
      style={{
        margin: 0,
        paddingLeft: 0,
        paddingRight: 0,
        backgroundColor: "#FAFAFA",
      }}
    >
      <RowBetween
        style={{
          paddingTop: 24,
          paddingBottom: 12,
          backgroundColor: "#FFFFFF",
        }}
      >
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
            Notifications
          </TopText>
        </View>
      </RowBetween>

      <ScrollView
        style={{ paddingVertical: 8, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={async () => {
              setRefreshing(true);
              // const data = await getNotification("community");
              // if (data && data.data && data.data.length > 0) {
              //   await dispatch(
              //     UpdateNotification({ ...notification, community: data.data })
              //   );
              // }
              queryclient.invalidateQueries("communityNotification");
              setRefreshing(false);
            }}
            refreshing={refreshing}
          />
        }
      >
        {notification.community && notification.community.length ? (
          notification.community.map((not, index) => (
            <NotificationCard
              cameFrom={"CommunityScreen"}
              {...not}
              key={index}
            />
          ))
        ) : (
          <View
            style={{
              marginTop: "60%",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="notifications"
              size={90}
              color="black"
              style={{
                opacity: 0.2,
              }}
            ></Ionicons>
            <Text
              style={{
                fontSize: 18,
                opacity: 0.2,
                fontWeight: "bold",
              }}
            >
              No Notifications
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}
