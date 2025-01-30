import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
const RepostWithThoughts = ({ route, navigation }) => {
  const { post, userId } = route.params;
 
  const user = post.find((item) => item.id === userId);
 
  const [thoughts, setThoughts] = useState("");


  return (
    <ScrollView style={styles.container}>
     
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon
            name="arrow-back"
            size={24}
            color="#000"
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What do you want to talk about?"
          value={thoughts}
          onChangeText={setThoughts}
        />
      </View>

      <View style={styles.repostContainer}>
        {/* Header */}

        {/* Original Post Preview */}
        <View >
          <Image source={user.profileImageUri} style={styles.profileImage} />
          
          <View style={styles.headerText}>
          <Text style={styles.username}>{user.name}</Text>
            <Text style={styles.jobTitle}>{user.jobTitle}</Text>
            <Text style={styles.time}>1w • Edited</Text>
            <Text style={styles.description}>{user.description}</Text>
          </View>
          <Image style={styles.bannerImage} source={user.photoUri} />
        </View>
        </View>
    </ScrollView>
  );
};

export default RepostWithThoughts;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
  },
  generalInfoContainer: {
    backgroundColor: "white",
    paddingBottom: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f8f8f8",
    justifyContent: 'space-between',
  },
  postButton: {
    color: "#fff",
    backgroundColor: "blue",
    borderRadius: 20,
    paddingHorizontal: 20,
    marginRight: 10,
    paddingVertical: 10,            
    paddingHorizontal: 20, 
    
  },
  postButtonText: {
    color: "white", // White text color
    fontSize: 16, // Font size
    fontWeight: "bold", // Bold text
  },

  inputContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  input: {
    marginTop: 10,
    fontSize: 18,
    paddingVertical: 10,
  },
  
  repostContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20, // Apply rounded edges to the container
    padding: 20, // Add padding inside the container
    margin: 10, // Optional: margin around the container for spacing
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 5,              // For Android shadow effect
    borderWidth: 1, // Border width
    borderColor: "#ccc",
  },

  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20, // Space between input and content
    paddingHorizontal: 15,
    fontSize: 16,
  },
  originalPost: {
    borderRadius: 20, // Rounded edges for the post preview
    overflow: "hidden", // Ensures child elements do not overflow
    backgroundColor: "#f9f9f9", // Light gray background for post preview
    padding: 15, // Padding inside the post container
  },
  postHeader: {
    flexDirection: "row", // Horizontal layout for profile image and text
    alignItems: "center",
    marginBottom: 10, // Space between profile and description
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Rounded profile image
    marginRight: 10, // Space between image and text
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  jobTitle: {
    fontSize: 14,
    color: "#888",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15, // Space between description and banner image
  },
  bannerImage: {
    width: "100%",
    height: 500,
    borderRadius: 10, // Rounded edges for the banner image
  },
});
