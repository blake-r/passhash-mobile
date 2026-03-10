// LengthSelector.tsx - Reusable password length selector component

import { Picker } from "@react-native-picker/picker";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

const DEFAULT_PASSWORD_LENGTHS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];

export interface LengthSelectorProps {
  value: number;
  onChange: (length: number) => void;
  lengths?: number[];
}

function LengthSelector({ value, onChange, lengths = DEFAULT_PASSWORD_LENGTHS }: LengthSelectorProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      style={styles.picker}
      accessibilityLabel={t("common.passwordLength")}
      accessibilityRole="combobox"
      accessible={true}
      accessibilityHint={t("common.passwordLength")}
      testID="password-length-picker"
    >
      {lengths.map((len) => (
        <Picker.Item key={len} label={String(len)} value={len} />
      ))}
    </Picker>
  );
}

const styles = StyleSheet.create({
  picker: {
    width: 40,
    marginLeft: 8,
  },
});

export default LengthSelector;
