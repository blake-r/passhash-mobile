// Button.tsx - Reusable button component

import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

export interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  small?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

function Button({ onPress, title, disabled = false, small = false, style, textStyle, testID }: ButtonProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.button, small && styles.smallButton, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={t(title)}
      accessibilityState={{ disabled }}
      accessible={true}
      testID={testID}
    >
      <Text style={[styles.buttonText, textStyle]}>{t(title)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    height: 44,
  },
  smallButton: {
    minWidth: 80,
    maxWidth: 90,
    height: 44,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default Button;
