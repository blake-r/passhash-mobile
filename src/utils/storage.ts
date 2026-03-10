// storage.ts - AsyncStorage wrapper for settings compatibility
// Compatible with QtQuick Settings format for seamless migration

import AsyncStorage from "@react-native-async-storage/async-storage";

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

export async function loadSettings(): Promise<AppSettings> {
  try {
    const values = await AsyncStorage.multiGet(Object.values(SETTINGS_KEYS));
    const settings: AppSettings = { ...DEFAULT_SETTINGS };

    values.forEach(([key, value]): void => {
      if (value !== null) {
        switch (key) {
          case SETTINGS_KEYS.DIGITS:
          case SETTINGS_KEYS.PUNCTUATION:
          case SETTINGS_KEYS.MIXED_CASE:
          case SETTINGS_KEYS.NO_SPECIAL:
          case SETTINGS_KEYS.DIGITS_ONLY:
            (settings as unknown as Record<string, boolean>)[key.split(".")[1]] = value === "true";
            break;
          case SETTINGS_KEYS.PASSWORD_LENGTH:
            settings.passwordLength = parseInt(value, 10);
            break;
          case SETTINGS_KEYS.KEEPER_DATA:
            settings.keeperData = value;
            break;
        }
      }
    });

    return settings;
  } catch (error) {
    console.error("Error loading settings:", error);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSetting(key: string, value: boolean | number | string): Promise<void> {
  try {
    let storageKey: string | undefined;
    let storageValue: string;

    if (typeof value === "boolean") {
      storageValue = value.toString();
    } else if (typeof value === "number") {
      storageValue = value.toString();
    } else {
      storageValue = value;
    }

    switch (key) {
      case "digits":
        storageKey = SETTINGS_KEYS.DIGITS;
        break;
      case "punctuation":
        storageKey = SETTINGS_KEYS.PUNCTUATION;
        break;
      case "mixedCase":
        storageKey = SETTINGS_KEYS.MIXED_CASE;
        break;
      case "noSpecial":
        storageKey = SETTINGS_KEYS.NO_SPECIAL;
        break;
      case "digitsOnly":
        storageKey = SETTINGS_KEYS.DIGITS_ONLY;
        break;
      case "passwordLength":
        storageKey = SETTINGS_KEYS.PASSWORD_LENGTH;
        break;
      case "keeperData":
        storageKey = SETTINGS_KEYS.KEEPER_DATA;
        break;
      default:
        console.warn("Unknown setting key:", key);
        return;
    }

    if (storageKey) {
      await AsyncStorage.setItem(storageKey, storageValue);
    }
  } catch (error: unknown) {
    console.error("Error saving setting:", error);
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const items: [string, string][] = [];

    if (settings.digits !== undefined) {
      items.push([SETTINGS_KEYS.DIGITS, settings.digits.toString()]);
    }
    if (settings.punctuation !== undefined) {
      items.push([SETTINGS_KEYS.PUNCTUATION, settings.punctuation.toString()]);
    }
    if (settings.mixedCase !== undefined) {
      items.push([SETTINGS_KEYS.MIXED_CASE, settings.mixedCase.toString()]);
    }
    if (settings.noSpecial !== undefined) {
      items.push([SETTINGS_KEYS.NO_SPECIAL, settings.noSpecial.toString()]);
    }
    if (settings.digitsOnly !== undefined) {
      items.push([SETTINGS_KEYS.DIGITS_ONLY, settings.digitsOnly.toString()]);
    }
    if (settings.passwordLength !== undefined) {
      items.push([SETTINGS_KEYS.PASSWORD_LENGTH, settings.passwordLength.toString()]);
    }
    if (settings.keeperData !== undefined) {
      items.push([SETTINGS_KEYS.KEEPER_DATA, settings.keeperData]);
    }

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
  'Requirements.digits'?: boolean;
  'Requirements.punctuation'?: boolean;
  'Requirements.mixedCase'?: boolean;
  'Restrictions.noSpecial'?: boolean;
  'Restrictions.digitsOnly'?: boolean;
  'Restrictions.passwordLength'?: number;
  'Keeper.data'?: string;
}): Promise<void> {
  try {
    const items: [string, string][] = [];

    if (migratedSettings['Requirements.digits'] !== undefined) {
      items.push([SETTINGS_KEYS.DIGITS, migratedSettings['Requirements.digits']!.toString()]);
    }
    if (migratedSettings['Requirements.punctuation'] !== undefined) {
      items.push([SETTINGS_KEYS.PUNCTUATION, migratedSettings['Requirements.punctuation']!.toString()]);
    }
    if (migratedSettings['Requirements.mixedCase'] !== undefined) {
      items.push([SETTINGS_KEYS.MIXED_CASE, migratedSettings['Requirements.mixedCase']!.toString()]);
    }
    if (migratedSettings['Restrictions.noSpecial'] !== undefined) {
      items.push([SETTINGS_KEYS.NO_SPECIAL, migratedSettings['Restrictions.noSpecial']!.toString()]);
    }
    if (migratedSettings['Restrictions.digitsOnly'] !== undefined) {
      items.push([SETTINGS_KEYS.DIGITS_ONLY, migratedSettings['Restrictions.digitsOnly']!.toString()]);
    }
    if (migratedSettings['Restrictions.passwordLength'] !== undefined) {
      items.push([SETTINGS_KEYS.PASSWORD_LENGTH, migratedSettings['Restrictions.passwordLength']!.toString()]);
    }
    if (migratedSettings['Keeper.data'] !== undefined && migratedSettings['Keeper.data'] !== '') {
      items.push([SETTINGS_KEYS.KEEPER_DATA, migratedSettings['Keeper.data']!]);
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
