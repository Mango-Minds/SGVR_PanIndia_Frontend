import React, { useState } from "react";
import { IconButton } from "react-native-paper";
import { Container, RowBetween, View } from "../styles/common.styles";
import {
  CreatePostButton,
  CreatePostButtonSection,
  CreatePostTextBox,
  OtherUserFollowButton,
  TopText,
} from "../styles/social.styles";
import { Image, ScrollView, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";

const CreateTimelineScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState("");

  const _pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
    });
    setSelectedImage(result);
  };

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
            Create Timeline
          </TopText>
        </View>
      </RowBetween>

      <View>
        <ScrollView
          style={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "flex-end" }}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZSUyMGltYWdlc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
              }}
              style={{ width: 60, height: 60, borderRadius: 6 }}
            />
            <Text
              style={{
                color: "#B98C13",
                fontSize: 16,
                marginLeft: 9,
              }}
            >
              @Jasveenkaur
            </Text>
          </View>
          <CreatePostTextBox
            underlineColor="transparent"
            multiline={true}
            numberOfLines={8}
            placeholder="What’s on your mind, Jasveen?"
            activeUnderlineColor="transparent"
            selectionColor="#3F496D"
          />
          <CreatePostButtonSection>
            <CreatePostButton
              uppercase={false}
              labelStyle={{
                color: "#3F496D",
                fontSize: 16,
                letterSpacing: 0,
                paddingVertical: 6,
              }}
              icon="account-plus-outline"
              color="#3F496D"
            >
              Tag Someone
            </CreatePostButton>
          </CreatePostButtonSection>
          <OtherUserFollowButton style={{ marginTop: 12 }}>
            <Text style={{ color: "#fff", fontSize: 16 }}>Post</Text>
          </OtherUserFollowButton>
        </ScrollView>
      </View>
    </Container>
  );
};

export default CreateTimelineScreen;
