import React from "react";
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, IconButton, Card } from "react-native-paper";

import { RowBetween } from "../styles/common.styles";
import { TopText } from "../styles/social.styles";
import Theme from "../styles/theme";

const ChangeLanguage = ({ navigation }) => {
  const [languageChanged, setLanguageChanged] = useState(false);
  const { t, i18n } = useTranslation();
  
  // Get current language
  const currentLanguage = i18n.language;

  const changeLanguage = async (lng) => {
    console.log(`🔁 Attempting to change language to: ${lng}`);

    try {
      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem('user-language', lng);
      console.log(`✅ Language changed to: ${lng}`);
      setLanguageChanged((prev) => !prev);
    } catch (error) {
      console.error(`❌ Error changing language: ${error}`);
    }
  };


  console.log("languageChanged: ", languageChanged);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <RowBetween>
          <View style={styles.headerRow}>
            <IconButton
              icon="arrow-left"
              onPress={() => {
                if (navigation?.canGoBack?.()) {
                  navigation.goBack();
                } else {
                  navigation.navigate("Dashboard");
                }
              }}
            />
            <TopText style={styles.headerText}>{t("change_language")}</TopText>
          </View>
        </RowBetween>
      </View>

      <View style={styles.content}>
       
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={() => changeLanguage("mr")}
              style={[
                styles.button,
                currentLanguage === "mr" && styles.selectedButton
              ]}
              labelStyle={[
                styles.buttonLabel,
                currentLanguage === "mr" && styles.selectedButtonLabel
              ]}
            >
              मराठी (Marathi)
            </Button>
            <Button
              mode="contained"
              onPress={() => changeLanguage("en")}
              style={[
                styles.button,
                currentLanguage === "en" && styles.selectedButton
              ]}
              labelStyle={[
                styles.buttonLabel,
                currentLanguage === "en" && styles.selectedButtonLabel
              ]}
            >
              English
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

export default ChangeLanguage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingHorizontal: 10,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: Theme.themeColor,
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#222",
  },
  subText: {
    fontSize: 16,
    marginBottom: 30,
    color: "#555",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    elevation: 3,
  },
  button: {
    marginVertical: 8,
    backgroundColor: Theme.themeColor,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
  },
  selectedButton: {
    backgroundColor: Theme.themeColor,
    borderWidth: 2,
    borderColor: Theme.themeColor,
    elevation: 5,
  },
  selectedButtonLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
