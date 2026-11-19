// theme.ts - Design tokens and theme resolution (single source of truth for colors)

import { useColorScheme } from "react-native";

import { useAppStore } from "./state/app-store";

export type ThemeName = "dark" | "light";
export type ThemePreference = "system" | ThemeName;

export interface StatusPalette {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  name: ThemeName;
  bg: string;
  card: string;
  cardBorder: string;
  input: string;
  inputBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGradient: [string, string, ...string[]];
  accentText: string;
  accentDisabled: string;
  switchTrackOff: string;
  border: string;
  headerBg: string;
  tabInactive: string;
  hintSelected: string;
  status: StatusPalette;
  radii: {
    card: number;
    control: number;
  };
}

const darkTheme: Theme = {
  name: "dark",
  bg: "#0E1120",
  card: "#1B1F3B",
  cardBorder: "rgba(255,255,255,0.07)",
  input: "#141833",
  inputBorder: "rgba(255,255,255,0.12)",
  text: "#E8EAF2",
  textSecondary: "#9AA0B8",
  textMuted: "#5A6079",
  accent: "#FF9E2C",
  accentGradient: ["#FFC53D", "#FF7A1A"],
  accentText: "#241500",
  accentDisabled: "#2A3054",
  switchTrackOff: "#2A3054",
  border: "rgba(255,255,255,0.08)",
  headerBg: "#141833",
  tabInactive: "#7A7F96",
  hintSelected: "#252B52",
  status: {
    success: "#7EE08A",
    warning: "#FFB84D",
    error: "#FF6B60",
    info: "#6BA8FF",
  },
  radii: {
    card: 14,
    control: 10,
  },
};

const lightTheme: Theme = {
  name: "light",
  bg: "#F5F4F0",
  card: "#FFFFFF",
  cardBorder: "#E6E3DC",
  input: "#FBFAF7",
  inputBorder: "#D8D5CD",
  text: "#1B1F3B",
  textSecondary: "#6B6F80",
  textMuted: "#A8AAB5",
  accent: "#C25E00",
  accentGradient: ["#E8890B", "#C25E00", "#8A3A00"],
  accentText: "#FFFFFF",
  accentDisabled: "#D8D5CD",
  switchTrackOff: "#D4D1C9",
  border: "#ECEAE4",
  headerBg: "#FFFFFF",
  tabInactive: "#8A8D99",
  hintSelected: "#F5E8DA",
  status: {
    success: "#1E8E3E",
    warning: "#E8710A",
    error: "#D32F2F",
    info: "#1976D2",
  },
  radii: {
    card: 14,
    control: 10,
  },
};

export const themes: Record<ThemeName, Theme> = {
  dark: darkTheme,
  light: lightTheme,
};

export function resolveTheme(preference: ThemePreference, systemScheme: "dark" | "light" | null | undefined): Theme {
  if (preference === "system") {
    return systemScheme === "dark" ? darkTheme : lightTheme;
  }
  return themes[preference];
}

export function useTheme(): Theme {
  const preference = useAppStore((state) => state.themePreference);
  const systemScheme = useColorScheme();
  return resolveTheme(preference, systemScheme);
}
