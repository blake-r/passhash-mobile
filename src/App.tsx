// App.tsx - Main application entry point
// Based on QtQuick Application.qml from the original project

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, Theme as NavigationTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import i18n, { getInitialLanguage } from "./i18n/i18n";
import GeneratorScreen from "./screens/GeneratorScreen";
import KeeperScreen from "./screens/KeeperScreen";
import { useAppStore } from "./state/app-store";
import { useTheme } from "./theme";
import { checkQtMigrationAvailable, performQtMigration } from "./utils/QtSettingsMigration";
import { applyMigratedSettings, isFirstLaunch } from "./utils/storage";

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const [languageReady, setLanguageReady] = useState(false);

  const navigationTheme = useMemo<NavigationTheme>(
    () => ({
      dark: theme.name === "dark",
      colors: {
        primary: theme.accent,
        background: theme.bg,
        card: theme.headerBg,
        text: theme.text,
        border: theme.border,
        notification: theme.accent,
      },
      fonts: {
        regular: { fontFamily: "System", fontWeight: "400" },
        medium: { fontFamily: "System", fontWeight: "500" },
        bold: { fontFamily: "System", fontWeight: "700" },
        heavy: { fontFamily: "System", fontWeight: "800" },
      },
    }),
    [theme],
  );

  // Apply the persisted language before the first render to avoid a flash of the default language
  useEffect((): void => {
    getInitialLanguage()
      .then((language) => i18n.changeLanguage(language))
      .catch((error) => console.error("Error applying saved language:", error))
      .finally(() => setLanguageReady(true));
  }, []);

  // Load settings and keeper data into the store
  useEffect((): void => {
    useAppStore
      .getState()
      .initialize()
      .catch((error) => console.error("Error initializing app store:", error));
  }, []);

  // Perform automatic migration from Qt settings on first launch
  useEffect((): void => {
    const migrateSettings = async (): Promise<void> => {
      try {
        // Check if this is the first launch of React Native app
        const firstLaunch = await isFirstLaunch();
        if (!firstLaunch) {
          // Not first launch, skip migration
          return;
        }

        // Check if Qt settings are available for migration
        const hasQtSettings = await checkQtMigrationAvailable();
        if (!hasQtSettings) {
          console.log("No Qt settings found, skipping migration");
          return;
        }

        // Perform migration
        const result = await performQtMigration();
        if (result.success && result.migratedSettings) {
          // Apply migrated settings to AsyncStorage and reload the store
          await applyMigratedSettings(result.migratedSettings);
          await useAppStore.getState().initialize();
          console.log("Qt settings migrated successfully");
        } else {
          console.warn("Qt migration failed or no settings to migrate:", result.error);
        }
      } catch (error) {
        console.error("Error during Qt settings migration:", error);
      }
    };

    migrateSettings();
  }, []);

  if (!languageReady) {
    return <></>;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={theme.name === "dark" ? "light" : "dark"} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }): React.JSX.Element => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "Generator") {
              iconName = focused ? "key" : "key-outline";
            } else if (route.name === "Keeper") {
              iconName = focused ? "folder" : "folder-outline";
            } else {
              iconName = "help-circle-outline";
            }

            return <Ionicons name={iconName} size={32} color={color} />;
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.tabInactive,
          tabBarLabelStyle: {
            fontSize: 14,
            paddingBottom: 4,
          },
          tabBarStyle: {
            minHeight: 60,
            paddingTop: 4,
            backgroundColor: theme.headerBg,
            borderTopColor: theme.border,
          },
          headerStyle: {
            backgroundColor: theme.headerBg,
          },
          headerTitleStyle: {
            fontWeight: "bold",
            textAlign: "center",
            color: theme.text,
          },
          headerTitle: t("app.name"),
          headerTitleAlign: "center",
        })}
      >
        <Tab.Screen
          name="Generator"
          component={GeneratorScreen}
          options={{
            title: t("tabs.generator"),
            tabBarAccessibilityLabel: t("tabs.generator"),
            tabBarButtonTestID: "tab-generator",
          }}
        />
        <Tab.Screen
          name="Keeper"
          component={KeeperScreen}
          options={{
            title: t("tabs.keeper"),
            tabBarAccessibilityLabel: t("tabs.keeper"),
            tabBarButtonTestID: "tab-keeper",
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
