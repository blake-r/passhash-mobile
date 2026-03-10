// FormRow.tsx - Reusable form row component with label, input, and optional action

import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View, StyleSheet, ViewStyle, TextStyle, Platform } from "react-native";

export interface FormRowProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  selectTextOnFocus?: boolean;
  onSubmitEditing?: () => void;
  inputStyle?: TextStyle;
  rightElement?: React.ReactNode;
  rightElementStyle?: ViewStyle;
  labelWidth?: number;
  verticalLayout?: boolean;
  rightElementWidth?: number;
}

function FormRow({
  label,
  value,
  onChangeText,
  placeholder,
  readOnly = false,
  secureTextEntry = false,
  autoCapitalize = "none",
  autoCorrect = false,
  selectTextOnFocus = false,
  onSubmitEditing,
  inputStyle,
  rightElement,
  rightElementStyle,
  labelWidth = 100,
  verticalLayout = false,
  rightElementWidth = 90,
}: FormRowProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <View style={[styles.container, verticalLayout && styles.containerVertical]}>
      <Text style={[styles.label, { width: labelWidth }]}>{t(label)}</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder ? t(placeholder) : undefined}
        value={value}
        onChangeText={onChangeText}
        readOnly={readOnly}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        selectTextOnFocus={selectTextOnFocus}
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={t(label)}
        accessibilityRole="none"
      />
      {rightElement && <View style={[styles.rightElementContainer, { width: rightElementWidth }, rightElementStyle]}>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  containerVertical: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  label: {
    textAlign: "right",
    paddingRight: 8,
    fontSize: 16,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    height: 40,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  rightElementContainer: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FormRow;
