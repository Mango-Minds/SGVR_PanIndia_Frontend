import React, { useEffect, useState, useMemo } from "react";
import { debounce } from "lodash";
import { Container, RowBetween, SearchField } from "../../styles/common.styles";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";
import { decode } from "base-64";
import Theme from "../../styles/theme";
import {
  View,
  ImageBackground,
  FlatList,
  StyleSheet,
  Modal,
  Text,
  RefreshControl,
  Image,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { TopText } from "../../styles/social.styles";
import { Card, IconButton } from "react-native-paper";
import { TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Profile from "../../assets/images/B2b/profile.png";
import Icon from "react-native-vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { UpdateTemple } from "../../store/Handlers/Reducer.Handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../store/apiClient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BASEAPIURL,
  BASEIMGURL,
  RENDERMEDIAURL,
} from "../../infrastructure/constants";
import { io } from "socket.io-client";
import * as DocumentPicker from "expo-document-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";

const ChatScreenNew = ({ route }) => {
  //data from chat home
  const data = route.params;

  //user and token data
  const auth_token = useSelector((state) => state.user.token);
  const tokenPayload = auth_token.split(".")[1];
  const decodedPayload = JSON.parse(decode(tokenPayload));
  const userId = decodedPayload.id;

  //chatroom data (participants and sender)
  const room_data = data.room;
  const chat_room_id = room_data.roomId;
  const participant_name = data.participant_name;
   

  //state variables
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  useEffect(() => {
    // Set initial message if available
    if (route.params?.initialMessage) {
      setChat(route.params.initialMessage);
    }
  }, [route.params?.initialMessage]);

  //navigation variables
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const socket = useMemo(() => {
    return io(`${BASEIMGURL}`, {
      query: { auth_token },
      transports: ["websocket"],
    });
  }, []);

  useEffect(() => {
    socket.emit("joinRoom", { roomId: chat_room_id, userId: userId });

    // Request all messages for a specific chat room
    socket.emit("getAllMessages", { roomId: chat_room_id });

    // Listen for the response containing all messages
    socket.on("allMessages", (messages) => {
      console.log("line 94:", messages);
      setChats(messages);
    });

    //Send Message
    socket.on("message", (chatMessage) => {
      console.log(chatMessage);
      setChats((chats) => [...chats, chatMessage]);
    });

    //Update Message
    socket.on("messageEdited", ({ messageId, newMessage }) => {
      console.log("chats", chats);
      console.log("newmessage", newMessage);
      console.log("messageid", messageId);
      setChats((chats) =>
        chats.map((single_chat) =>
          single_chat._id === messageId
            ? { ...single_chat, message: newMessage }
            : single_chat
        )
      );
    });

    //Delete Message
    socket.on("messageDeleted", ({ messageId }) => {
      setChats((chats) => chats.filter((message) => message._id !== messageId));
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected from server`);
    });

    return () => {
      setUploadedImage(null);
      // setUploadedVideo(null);
      setUploadedDoc(null);

      socket.off("message");
      socket.off("allMessages");
      socket.off("messageEdited");
      socket.off("messageDeleted");
      console.log(`Leaving room: ${chat_room_id}`);  // Add this line
    socket.emit("leaveRoom", { roomId: chat_room_id, userId });
      // socket.disconnect();
    };
  }, []);

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   // Check if there's any uploaded media (image, video, or document)
  //   let uploaded_media = uploadedImage || uploadedVideo || uploadedDoc;

  //   if (uploaded_media || chat.trim() !== "") {
  //     if (uploaded_media) {
  //       try {
  //         // Upload media first
  //         const formData = new FormData();
  //         formData.append("media", {
  //           uri: uploaded_media.uri,
  //           name: uploaded_media.name,
  //           type: uploaded_media.mimeType,
  //           size: uploaded_media.size,
  //         });

  //         const response = await fetch(`${BASEAPIURL}/upload/${chat_room_id}`, {
  //           method: "POST",
  //           headers: {
  //             Authorization: `Bearer ${auth_token}`,
  //           },
  //           body: formData,
  //         });

  //         let data_media = null;
  //         if (response.ok) {
  //           data_media = await response.json();

  //           const media_object = {
  //             mimeType: data_media.mimeType,
  //             name: data_media.name,
  //             size: data_media.size,
  //             uri: data_media.uri,
  //           };

  //           socket.emit("chatMessage", {
  //             roomId: chat_room_id,
  //             message: chat.trim() === "" ? null : chat, // Handle text or media-only
  //             media: media_object,
  //             userId: userId,
  //           });
  //         } else {
  //           throw new Error("Failed to upload media");
  //         }
  //       } catch (error) {
  //         console.error("Error uploading media:", error);
  //       }
  //     } else {
  //       // Proceed to send the chat message without media
  //       socket.emit("chatMessage", {
  //         roomId: chat_room_id,
  //         message: chat,
  //         media: null,
  //         userId: userId,
  //       });
  //     }
  //     setChats([...chats, { id: Date.now().toString(), text: chat, sender: "You" }]);
  //     // Clear the input fields after sending the message
  //     setChat("");
  //     setUploadedImage(null);
  //     setUploadedVideo(null);
  //     setUploadedDoc(null);
  //   }
  // };
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Check if there's any uploaded media (image, video, or document)
    let uploaded_media = uploadedImage || uploadedVideo || uploadedDoc;
  
    if (uploaded_media || chat.trim() !== "") {
      if (uploaded_media) {
        try {
          // Upload media first
          const formData = new FormData();
          formData.append("media", {
            uri: uploaded_media.uri,
            name: uploaded_media.name,
            type: uploaded_media.mimeType,
            size: uploaded_media.size,
          });
  
          const response = await apiClient.post(`/upload/${chat_room_id}`, formData, {
            headers: {
              Authorization: `Bearer ${auth_token}`,
              "Content-Type": "multipart/form-data",
            },
          });
  
          let data_media = null;
          if (response.status === 200) {
            data_media = response.data;
  
            const media_object = {
              mimeType: data_media.mimeType,
              name: data_media.name,
              size: data_media.size,
              uri: data_media.uri,
            };
  
            socket.emit("chatMessage", {
              roomId: chat_room_id,
              message: chat.trim() === "" ? null : chat, // Handle text or media-only
              media: media_object,
              userId: userId,
            });
          } else {
            throw new Error("Failed to upload media");
          }
        } catch (error) {
          console.error("Error uploading media:", error);
        }
      } else {
        // Proceed to send the chat message without media
        socket.emit("chatMessage", {
          roomId: chat_room_id,
          message: chat,
          media: null,
          userId: userId,
        });
      }
  
      setChats([...chats, { id: Date.now().toString(), text: chat, sender: "You" }]);
      // Clear the input fields after sending the message
      setChat("");
      setUploadedImage(null);
      setUploadedVideo(null);
      setUploadedDoc(null);
    }
  };
  const goBackAndDisconnect = async () => {
    console.log(`Going back and leaving room: ${chat_room_id}`);
    navigation.goBack();
    socket.emit("leaveRoom", { roomId: chat_room_id, userId });
  };

  const handleLongPress = (message) => {
    console.log("Long press detected:", message);

    if (message.userId === userId) {
      setSelectedMessage(message);
      console.log("Selected message:", message);
      console.log("Setting modal visible to true");
      setModalVisible(true);
    }
  };

  const handleUpdatePress = async () => {
    setChat(selectedMessage.message || ""); // Set message text or empty string
    setIsEditing(true);
    setModalVisible(false);
  };

  const UpdateMessage = async () => {
    socket.emit("editMessage", {
      roomId: chat_room_id,
      messageId: selectedMessage._id,
      newMessage: chat,
      userId: userId,
    });

    // Refresh for the next chat
    setIsEditing(false);
    setChat("");
  };

  const deleteMessage = async () => {
    setModalVisible(false);
    console.log("Deleting message with ID:", selectedMessage._id);
    // Emit event to delete message
    socket.emit("deleteMessage", {
      roomId: chat_room_id,
      messageId: selectedMessage._id,

      media: selectedMessage._id || null, // Include media if exists
      userId: userId,
    });

    // Clear any existing uploads
    setUploadedImage(null);
    setUploadedVideo(null);
    setUploadedDoc(null);
  };

  const renderItem = ({ item }) => {
    const isUserMessage = item?.userId === userId;
    // console.log("item.userId._id :",item.userId._id,);
    // console.log("userId :",userId,);
    const { message, media } = item;

    const handleMediaPress = (media) => {
      setModalContent(media);
      setIsModalVisible(true);
    };

    const handleCloseModal = () => {
      setIsModalVisible(false);
      setModalContent(null);
      setIsPlayingVideo(false);
    };

    const downloadPDF = async (media) => {
      if (item.userId !== userId) {
        const filename = media.name.slice(18);
        const result = await FileSystem.downloadAsync(
          `${RENDERMEDIAURL}${media.uri}`,
          FileSystem.documentDirectory + filename
        );
        save(result.uri, filename, result.headers["Content-Type"]);
      }
    };

    const save = async (uri, filename, mimetype) => {
      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            filename,
            mimetype
          )
            .then(async (uri) => {
              await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64,
              });
            })
            .catch((e) => console.log(e));
        } else {
          shareAsync(uri);
        }
      } else {
        shareAsync(uri);
      }
    };

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessage : styles.otherMessage,
        ]}
      >
        {media && media.mimeType.startsWith("image/") && media.uri && (
          <TouchableOpacity
            onPress={() => handleMediaPress(media)}
            onLongPress={() => handleLongPress(item)}
          >
            <Image
              source={{ uri: `${RENDERMEDIAURL}${media.uri}` }}
              style={styles.chatImage}
              resizeMode="cover"
            />
            {message && <Text style={styles.messageText}>{message}</Text>}
          </TouchableOpacity>
        )}

        {media && media.mimeType.startsWith("video/") && (
          <TouchableOpacity
            onPress={() => handleMediaPress(media)}
            onLongPress={() => handleLongPress(item)}
          >
            <View>
              <Video
                source={{ uri: `${RENDERMEDIAURL}${media.uri}` }}
                style={styles.chatVideoThumbnail}
                resizeMode={ResizeMode.COVER}
                usePoster={true}
              />
              <Ionicons
                name="play-circle"
                size={64}
                color="white"
                style={styles.playIcon}
              />
            </View>
            {message && <Text style={styles.messageText}>{message}</Text>}
          </TouchableOpacity>
        )}

        {media && media.mimeType === "application/pdf" && (
          <TouchableOpacity onLongPress={() => handleLongPress(item)}>
            <View style={styles.documentContainer}>
              <TouchableOpacity
                onLongPress={() => handleLongPress(item)}
                onPress={() => downloadPDF(media)}
              >
                <Ionicons name="document-text-outline" size={24} color="red" />
                <Text>{media.name.slice(18)}</Text>
              </TouchableOpacity>
            </View>
            {message && <Text style={styles.messageText}>{message}</Text>}
          </TouchableOpacity>
        )}

        {media === null && (
          <TouchableOpacity onLongPress={() => handleLongPress(item)}>
            <Text style={styles.messageText}>{message}</Text>
          </TouchableOpacity>
        )}

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.previewmodalContainer}>
            {modalContent && modalContent.mimeType.startsWith("image/") && (
              <Image
                source={{ uri: `${RENDERMEDIAURL}${modalContent.uri}` }}
                style={{ height: "40%", width: "100%", resizeMode: "cover" }}
              />
            )}

            {modalContent && modalContent.mimeType.startsWith("video/") && (
              <Video
                source={{ uri: `${RENDERMEDIAURL}${modalContent.uri}` }}
                shouldPlay={true}
                resizeMode="contain"
                style={styles.previewmodalVideo}
                useNativeControls
              />
            )}

            <TouchableOpacity
              style={styles.previewcloseButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close-circle" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };

  // upload image for chat
  const pickImage = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      if (!result.canceled) {
        setUploadedImage(result.assets[0]);
        setUploadedVideo(null);
        setUploadedDoc(null);
        setDocModalVisible(false);
      }
    } catch (error) {
      console.log("error doc:", error);
    }
  };

  console.log(uploadedImage);

  //upload docs for chat
  const pickDoc = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      if (!result.canceled) {
        setUploadedImage(null);
        setUploadedVideo(null);
        setUploadedDoc(result.assets[0]);
        setDocModalVisible(false);
      }
    } catch (error) {
      console.log("error doc:", error);
    }
  };

  const generateThumbnail = async (videoUri) => {
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

  const pickVideo = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
      });

      if (!result.canceled) {
        setUploadedImage(null);
        setUploadedDoc(null);
        setUploadedVideo(result.assets[0]);
        await generateThumbnail(result.assets[0].uri);
        setDocModalVisible(false);
      }
    } catch (error) {
      console.log("error doc:", error);
    }
  };

  const close = () => {
    setUploadedDoc(null);
    setUploadedVideo(null);
    setUploadedImage(null);
  };

  const toggleVideoPlayback = () => {
    setIsPlayingVideo(!isPlayingVideo);
  };

  return (
    <View style={styles.container}>
      <RowBetween style={{ paddingTop: 24 }}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <IconButton icon="arrow-left" onPress={goBackAndDisconnect} />
          <TopText
            style={{ color: Theme.themeColor, fontSize: 20, fontWeight: "bold" }}
          >
            {participant_name}
          </TopText>
        </View>
      </RowBetween>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
      />
      {uploadedImage && (
        <View
          style={{
            backgroundColor: "white",
            height: "30%",
            width: "100%",
            padding: 10,
            position: "relative",
          }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 25,
              padding: 5,
              zIndex: 1,
            }}
            onPress={close}
          >
            <Text style={{ color: "black", fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
          <Image
            style={{ height: "100%", width: "100%", borderRadius: 10 }}
            source={{ uri: uploadedImage.uri }}
          />
        </View>
      )}

      {uploadedDoc && (
        <View
          style={{
            backgroundColor: "white",
            height: "20%",
            width: "100%",
            padding: 10,
            position: "relative",
          }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 25,
              padding: 4,
              zIndex: 1,
            }}
            onPress={close}
          >
            <Text style={{ color: "white", fontSize: 16 }}>✕</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color="red"
              style={{ marginRight: 10 }}
            />
            <Text>{uploadedDoc.name}</Text>
          </View>
        </View>
      )}
      {uploadedVideo && thumbnail && (
        <View
          style={{
            backgroundColor: "white",
            height: "35%",
            width: "100%",
            paddingBottom: 20,
            paddingHorizontal: 10,
          }}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 25,
              padding: 5,
              zIndex: 1,
            }}
            onPress={close}
          >
            <Text style={{ color: "black", fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleVideoPlayback}>
            {!isPlayingVideo ? (
              <>
                <Image
                  source={{ uri: thumbnail }}
                  style={{ height: "100%", width: "100%" }}
                />
                <Ionicons
                  name="play-circle"
                  size={64}
                  color="white"
                  style={{ position: "absolute", top: "50%", left: "50%" }}
                />
              </>
            ) : (
              <Video
                source={{ uri: uploadedVideo.uri }}
                shouldPlay={isPlayingVideo}
                resizeMode="cover"
                style={{ height: "100%", width: "100%" }}
              />
            )}
          </TouchableOpacity>
          <Text>{uploadedVideo.name}</Text>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.mediaInput}
          onPress={() => setDocModalVisible(true)}
        >
          <Ionicons size={30} name="add-circle-outline"></Ionicons>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={docModalVisible}
          onRequestClose={() => setDocModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.option} onPress={pickVideo}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="videocam" size={24} color="darkblue" />
                  </View>
                  <Text style={styles.optionText}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={pickImage}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="camera" size={24} color="black" />
                  </View>
                  <Text style={styles.optionText}>Picture</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={pickDoc}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="document" size={24} color="red" />
                  </View>
                  <Text style={styles.optionText}>Document</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDocModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setChat(text)}
          value={chat}
          placeholder="Type a message..."
        />
        <Modal
          transparent={true}
          // visible={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          animationType="fade"
        >
          <TouchableOpacity
            style={styles.updatemodalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.contextMenu}>
              {selectedMessage?.message && (
                <TouchableOpacity
                  onPress={handleUpdatePress}
                  style={styles.modalOption}
                >
                  <Text>Update Message</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={deleteMessage}
                style={styles.modalOption}
              >
                <Text>Delete Message</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={isEditing ? UpdateMessage : handleSubmit}
        >
          <Text style={styles.sendButtonText}>
            {isEditing ? "Update" : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatContainer: {
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor:"#DCF8C6",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageText: {
    fontSize: 16,
  },
  messageText: {
    borderRadius: 5,
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    color: "#007bff",
    fontSize: 16,
  },
  media: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    height: "auto",
    resizeMode: "cover",
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  chatVideo: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  chatVideoThumbnail: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
  documentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 5,
    width: 200,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  mediaInput: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "lightgrey", // Light grey background
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: "center",
  },
  modalContent: {
    flexDirection: "row",
    flexWrap: "wrap", // To wrap the icons into multiple rows if needed
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    padding: 15,
    width: 100, // Fixed width to align icons properly
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white", // White circle
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  optionText: {
    fontSize: 15,
    color: "black",
    textAlign: "center",
    flexWrap: "nowrap",
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalOption: {
    padding: 10,
    fontSize: 16,
  },
  previewmodalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  previewmodalVideo: {
    width: "100%",
    height: "80%",
  },
  previewcloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },

  updatemodalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  contextMenu: {
    width: 200,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    alignItems: "center",
  },

  modalOption: {
    padding: 10,
    width: "100%",
    alignItems: "center",
  },

  fullImage: {
    width: "100%",
    height: "100%",
  },
});

export default ChatScreenNew;
