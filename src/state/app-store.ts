// app-store.ts - Single source of truth for settings and keeper data (zustand)

import { create } from "zustand";

import { parseKeeperText, serializeKeeperData, upsertSiteTag, KeepObj, KeeperSettings } from "../utils/keeper";
import { AppSettings, loadSettings, saveSetting, saveSettings } from "../utils/storage";

export type GeneratorSettings = Omit<AppSettings, "keeperData">;
export type SettingField = keyof GeneratorSettings;

interface AppState {
  loaded: boolean;
  settings: GeneratorSettings;
  // Snapshot of the persisted settings, used by the UI to detect unsaved changes
  savedSettings: GeneratorSettings;
  keeperData: Map<string, KeepObj>;

  initialize: () => Promise<void>;
  setSetting: <K extends SettingField>(field: K, value: GeneratorSettings[K]) => void;
  persistSettings: () => Promise<void>;
  storeSiteTag: (siteTag: string, settings: KeeperSettings) => void;
  setKeeperText: (keeperText: string) => Promise<void>;
}

const DEFAULT_GENERATOR_SETTINGS: GeneratorSettings = {
  digits: true,
  punctuation: true,
  mixedCase: true,
  noSpecial: false,
  digitsOnly: false,
  passwordLength: 8,
};

export const useAppStore = create<AppState>((set, get) => ({
  loaded: false,
  settings: { ...DEFAULT_GENERATOR_SETTINGS },
  savedSettings: { ...DEFAULT_GENERATOR_SETTINGS },
  keeperData: new Map<string, KeepObj>(),

  initialize: async (): Promise<void> => {
    const stored = await loadSettings();
    const settings: GeneratorSettings = {
      digits: stored.digits,
      punctuation: stored.punctuation,
      mixedCase: stored.mixedCase,
      noSpecial: stored.noSpecial,
      digitsOnly: stored.digitsOnly,
      passwordLength: stored.passwordLength,
    };
    set({
      loaded: true,
      settings,
      savedSettings: { ...settings },
      keeperData: parseKeeperText(stored.keeperData),
    });
  },

  setSetting: (field, value): void => {
    set((state) => ({ settings: { ...state.settings, [field]: value } }));
  },

  persistSettings: async (): Promise<void> => {
    const { settings } = get();
    await saveSettings(settings);
    set({ savedSettings: { ...settings } });
  },

  storeSiteTag: (siteTag, siteSettings): void => {
    const keeperData = upsertSiteTag(get().keeperData, siteTag, siteSettings);
    set({ keeperData });
    saveSetting("keeperData", serializeKeeperData(keeperData));
  },

  setKeeperText: async (keeperText): Promise<void> => {
    set({ keeperData: parseKeeperText(keeperText) });
    await saveSettings({ keeperData: keeperText });
  },
}));
