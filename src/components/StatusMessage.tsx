// StatusMessage.tsx - Reusable status message component

import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";

export interface StatusMessageProps {
  text: string;
  color: string;
  style?: ViewStyle;
}

const STATUS_DURATION = 1000; // ms before fade out starts (matches Qt Timer interval)
const FADE_DURATION = 500; // ms for fade out animation (matches Qt OpacityAnimator duration)

function StatusMessage({ text, color, style }: StatusMessageProps): React.JSX.Element | null {
  const [displayedText, setDisplayedText] = useState(text);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (text) {
      // Show message immediately
      setDisplayedText(text);
      fadeAnim.setValue(1.0);

      // Start fade out after duration
      const fadeTimer = setTimeout((): void => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }).start();
      }, STATUS_DURATION);

      return (): void => { clearTimeout(fadeTimer); };
    } else {
      // Reset fade animation when text is cleared
      fadeAnim.setValue(0);
    }
  }, [text, fadeAnim]);

  return (
    <Animated.Text
      style={[styles.statusMessage, { color, opacity: fadeAnim }, style]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {displayedText}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  statusMessage: {
    textAlign: "center",
    fontSize: 16,
    minHeight: 20,
  },
});

export default StatusMessage;
