import React, { useState } from "react";
import { Container, RowBetween, View } from "../../styles/common.styles";
import { ScrollView } from "react-native";
import { IconButton } from "react-native-paper";
import {
  ChatDateLabel,
  ChatTextInput,
  RecieveChatBlock,
  SendChatBlock,
  TopText,
} from "../../styles/social.styles";

const MatrimonyChatScreen = ({ navigation }) => {
  return (
    <Container
      style={{
        margin: 0,
        paddingLeft: 0,
        paddingRight: 0,
        backgroundColor: "#FAFAFA",
        flex: 1,
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
            Saumya
          </TopText>
        </View>
      </RowBetween>
      <View style={{ flex: 1, paddingHorizontal: 16, flexDirection: "column" }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ChatDateLabel>YESTERDAY, 2:30 PM</ChatDateLabel>
          <SendChatBlock>
            Remember that not getting what you want is sometimes a wonderful
            stroke of luck.
          </SendChatBlock>
          <RecieveChatBlock>
            The person who says it cannot be done should not interrupt the
            person who is doing it.
          </RecieveChatBlock>

          <ChatDateLabel>YESTERDAY, 2:30 PM</ChatDateLabel>
          <SendChatBlock>
            Remember that not getting what you want is sometimes a wonderful
            stroke of luck.
          </SendChatBlock>
          <RecieveChatBlock>
            The person who says it cannot be done should not interrupt the
            person who is doing it.
          </RecieveChatBlock>

          <ChatDateLabel>YESTERDAY, 2:30 PM</ChatDateLabel>
          <SendChatBlock>
            Remember that not getting what you want is sometimes a wonderful
            stroke of luck.
          </SendChatBlock>
          <RecieveChatBlock>
            The person who says it cannot be done should not interrupt the
            person who is doing it.
          </RecieveChatBlock>

          <ChatDateLabel>YESTERDAY, 2:30 PM</ChatDateLabel>
          <SendChatBlock>
            Remember that not getting what you want is sometimes a wonderful
            stroke of luck.
          </SendChatBlock>
          <RecieveChatBlock>
            The person who says it cannot be done should not interrupt the
            person who is doing it.
          </RecieveChatBlock>
        </ScrollView>
        <ChatTextInput
          placeholder="Search your message"
          placeholderTextColor="#78849E"
          selectionColor="#B98C13"
          left={<ChatTextInput.Icon name="camera" />}
          activeUnderlineColor="transparent"
          underlineColor="transparent"
        />
      </View>
    </Container>
  );
};

export default MatrimonyChatScreen;
