// GeneratorScreen.styles.ts - themed styles for the generator screen

import { StyleSheet, Platform } from "react-native";

import type { Theme } from "../theme";

export function makeStyles(theme: Theme): ReturnType<typeof StyleSheet.create> {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingVertical: 12,
      flexGrow: 1,
    },
    generationCard: {
      marginHorizontal: 8,
      marginBottom: 12,
    },
    settingsCard: {
      marginHorizontal: 8,
      marginBottom: 12,
    },
    settingsRow: {
      flexDirection: "row",
    },
    settingsColumn: {
      flex: 1,
      paddingHorizontal: 4,
    },
    cardSectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    inputRow: {
      marginBottom: 16,
    },
    // The hints dropdown is absolutely positioned inside this row, so the row itself has to
    // be raised: zIndex only reorders children within their own parent and cannot lift a
    // subtree above a later sibling row.
    inputRowRaised: {
      zIndex: 10,
      elevation: 10,
    },
    inputLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
      paddingHorizontal: 4,
    },
    inputWithButton: {
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
    },
    inputWithButtonContainer: {
      position: "relative",
      flex: 1,
    },
    hintsDropdownWrapper: {
      position: "absolute",
      top: 48,
      left: 0,
      right: 50,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: theme.radii.control,
      padding: 12,
      fontSize: 16,
      height: 48,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      backgroundColor: theme.input,
      color: theme.text,
    },
    passwordOutput: {
      color: theme.text,
      fontWeight: "600",
    },
    bumpButton: {
      position: "absolute",
      right: 0,
      height: 48,
      minWidth: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: theme.radii.control,
      overflow: "hidden",
    },
    bumpButtonGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    bumpButtonInner: {
      minWidth: 44,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
    },
    bumpButtonText: {
      color: theme.accentText,
      fontSize: 16,
      fontWeight: "bold",
    },
    toggleButton: {
      position: "absolute",
      right: 0,
      height: 48,
      width: 50,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
      marginRight: 4,
    },
    toggleButtonInner: {
      minWidth: 44,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
    },
    toggleButtonText: {
      fontSize: 20,
    },
    generateButtonFull: {
      height: 48,
      width: "100%",
    },
    statusBar: {
      backgroundColor: theme.headerBg,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    bottomBar: {
      backgroundColor: theme.headerBg,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      padding: 12,
    },
    saveButton: {
      borderRadius: theme.radii.control,
      padding: 12,
      alignItems: "center",
    },
    saveButtonTextStyle: {
      fontSize: 16,
    },
  });
}
