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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { VideoView, useVideoPlayer } from "expo-video";
import Theme from "../../styles/theme";
import { IconButton } from "react-native-paper";
import { TopText } from "../../styles/social.styles";
import messageIcon from "../../assets/images/social/message.png";
import { ErrorToggle, setLoadingInBtn } from "../../store/user";
import { submitNewPost } from "./SocialMediaAPIs";

import { useSelector } from "react-redux";
import { Container, RowBetween } from "../../styles/common.styles";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useDispatch } from "react-redux";
import BottomNavigation from "../../components/social/BottomNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { useTranslation } from "react-i18next";

const CreateNewPost = ({ navigation }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [media, setMedia] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [list, setList] = useState([]);
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();
  const { loadingInBtn } = useSelector((state) => state.user);

  const [thumbnail, setThumbnail] = useState(null);

  // Request permissions for image picker
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      return false;
    }
    return true;
  };

  // Helper function to get media types safely
  const getMediaTypes = () => {
    try {
      // Try the new MediaType enum first
      if (ImagePicker.MediaType) {
        return [ImagePicker.MediaType.Image, ImagePicker.MediaType.Video];
      }
      // Fallback to deprecated but working MediaTypeOptions
      return ImagePicker.MediaTypeOptions.All;
    } catch (error) {
      console.warn('MediaType not available, using MediaTypeOptions.All');
      return ImagePicker.MediaTypeOptions.All;
    }
  };

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

  // Function to handle media selection (supports both images and videos)
  const pickMedia = async () => {
    try {
      // Check if the user has already uploaded 5 media items
      if (list.length >= 5) {
        Alert.alert("Limit Reached", "You can only upload up to 5 media items.", [
          { text: "OK" },
        ]);
        return;
      }

      // Check if there's already a video in the list (only 1 video allowed)
      const hasVideo = list.some(item => item.type === 'video');
      if (hasVideo) {
        Alert.alert("Limit Reached", "You can only upload 1 video.", [
          { text: "OK" },
        ]);
        return;
      }

      // Request permissions first
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return;
      }

      // Open the ImagePicker to show gallery (supports both images and videos)
      // Users can switch between "Photos" and "Albums" tabs
      // Never use Passthrough/HighestQuality — iOS HEVC/MOV will not play on Android.
      // H.264 export + server-side transcode keeps Android ExoPlayer happy.
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getMediaTypes(),
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
        presentationStyle: 'pageSheet',
        videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      console.log(result);

      // Check if the user has selected a file and not canceled
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Prefer picker-provided mimeType so Android/S3 get a real Content-Type
        const isVideo = selectedAsset.type === "video";
        const inferredExt = isVideo
          ? "mp4"
          : selectedAsset.uri?.match(/\.(jpe?g|png|gif|webp)(\?|$)/i)?.[1]?.toLowerCase() || "jpg";
        const selectedMedia = {
          uri: selectedAsset.uri,
          // Always label videos as .mp4 / video/mp4 for Android-compatible upload metadata
          name: isVideo
            ? `video_${Date.now()}.mp4`
            : selectedAsset.fileName ||
              `media_${Date.now()}.${inferredExt === "jpeg" ? "jpg" : inferredExt}`,
          mimeType: isVideo
            ? "video/mp4"
            : selectedAsset.mimeType ||
              (inferredExt === "jpg" || inferredExt === "jpeg"
                ? "image/jpeg"
                : `image/${inferredExt}`),
          type: selectedAsset.type,
          size: selectedAsset.fileSize,
        };

        if (selectedAsset.type === 'video') {
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

  // Function to handle adding hashtags
  const addTag = () => {
    const normalized = tagInput?.trim().replace(/^#+/, '').toLowerCase();
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
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
      console.log("Submitting post with description:", description);
      console.log("Media list:", list);
      
      const response = await submitNewPost(description, list, tags);
      console.log("response of add post", response);
  
      dispatch(setLoadingInBtn(false));
  
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Post created successfully!");
        // Navigate back and trigger refresh by setting a flag
        navigation.navigate("SocialHomeScreen", { refresh: true });
      } else {
        console.error("Post submission failed with status:", response.status);
        console.error("Response data:", response.data);
        Alert.alert("Error", response.data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Post submission error:", error);
      console.error("Error details:", error.response?.data);
      dispatch(setLoadingInBtn(false));
      Alert.alert("Error", `Unable to submit post: ${error.message || 'Unknown error'}`);
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
            {t("createPost")}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
                 <ScrollView 
           contentContainerStyle={styles.container}
           showsVerticalScrollIndicator={false}
           keyboardShouldPersistTaps="handled"
         >
          <View style={styles.mediaContainer}>
            {list.map((item, index) => (
              <View key={index} style={styles.mediaPreviewWrapper}>
                {/* Image or video preview */}
                {item.type === "image" || item.mimeType?.startsWith("image/") ? (
                  <>
                    <Image
                      style={{ height: "100%", width: "100%", borderRadius: 10 }}
                      source={{ uri: item.uri }}
                    />
                  </>
                ) : (
                  // Video preview
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

          {/* Media Picker - Supports both images and videos */}
          <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
            <Ionicons name="folder" size={24} color="white" />
            <Text style={styles.mediaText}>{t("selectMediaFromAlbums") || "Select Media from Albums"}</Text>
          </TouchableOpacity>
          {/* Description Field */}
                     <TextInput
             style={styles.input}
             placeholder={t("writeDescription")}
             value={description}
             onChangeText={setDescription}
             multiline
             returnKeyType="done"
             blurOnSubmit={true}
           />

         
          {/* Hashtag input */}
          <View style={styles.tagContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder={t("addHashtagsPlaceHolder") || "Add hashtag (e.g. travel)"}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Text style={styles.addTagText}>{t("add") || "Add"}</Text>
            </TouchableOpacity>
          </View>

          {/* Tag List */}
          <View style={styles.tagList}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tagItem}>
                <Text style={styles.tagText}>#{tag}</Text>
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
               t("submitPost")
              )}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
