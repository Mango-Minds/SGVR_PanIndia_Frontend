import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import useMessageUnreadBadge from "../../hooks/useMessageUnreadBadge";

export default function BottomNavigation({ navigation }) {
  const messageUnreadCount = useMessageUnreadBadge();
  const messageBadgeLabel =
    messageUnreadCount > 99 ? "99+" : String(messageUnreadCount);

  return (
    <View style={styles.bottomBarContainer}>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("HomeScreen")} 
        >
          <Ionicons name="home" size={24} color="#b98c13" />
          <Text style={[styles.iconText, { color: "#b98c13" }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("MyProfile")}
        >
          <Ionicons name="person-outline" size={24} color="gray" />
          <Text style={[styles.iconText, { color: "gray" }]}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.iconContainer, styles.centerIconContainer]}
          onPress={() => {
            // Navigate to browse/search screen
            navigation.navigate("BrowseScreen");
          }}
        >
          <Ionicons name="search" size={28} color="gray" />
          <Text style={[styles.iconText, { color: "gray" }]}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("MessageScreen")}
        >
          <View style={styles.messageIconWrap}>
            <Ionicons name="chatbubble-outline" size={24} color="gray" />
            {messageUnreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{messageBadgeLabel}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.iconText, { color: "gray" }]}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() =>
            navigation.navigate("JewelleryNotifications", {
              shops: [],
              shopId: null,
            })
          }
        >
          <Ionicons name="notifications-outline" size={24} color="gray" />
          <Text style={[styles.iconText, { color: "gray" }]}>Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Catagory: {
    marginHorizontal: 10,
    marginVertical: 15,
  },
  CatagoryText: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
    color: "#616161",
  },
  StockCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 5,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  stockImage: {
    width: 90,
    height: 90,
    marginRight: 10,
  },
  stockName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#141414",
    marginBottom: 10,
  },
  stockspecs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "73%",
  },
  stockdetails: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.5,
  },
  stocklocation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  stockloacaiontext: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
    opacity: 0.8,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: "#D4AF37",
  },
  tabText: {
    color: "black",
  },
  selectedTabText: {
    color: "white",
  },

  shadowProp: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 1.41,
    elevation: 2,
  },

  bottomBarContainer: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
  },
  centerIconContainer: {
    flex: 1.2,
  },
  messageIconWrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  iconText: {
    marginTop: 4,
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
    marginLeft: 20,
  },
  circleImage: {
    width: 50,
    height: 50,
    borderRadius: 45,
    overflow: "hidden",
    marginBottom: 5,
    borderWidth: 0.1,
    borderColor: "gray",
  },
  chatIconBackground: {
    width: 60,
    height: 30,
    borderRadius: 22,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "lightgray",
    borderRadius: 10,
    width: 250,
    opacity: 1.5,
    height: 40,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 18,
  },
  closeButton: {
    position: "absolute",
    top: 1,
    right: 8,
  },
});
