// LanguageSelector.tsx - Language selection component

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

import { supportedLanguages, LanguageCode, LANGUAGE_STORAGE_KEY } from "../i18n";

import ThemedSelect, { ThemedSelectOption } from "./ThemedSelect";

export interface LanguageSelectorProps {
  onLanguageChange?: (language: LanguageCode) => void;
}

function LanguageSelector({ onLanguageChange }: LanguageSelectorProps): React.JSX.Element {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(i18n.language as LanguageCode);

  const options = useMemo<ThemedSelectOption<LanguageCode>[]>(
    () =>
      supportedLanguages.map((lang) => ({
        value: lang.code,
        label: `${lang.nativeName} (${lang.name})`,
      })),
    [],
  );

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

  return (
    <View style={styles.container}>
      <ThemedSelect
        options={options}
        selectedValue={currentLanguage}
        onValueChange={handleValueChange}
        accessibilityLabel="Language selector"
        accessibilityHint="Select application language"
        testID="language-selector"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
});

export default LanguageSelector;
