// CompactSettingRow.tsx - Compact setting row with symbolic labels for mobile

import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet, Switch, Platform } from "react-native";

export interface CompactSettingRowProps {
  label: string;
  symbol: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  hideLabel?: boolean;
}

function CompactSettingRow({
  label,
  symbol,
  value,
  onValueChange,
  disabled = false,
  hideLabel = false,
}: CompactSettingRowProps): React.JSX.Element {
  const { t } = useTranslation();

  // Always use explicit hideLabel prop, ignore screen size
  const shouldHideLabel = hideLabel;

  return (
    <View
      style={[styles.container, disabled && styles.disabled]}
      accessibilityLabel={t(label)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={styles.labelContainer}>
        <Text style={styles.symbol}>{symbol}</Text>
        {!shouldHideLabel && (
          <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
            {t(label)}
          </Text>
        )}
      </View>
      <View style={styles.switchContainer}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={value ? "#007AFF" : "#f4f3f4"}
          style={styles.switch}
          testID={`switch-${label}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  disabled: {
    opacity: 0.5,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  switchContainer: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  symbol: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#007AFF",
    fontWeight: "600",
    marginRight: 8,
    minWidth: 50,
  },
  label: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});

export default CompactSettingRow;
