import React, { useRef } from "react";
import { Card, Button, Divider } from "react-native-paper";
import { ActivityIndicator, Image, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { getImageUrl } from "../../services/socialMedia.services";
import { deleteChat } from "../../services/socialMedia.services";
import { updateConversation } from "../../store/user";
import Icons from "react-native-vector-icons/Ionicons";

export default function MessageCard(props) {
  console.log("MessageCard - props:", props);
  const { user } = useSelector((state) => state.user);
  const { conversations } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [dp, setDp] = React.useState();
  const profile = useRef();

  const handleDelete = () => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete chat with ${(profile.current?.firstName || profile.current?.fname) + " " + (profile.current?.lastName || profile.current?.lname)}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Generate conversation ID from the conversation array if _id is not available
              let conversationId = props._id;
              
              if (!conversationId && props.lastmsg && props.lastmsg.conversation) {
                // Generate room ID from conversation array (sorted user IDs joined with underscore)
                conversationId = props.lastmsg.conversation.sort().join('_');
              }
              
              if (!conversationId) {
                console.error("No conversation ID available for deletion");
                Alert.alert("Error", "Unable to delete conversation");
                return;
              }
              
              console.log("Deleting conversation:", conversationId);
              const res = await deleteChat(conversationId);
              
              if (res.success) {
                console.log("Conversation deleted successfully");
                
                // Remove the conversation from Redux state
                const updatedConversations = conversations.filter(conv => {
                  // Check if this conversation matches the deleted one
                  if (conv._id === conversationId) return false;
                  if (conv.lastmsg && conv.lastmsg.conversation && conv.lastmsg.conversation.sort().join('_') === conversationId) return false;
                  return true;
                });
                dispatch(updateConversation(updatedConversations));
                
                // Navigate back to previous page
                navigation.goBack();
              } else {
                console.error("Failed to delete conversation:", res.message);
                Alert.alert("Error", "Failed to delete conversation");
              }
            } catch (error) {
              console.error("Error deleting conversation:", error);
              Alert.alert("Error", "Failed to delete conversation");
            }
          }
        }
      ]
    );
  };

  React.useEffect(() => {
    const loadProfile = async () => {
      // Handle both array and single object formats
      const userData = Array.isArray(props.user) ? props.user : [props.user];
      
      for (let i = 0; i < userData.length; i++) {
        const item = userData[i];
        if (item._id === user._id) {
          // Skip current user
        } else {
          profile.current = item;
          const res = await getImageUrl(item.dp || item.image);
          if (res.status === 0 && (item.dp || item.image)) {
            setDp(res.url);
          }
          return;
        }
      }
    };
    
    loadProfile();
  }, []);

  if (profile.current)
    return (
      <Card
        style={{
          marginVertical: 10,
          shadowColor: "#00000014",
          backgroundColor: "white",
        }}
        onPress={() => {
          navigation.navigate("ChatScreen", {
            toid: profile.current._id,
            toName: (profile.current.firstName || profile.current.fname) + " " + (profile.current.lastName || profile.current.lname),
            index: props.index,
            conversationId: props._id, // Pass the conversation ID
          });
        }}
        onLongPress={handleDelete}
      >
        <Card.Title
          style={{ paddingBottom: 10 }}
          title={(profile.current?.firstName || profile.current?.fname) + " " + (profile.current?.lastName || profile.current?.lname)}
          subtitle={
            props?.lastmsg?.sender === user._id.toString() ? (
              <>
                <Icons name="checkmark-done" size={16} color="#454F63" />{" "}
                {props?.lastmsg?.msg}
              </>
            ) : (
              props?.lastmsg?.msg
            )
          }
          titleStyle={{
            fontWeight: "bold",
            fontSize: 16,
            marginLeft: 16,
            color: "#454F63",
            textTransform: "capitalize",
          }}
          subtitleStyle={{
            fontSize: 12,
            color: "#454F63",
            marginLeft: 16,
            fontWeight: "500",
          }}
          subtitleNumberOfLines={2}
          left={(props) => {
            return (
              <Image
                source={
                  dp
                    ? { uri: dp }
                    : require("../../assets/images/general/user.png")
                }
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 10,
                  backgroundColor: "#fff",
                }}
                resizeMode="contain"
              />
            );
          }}
          // right={(props) => {
          //   return <NotificationAlertCircle />;
          // }}
        />
        <Divider style={{ marginTop: 5 }} />
      </Card>
    );
  else
    return (
      <ActivityIndicator
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
        size={"large"}
        color={"#b98c13"}
      />
    );
}
