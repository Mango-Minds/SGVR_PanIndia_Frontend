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
  View,
} from "react-native";
import { IconButton } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  commentOnPost,
  getAllComments,
} from "../../services/socialMedia.services";
import { setLoadingInBtn } from "../../store/user";
import { Container, RowBetween, View as StyledView } from "../../styles/common.styles";
import { ChatTextInput, TopText } from "../../styles/social.styles";
import CommentCard from "./CommentCard";
import { ErrorToggle } from "../../store/user";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

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

  const handleCommentDeleted = (deletedCommentId) => {
    setComments(prevComments => 
      prevComments.filter(comment => comment._id !== deletedCommentId)
    );
    dispatch(
      ErrorToggle({
        msg: "Comment deleted successfully",
        type: "success",
        toggle: true,
      })
    );
  };

  if (loadingInBtn || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: "#8E8E93", fontSize: 16 }}>Loading comments...</Text>
      </View>
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
      {/* Header */}
      <View
        style={{
          paddingTop: Platform.OS === "ios" ? 50 : 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E5EA",
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <RowBetween style={{ paddingHorizontal: 16 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor="#007AFF"
            />
            <TopText
              style={{ 
                color: "#1A1A1A", 
                fontSize: 20, 
                fontWeight: "700",
                marginLeft: 8
              }}
            >
              Comments ({comments.length})
            </TopText>
          </View>
        </RowBetween>
      </View>

      {/* Comments List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {comments && comments.length > 0 ? (
          comments.map((item, index) => (
            <CommentCard 
              comment={item} 
              key={item._id || index}
              postId={postId}
              onCommentDeleted={handleCommentDeleted}
            />
          ))
        ) : (
          <View style={{ 
            paddingVertical: 60, 
            alignItems: "center",
            paddingHorizontal: 32
          }}>
            <Icon 
              name="comment-outline" 
              size={64} 
              color="#C7C7CC" 
            />
            <TopText
              style={{ 
                color: "#8E8E93", 
                fontSize: 18, 
                fontWeight: "500",
                marginTop: 16,
                textAlign: "center"
              }}
            >
              No comments yet
            </TopText>
            <Text
              style={{ 
                color: "#C7C7CC", 
                fontSize: 14, 
                marginTop: 8,
                textAlign: "center",
                lineHeight: 20
              }}
            >
              Be the first to share your thoughts!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Comment Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={true}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={{ 
          flexDirection: 'row', 
          padding: 16, 
          borderTopWidth: 1, 
          borderTopColor: '#E5E5EA',
          backgroundColor: '#FFFFFF',
          alignItems: 'flex-end'
        }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            backgroundColor: '#F2F2F7',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 12,
            minHeight: 40,
            maxHeight: 100,
            borderWidth: commentText.trim() ? 1 : 0,
            borderColor: commentText.trim() ? '#007AFF' : 'transparent',
          }}>
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: '#1A1A1A',
                paddingVertical: 8,
                paddingHorizontal: 0,
                textAlignVertical: 'bottom',
              }}
              placeholder="Add a comment..."
              placeholderTextColor="#8E8E93"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            {commentText.length > 0 && (
              <Text style={{
                fontSize: 12,
                color: commentText.length > 450 ? '#FF3B30' : '#8E8E93',
                marginLeft: 8,
                alignSelf: 'flex-end',
                marginBottom: 4,
              }}>
                {commentText.length}/500
              </Text>
            )}
          </View>
          
          <TouchableOpacity
            onPress={handleComment}
            disabled={submitting || !commentText.trim()}
            style={{
              backgroundColor: submitting || !commentText.trim() ? '#C7C7CC' : '#007AFF',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 20,
              minWidth: 70,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: submitting || !commentText.trim() ? 'transparent' : '#007AFF',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: submitting || !commentText.trim() ? 0 : 4,
            }}
          >
            <Text style={{ 
              color: 'white', 
              fontWeight: '600',
              fontSize: 16
            }}>
              {submitting ? 'Sending...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}
