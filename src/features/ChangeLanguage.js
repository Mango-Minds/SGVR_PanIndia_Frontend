import React from "react";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, IconButton, Card } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { RowBetween } from "../styles/common.styles";
import { TopText } from "../styles/social.styles";
import Theme from "../styles/theme";
import { applyAppLanguage } from "./i18n";
import { updateUser } from "../store/user";
import { BASEAPIURL } from "../infrastructure/constants";
import authHeader from "../services/auth.header";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
];

const ChangeLanguage = ({ navigation }) => {
  const [languageChanged, setLanguageChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user, token, isGuest } = useSelector((state) => state.user);

  const currentLanguage = (i18n.language || "en").split("-")[0];

  const changeLanguage = async (lng) => {
    if (saving || lng === currentLanguage) return;

    try {
      setSaving(true);

      // Apply locally first for instant UI feedback
      await applyAppLanguage(lng);

      // Logged-in users: sync preference to account (works across devices)
      if (token && !isGuest && user?._id) {
        try {
          const headers = await authHeader();
          // Use existing update endpoint (preferred-language route may not be deployed yet)
          await axios.patch(
            `${BASEAPIURL}/user/update/${user._id}`,
            { preferredLanguage: lng },
            { headers }
          );

          const updatedUser = { ...user, preferredLanguage: lng };
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          dispatch(updateUser(updatedUser));
        } catch (apiError) {
          console.error("Failed to sync language to server:", apiError);
          // Local change already applied; sync can retry next time user changes language
        }
      }

      setLanguageChanged((prev) => !prev);
    } catch (error) {
      console.error(`Error changing language: ${error}`);
    } finally {
      setSaving(false);
    }
  };

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
            {LANGUAGES.map((lang) => {
              const selected = currentLanguage === lang.code;
              return (
                <Button
                  key={`${lang.code}-${languageChanged}`}
                  mode="contained"
                  disabled={saving}
                  onPress={() => changeLanguage(lang.code)}
                  style={[styles.button, selected && styles.selectedButton]}
                  contentStyle={styles.buttonContent}
                  labelStyle={[
                    styles.buttonLabel,
                    selected && styles.selectedButtonLabel,
                  ]}
                >
                  {lang.label}
                </Button>
              );
            })}
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
    lineHeight: 28,
    paddingTop: 4,
    includeFontPadding: true,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
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
  buttonContent: {
    paddingVertical: 6,
    minHeight: 48,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    paddingTop: 3,
    includeFontPadding: true,
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
    lineHeight: 26,
    paddingTop: 3,
    includeFontPadding: true,
  },
});
