import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Video, ResizeMode } from "expo-av";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import { submitNewPost } from "./SocialMediaAPIs";
import {
  BASEAPIURL,
  BASEIMGURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import { useSelector } from "react-redux";
import { Container, RowBetween } from "../../styles/common.styles";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useDispatch } from "react-redux";
import BottomNavigation from "../../components/social/BottomNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
const CreateNewPost = ({ navigation }) => {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [media, setMedia] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [list, setList] = useState([]);
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();
  const { loadingInBtn } = useSelector((state) => state.user);

  const [thumbnail, setThumbnail] = useState(null);

  const generateThumbnail = async (videoUri) => {
    console.log("inside generate thumb");
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 15000,
      });
      console.log("Uri: ", uri);
      setThumbnail(uri);
    } catch (e) {
      console.warn("Could not generate thumbnail", e);
    }
  };

  // Function to handle media selection
  const pickMedia = async () => {
    try {
      // Determine allowed media type based on the first item in the list

      let allowedType = "*/*"; // Default to any file type

      if (list.length > 0) {
        const firstMediaType = list[0].mimeType;
        // Adjust allowed type based on the first selected media's type
        if (firstMediaType.startsWith("image")) {
          allowedType = "image/*";
        } else if (firstMediaType.startsWith("video")) {
          allowedType = "video/*";
        }
      }

      // Check if the user has already uploaded 5 media items
      if (allowedType === "image/*" && list.length >= 5) {
        Alert.alert("Limit Reached", "You can only upload up to 5 images.", [
          { text: "OK" },
        ]);
        return;
      } else if (allowedType === "video/*" && list.length >= 1) {
        Alert.alert("Limit Reached", "You can only upload 1 video.", [
          { text: "OK" },
        ]);
        return;
      }

      // Open the DocumentPicker with the specified type
      let result = await DocumentPicker.getDocumentAsync({
        type: allowedType,
      });

      console.log(result);

      // Check if the user has selected a file and not canceled
      if (!result.canceled) {
        const selectedMedia = result.assets[0];
        if (selectedMedia.mimeType.startsWith("video")) {
          generateThumbnail(selectedMedia.uri);
        }

        // Update the list with the newly selected media
        setList((prevList) => [...prevList, selectedMedia]);

        // Set the media state to the latest selected file
        setMedia(selectedMedia);
      }
    } catch (err) {
      console.error(err);
    }
  };

  console.log(list);

  // Function to remove selected media
  const removeMedia = (index) => {
    setList((prevList) => prevList.filter((_, i) => i !== index));
    console.log(list);
  };

  // Function to handle adding tags
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  // Function to remove a tag
  const removeTag = (tag) => {
    setTags(tags.filter((item) => item !== tag));
  };
  // Function to handle submitting the post
  // const handleSubmit = async () => {
  //   if (!description) {
  //     Alert.alert("Error", "Please add a description.");
  //     return;
  //   }
  //   dispatch(setLoadingInBtn(true));

  //   const formData = new FormData();

  //   formData.append("content", description);
  //   // Adjust allowed type based on the first selected media's type
  //   if (list[0].mimeType.startsWith("image")) {
  //     formData.append("type", "text+image");
  //     list.forEach((image, index) => {
  //       formData.append("images", {
  //         uri: image.uri,
  //         name: image.name,
  //         type: image.mimeType,
  //       });
  //     });
  //   } else if (list[0].mimeType.startsWith("video")) {
  //     formData.append("type", "text+video");
  //     formData.append("video", {
  //       uri: list[0].uri,
  //       name: list[0].name,
  //       type: list[0].mimeType,
  //     });
  //   }

  //   try {
  //     console.log(formData);
  //     const response = await fetch(`${BASEAPIURL}/social/post/create`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: formData,
  //     });
  //     console.log("response of add post", response);
  //     const data = await response.json();
  //     dispatch(setLoadingInBtn(false));
  //     if (response.ok) {
  //       Alert.alert("Success", "Post created successfully!");
  //       navigation.goBack();
  //     } else {
  //       Alert.alert("Error", data.message || "Something went wrong.");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     Alert.alert("Error", "Unable to submit post.");
  //   }
  // };



  //correct one
  // const handleSubmit = async () => {
  //   if (!description) {
  //     Alert.alert("Error", "Please add a description.");
  //     return;
  //   }
  //   dispatch(setLoadingInBtn(true));
  
  //   const token = await AsyncStorage.getItem("token");
  
  //   if (!token) {
  //     console.error("Authentication token is missing.");
  //     Alert.alert("Error", "You are not authorized. Please log in again.");
  //     dispatch(setLoadingInBtn(false));
  //     return;
  //   }
  
  //   const formData = new FormData();
  
  //   formData.append("content", description);
  
  //   // Adjust allowed type based on the first selected media's type
  //   if (list[0].mimeType.startsWith("image")) {
  //     formData.append("type", "text+image");
  //     list.forEach((image, index) => {
  //       formData.append("images", {
  //         uri: image.uri,
  //         name: image.name,
  //         type: image.mimeType,
  //       });
  //     });
  //   } else if (list[0].mimeType.startsWith("video")) {
  //     formData.append("type", "text+video");
  //     formData.append("video", {
  //       uri: list[0].uri,
  //       name: list[0].name,
  //       type: list[0].mimeType,
  //     });
  //   }
  
  //   try {
  //     console.log(formData);
  
  //     const response = await apiClient.post("/social/post/create", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  
  //     console.log("response of add post", response);
  
  //     dispatch(setLoadingInBtn(false));
  
  //     if (response.status === 200 || response.status === 201) {
  //       Alert.alert("Success", "Post created successfully!");
  //       navigation.goBack();
  //     } else {
  //       Alert.alert("Error", response.data?.message || "Something went wrong.");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     dispatch(setLoadingInBtn(false));
  //     Alert.alert("Error", "Unable to submit post.");
  //   }
  // };
  
  const handleSubmit = async () => {
    if (!description) {
      Alert.alert("Error", "Please add a description.");
      return;
    }
  
    dispatch(setLoadingInBtn(true));
  
    try {
      const response = await submitNewPost(description, list);
      console.log("response of add post", response);
  
      dispatch(setLoadingInBtn(false));
  
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Post created successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", response.data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      dispatch(setLoadingInBtn(false));
      Alert.alert("Error", "Unable to submit post.");
    }
  };

  return (
    <Container style={{ backgroundColor: "white", paddingBottom: 0 }}>
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <TopText
            style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
          >
            Create a Post
          </TopText>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        ></View>
      </RowBetween>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mediaContainer}>
          {list.map((item, index) => (
            <View key={index} style={styles.mediaPreviewWrapper}>
              {/* Image or video preview */}
              {item.mimeType.startsWith("image/") ? (
                <>
                  <Image
                    style={{ height: "100%", width: "100%", borderRadius: 10 }}
                    source={{ uri: item.uri }}
                  />
                </>
              ) : (
                // Add Video Component logic here if you also want to support video previews
                <>
                  <Image
                    source={{ uri: thumbnail }}
                    style={{ height: "100%", width: "100%", borderRadius: 10 }}
                  />
                  <Ionicons
                    name="play-circle"
                    size={20}
                    color="white"
                    style={{ position: "absolute", top: 20, left: 20 }}
                  />
                </>
              )}

              {/* Cross icon to remove media */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMedia(index)}
              >
                <Ionicons name="close" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Media Picker */}
        <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.mediaText}>Pick Media (Photo/Video)</Text>
        </TouchableOpacity>
        {/* Description Field */}
        <TextInput
          style={styles.input}
          placeholder="Write a description..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Tag Input */}
        {/* <View style={styles.tagContainer}>
          <TextInput
            style={styles.tagInput}
            placeholder="Add a tag"
            value={tagInput}
            onChangeText={setTagInput}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
            <Text style={styles.addTagText}>Add Tag</Text>
          </TouchableOpacity>
        </View> */}

        {/* Tag List */}
        <View style={styles.tagList}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagItem}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Ionicons name="close" size={16} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {loadingInBtn === true ? (
              <ActivityIndicator
                style={{
                  display: "flex",
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
                // size={"large"}
                color={"white"}
              />
            ) : (
              "Submit Post"
            )}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavigation navigation={navigation} />
    </Container>
  );
};

export default CreateNewPost;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
    alignContent: "center",
  },
  chatVideoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.themeColor,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  mediaText: {
    color: "white",
    marginLeft: 10,
  },
  mediaFileName: {
    fontSize: 16,
    color: "#555",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  addTagButton: {
    backgroundColor: Theme.themeColor,
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
  },
  addTagText: {
    color: "white",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagItem: {
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginRight: 5,
  },
  mediaContainer: {
    flexDirection: "row",
    marginTop: 20,
    height: "auto",
  },
  mediaPreviewWrapper: {
    position: "relative",
    marginRight: 10,
    marginVertical: 10,
    height: 60,
    width: 60,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 2,
  },
  submitButton: {
    backgroundColor: Theme.themeColor,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
  },
  mediaPreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  mediaPreview: {
    position: "relative",
    marginBottom: 10,
  },
});
