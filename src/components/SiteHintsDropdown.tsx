// SiteHintsDropdown.tsx - Dropdown component for site tag hints

import React from "react";
import { useTranslation } from "react-i18next";
import { Text, Pressable, View, StyleSheet, Platform, FlatList, type ViewStyle } from "react-native";

import type { KeepObj } from "../utils/keeper";

export interface SiteHintsDropdownProps {
  hints: KeepObj[];
  onSelect: (keepObj: KeepObj) => void;
  currentSiteTag?: string;
  style?: ViewStyle;
}

function SiteHintsDropdown({
  hints,
  onSelect,
  currentSiteTag,
  style,
}: SiteHintsDropdownProps): React.JSX.Element {
  const { t } = useTranslation();

  console.log('SiteHintsDropdown rendered with hints length:', hints.length, 'onSelect:', typeof onSelect, 'currentSiteTag:', currentSiteTag);

  const hasHints = hints.length > 0;

  if (!hasHints) {
    return <View style={[styles.container, styles.emptyContainer, style]} />;
  }

  return (
    <View style={[styles.container, style]} accessibilityLabel={t("generator.hints.title")}>
      <FlatList
        data={hints}
        keyExtractor={(item, index) => `${item.tag}-${index}`}
        renderItem={({ item }) => {
          const tagStr = item.tag;
          const isSelected = tagStr === currentSiteTag;
          console.log('Rendering hint item for:', tagStr, 'selected:', isSelected);
          return (
            <Pressable
              style={[styles.hintItem, isSelected && styles.hintItemSelected]}
              onPressIn={() => {
                console.log('Pressable onPressIn for:', tagStr);
              }}
              onPressOut={() => {
                console.log('Pressable onPressOut for:', tagStr);
              }}
              onPress={() => {
                console.log('Pressable pressed for:', tagStr);
                try {
                  onSelect(item);
                  console.log('onSelect executed successfully for:', tagStr);
                } catch (error) {
                  console.error('Error in onSelect for:', tagStr, error);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select site tag: ${tagStr}`}
              accessibilityState={{ selected: isSelected }}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
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
        }}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        overScrollMode="never"
        paddingBottom={20}
      />
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

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 10,
  },
  emptyContainer: {
    height: 0,
    borderWidth: 0,
  },
  scrollView: {
    maxHeight: 200,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    backgroundColor: "#fff",
  },
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
