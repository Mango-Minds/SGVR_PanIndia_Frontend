import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "../locales/en.json";
import mr from "../locales/mr.json";
import hi from "../locales/hi.json";
import te from "../locales/te.json";
import kn from "../locales/kn.json";
import ta from "../locales/ta.json";
import ml from "../locales/ml.json";

export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = ["en", "hi", "mr", "te", "kn", "ta", "ml"];

const resources = {
  en: { translation: en },
  mr: { translation: mr },
  hi: { translation: hi },
  te: { translation: te },
  kn: { translation: kn },
  ta: { translation: ta },
  ml: { translation: ml },
};

const normalizeLanguage = (lng) => {
  const code = (lng || DEFAULT_LANGUAGE).split("-")[0];
  return SUPPORTED_LANGUAGES.includes(code) ? code : DEFAULT_LANGUAGE;
};

/**
 * Hybrid language:
 * - Guest / logged out → English
 * - Logged in → user's preferredLanguage (cached in AsyncStorage)
 */
export const applyAppLanguage = async (lng) => {
  const language = normalizeLanguage(lng);
  await AsyncStorage.setItem("user-language", language);
  if (i18next.language !== language) {
    await i18next.changeLanguage(language);
  }
  return language;
};

export const resetToDefaultLanguage = async () => {
  return applyAppLanguage(DEFAULT_LANGUAGE);
};

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: async (callback) => {
    try {
      const loggedIn = await AsyncStorage.getItem("loggedIn");
      // Guests / logged-out users always start in English
      if (loggedIn !== "true") {
        callback(DEFAULT_LANGUAGE);
        return;
      }
      const savedLanguage = await AsyncStorage.getItem("user-language");
      callback(normalizeLanguage(savedLanguage));
    } catch (error) {
      callback(DEFAULT_LANGUAGE);
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    const loggedIn = await AsyncStorage.getItem("loggedIn");
    // Only cache for logged-in users so guest sessions don't stick a language on the device
    if (loggedIn === "true") {
      await AsyncStorage.setItem("user-language", normalizeLanguage(lng));
    }
  },
};

i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    fallbackLng: DEFAULT_LANGUAGE,
    debug: false,
    resources,
  });

export default i18next;
