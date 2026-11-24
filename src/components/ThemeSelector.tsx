// ThemeSelector.tsx - Theme preference selection component (system / dark / light)

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

import { useAppStore } from "../state/app-store";
import { ThemePreference } from "../theme";

import ThemedSelect, { ThemedSelectOption } from "./ThemedSelect";

const THEME_OPTIONS: ThemePreference[] = ["system", "dark", "light"];

function ThemeSelector(): React.JSX.Element {
  const { t } = useTranslation();
  const themePreference = useAppStore((state) => state.themePreference);
  const setThemePreference = useAppStore((state) => state.setThemePreference);

  const options = useMemo<ThemedSelectOption<ThemePreference>[]>(
    () =>
      THEME_OPTIONS.map((option) => ({
        value: option,
        label: t(`settings.theme.${option}`),
      })),
    [t],
  );

  return (
    <View style={styles.container}>
      <ThemedSelect
        options={options}
        selectedValue={themePreference}
        onValueChange={setThemePreference}
        accessibilityLabel={t("settings.theme.label")}
        accessibilityHint="Select application theme"
        testID="theme-selector"
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

export default ThemeSelector;
