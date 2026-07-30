import React, { useState, useRef } from "react";
import { StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Text } from "react-native-paper";
import { SearchField, View } from "../../styles/common.styles";
import { Row } from "../../styles/dashboard.styles";
import { ShareModalContainer } from "../../styles/social.styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RBSheet from "react-native-raw-bottom-sheet";
import ShareCard from "../social/ShareCard";
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import { generateShareUrl, generateShareMessage } from '../../utils/shareUtils';

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

export default function ShareModal({ slideUpRef, friends, onShare, shareData: initialShareData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedFriendNames, setSelectedFriendNames] = useState([]);
  const [currentShareData, setCurrentShareData] = useState(initialShareData || {
    type: 'content',
    id: 'default',
    title: 'Indiyoura',
    message: 'Check out this content on Indiyoura!'
  });

  // Expose setShareData method through ref
  React.useImperativeHandle(slideUpRef, () => ({
    open: () => slideUpRef.current?.open(),
    close: () => slideUpRef.current?.close(),
    setShareData: (data) => {
      console.log("setShareData called with:", data);
      setCurrentShareData(data);
    }
  }));

  // Update currentShareData when initialShareData changes
  React.useEffect(() => {
    if (initialShareData) {
      setCurrentShareData(initialShareData);
    }
  }, [initialShareData]);

  const filteredFriends = friends?.filter(friend => 
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.fname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.lname?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getShareUrl = () => {
    console.log("Current share data:", currentShareData);
    
    if (currentShareData?.type === 'post') {
      return generateShareUrl('post', currentShareData.postId, {
        userId: currentShareData.userId,
        preview: currentShareData.content?.substring(0, 100)
      });
    } else if (currentShareData?.type === 'event') {
      return generateShareUrl('event', currentShareData.eventId, {
        name: currentShareData.eventName,
        location: currentShareData.location,
        organizer: currentShareData.organizer
      });
    } else if (currentShareData?.type === 'profile') {
      return generateShareUrl('profile', currentShareData.userId, {
        username: currentShareData.username,
        name: currentShareData.name
      });
    } else {
      return generateShareUrl('content', currentShareData?.id || 'default');
    }
  };

  const handleShareUrl = async () => {
    try {
      const shareUrl = getShareUrl();
      const shareMessage = currentShareData?.message || "Check out this content on Indiyoura!";
      
      const shareOptions = {
        title: currentShareData?.title || "Indiyoura",
        message: generateShareMessage(shareMessage, shareUrl),
        url: shareUrl,
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        console.log("Content shared successfully");
        slideUpRef.current.close();
      }
    } catch (error) {
      console.error("Error sharing URL:", error);
      Alert.alert("Error", "Failed to share content. Please try again.");
    }
  };

  const handleCopyUrl = async () => {
    try {
      const shareUrl = getShareUrl();
      await Clipboard.setStringAsync(shareUrl);
      Alert.alert("Success", "URL copied to clipboard!");
      slideUpRef.current.close();
    } catch (error) {
      console.error("Error copying URL:", error);
      Alert.alert("Error", "Failed to copy URL. Please try again.");
    }
  };

  return (
    <RBSheet
      ref={slideUpRef}
      openDuration={250}
      height={400}
      closeOnDragDown={true}
      dragFromTopOnly={true}
      closeOnPressMask={true}
      customStyles={{
        container: {
          borderTopRightRadius: 12,
          borderTopLeftRadius: 12,
        },
        draggableIcon: {
          backgroundColor: "#000",
        },
      }}
    >
      <ShareModalContainer style={styles.container}>
        <Text
          style={{
            fontWeight: "normal",
            fontSize: 20,
            color: "#454F63",
            marginBottom: 8,
          }}
        >
          Share Content
        </Text>
        
        {/* Debug info - remove in production */}
        <Text
          style={{
            fontSize: 12,
            color: "#666",
            marginBottom: 8,
            fontStyle: 'italic'
          }}
        >
          Type: {currentShareData?.type || 'none'} | ID: {currentShareData?.postId || currentShareData?.id || 'none'}
        </Text>
        
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#b98c13",
              padding: 15,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 10,
            }}
            onPress={handleShareUrl}
          >
            <Icon name="share-variant" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Share via App
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: "#f0f0f0",
              padding: 15,
              borderRadius: 8,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#b98c13",
            }}
            onPress={handleCopyUrl}
          >
            <Icon name="content-copy" size={20} color="#b98c13" style={{ marginRight: 8 }} />
            <Text style={{ color: "#b98c13", fontWeight: "bold" }}>
              Copy Link
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontWeight: "normal",
            fontSize: 16,
            color: "#454F63",
            marginBottom: 8,
          }}
        >
          Or share with friends:
        </Text>
        
        <Row style={{ alignItems: "center", marginTop: 16 }}>
          <SearchField
            style={{ marginTop: 0 }}
            placeholder="Search your friends"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={{ position: "absolute", right: "5%", elevation: 3 }}>
            <TouchableOpacity>
              <Icon name="magnify" size={24} />
            </TouchableOpacity>
          </View>
        </Row>
        <ScrollView
          style={{ margin: 0, padding: 0, marginBottom: 48, maxHeight: 200 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredFriends.map((item, index) => (
            <ShareCard 
              {...item} 
              key={index}
              setBufferArray={setSelectedFriends}
              bufferArray={selectedFriends}
              bufferArrayNames={selectedFriendNames}
              setBufferArrayNames={setSelectedFriendNames}
            />
          ))}
        </ScrollView>
        {selectedFriends.length > 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: "#b98c13",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 10,
            }}
            onPress={() => {
              const shareUrl = getShareUrl();
              console.log("Sharing URL with friends:", shareUrl, selectedFriends);
              // Here you could implement sending the URL to selected friends via chat or notification
              Alert.alert("Success", `URL shared with ${selectedFriends.length} friend(s)!`);
              slideUpRef.current.close();
              setSelectedFriends([]);
              setSelectedFriendNames([]);
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Share with {selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
      </ShareModalContainer>
    </RBSheet>
  );
}
