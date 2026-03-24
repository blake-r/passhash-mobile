// Card.tsx - Material Design card component

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
}

function Card({ children, style, title }: CardProps): React.JSX.Element {
  return (
    <View style={[styles.card, style]}>
      {title && <View style={styles.cardHeader}><View style={styles.cardTitleLine} /></View>}
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardTitleLine: {
    height: 2,
    width: 40,
    backgroundColor: "#007AFF",
    borderRadius: 1,
  },
  cardContent: {
    padding: 16,
  },
});

export default Card;
