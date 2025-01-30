import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    Pressable,
    Dimensions,
    TouchableOpacity,
  Modal,

  } from "react-native";
  import React, { useState } from "react";
  
  import { Divider, IconButton } from "react-native-paper";
  //   import { TopText } from "../../../styles/social.styles";
  import { TopText } from "../../styles/social.styles";
  import { useNavigation } from "@react-navigation/native";
  import {
    Container,
    RowBetween,
    SearchField,
  } from "../../styles/common.styles";
  const WINDOW_WIDTH = Dimensions.get("window").width;
  const WINDOW_HEIGHT = Dimensions.get("window").height;
  import { BASEIMGURL } from "../../infrastructure/constants";
import UserImg from "../../assets/images/general/user.png";
import { useSelector } from "react-redux";
import { BASEAPIURL } from "../../infrastructure/constants";



  
  const EachDesigner = ({ route }) => {
    const navigation = useNavigation();
    const { designer } = route.params;

    const token = useSelector((state) => state.user.token);
    const { user } = useSelector((state) => state.user);
  
    const userId = user.roleData.owner;
    const [chatUserId, setChatUserId] = useState();
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const DesignerUserId = designer.owner._id;
  
    const createChatRoom = async (userId) => {
      console.log("userId: ", userId);
      console.log("chatuserId: ", chatUserId);
  
      try {
        const response = await fetch(`${BASEAPIURL}/chat/room/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [userId, chatUserId] }),
        });
  
        console.log("Response: ", response);
        console.log(response.json());
  
        if (response.ok) {
          try {
            const roomResponse = await fetch(`${BASEAPIURL}/chat/rooms/`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            if (roomResponse.ok) {
              const roomData = await roomResponse.json();
              // setUserRooms(data);
              console.log("Room Data: ", roomData);
              const room_with_user = roomData.rooms.filter((room) => room.participants[0].id === chatUserId)[0];
              console.log("Room with user",room_with_user);
              setRequestModalVisible(false);
              navigation.navigate("ChatScreenNew", {
                user_auth_token: token,
                room: room_with_user,
                participant_name:
                room_with_user.participants[0].firstName +
                " " +
                room_with_user.participants[0].lastName,
              });
            } else {
              Alert.alert("Failed to fetch Room.");
              throw new Error("Failed to fetch rooms");
              
            }
          } catch (error) {
            console.error("Error fetching room:", error);
          }
        } else {
          const errorData = await response.json();
          console.error("Error Creating Chat Room:", errorData);
          Alert.alert("Error Creating Chat Room");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
  
  
  
  
    return (
      <Container
        style={{ paddingRight: 0, paddingLeft: 0, backgroundColor: "white" }}
      >
        <RowBetween style={{ paddingTop: 24 }}>
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            <TopText
              style={{ color: "#D4AF37", fontSize: 20, fontWeight: "bold" }}
            >
              Designer Details
            </TopText>
          </View>
          <TouchableOpacity
          style={style.chatButton}
          onPress={() => {
            setChatUserId(DesignerUserId);
            setRequestModalVisible(true);
          }}
        >
          <IconButton icon="chat" size={30}></IconButton>

          {/* <Text style={style.chatButtonText}>Chat</Text> */}
        </TouchableOpacity>
        </RowBetween>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: "4%" }}>
            <Text style={{ fontWeight: "700", fontSize: 22, opacity: 0.8 }}>
            {designer.owner.firstName} {designer.owner.lastName}
            </Text>
            <Image
              style={{
                width: "100%",
                height: 240,
                marginTop: "4%",
                borderRadius: 5,
              }}
            resizeMode="contain"

              source={
                designer.owner && designer.profileImage
                  ? {
                      uri: `${BASEIMGURL}${designer.profileImage}`,
                    }
                  : UserImg
              }
            ></Image>
  
            <View style={{ marginTop: "2%" }}>
              <Text
                style={{
                  fontWeight: "700",
                  opacity: 1,
                  fontSize: 16,
                  marginBottom: "2%",
                }}
              >
                About Designer
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#7E7E7E",
                  lineHeight: 20,
                  fontWeight: "500",
                }}
              >
                {designer.specialty}
              </Text>
            </View>
  
            <View style={{ flexDirection: "column", marginTop: "8%" }}>
                    <Text style={{ fontWeight: "bold", opacity: 0.8 }}>
                      Email
                    </Text>
                    <Text style={{ opacity: 0.7 }}>{designer.owner.email}</Text>
              </View>
                
                <View style={{ flexDirection: "column", marginTop: "8%" }}>
                  <View style={{ flexDirection: "column" }}>
                    <Text style={{ fontWeight: "bold", opacity: 0.7 }}>
                      Phone
                    </Text>
  
                    <Text style={{ opacity: 1 }}>{designer.owner.phone}</Text>
                  </View>
               </View>
           
               <Modal
              animationType="slide"
              transparent={true}
              visible={requestModalVisible}
              onRequestClose={() => setRequestModalVisible(false)}
            >
              <View style={style.modalContainer}>
                <View style={style.modalContent}>
                  <Text style={style.modalTitle}>
                    Are you sure you want to chat with {designer.owner.firstName} {designer.owner.lastName} ?
                  </Text>
                  <TouchableOpacity
                    style={style.sendRequestButton}
                    onPress={() => {
                      createChatRoom(userId);
                    }}
                  >
                    <Text style={style.sendRequestButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={style.closeButton}
                    onPress={() => setRequestModalVisible(false)}
                  >
                    <Text style={style.closeButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
  
  
          </View>
        </ScrollView>
      </Container>
    );
  };
  
  export default EachDesigner;
  
  const style = StyleSheet.create({
    footer: {
      position: "absolute",
      height: 50,
      left: 0,
      bottom: -2,
      width: WINDOW_WIDTH,
    },
    oldPrice: {
      textDecorationLine: "line-through",
      textDecorationStyle: "solid",
      opacity: 0.9,
      fontSize: 13,
      color: "#D4AF37",
      margin: "1%",
    },
    qq: {
      marginTop: "3%",
      backgroundColor: "#f7f1d5",
      padding: "2%",
      borderRadius: 9,
      marginRight: "2%",
    },
    qqtxt: {
      fontSize: 15,
      color: "#D4AF37",
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    eachJewelleryCardFooter: {
      backgroundColor: "#D4AF37",
      opacity: 0.8,
      justifyContent: "center",
      alignItems: "center",
      padding: "3%",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "80%",
      backgroundColor: "white",
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
    },
  
    sendRequestButton: {
      marginTop: 20,
      backgroundColor: "#D4AF37",
      padding: 10,
      borderRadius: 5,
    },
    sendRequestButtonText: {
      color: "white",
      fontWeight: "bold",
    },
    closeButton: {
      marginTop: 10,
      padding: 10,
    },
    closeButtonText: {
      color: "#D4AF37",
      fontWeight: "bold",
    },
  });
  