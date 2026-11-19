// Button.tsx - Reusable themed button component with accent gradient

import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

import { useTheme } from "../theme";

export interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  small?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

function Button({
  onPress,
  title,
  disabled = false,
  small = false,
  style,
  textStyle,
  testID,
}: ButtonProps): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          borderRadius: theme.radii.control,
          justifyContent: "center",
          alignItems: "center",
          height: 44,
          overflow: "hidden",
        },
        smallButton: {
          minWidth: 80,
          maxWidth: 90,
          height: 44,
        },
        buttonDisabled: {
          backgroundColor: theme.accentDisabled,
        },
        gradient: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: "center",
          alignItems: "center",
        },
        buttonText: {
          color: theme.accentText,
          fontSize: 14,
        },
        buttonTextDisabled: {
          color: theme.textMuted,
        },
      }),
    [theme],
  );

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
      {!disabled && (
        <LinearGradient
          colors={theme.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      )}
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled, textStyle]}>{t(title)}</Text>
    </TouchableOpacity>
  );
}

export default Button;
