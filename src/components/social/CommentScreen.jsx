import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { IconButton } from "react-native-paper";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  commentOnPost,
  getAllComments,
} from "../../services/socialMedia.services";
import { setLoadingInBtn } from "../../store/user";
import { Container, RowBetween, View } from "../../styles/common.styles";
import { ChatTextInput, TopText } from "../../styles/social.styles";
import CommentCard from "./CommentCard";
import PostComment from "./PostComment";
import { ErrorToggle } from "../../store/user";

// import LikeCard from './LikeCard';

export default function CommentScreen({ navigation, route }) {
  const { loadingInBtn } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { postId } = route.params;
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data, isError, error, isLoading } = useQuery(
    ["post-comments", postId],
    () => getAllComments({ postId }),
    {
      onSuccess: (data) => {
        // console.log(data.data,'comments------------------------------------------');
        dispatch(
          ErrorToggle({
            msg: "Comment Added",
            type: "success",
            toggle: false,
          })
        );
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

  const commentMutation = useMutation(commentOnPost, {
    onSuccess: async (data) => {
      await queryClient.invalidateQueries("post-comments");
      // await queryClient.invalidateQueries("social-timeline");
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

  const handleComment = async () => {
    dispatch(setLoadingInBtn(true));
    await commentMutation.mutateAsync({ postId: postId, content: commentText });
    dispatch(setLoadingInBtn(false));
    setCommentText("");
  };

  if (loadingInBtn)
    return (
      <ActivityIndicator
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    );
  else
    return (
      <Container
        style={{
          margin: 0,
          paddingLeft: 0,
          paddingRight: 0,
          backgroundColor: "#FFFFFF",
        }}
      >
        <RowBetween
          style={{
            paddingTop: 24,
            borderBottomWidth: 1,
            borderColor: "lightgrey",
            paddingBottom: 14,
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
              Comments
            </TopText>
          </View>
        </RowBetween>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#D4AF37"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          />
        ) : (
          <ScrollView
            style={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {data.data &&
              data.data.length > 0 &&
              data.data.map((item, index) => {
                return <CommentCard {...item} key={index} />;
              })}
            {data.data && data.data.length === 0 && (
              <View style={{ paddingVertical: 16 }}>
                <TopText
                  style={{ color: "#000000", fontSize: 22, paddingLeft: 16 }}
                >
                  No Comments
                </TopText>
              </View>
            )}
          </ScrollView>
        )}

        {/* <PostComment
      img={
        'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
      }
    /> */}

        <KeyboardAvoidingView
          // style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled={true}
        >
          <ChatTextInput
            placeholder="Post a comment ..."
            placeholderTextColor="#78849E"
            selectionColor="#B98C13"
            // left={<ChatTextInput.Icon name="camera" />}
            right={
              <ChatTextInput.Icon
                style={{
                  // backgroundColor: "red",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 16,
                }}
                name="send"
                onPress={handleComment}
              />
            }
            style={{
              marginHorizontal: 16,
              // display: "flex",
              // justifyContent: "center",
              // alignItems: "center",
            }}
            activeUnderlineColor="transparent"
            underlineColor="transparent"
            value={commentText}
            onChangeText={(e) => setCommentText(e)}
          />
        </KeyboardAvoidingView>
      </Container>
    );
}
