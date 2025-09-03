import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import apiClient from "../../store/apiClient";

const RepostWithThoughts = ({ route, navigation }) => {
  const { post, userId, fetchPosts } = route.params;
  const token = useSelector((state) => state.user.token);
  const currentUser = useSelector((state) => state.user.user);

  const originalPost = post;

  const [thoughts, setThoughts] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleRepost = async () => {
    if (!originalPost || !originalPost._id) {
      Alert.alert("Error", "Invalid post data");
      return;
    }

    // Allow reposts with or without thoughts
    setIsPosting(true);
    try {
      const repostData = {
        originalPostId: originalPost._id,
        thoughts: thoughts.trim()
      };

      const response = await apiClient.post("/social/post/create-repost", repostData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        Alert.alert("Success", "Post reposted successfully!", [
          {
            text: "OK",
            onPress: async () => {
              // Refresh posts if fetchPosts function is available
              if (fetchPosts) {
                await fetchPosts(true); // Pass true for refresh
              }
              // Navigate to SocialHomeScreen to ensure user stays in social section
              navigation.navigate("SocialHomeScreen");
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Failed to repost");
      }
    } catch (error) {
      console.error("Repost error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.status === 401) {
        Alert.alert("Error", "Authentication failed. Please login again.");
      } else if (error.response?.status === 404) {
        Alert.alert("Error", "Original post not found.");
      } else if (error.response?.status === 400) {
        Alert.alert("Error", error.response.data?.message || "Invalid request data.");
      } else {
        Alert.alert("Error", error.response?.data?.message || "Failed to repost. Please try again.");
      }
    } finally {
      setIsPosting(false);
    }
  };

  if (!originalPost) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-back"
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No post data available</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
             <ScrollView 
         style={styles.container}
         keyboardShouldPersistTaps="handled"
       >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              name="arrow-back"
              size={24}
              color="#000"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postButton, isPosting && styles.postButtonDisabled]}
            onPress={handleRepost}
            disabled={isPosting}
          >
            <Text style={styles.postButtonText}>
              {isPosting ? "Posting..." : "Post"}
            </Text>
          </TouchableOpacity>
        </View>

                 <View style={styles.inputContainer}>
           <TextInput
             style={styles.input}
             placeholder="What do you want to talk about?"
             value={thoughts}
             onChangeText={setThoughts}
             multiline
             numberOfLines={4}
             returnKeyType="done"
             blurOnSubmit={true}
           />
         </View>

        <View style={styles.repostContainer}>
          <View style={styles.originalPost}>
            <View style={styles.postHeader}>
              <Image
                source={
                  originalPost.createdBy?.image
                    ? { uri: originalPost.createdBy.image }
                    : require("../../assets/images/general/user.png")
                }
                style={styles.profileImage}
              />

              <View style={styles.headerText}>
                <Text style={styles.username}>
                  {originalPost.createdBy?.firstName} {originalPost.createdBy?.lastName}
                </Text>
                <Text style={styles.time}>
                  {originalPost.createdAt
                    ? new Date(originalPost.createdAt).toLocaleDateString()
                    : "Recently"
                  }
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              {originalPost.content || "No content available"}
            </Text>

            {(originalPost.images && originalPost.images.length > 0) || originalPost.image ? (
              <Image
                style={styles.bannerImage}
                source={{ uri: originalPost.images?.[0] || originalPost.image }}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RepostWithThoughts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f8f8f8",
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: "blue",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  postButtonDisabled: {
    backgroundColor: "#ccc",
  },
  postButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    backgroundColor: "#fff",
    padding: 16,
  },
  input: {
    fontSize: 18,
    paddingVertical: 10,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  repostContainer: {
    backgroundColor: "#fff",
    padding: 10,
  },
  originalPost: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  time: {
    fontSize: 14,
    color: "#888",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  bannerImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
});