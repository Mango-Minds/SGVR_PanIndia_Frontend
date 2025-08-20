import React from "react";
import { ActivityIndicator, ScrollView, Platform } from "react-native";
import { Divider, IconButton } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { getAllLikes } from "../../services/socialMedia.services";
import { Container, RowBetween, View } from "../../styles/common.styles";
import { TopText } from "../../styles/social.styles";
import LikeCard from "./LikeCard";
import { useDispatch } from "react-redux";
import { ErrorToggle } from "../../store/user";

export default function LikeScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const { postId } = route.params;
  const { data, isError, error, isLoading } = useQuery(
    ["post-likes", postId],
    () => getAllLikes({ postId }),
    {
      onSuccess: (data) => {
        // console.log("in likescreen");
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
    }
  );
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
            Likes
          </TopText>
        </View>
      </RowBetween>

      <ScrollView
        style={{ width: "100%", paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Divider />
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            {data.data && data.data.length > 0 ? (
              data.data.map(
                (item, index) =>
                  item.user !== null && (
                    <LikeCard cameFrom={"likeScreen"} item={item} key={index} />
                  )
              )
            ) : (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 16,
                }}
              >
                <TopText style={{ color: "#000000", fontSize: 16 }}>
                  No Likes Yet
                </TopText>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Container>
  );
}
