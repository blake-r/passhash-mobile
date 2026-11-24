// KeeperScreen.tsx - Keeper data management screen
// Based on QtQuick KeeperPage.qml from the original project

import * as Clipboard from "expo-clipboard";
import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View, TextInput, StyleSheet, Platform, Alert, Text } from "react-native";

import { Button, StatusMessage } from "../components";
import { useAppStore } from "../state/app-store";
import { useTheme, Theme } from "../theme";
import { copyWithAutoClear } from "../utils/clipboard";
import { serializeKeeperData, isValidKeeperText } from "../utils/keeper";

interface StatusMessage {
  text: string;
  color: string;
}

function KeeperScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const keeperData = useAppStore((state) => state.keeperData);
  const setKeeperText = useAppStore((state) => state.setKeeperText);
  const [statusMsg, setStatusMsg] = useState<StatusMessage>({ text: "", color: theme.textMuted });

  const keeperText = useMemo(() => serializeKeeperData(keeperData), [keeperData]);

  const showStatus = useCallback((text: string, color: string): void => {
    setStatusMsg({ text, color });
  }, []);

  const handleExport = useCallback(async (): Promise<void> => {
    try {
      await copyWithAutoClear(keeperText);
      showStatus(t("keeper.exportSuccess"), theme.status.success);
    } catch {
      showStatus(t("keeper.exportFailed"), theme.status.error);
    }
  }, [keeperText, showStatus, t, theme]);

  const handleImport = useCallback(async (): Promise<void> => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();

      if (!clipboardContent || clipboardContent.trim().length === 0) {
        showStatus(t("keeper.emptyClipboard"), theme.status.warning);
        return;
      }

      if (!isValidKeeperText(clipboardContent)) {
        showStatus(t("keeper.invalidClipboard"), theme.status.error);
        return;
      }

      Alert.alert(t("keeper.importConfirmation.title"), t("keeper.importConfirmation.message"), [
        {
          text: t("keeper.importConfirmation.cancel"),
          style: "cancel",
          onPress: (): void => {
            showStatus(t("keeper.importConfirmation.unchanged"), theme.status.info);
          },
        },
        {
          text: t("keeper.importConfirmation.ok"),
          onPress: async (): Promise<void> => {
            await setKeeperText(clipboardContent);
            showStatus(t("keeper.importSuccess"), theme.status.warning);
          },
        },
      ]);
    } catch {
      showStatus(t("keeper.importFailed"), theme.status.error);
    }
  }, [setKeeperText, showStatus, t, theme]);

  return (
    <View style={styles.container}>
      {/* Keeper data text area */}
      <View style={styles.textAreaContainer} accessibilityLabel={t("tabs.keeper")}>
        <TextInput
          style={styles.textArea}
          value={keeperText}
          multiline={true}
          editable={false}
          selectTextOnFocus
          accessibilityLabel={t("keeper.export")}
          accessibilityRole="none"
          accessibilityHint="Keeper data area, read-only"
          testID="keeper-data-textarea"
        />
      </View>

      {/* Status message */}
      <StatusMessage text={statusMsg.text} color={statusMsg.color} />

      {/* Export/Import buttons */}
      <View style={styles.buttonRow}>
        <Button title="keeper.export" onPress={handleExport} style={styles.button} testID="export-button" />
        <Button title="keeper.import" onPress={handleImport} style={styles.button} testID="import-button" />
      </View>

      {/* Empty state hint */}
      {!keeperText || keeperText.trim().length === 0 ? (
        <View style={styles.emptyStateContainer} accessibilityRole="summary">
          <Text style={styles.emptyStateText}>{t("keeper.emptyState")}</Text>
        </View>
      ) : null}
    </View>
  );
}

function makeStyles(theme: Theme): ReturnType<typeof StyleSheet.create> {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 6,
      backgroundColor: theme.bg,
    },
    textAreaContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: theme.radii.control,
      marginBottom: 8,
      overflow: "hidden",
    },
    textArea: {
      flex: 1,
      padding: 8,
      fontSize: 16,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      textAlignVertical: "top",
      backgroundColor: theme.input,
      color: theme.text,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 8,
      marginTop: 8,
    },
    button: {
      width: "45%",
      borderRadius: theme.radii.control,
      padding: 12,
      alignItems: "center",
    },
    emptyStateContainer: {
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: theme.radii.card,
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      fontStyle: "italic",
    },
  });
}

export default KeeperScreen;
