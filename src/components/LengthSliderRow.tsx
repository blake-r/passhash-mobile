// LengthSliderRow.tsx - Row container for password length slider

import React from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import Slider from "@react-native-community/slider";

export interface LengthSliderRowProps {
  value: number;
  onChange: (length: number) => void;
  minLength?: number;
  maxLength?: number;
}

function LengthSliderRow({
  value,
  onChange,
  minLength = 4,
  maxLength = 26,
}: LengthSliderRowProps): React.JSX.Element {
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <View style={styles.sliderWrapper}>
          <input
            type="range"
            min={minLength}
            max={maxLength}
            value={value}
            onChange={(e) => onChange(parseInt((e.target as any).value, 10))}
            style={styles.webSlider}
            data-testid="password-length-slider"
          />
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{value}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={minLength}
          maximumValue={maxLength}
          step={1}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#007AFF"
          testID="password-length-slider"
        />
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 44,
  },
  sliderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 44,
  },
  slider: {
    width: 100,
    height: 40,
  },
  webSlider: {
    width: 100,
    height: 40,
  },
  valueContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  valueText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});

export default LengthSliderRow;
