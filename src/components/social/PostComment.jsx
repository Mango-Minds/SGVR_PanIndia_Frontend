import React from "react";
import { Image } from "react-native";
import { InputField } from "../../styles/common.styles";
import { PostCommentContainer } from "../../styles/social.styles";

export default function PostComment(props) {
  const { img } = props;
  return (
    <PostCommentContainer>
      <Image
        source={{ uri: img }}
        style={{ width: 36, height: 36, borderRadius: 18 }}
      />
      <InputField placeholder="Post a comment..." style={{ marginRight: 16 }} />
    </PostCommentContainer>
  );
}
