import React from "react";
import {
  ScrollView,
  RefreshControl,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useMutation, useQueryClient } from "react-query";
import {
  AcceptFriendRequest,
  DeleteFriendRequest,
} from "../../services/socialMedia.services";
import { Container } from "../../styles/common.styles";
import ConfirmCard from "./ConfirmCard";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector } from "react-redux";
import { ErrorToggle } from "../../store/user";
import update from "react-addons-update";
import { UpdateSocialData } from "../../store/Handlers/Reducer.Handler";

export default function Requests() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { socialData } = useSelector((state) => state.user);

  const [refreshing, setRefreshing] = React.useState(false);

  const acceptRequestMutation = useMutation(AcceptFriendRequest, {
    onSuccess: async (data) => {},
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

  const deleteRequestMutation = useMutation(DeleteFriendRequest, {
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

  const OnRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries("social-profile-posts");
    setRefreshing(false);
  };

  const onDeleteReq = async (userid) => {
    const friendRequest = socialData.friendRequest;
    for (let i = 0; i < friendRequest.length; i++) {
      const item = friendRequest[i];
      if (item._id === userid) {
        deleteRequestMutation.mutateAsync({ userid });

        const newData = update(friendRequest, { $splice: [[i, 1]] });
        await dispatch(
          UpdateSocialData({ ...socialData, friendRequest: newData })
        );
      }
    }
    return;
  };

  const onAcceptReq = async (userid) => {
    const friendRequest = socialData.friendRequest;
    for (let i = 0; i < friendRequest.length; i++) {
      const item = friendRequest[i];
      if (item._id === userid) {
        acceptRequestMutation.mutateAsync({ userid });

        const newData = update(friendRequest, { $splice: [[i, 1]] });

        await dispatch(
          UpdateSocialData({
            ...socialData,
            friendRequest: newData,
            friends: [...socialData.friends, item],
          })
        );
      }
    }
    return;
  };

  return (
    <Container style={{ paddingRight: 0, paddingLeft: 0 }}>
      <ScrollView
        style={{}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={OnRefresh} />
        }
      >
        {socialData.friendRequest.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 100,
            }}
          >
            <Icon name="user-friends" size={70} color="#decc90" />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#decc90",
              }}
            >
              No Friends Requests
            </Text>
          </View>
        ) : (
          socialData.friendRequest?.map((item, index) => (
            <ConfirmCard
              onAcceptReq={onAcceptReq}
              onDeleteReq={onDeleteReq}
              username={item}
              key={index}
            />
          ))
        )}
      </ScrollView>
    </Container>
  );
}
