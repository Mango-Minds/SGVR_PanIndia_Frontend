import React from "react";
import {
  ScrollView,
  Text,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import {
  Container,
  InputField,
  RowBetween,
  SearchField,
  View,
} from "../../styles/common.styles";

import Icon from "react-native-vector-icons/MaterialIcons";
import ProfileCard from "./ProfileCard";
import { unfollowSocialMediaProfile } from "../../services/socialMedia.services";
import { useMutation, useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { ErrorToggle, updateSocialDataFriendsCount } from "../../store/user";
import update from "react-addons-update";
import { UpdateSocialData } from "../../store/Handlers/Reducer.Handler";

export default function Friends({ navigation }) {
  const { socialData } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = React.useState(false);

  const unfollowMutation = useMutation(unfollowSocialMediaProfile, {
    onSuccess: async (data) => {
      // await queryClient.invalidateQueries("social-profile-posts");
    },
    onError: (err) => {
      dispatch(
        ErrorToggle({
          msg: err.response.data.message,
          type: "error",
          toggle: true,
        })
      );
    },
  });

  const onUnfollow = async (username) => {
    const friends = socialData.friends;
    for (let i = 0; i < friends.length; i++) {
      const item = friends[i];
      if (item._id === username) {
        const newData = update(friends, { $splice: [[i, 1]] });
        unfollowMutation.mutateAsync({ username });
        await dispatch(UpdateSocialData({ ...socialData, friends: newData }));
      }
    }
  };

  const OnRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries("social-profile-posts");
    setRefreshing(false);
  };
  return (
    <Container
      style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
    >
      <ScrollView
        style={{}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
        }
      >
        {socialData.friends.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 100,
              flexDirection: "column",
            }}
          >
            <Icon name="person-add" size={100} color="#decc90" />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#decc90",
              }}
            >
              Don't Have Friends?
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Search");
              }}
              style={{
                marginTop: 20,
                backgroundColor: "#D4AF37",
                padding: 15,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: "bold",
                  letterSpacing: 0.3,
                }}
              >
                Search Friends
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          socialData.friends?.map((item, index) => (
            <ProfileCard
              onUnfollow={onUnfollow}
              username={item}
              key={index}
              navigation={navigation}
            />
          ))
        )}
      </ScrollView>
    </Container>
  );
}
