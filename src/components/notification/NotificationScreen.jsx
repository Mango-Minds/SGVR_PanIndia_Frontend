import React, { useEffect } from "react";
import { FlatList, RefreshControl, ScrollView, Text } from "react-native";
import { IconButton } from "react-native-paper";
import { Container, RowBetween, View } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import NotificationCard from "./NotificationCard";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { readNotification } from "../../services/notification.services";
import { cloneDeep } from "lodash";
import { UpdateNotification } from "../../store/Handlers/Reducer.Handler";

export default function NotificationScreen({ navigation }) {
  const { notification } = useSelector((state) => state.user);

  const queryclient = useQueryClient();

  const getNotification = async () => {
    queryclient.invalidateQueries("socialScreenNotification");
  };

  const dispatch = useDispatch();

  useEffect(() => {
    readNotification("meetup");

    if (notification.meetup) {
      const notifications = notification.meetup;
      let newNotification = [];
      for (let i = 0; i < notifications.length; i++) {
        const item = notifications[i];
        if (item.isRead === false) {
          const newItem = { ...item, isRead: true };
          console.log(newItem);
          newNotification.push(newItem);
        } else {
          newNotification.push(item);
        }
      }
      dispatch(
        UpdateNotification({ ...notification, meetup: newNotification })
      );
    }
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

      {notification.meetup && notification.meetup.length > 0 ? (
        <FlatList
          data={notification.meetup}
          renderItem={({ item, index }) => {
            return (
              <NotificationCard
                cameFrom={"socialNotifications"}
                {...item}
                key={index}
              />
            );
          }}
          keyExtractor={(item, index) => index}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => getNotification()}
            />
          }
        />
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
    </Container>
  );
}
