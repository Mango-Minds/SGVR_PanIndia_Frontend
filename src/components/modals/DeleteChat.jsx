import React from "react";
import { Image, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Row } from "../../styles/dashboard.styles";
import { FormButton } from "../../styles/prelogin.styles";
import { UnfollowModalContainer } from "../../styles/social.styles";
import RBSheet from "react-native-raw-bottom-sheet";
import { deleteChat } from "../../services/socialMedia.services";
import { useDispatch, useSelector } from "react-redux";
import { updateConversation } from "../../store/user";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.2)",
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "column",
  },
  container: {
    backgroundColor: "white",
    paddingTop: 24,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    paddingBottom: 12,
  },
});

export default function DeleteModal({ slideUpRef, img, name, mainRef, data }) {
  const dispatch = useDispatch();
  const { conversations } = useSelector((state) => state.user);
  const navigation = useNavigation();

  const handleDeleteChat = async () => {
    try {
      // Generate conversation ID from the conversation array if _id is not available
      let conversationId = data._id;
      
      if (!conversationId && data.conversation) {
        // Generate room ID from conversation array (sorted user IDs joined with underscore)
        conversationId = data.conversation.sort().join('_');
      }
      
      if (!conversationId) {
        console.error("No conversation ID available for deletion");
        return;
      }
      
      console.log("Deleting chat with ID:", conversationId);
      const res = await deleteChat(conversationId);
      
      if (res.success) {
        console.log("Chat deleted successfully");
        
        // Remove the conversation from Redux state
        const updatedConversations = conversations.filter(conv => {
          // Check if this conversation matches the deleted one
          if (conv._id === conversationId) return false;
          if (conv.conversation && conv.conversation.sort().join('_') === conversationId) return false;
          return true;
        });
        dispatch(updateConversation(updatedConversations));
        
        // Close modals
        slideUpRef.current.close();
        mainRef.current.close();
        navigation.goBack();
      } else {
        console.error("Failed to delete chat:", res.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error in handleDeleteChat:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <RBSheet
      animationType="fade"
      ref={slideUpRef}
      openDuration={250}
      closeOnDragDown={false}
      dragFromTopOnly={false}
      closeOnPressMask={false}
      customStyles={{
        container: {
          borderTopRightRadius: 12,
          borderTopLeftRadius: 12,
          height: "auto",
          paddingBottom: 28,
        },
        draggableIcon: {
          backgroundColor: "black",
        },
      }}
    >
      <UnfollowModalContainer style={styles.container}>
        {/* <Image
          source={{ uri: img }}
          style={{ width: 46, height: 46, borderRadius: 6, marginVertical: 8 }}
        />
        <Text
          style={{ fontWeight: "bold", color: "#454F63", marginVertical: 8 }}
        >
          {name}
        </Text> */}
        <Text
          style={{ fontWeight: "normal", color: "#454F63", marginVertical: 8 }}
        >
          Are you sure you want to delete chat with{" "}
          <Text style={{ textTransform: "capitalize", fontWeight: "bold" }}>
            {data.name}
          </Text>
          ?
        </Text>
        <Row style={{ width: "100%" }}>
          <FormButton
            style={{ flex: 1, marginLeft: 8, marginRight: 8 }}
            onPress={handleDeleteChat}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Delete</Text>
          </FormButton>

          <FormButton
            style={{
              flex: 1,
              marginLeft: 8,
              marginRight: 8,
              backgroundColor: "#E9EBEF",
            }}
            onPress={() => {
              {
                slideUpRef.current.close();
                mainRef.current.close();
              }
            }}
          >
            <Text style={{ color: "#78849E", fontWeight: "bold" }}>No</Text>
          </FormButton>
        </Row>
      </UnfollowModalContainer>
    </RBSheet>
  );
}
