import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Add this
import en from "../locales/en.json";
import mr from "../locales/mr.json";

const resources = {
  en: { translation: en },
  mr: { translation: mr },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    const savedLanguage = await AsyncStorage.getItem('user-language');
    const fallback = 'en';
    callback(savedLanguage || fallback);
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    await AsyncStorage.setItem('user-language', lng);
  },
};

i18next
  .use(languageDetector) 
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    debug: false,
    resources,
  });

export default i18next;


// import i18next from "i18next";
// import { initReactI18next } from "react-i18next";
// import en from "../locales/en.json";
// import mr from "../locales/mr.json"

// const resources = {
//   en: {
//     translation: en,
//   },
//   mr: {
//     translation: mr,
//   },
  
// }

// i18next.use(initReactI18next).init({
//   debug: false,
//   lng: 'en',
//   compatibilityJSON: 'v3',
  
//   fallbackLng: 'en',
//   resources,
// })

// export default i18next;





