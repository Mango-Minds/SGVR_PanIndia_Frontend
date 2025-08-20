import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { IconButton } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  commentOnPost,
  getAllComments,
} from "../../services/socialMedia.services";
import { setLoadingInBtn } from "../../store/user";
import { Container, RowBetween, View } from "../../styles/common.styles";
import { ChatTextInput, TopText } from "../../styles/social.styles";
import CommentCard from "./CommentCard";
import { ErrorToggle } from "../../store/user";

export default function CommentScreen({ navigation, route }) {
  const { loadingInBtn } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { postId } = route.params;
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getAllComments({ postId });
      console.log('Comments fetched:', response);
      if (response && response.comments) {
        setComments(response.comments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
      dispatch(
        ErrorToggle({
          msg: "Failed to load comments",
          type: "error",
          toggle: true,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleComment = async () => {
    if (!commentText.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);
      const response = await commentOnPost({ postId, content: commentText });
      console.log('Comment added:', response);
      
      // Refresh comments after adding new one
      await fetchComments();
      
      setCommentText("");
      dispatch(
        ErrorToggle({
          msg: "Comment added successfully",
          type: "success",
          toggle: true,
        })
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      dispatch(
        ErrorToggle({
          msg: error.response?.data?.message || "Failed to add comment",
          type: "error",
          toggle: true,
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInBtn || loading) {
    return (
      <ActivityIndicator
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    );
  }

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

      <ScrollView
        style={{ paddingVertical: 16, flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Debug section */}
        <View style={{ padding: 16, backgroundColor: '#f0f0f0', margin: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Debug Info:</Text>
          <Text>Comments length: {comments?.length || 0}</Text>
          <Text>PostId: {postId}</Text>
          <Text>Loading: {loading ? 'Yes' : 'No'}</Text>
          <Text>Submitting: {submitting ? 'Yes' : 'No'}</Text>
        </View>
        
        {comments && comments.length > 0 ? (
          comments.map((item, index) => (
            <CommentCard comment={item} key={index} />
          ))
        ) : (
          <View style={{ paddingVertical: 16 }}>
            <TopText
              style={{ color: "#000000", fontSize: 22, paddingLeft: 16 }}
            >
              No Comments
            </TopText>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={true}
      >
        <View style={{ 
          flexDirection: 'row', 
          padding: 16, 
          borderTopWidth: 1, 
          borderTopColor: '#eee',
          alignItems: 'center'
        }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8,
            }}
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            onPress={handleComment}
            disabled={submitting || !commentText.trim()}
            style={{
              backgroundColor: submitting || !commentText.trim() ? '#ccc' : '#007AFF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {submitting ? 'Sending...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}
