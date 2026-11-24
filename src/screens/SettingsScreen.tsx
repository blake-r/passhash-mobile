// SettingsScreen.tsx - Application settings: language and theme

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Card, LanguageSelector, ThemeSelector } from "../components";
import { useTheme, Theme } from "../theme";

function SettingsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <View style={styles.row}>
            <Text style={styles.label}>{t("settings.language.label")}</Text>
            <LanguageSelector />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>{t("settings.theme.label")}</Text>
            <ThemeSelector />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: Theme): ReturnType<typeof StyleSheet.create> {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    scrollContent: {
      paddingTop: 12,
      paddingBottom: 16,
    },
    row: {
      marginBottom: 4,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },
    divider: {
      height: 1,
      marginVertical: 12,
      backgroundColor: theme.border,
    },
  });
}

export default SettingsScreen;
