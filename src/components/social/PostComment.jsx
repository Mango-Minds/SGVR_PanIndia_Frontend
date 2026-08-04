import React from "react";
import { Image } from "react-native";
import { InputField } from "../../styles/common.styles";
import { PostCommentContainer } from "../../styles/social.styles";
import { useTranslation } from "react-i18next";

export default function PostComment(props) {
  const { t } = useTranslation();
  const { img, value, onChangeText, onSubmit } = props;
  return (
    <PostCommentContainer>
      <Image
        source={{ uri: img }}
        style={{ width: 36, height: 36, borderRadius: 18 }}
      />
      <InputField 
        placeholder={t("post_a_comment")} 
        style={{ marginRight: 16 }}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
      />
    </PostCommentContainer>
  );
}
