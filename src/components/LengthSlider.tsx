// LengthSlider.tsx - Password length slider with visual indicator
// Works on both mobile and web

import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Slider from "@react-native-community/slider";

export interface LengthSliderProps {
  value: number;
  onChange: (length: number) => void;
  minLength?: number;
  maxLength?: number;
}

function LengthSlider({
  value,
  onChange,
  minLength = 4,
  maxLength = 26,
}: LengthSliderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
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
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    height: 44,
    paddingRight: 8,
    paddingLeft: 8,
  },
  sliderContainer: {
    width: 100,
    height: 44,
    justifyContent: "center",
  },
  slider: {
    width: "100%",
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

export default LengthSlider;
