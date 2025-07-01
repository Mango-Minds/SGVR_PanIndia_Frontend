import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "react-native-vector-icons";
import Theme from "../../styles/theme";
import { useTranslation } from "react-i18next";
export default function BottomNavigation({ navigation }) {
  const { t } = useTranslation(); 
  return (
    <View style={styles.bottomBarContainer}>
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() =>
            // navigation.navigate("MainHome")
 navigation.goBack()
          }
        >
          <Ionicons name="home-outline" size={24} color={Theme.themeColor} />
          <Text style={[styles.iconText, { color: Theme.themeColor }]}>{t("home")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer}>
          <Ionicons name="list-outline" size={24} color="gray" />
          <Text style={[styles.iconText, { color: "gray" }]}>{t("details")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer}>
          <Ionicons name="settings-outline" size={24} color="gray" />
          <Text style={[styles.iconText, { color: "gray" }]}>{t("settings")}</Text>
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
    width: '100%',
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

  iconText: {
    marginTop: 4,
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
    marginLeft: 20,
  },
});
