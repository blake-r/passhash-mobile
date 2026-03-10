// SettingsGroup.tsx - Reusable settings group container

import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet, ViewStyle } from "react-native";

export interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

function SettingsGroup({ title, children, style }: SettingsGroupProps): React.JSX.Element {
  const { t } = useTranslation();
  const isRequirements = title === "Requirements";
  const isRestrictions = title === "Restrictions";

  const titleColor = isRequirements ? "#2E7D32" : isRestrictions ? "#C62828" : "#000";
  const borderColor = isRequirements ? "#4CAF50" : isRestrictions ? "#EF5350" : "#ccc";

  return (
    <View style={[styles.container, { borderColor }, style]} accessibilityLabel={t(title)}>
      <Text style={[styles.title, { color: titleColor }]}>{t(title)}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
});

export default SettingsGroup;
