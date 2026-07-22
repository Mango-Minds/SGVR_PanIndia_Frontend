import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Theme from "../../styles/theme";
import { useTranslation } from "react-i18next";
import useMessageUnreadBadge from "../../hooks/useMessageUnreadBadge";

export default function BottomNavigation({ navigation, currentScreen }) {
  const { t } = useTranslation();
  const messageUnreadCount = useMessageUnreadBadge();
  const messageBadgeLabel =
    messageUnreadCount > 99 ? "99+" : String(messageUnreadCount);
  
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
          <View style={styles.messageIconWrap}>
            <Ionicons 
              name={isActive("messages") ? getFilledIconName("messages") : getIconName("messages")}
              size={24} 
              color={isActive("messages") ? Theme.themeColor : "#666"} 
            />
            {messageUnreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{messageBadgeLabel}</Text>
              </View>
            )}
          </View>
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
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    textDecorationLine: "none",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
