// HintsList.tsx - Reusable hints list component

import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View, StyleSheet, ViewStyle, Platform } from "react-native";

export interface HintItem {
  toString?: () => string;
  [key: string]: unknown;
}

export interface HintsListProps {
  hints: HintItem[];
  onSelect: (hint: HintItem) => void;
  currentSiteTag?: string;
  hintToString?: (hint: HintItem) => string;
  style?: ViewStyle;
}

function HintsList({
  hints,
  onSelect,
  currentSiteTag,
  hintToString,
  style,
}: HintsListProps): React.JSX.Element {
  const { t } = useTranslation();
  const defaultToString = (hint: HintItem): string => {
    if (typeof hint.toString === "function") {
      return hint.toString();
    }
    return JSON.stringify(hint);
  };

  const toStringFn = hintToString ?? defaultToString;
  const hasHints = hints.length > 0;

  return (
    <View style={[styles.container, style]} accessibilityLabel={t("generator.hints.title")}>
      <Text style={styles.title}>{t("generator.hints.title")}</Text>
      <View style={styles.hintsList}>
        {!hasHints && (
          <Text style={styles.placeholderText}>{t("generator.hints.placeholder")}</Text>
        )}
        {hints.map((hint, index) => {
          const hintText = toStringFn(hint);
          return (
            <TouchableOpacity
              key={index}
              style={styles.hintItem}
              onPress={() => onSelect(hint)}
              accessibilityRole="button"
              accessibilityLabel={`Select site tag: ${hintText}`}
              accessibilityState={{ selected: hintText === currentSiteTag }}
            >
              <Text style={[styles.hintText, hintText === currentSiteTag && styles.hintTextSelected]}>
                {hintText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  hintsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  placeholderText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    padding: 8,
  },
  hintItem: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    margin: 4,
  },
  hintText: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  hintTextSelected: {
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});

export default HintsList;
