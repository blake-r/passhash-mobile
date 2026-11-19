// SiteHintsDropdown.tsx - Dropdown component for site tag hints

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View, StyleSheet, Platform } from "react-native";

import { useTheme } from "../theme";

import type { KeepObj } from "../utils/keeper";

export interface SiteHintsDropdownProps {
  hints: KeepObj[];
  onSelect: (keepObj: KeepObj) => void;
  currentSiteTag?: string;
}

function SiteHintsDropdown({ hints, onSelect, currentSiteTag }: SiteHintsDropdownProps): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderWidth: 1,
          borderColor: theme.inputBorder,
          borderRadius: theme.radii.control,
          backgroundColor: theme.card,
          maxHeight: 200,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.name === "dark" ? 0.4 : 0.15,
          shadowRadius: 3,
          elevation: 10,
          overflow: "hidden",
        },
        emptyContainer: {
          height: 0,
          borderWidth: 0,
        },
        hintItem: {
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.card,
        },
        hintItemSelected: {
          backgroundColor: theme.hintSelected,
        },
        hintText: {
          fontSize: 16,
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
          color: theme.text,
          flex: 1,
        },
        hintTextSelected: {
          fontWeight: "bold",
          color: theme.accent,
        },
        hintSettings: {
          fontSize: 12,
          color: theme.textSecondary,
          marginLeft: 8,
        },
      }),
    [theme],
  );

  const hasHints = hints.length > 0;

  if (!hasHints) {
    return <View style={[styles.container, styles.emptyContainer]} />;
  }

  return (
    <View style={styles.container} accessibilityLabel={t("generator.hints.title")}>
      <View>
        {hints.map((item, index) => {
          const tagStr = item.tag;
          const isSelected = tagStr === currentSiteTag;
          return (
            <TouchableOpacity
              key={`${item.tag}-${index}`}
              style={[styles.hintItem, isSelected && styles.hintItemSelected]}
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={`Select site tag: ${tagStr}`}
              accessibilityState={{ selected: isSelected }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.hintText, isSelected && styles.hintTextSelected]}>{tagStr}</Text>
              {item.settings && <Text style={styles.hintSettings}>{makeSettingsSummary(item.settings)}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function makeSettingsSummary(settings: KeepObj["settings"]): string {
  const parts: string[] = [];

  // Requirements (in order: digits, punctuation, mixedCase)
  if (settings.digits === true) parts.push("0-9");
  if (settings.punctuation === true) parts.push("!@#");
  if (settings.mixedCase === true) parts.push("Aa");

  // Restrictions (in order: noSpecial, digitsOnly, length)
  if (settings.special === false) parts.push("A-Za-z");
  if (settings.digitsOnly === true) parts.push("0-9");
  if (settings.length !== null) parts.push(`${settings.length}`);

  return parts.join(" • ");
}

export default SiteHintsDropdown;
