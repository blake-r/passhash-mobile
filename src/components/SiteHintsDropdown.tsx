// SiteHintsDropdown.tsx - Dropdown component for site tag hints

import React from "react";
import { useTranslation } from "react-i18next";
import { Text, Pressable, StyleSheet, Platform } from "react-native";

import type { KeepObj } from "../utils/keeper";

export interface SiteHintsDropdownProps {
  hints: KeepObj[];
  onSelect: (keepObj: KeepObj) => void;
  currentSiteTag?: string;
  onDropdownTouchStart?: () => void;
}

function SiteHintsDropdown({
  hints,
  onSelect,
  currentSiteTag,
  onDropdownTouchStart,
}: SiteHintsDropdownProps): React.JSX.Element {
  const { t } = useTranslation();

  const hasHints = hints.length > 0;

  if (!hasHints) {
    return null;
  }

  return (
    <>
      {hints.map((item, index) => {
        const tagStr = item.tag;
        const isSelected = tagStr === currentSiteTag;
        console.log('Rendering Pressable for:', tagStr, 'isSelected:', isSelected);
        return (
          <Pressable
            key={`${item.tag}-${index}`}
            style={[styles.hintItem, isSelected && styles.hintItemSelected]}
            onTouchStart={(e) => {
                console.log('Pressable onTouchStart for:', tagStr);
                if (onDropdownTouchStart) {
                  onDropdownTouchStart();
                }
              }}
            onPressIn={() => {
              console.log('Pressable onPressIn for:', tagStr);
            }}
            onPress={() => {
              console.log('HintsDropdown Pressable pressed for:', tagStr);
              onSelect(item);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Select site tag: ${tagStr}`}
            accessibilityState={{ selected: isSelected }}
            hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}
          >
            <Text style={[styles.hintText, isSelected && styles.hintTextSelected]}>
              {tagStr}
            </Text>
            {item.settings && (
              <Text style={styles.hintSettings}>
                {makeSettingsSummary(item.settings)}
              </Text>
            )}
          </Pressable>
        );
      })}
    </>
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

const styles = StyleSheet.create({
  hintItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  hintItemSelected: {
    backgroundColor: "#e3f2fd",
  },
  hintText: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#333",
    flex: 1,
  },
  hintTextSelected: {
    fontWeight: "bold",
    color: "#1976D2",
  },
  hintSettings: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
});

export default SiteHintsDropdown;
