// LanguageSelector.tsx - Language selection component

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";

import { supportedLanguages, LanguageCode, LANGUAGE_STORAGE_KEY } from "../i18n";

export interface LanguageSelectorProps {
  onLanguageChange?: (language: LanguageCode) => void;
}

function LanguageSelector({ onLanguageChange }: LanguageSelectorProps): React.JSX.Element {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(i18n.language as LanguageCode);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    const loadSavedLanguage = async (): Promise<void> => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
          await i18n.changeLanguage(savedLanguage);
          setCurrentLanguage(savedLanguage as LanguageCode);
        }
      } catch (error) {
        console.error("Error loading language:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLanguage();
  }, [i18n]);

  const handleValueChange = async (value: LanguageCode): Promise<void> => {
    try {
      await i18n.changeLanguage(value);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, value);
      setCurrentLanguage(value);
      if (onLanguageChange) {
        onLanguageChange(value);
      }
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={currentLanguage}
        onValueChange={handleValueChange}
        style={styles.picker}
        accessibilityLabel="Language selector"
        accessibilityRole="combobox"
        accessible={true}
        accessibilityHint="Select application language"
      >
        {supportedLanguages.map((lang) => (
          <Picker.Item
            key={lang.code}
            label={`${lang.nativeName} (${lang.name})`}
            value={lang.code}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  loadingContainer: {
    padding: 8,
    alignItems: "center",
  },
  picker: {
    flex: 1,
    height: 50,
    ...Platform.select({
      ios: {
        height: 120,
      },
    }),
  },
});

export default LanguageSelector;
