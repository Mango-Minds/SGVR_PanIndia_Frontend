import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, IconButton } from "react-native-paper";
import Theme from "../../styles/theme";
import { useTranslation } from "react-i18next";

export default function BottomNavigation({ navigation, currentScreen }) {
  const { t } = useTranslation();
  
  const getIconName = (screen) => {
    switch (screen) {
      case "home":
        return "home-outline";
      case "myNetwork":
        return "people-outline";
      case "search":
        return "search-outline";
      case "messages":
        return "chatbubble-ellipses-outline";
      default:
        return "home-outline";
    }
  };

  const getFilledIconName = (screen) => {
    switch (screen) {
      case "home":
        return "home";
      case "myNetwork":
        return "people";
      case "search":
        return "search";
      case "messages":
        return "chatbubble-ellipses";
      default:
        return "home";
    }
  };

  const isActive = (screen) => currentScreen === screen;

  return (
    <View style={styles.bottomBarContainer}>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => {
            if (currentScreen === "home") {
              const parent = navigation.getParent();
              if (parent) {
                parent.navigate("Main");
              } else {
                navigation.navigate("MainHome");
              }
            } else {
              navigation.navigate("SocialHomeScreen");
            }
          }}
        >
          <Ionicons 
            name={isActive("home") ? getFilledIconName("home") : getIconName("home")}
            size={24} 
            color={isActive("home") ? Theme.themeColor : "#666"} 
          />
          <Text style={[
            styles.iconText, 
            { color: isActive("home") ? Theme.themeColor : "#666" }
          ]}>
            {t("home")}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("MyNetwork")}
        >
          <Ionicons 
            name={isActive("myNetwork") ? getFilledIconName("myNetwork") : getIconName("myNetwork")}
            size={24} 
            color={isActive("myNetwork") ? Theme.themeColor : "#666"} 
          />
          <Text style={[
            styles.iconText, 
            { color: isActive("myNetwork") ? Theme.themeColor : "#666" }
          ]}> 
            {t("myNetwork")}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("SearchResults")}
        >
          <Ionicons 
            name={isActive("search") ? getFilledIconName("search") : getIconName("search")}
            size={24} 
            color={isActive("search") ? Theme.themeColor : "#666"} 
          />
          <Text style={[
            styles.iconText, 
            { color: isActive("search") ? Theme.themeColor : "#666" }
          ]}>
            {t("search")}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate("MessageScreen")}
        >
          <Ionicons 
            name={isActive("messages") ? getFilledIconName("messages") : getIconName("messages")}
            size={24} 
            color={isActive("messages") ? Theme.themeColor : "#666"} 
          />
          <Text style={[
            styles.iconText, 
            { color: isActive("messages") ? Theme.themeColor : "#666" }
          ]}>
            {t("messages")}
          </Text>
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
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },

  iconText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    textDecorationLine: "none",
    includeFontPadding: false,
    textAlignVertical: "center",
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
