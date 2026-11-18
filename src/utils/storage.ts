// storage.ts - AsyncStorage wrapper for settings compatibility
// Compatible with QtQuick Settings format for seamless migration

import AsyncStorage from "@react-native-async-storage/async-storage";

import { decryptKeeperData, encryptKeeperData } from "./secure-storage";

const SETTINGS_KEYS = {
  // Requirements category
  DIGITS: "Requirements.digits",
  PUNCTUATION: "Requirements.punctuation",
  MIXED_CASE: "Requirements.mixedCase",
  // Restrictions category
  NO_SPECIAL: "Restrictions.noSpecial",
  DIGITS_ONLY: "Restrictions.digitsOnly",
  PASSWORD_LENGTH: "Restrictions.passwordLength",
  // Keeper category
  KEEPER_DATA: "Keeper.data",
};

export interface AppSettings {
  digits: boolean;
  punctuation: boolean;
  mixedCase: boolean;
  noSpecial: boolean;
  digitsOnly: boolean;
  passwordLength: number;
  keeperData: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  digits: true,
  punctuation: true,
  mixedCase: true,
  noSpecial: false,
  digitsOnly: false,
  passwordLength: 8,
  keeperData: "",
};

const FIELD_TO_STORAGE_KEY: Record<keyof AppSettings, string> = {
  digits: SETTINGS_KEYS.DIGITS,
  punctuation: SETTINGS_KEYS.PUNCTUATION,
  mixedCase: SETTINGS_KEYS.MIXED_CASE,
  noSpecial: SETTINGS_KEYS.NO_SPECIAL,
  digitsOnly: SETTINGS_KEYS.DIGITS_ONLY,
  passwordLength: SETTINGS_KEYS.PASSWORD_LENGTH,
  keeperData: SETTINGS_KEYS.KEEPER_DATA,
};

// Qt settings keys back to AppSettings fields (used by Qt migration)
const QT_KEY_TO_FIELD: Record<string, keyof AppSettings> = Object.fromEntries(
  (Object.entries(FIELD_TO_STORAGE_KEY) as [keyof AppSettings, string][]).map(([field, qtKey]) => [qtKey, field]),
);

function serializeSetting(value: boolean | number | string): string {
  return typeof value === "string" ? value : value.toString();
}

function deserializeSetting(field: keyof AppSettings, value: string): AppSettings[keyof AppSettings] {
  if (field === "passwordLength") {
    return parseInt(value, 10);
  }
  if (field === "keeperData") {
    return value;
  }
  return value === "true";
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const values = await AsyncStorage.multiGet(Object.values(SETTINGS_KEYS));
    const settings: AppSettings = { ...DEFAULT_SETTINGS };

    values.forEach(([key, value]): void => {
      if (value === null) {
        return;
      }
      const field = QT_KEY_TO_FIELD[key];
      if (field !== undefined) {
        (settings as Record<keyof AppSettings, AppSettings[keyof AppSettings]>)[field] = deserializeSetting(
          field,
          value,
        );
      }
    });

    // Decrypt the keeper envelope; legacy plaintext passes through unchanged
    if (settings.keeperData) {
      try {
        settings.keeperData = await decryptKeeperData(settings.keeperData);
      } catch (error) {
        console.error("Error decrypting keeper data:", error);
        settings.keeperData = "";
      }
    }

    return settings;
  } catch (error) {
    console.error("Error loading settings:", error);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSetting(key: keyof AppSettings, value: boolean | number | string): Promise<void> {
  try {
    const serialized = key === "keeperData" ? await encryptKeeperData(String(value)) : serializeSetting(value);
    await AsyncStorage.setItem(FIELD_TO_STORAGE_KEY[key], serialized);
  } catch (error: unknown) {
    console.error("Error saving setting:", error);
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const items: [string, string][] = await Promise.all(
      (Object.entries(settings) as [keyof AppSettings, AppSettings[keyof AppSettings]][]).map(
        async ([field, value]): Promise<[string, string]> => [
          FIELD_TO_STORAGE_KEY[field],
          field === "keeperData" ? await encryptKeeperData(String(value)) : serializeSetting(value),
        ],
      ),
    );

    await AsyncStorage.multiSet(items);
  } catch (error: unknown) {
    console.error("Error saving settings:", error);
  }
}

export async function clearSettings(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(SETTINGS_KEYS));
  } catch (error: unknown) {
    console.error("Error clearing settings:", error);
  }
}

/**
 * Apply migrated settings from Qt to AsyncStorage.
 * This function takes the raw migrated settings and saves them to AsyncStorage.
 */
export async function applyMigratedSettings(migratedSettings: {
  "Requirements.digits"?: boolean;
  "Requirements.punctuation"?: boolean;
  "Requirements.mixedCase"?: boolean;
  "Restrictions.noSpecial"?: boolean;
  "Restrictions.digitsOnly"?: boolean;
  "Restrictions.passwordLength"?: number;
  "Keeper.data"?: string;
}): Promise<void> {
  try {
    const items: [string, string][] = [];

    for (const [qtKey, value] of Object.entries(migratedSettings) as [string, boolean | number | string][]) {
      const field = QT_KEY_TO_FIELD[qtKey];
      if (field === undefined) {
        continue;
      }
      if (field === "keeperData" && value === "") {
        continue;
      }
      const serialized = field === "keeperData" ? await encryptKeeperData(String(value)) : serializeSetting(value);
      items.push([qtKey, serialized]);
    }

    if (items.length > 0) {
      await AsyncStorage.multiSet(items);
      console.log(`Applied ${items.length} migrated settings from Qt`);
    }
  } catch (error: unknown) {
    console.error("Error applying migrated settings:", error);
  }
}

/**
 * Check if this is the first launch of the React Native app.
 * Returns true if no React Native settings have been saved yet.
 */
export async function isFirstLaunch(): Promise<boolean> {
  try {
    const values = await AsyncStorage.multiGet(Object.values(SETTINGS_KEYS));
    // If all values are null, this is the first launch
    return values.every(([, value]) => value === null);
  } catch (error) {
    console.error("Error checking first launch:", error);
    return true; // Assume first launch on error
  }
}

export { SETTINGS_KEYS, DEFAULT_SETTINGS };
