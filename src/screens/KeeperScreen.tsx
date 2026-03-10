// KeeperScreen.tsx - Keeper data management screen
// Based on QtQuick KeeperPage.qml from the original project

import * as Clipboard from "expo-clipboard";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { View, TextInput, StyleSheet, Platform, Alert, Text } from "react-native";

import { Button, StatusMessage, LanguageSelector } from "../components";
import { updateKeeperData } from "../utils/keeper";
import { loadSettings, saveSettings } from "../utils/storage";

// Vibrant status colors for better contrast
const STATUS_COLORS = {
  error: "#D32F2F",    // Red for errors
  warning: "#F57C00",  // Orange for warnings
  success: "#388E3C",  // Green for success
  info: "#1976D2",     // Blue for info
};

interface KeeperScreenProps {
  onStatusMessage?: (text: string, color: string) => void;
}

interface StatusMessage {
  text: string;
  color: string;
}

function KeeperScreen({ onStatusMessage }: KeeperScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const [keeperData, setKeeperData] = useState("");
  const [statusMsg, setStatusMsg] = useState<StatusMessage>({ text: "", color: "gray" });

  const showStatus = useCallback(
    (text: string, color: string): void => {
      setStatusMsg({ text, color });
      if (onStatusMessage) {
        onStatusMessage(text, color);
      }
    },
    [onStatusMessage],
  );

  // Load keeper data on mount
  useEffect((): void => {
    loadSettings().then((settings) => {
      if (settings.keeperData) {
        setKeeperData(settings.keeperData);
        updateKeeperData(settings.keeperData);
      }
    });
  }, []);

  // Reload keeper data when screen comes into focus
  useFocusEffect(
    useCallback((): void => {
      loadSettings().then((settings) => {
        if (settings.keeperData) {
          setKeeperData(settings.keeperData);
          updateKeeperData(settings.keeperData);
        }
      });
    }, []),
  );

  const handleExport = useCallback(async (): Promise<void> => {
    try {
      await Clipboard.setStringAsync(keeperData);
      showStatus(t("keeper.exportSuccess"), STATUS_COLORS.success);
    } catch {
      showStatus(t("keeper.exportFailed"), STATUS_COLORS.error);
    }
  }, [keeperData, showStatus, t]);

  const handleImport = useCallback(async (): Promise<void> => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();

      if (!clipboardContent || clipboardContent.trim().length === 0) {
        showStatus(t("keeper.emptyClipboard"), STATUS_COLORS.warning);
        return;
      }

      Alert.alert(
        t("keeper.importConfirmation.title"),
        t("keeper.importConfirmation.message"),
        [
          {
            text: t("keeper.importConfirmation.cancel"),
            style: "cancel",
            onPress: (): void => {
              showStatus(t("keeper.importConfirmation.unchanged"), STATUS_COLORS.info);
            },
          },
          {
            text: t("keeper.importConfirmation.ok"),
            onPress: async (): Promise<void> => {
              setKeeperData(clipboardContent);
              updateKeeperData(clipboardContent);
              await saveSettings({ keeperData: clipboardContent });
              showStatus(t("keeper.importSuccess"), STATUS_COLORS.warning);
            },
          },
        ],
      );
    } catch {
      showStatus(t("keeper.importFailed"), STATUS_COLORS.error);
    }
  }, [showStatus, t]);

  return (
    <View style={styles.container}>
      {/* Language selector */}
      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>{t("settings.language.label")}</Text>
        <LanguageSelector />
      </View>

      {/* Keeper data text area */}
      <View style={styles.textAreaContainer} accessibilityLabel={t("tabs.keeper")}>
        <TextInput
          style={styles.textArea}
          value={keeperData}
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
      {!keeperData || keeperData.trim().length === 0 ? (
        <View style={styles.emptyStateContainer} accessibilityRole="summary">
          <Text style={styles.emptyStateText}>
            {t("keeper.emptyState")}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
    backgroundColor: "#fff",
  },
  languageContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  textAreaContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  textArea: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    textAlignVertical: "top",
  },
  statusMessage: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  button: {
    width: "45%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  emptyStateContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default KeeperScreen;
