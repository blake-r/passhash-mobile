// i18n.ts - Internationalization configuration
// Based on i18next for React Native

import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";
import ru from "./locales/ru.json";

export const defaultNS = "translation";
export const resources = {
  en: { translation: en },
  de: { translation: de },
  ru: { translation: ru },
} as const;

export const supportedLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
] as const;

export type LanguageCode = (typeof supportedLanguages)[number]["code"];
export const LANGUAGE_STORAGE_KEY = "@PasswordHasher:language";

// Get initial language from storage or default to 'en'
const getInitialLanguage = async (): Promise<LanguageCode> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
      return savedLanguage as LanguageCode;
    }
  } catch (error) {
    console.error("Error loading language:", error);
  }
  return "en";
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language, will be overridden by LanguageSelector
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    compatibilityJSON: "v3",
  });

export { getInitialLanguage };
export default i18n;
