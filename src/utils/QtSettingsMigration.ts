// QtSettingsMigration.ts - Native module interface for Qt settings migration
// This module provides automatic migration of settings from Qt QSettings to React Native AsyncStorage

import { NativeModule, NativeModules } from "react-native";

// Define the interface for the Qt Settings Migration native module
interface QtSettingsMigrationInterface extends NativeModule {
  /**
   * Check if Qt settings exist and can be migrated.
   * @returns Promise that resolves to true if Qt settings are found
   */
  hasQtSettings(): Promise<boolean>;

  /**
   * Migrate settings from Qt to React Native AsyncStorage.
   * @returns Promise that resolves to a map of migrated key-value pairs, or null if no Qt settings found
   */
  migrateQtSettings(): Promise<{
    "Requirements.digits"?: boolean;
    "Requirements.punctuation"?: boolean;
    "Requirements.mixedCase"?: boolean;
    "Restrictions.noSpecial"?: boolean;
    "Restrictions.digitsOnly"?: boolean;
    "Restrictions.passwordLength"?: number;
    "Keeper.data"?: string;
  } | null>;

  /**
   * Clear Qt settings after successful migration.
   * @returns Promise that resolves to true when cleared
   */
  clearQtSettings(): Promise<boolean>;
}

// Access the native module
const { QtSettingsMigration } = NativeModules;

export const QtSettingsMigrationModule: QtSettingsMigrationInterface = QtSettingsMigration;

/**
 * Check if Qt settings are available for migration.
 * This should be called on first app launch to detect if migration is needed.
 */
export async function checkQtMigrationAvailable(): Promise<boolean> {
  try {
    if (!QtSettingsMigrationModule) {
      console.warn("QtSettingsMigration native module not available");
      return false;
    }
    return await QtSettingsMigrationModule.hasQtSettings();
  } catch (error) {
    console.error("Error checking Qt migration availability:", error);
    return false;
  }
}

/**
 * Perform migration from Qt settings to React Native AsyncStorage.
 * This should be called once on first app launch if Qt settings are detected.
 *
 * @returns Object with migration results
 */
export async function performQtMigration(): Promise<{
  success: boolean;
  migratedSettings: {
    "Requirements.digits"?: boolean;
    "Requirements.punctuation"?: boolean;
    "Requirements.mixedCase"?: boolean;
    "Restrictions.noSpecial"?: boolean;
    "Restrictions.digitsOnly"?: boolean;
    "Restrictions.passwordLength"?: number;
    "Keeper.data"?: string;
  } | null;
  error?: string;
}> {
  try {
    if (!QtSettingsMigrationModule) {
      return {
        success: false,
        migratedSettings: null,
        error: "QtSettingsMigration native module not available",
      };
    }

    const migratedSettings = await QtSettingsMigrationModule.migrateQtSettings();

    if (migratedSettings === null) {
      return {
        success: false,
        migratedSettings: null,
        error: "No Qt settings found to migrate",
      };
    }

    return {
      success: true,
      migratedSettings,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      migratedSettings: null,
      error: errorMessage,
    };
  }
}

/**
 * Clear Qt settings after successful migration.
 * This is optional and should only be called after confirming the migration was successful.
 */
export async function clearQtSettingsAfterMigration(): Promise<boolean> {
  try {
    if (!QtSettingsMigrationModule) {
      console.warn("QtSettingsMigration native module not available");
      return false;
    }
    return await QtSettingsMigrationModule.clearQtSettings();
  } catch (error) {
    console.error("Error clearing Qt settings:", error);
    return false;
  }
}
