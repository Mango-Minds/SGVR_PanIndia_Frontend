import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const JewelleryChatScreen = (selectedVendor) => {
  // const { vendor } = route.params;
  // console.log("Route: ", route.params);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  const sendMessage = () => {
    if (message.trim() === "") return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, sender: "user", time: currentTime },
    ]);
    setMessage("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ marginLeft: "0%", marginTop: "1%" }}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        </View>

        <Text style={styles.headerText}>Vendor</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text
              style={
                item.sender === "user"
                  ? styles.userMessage
                  : styles.vendorMessage
              }
            >
              {item.text}
              {"\n"}
              <View style={styles.timestampContainer}>
                <Text style={styles.timestampText}>{item.time}</Text>
              </View>
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    height: 90,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "left",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: "-10%",
    marginLeft: 50,
    color: "#D4AF37",
  },
  messageContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  userMessage: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 10,
    alignSelf: "flex-end",
  },
  vendorMessage: {
    backgroundColor: "#c0e0ff",
    padding: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  timestampContainer: {
    alignSelf: "flex-end",
    marginRight: 30,
  },
  timestampText: {
    fontSize: 10,
    color: "#888",
    textAlign: "right",
  },
});

export default JewelleryChatScreen;
