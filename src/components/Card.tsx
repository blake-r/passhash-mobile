// Card.tsx - Themed card component

import React, { useMemo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

import { useTheme } from "../theme";

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
}

function Card({ children, style, title }: CardProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.card,
          borderRadius: theme.radii.card,
          marginHorizontal: 8,
          marginBottom: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme.name === "dark" ? 0.3 : 0.08,
          shadowRadius: 3,
          elevation: 3,
          borderWidth: 1,
          borderColor: theme.cardBorder,
        },
        cardHeader: {
          paddingHorizontal: 16,
          paddingTop: 12,
        },
        cardTitleLine: {
          height: 2,
          width: 40,
          backgroundColor: theme.accent,
          borderRadius: 1,
        },
        cardContent: {
          padding: 16,
        },
      }),
    [theme],
  );

  return (
    <View style={[styles.card, style]}>
      {title && (
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleLine} />
        </View>
      )}
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

export default Card;
