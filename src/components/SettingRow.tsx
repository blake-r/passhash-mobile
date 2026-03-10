// SettingRow.tsx - Reusable setting row with label and switch

import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet, Switch, ViewStyle } from "react-native";

export interface SettingRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  rightElement?: React.ReactNode;
  labelStyle?: ViewStyle;
}

function SettingRow({
  label,
  value,
  onValueChange,
  disabled = false,
  rightElement,
  labelStyle,
}: SettingRowProps): React.JSX.Element {
  const { t } = useTranslation();
  
  return (
    <View style={styles.container} accessibilityRole="switch" accessibilityLabel={t(label)} accessibilityState={{ checked: value, disabled }}>
      <Text style={[styles.label, labelStyle]}>{t(label)}</Text>
      {rightElement ?? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={value ? "#007AFF" : "#f4f3f4"}
          accessibilityLabel={t(label)}
          accessibilityRole="switch"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
  },
});

export default SettingRow;
