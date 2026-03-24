// App.tsx - Main application entry point
// Based on QtQuick Application.qml from the original project

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import "./i18n/i18n";
import GeneratorScreen from "./screens/GeneratorScreen";
import KeeperScreen from "./screens/KeeperScreen";
import { setChangeDataCallback } from "./utils/keeper";
import { checkQtMigrationAvailable, performQtMigration } from "./utils/QtSettingsMigration";
import { loadSettings, saveSettings, applyMigratedSettings, isFirstLaunch } from "./utils/storage";

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const { t } = useTranslation();

  // Set up global keeper data callback to persist changes
  useEffect((): void => {
    setChangeDataCallback((newData: string): void => {
      saveSettings({ keeperData: newData });
    });

    // Load initial keeper data
    loadSettings().then((settings) => {
      if (settings.keeperData) {
        // KeeperScreen will load this data when mounted
      }
    });
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
          // Apply migrated settings to AsyncStorage
          await applyMigratedSettings(result.migratedSettings);
          console.log("Qt settings migrated successfully");
          
          // Optionally clear Qt settings after successful migration
          // import { clearQtSettingsAfterMigration } from "./utils/QtSettingsMigration";
          // await clearQtSettingsAfterMigration();
        } else {
          console.warn("Qt migration failed or no settings to migrate:", result.error);
        }
      } catch (error) {
        console.error("Error during Qt settings migration:", error);
      }
    };

    migrateSettings();
  }, []);

  const handleSaveSettings = useCallback((): void => {
    console.log("Settings saved");
  }, []);

  const handleStatusMessage = useCallback((text: string, color: string): void => {
    console.log(`Status: ${text} (${color})`);
  }, []);

  return (
    <NavigationContainer>
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
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
          tabBarLabelStyle: {
            fontSize: 14,
            paddingBottom: 4,
          },
          tabBarStyle: {
            minHeight: 60,
            paddingTop: 4,
          },
          headerStyle: {
            backgroundColor: "#f8f8f8",
          },
          headerTitleStyle: {
            fontWeight: "bold",
            textAlign: "center",
          },
          headerTitle: t("app.name"),
          headerTitleAlign: "center",
        })}
      >
        <Tab.Screen
          name="Generator"
          component={GeneratorScreen}
          initialParams={{ onSaveSettings: handleSaveSettings, onStatusMessage: handleStatusMessage }}
          options={{
            title: t("tabs.generator"),
            tabBarAccessibilityLabel: t("tabs.generator"),
          }}
        />
        <Tab.Screen
          name="Keeper"
          component={KeeperScreen}
          options={{
            title: t("tabs.keeper"),
            tabBarAccessibilityLabel: t("tabs.keeper"),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
