import styled from "styled-components";
import { Dimensions } from "react-native";
import { Button, TextInput } from "react-native-paper";
const windowWidth = Dimensions.get("window").width;

export const TopText = styled.Text`
  font-size: 22px;
  color: #000000;
`;

export const FollowingButton = styled.TouchableOpacity`
  background-color: #e9ebef;
  border-radius: 8px;
  color: #78849e;
  font-size: 11px;
  padding: 8px 16px;
  margin-right: 16px;
`;

export const PostCommentContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
  border-radius: 27px;
  height: 54px;
  background-color: #efefef;
  margin: 0 16px;
`;

export const UnfollowModalContainer = styled.View`
  align-items: center;
  background-color: #ffffff;
  padding: 16px 5px;
  margin-left: 10px;
`;

export const ShareModalContainer = styled.View`
  background-color: #ffffff;
  padding: 16px;
`;

export const CreatePostButtonSection = styled.View`
  flex-direction: row;
  width: 100%;
  justify-content: center;
  margin-top: 0px;
`;

export const CreatePostButton = styled(Button)`
  background-color: #ffffff;
  border-radius: 12px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 1;
  width: 48%;
  margin: 6px 4px;
`;

export const CreatePostTextBox = styled(TextInput)`
  background-color: transparent;
  margin: 12px 0px;
  font-size: 16px;
  min-height: 90px;
`;

export const NotificationAlertCircle = styled.View`
  width: 9px;
  height: 9px;
  border-radius: 12px;
  background-color: #ff4f9a;
  position: absolute;
  right: 32px;
  top: -28px;
`;

export const ChatDateLabel = styled.Text`
  font-size: 12px;
  text-align: center;
  color: #78849e;
  opacity: 0.56;
  font-weight: 600;
  margin: 8px 0px;
`;

export const SendChatBlock = styled.Text`
  background-color: #b98c13;
  color: white;
  padding: 13px;
  font-size: 14px;
  text-align: left;
  border-radius: 8px;
  overflow: hidden;
  margin: 5px 0px;
  /* width: 80%; */
`;

export const RecieveChatBlock = styled.Text`
  background-color: #898e92;
  color: white;
  padding: 13px;
  font-size: 14px;
  text-align: left;
  border-radius: 8px;
  overflow: hidden;
  margin: 5px 0px;
  /* width: 80%; */
  align-self: flex-start;
`;

export const ChatTextInput = styled(TextInput)`
  background-color: #efefef;
  border-top-left-radius: 26px;
  border-top-right-radius: 26px;
  border-bottom-left-radius: 26px;
  border-bottom-right-radius: 26px;
  height: 40px;
  padding: 5px 2px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 15px;
  margin-right: 15px;
`;

export const OtherUserFollowButton = styled.TouchableOpacity`
  background-color: #b88b13;
  width: 100%;
  height: 50px;
  color: #fff;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
`;

export const OtherUserMessageButton = styled.TouchableOpacity`
  background-color: transparent;
  width: 100%;
  height: 50px;
  color: #fff;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border-width: 1px;
  border-color: #b88b13;
`;
