// ThemeSelector.tsx - Theme preference selection component (system / dark / light)

import { Picker } from "@react-native-picker/picker";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, Platform } from "react-native";

import { useAppStore } from "../state/app-store";
import { useTheme, ThemePreference } from "../theme";

const THEME_OPTIONS: ThemePreference[] = ["system", "dark", "light"];

function ThemeSelector(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const themePreference = useAppStore((state) => state.themePreference);
  const setThemePreference = useAppStore((state) => state.setThemePreference);

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={themePreference}
        onValueChange={(value: ThemePreference) => setThemePreference(value)}
        style={styles.picker}
        dropdownIconColor={theme.textSecondary}
        accessibilityLabel={t("settings.theme.label")}
        accessibilityRole="combobox"
        accessible={true}
        accessibilityHint="Select application theme"
        testID="theme-selector"
      >
        {THEME_OPTIONS.map((option) => (
          <Picker.Item key={option} label={t(`settings.theme.${option}`)} value={option} color={theme.text} />
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

export default ThemeSelector;
