// ThemedSelect.tsx - Theme-aware dropdown that replaces the platform picker

import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme, Theme } from "../theme";

export interface ThemedSelectOption<T extends string> {
  value: T;
  label: string;
}

export interface ThemedSelectProps<T extends string> {
  options: ThemedSelectOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

function ThemedSelect<T extends string>({
  options,
  selectedValue,
  onValueChange,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ThemedSelectProps<T>): React.JSX.Element {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const selectedOption = options.find((option) => option.value === selectedValue);

  const close = useCallback((): void => setOpen(false), []);

  const handleSelect = useCallback(
    (value: T): void => {
      setOpen(false);
      if (value !== selectedValue) {
        onValueChange(value);
      }
    },
    [onValueChange, selectedValue],
  );

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        onPress={() => setOpen(true)}
        accessibilityRole="combobox"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ expanded: open }}
        testID={testID}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {selectedOption ? selectedOption.label : ""}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close dropdown">
          <View style={styles.sheet}>
            <ScrollView bounces={false}>
              {options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    onPress={() => handleSelect(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={option.label}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.label}</Text>
                    {isSelected ? <Ionicons name="checkmark" size={18} color={theme.accent} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function makeStyles(theme: Theme): ReturnType<typeof StyleSheet.create> {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: theme.radii.control,
      backgroundColor: theme.input,
    },
    triggerPressed: {
      backgroundColor: theme.hintSelected,
    },
    triggerText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      marginRight: 8,
    },
    backdrop: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheet: {
      width: "100%",
      maxHeight: "70%",
      borderRadius: theme.radii.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      backgroundColor: theme.card,
      overflow: "hidden",
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    optionSelected: {
      backgroundColor: theme.hintSelected,
    },
    optionPressed: {
      backgroundColor: theme.border,
    },
    optionText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    optionTextSelected: {
      color: theme.accent,
      fontWeight: "bold",
    },
  });
}

export default ThemedSelect;
