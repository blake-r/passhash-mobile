// GeneratorScreen.tsx - Main password generator screen with Material Design
// Redesigned with three cards: Generation, Character Settings, Restrictions

import * as Clipboard from "expo-clipboard";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  TouchableOpacity,
} from "react-native";

import { PassHashCommon } from "../algorithms/passhash";
import {
  Button,
  StatusMessage,
  Card,
  CompactSettingRow,
  LengthSliderRow,
  SiteHintsDropdown,
} from "../components";
import { getAllData, storeSiteTag, updateKeeperData } from "../utils/keeper";
import { createSiteObj, toString } from "../utils/site-tag";
import { loadSettings, saveSetting } from "../utils/storage";

import type { KeepObj } from "../utils/keeper";

// Master key clear timeout (30 seconds, matching QtQuick)
const MASTER_KEY_CLEAR_TIMEOUT = 30000;

// Vibrant status colors for better contrast
const STATUS_COLORS = {
  error: "#D32F2F",    // Red for errors
  warning: "#F57C00",  // Orange for warnings
  success: "#388E3C",  // Green for success
  info: "#1976D2",     // Blue for info
};

interface GeneratorScreenProps {
  route: {
    params?: {
      onSaveSettings?: () => void;
      onStatusMessage?: (text: string, color: string) => void;
    };
  };
}

interface StatusMessage {
  text: string;
  color: string;
}

function GeneratorScreen({ route }: GeneratorScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const onSaveSettings = route.params?.onSaveSettings;
  const onStatusMessage = route.params?.onStatusMessage;

  const [siteTag, setSiteTag] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [hashWord, setHashWord] = useState("");
  const [unmaskMasterKey, setUnmaskMasterKey] = useState(false);

  // Hints dropdown state
  const [filteredHints, setFilteredHints] = useState<KeepObj[]>([]);
  const [showHints, setShowHints] = useState(false);

  // Requirements
  const [digits, setDigits] = useState(true);
  const [punctuation, setPunctuation] = useState(true);
  const [mixedCase, setMixedCase] = useState(true);

  // Restrictions
  const [noSpecial, setNoSpecial] = useState(false);
  const [digitsOnly, setDigitsOnly] = useState(false);
  const [passwordLength, setPasswordLength] = useState(8);

  // Original settings for tracking changes
  const [originalSettings, setOriginalSettings] = useState<{
    digits: boolean;
    punctuation: boolean;
    mixedCase: boolean;
    noSpecial: boolean;
    digitsOnly: boolean;
    passwordLength: number;
  } | null>(null);

  const [statusMsg, setStatusMsg] = useState<StatusMessage>({ text: "", color: "gray" });
  const masterKeyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showStatus = useCallback(
    (text: string, color: string) => {
      setStatusMsg({ text, color });
      if (onStatusMessage) {
        onStatusMessage(text, color);
      }
    },
    [onStatusMessage],
  );

  // Clear master key timer
  const clearMasterKeyTimer = useCallback(() => {
    if (masterKeyTimerRef.current) {
      clearTimeout(masterKeyTimerRef.current);
      masterKeyTimerRef.current = null;
    }
  }, []);

  // Schedule master key auto-clear after 30 seconds
  const scheduleMasterKeyClear = useCallback(() => {
    clearMasterKeyTimer();
    masterKeyTimerRef.current = setTimeout(() => {
      setMasterKey("");
      setHashWord("");
      showStatus(t("generator.masterKey.autoClearWarning"), STATUS_COLORS.warning);
    }, MASTER_KEY_CLEAR_TIMEOUT);
  }, [clearMasterKeyTimer, showStatus, t]);

  // Cleanup timer on unmount
  useEffect(() => {
    return (): void => {
      clearMasterKeyTimer();
    };
  }, [clearMasterKeyTimer]);

  // Load settings on mount
  useEffect(() => {
    loadSettings().then((settings) => {
      const loadedSettings = {
        digits: settings.digits ?? true,
        punctuation: settings.punctuation ?? true,
        mixedCase: settings.mixedCase ?? true,
        noSpecial: settings.noSpecial ?? false,
        digitsOnly: settings.digitsOnly ?? false,
        passwordLength: settings.passwordLength ?? 8,
      };

      setDigits(loadedSettings.digits);
      setPunctuation(loadedSettings.punctuation);
      setMixedCase(loadedSettings.mixedCase);
      setNoSpecial(loadedSettings.noSpecial);
      setDigitsOnly(loadedSettings.digitsOnly);
      setPasswordLength(loadedSettings.passwordLength);

      // Store original settings for change tracking
      setOriginalSettings(loadedSettings);

      // Load keeper data for hints
      if (settings.keeperData) {
        updateKeeperData(settings.keeperData);
      }
    });
  }, []);

  // Copy to clipboard when hash word changes
  useEffect(() => {
    if (hashWord.length > 0) {
      Clipboard.setStringAsync(hashWord);
      showStatus(t("generator.password.copied"), STATUS_COLORS.success);
    }
  }, [hashWord, onStatusMessage, showStatus, t]);

  const generateHash = useCallback((
    overrideSettings?: {
      digits?: boolean;
      punctuation?: boolean;
      mixedCase?: boolean;
      noSpecial?: boolean;
      digitsOnly?: boolean;
      passwordLength?: number;
    },
    overrideSiteTag?: string,
  ) => {
    // Use override siteTag if provided, otherwise use current state
    const useSiteTag = overrideSiteTag ?? siteTag;

    if (!useSiteTag.trim()) {
      showStatus(t("generator.siteTag.empty"), STATUS_COLORS.info);
      return;
    }
    if (!masterKey.trim()) {
      showStatus(t("generator.masterKey.empty"), STATUS_COLORS.warning);
      return;
    }

    // Use override settings if provided, otherwise use current state
    const useDigits = overrideSettings?.digits ?? digits;
    const usePunctuation = overrideSettings?.punctuation ?? punctuation;
    const useMixedCase = overrideSettings?.mixedCase ?? mixedCase;
    const useNoSpecial = overrideSettings?.noSpecial ?? noSpecial;
    const useDigitsOnly = overrideSettings?.digitsOnly ?? digitsOnly;
    const usePasswordLength = overrideSettings?.passwordLength ?? passwordLength;

    const hashText = PassHashCommon.generateHashWord(
      useSiteTag,
      masterKey,
      usePasswordLength,
      useDigits,
      usePunctuation,
      useMixedCase,
      useNoSpecial,
      useDigitsOnly,
    );
    setHashWord(hashText);

    // Store site tag settings
    storeSiteTag(useSiteTag, {
      digits: useDigits,
      punctuation: usePunctuation,
      mixedCase: useMixedCase,
      special: !useNoSpecial,
      digitsOnly: useDigitsOnly,
      length: usePasswordLength,
    });

    // Reset master key clear timer on successful generation
    scheduleMasterKeyClear();
  }, [siteTag, masterKey, passwordLength, digits, punctuation, mixedCase, noSpecial, digitsOnly, showStatus, scheduleMasterKeyClear, t]);

  // Clear password when site or master key changes (requires manual generation)
  useEffect(() => {
    // Password is cleared in handleSiteTagChange and handleMasterKeyChange
    // This effect is kept for future manual-trigger logic if needed
  }, [siteTag, masterKey]);

  // Auto-regenerate password when settings change (if password is already generated)
  useEffect(() => {
    if (hashWord && siteTag.trim().length > 0 && masterKey.trim().length > 0) {
      generateHash();
    }
  }, [digits, punctuation, mixedCase, noSpecial, digitsOnly, passwordLength, hashWord, siteTag, masterKey, generateHash]);

  // Filter and sort hints based on current site tag input
  const filterHints = useCallback((input: string): KeepObj[] => {
    const allData = getAllData();
    if (!input || input.trim().length === 0) {
      return [];
    }

    const inputLower = input.toLowerCase();
    const hints: KeepObj[] = [];

    allData.forEach((keepObj) => {
      const tagLower = keepObj.tag.toLowerCase();
      // Check if the tag contains the input
      if (tagLower.includes(inputLower)) {
        hints.push(keepObj);
      }
    });

    // Sort by relevance: exact match first, then starts with, then contains
    hints.sort((a, b) => {
      const aTagLower = a.tag.toLowerCase();
      const bTagLower = b.tag.toLowerCase();

      // Exact match gets highest priority
      if (aTagLower === inputLower) return -1;
      if (bTagLower === inputLower) return 1;

      // Starts with gets second priority
      if (aTagLower.startsWith(inputLower) && !bTagLower.startsWith(inputLower)) return -1;
      if (bTagLower.startsWith(inputLower) && !aTagLower.startsWith(inputLower)) return 1;

      // Then sort by length (shorter matches are typically more relevant)
      return aTagLower.length - bTagLower.length;
    });

    return hints;
  }, []);

  const handleGeneratePress = useCallback(() => {
    generateHash();
  }, [generateHash]);

  const handleSiteTagChange = useCallback(
    (text: string) => {
      setSiteTag(text);
      // Clear password to require manual generation
      setHashWord("");

      // Filter and update hints
      const hints = filterHints(text);
      setFilteredHints(hints);
      setShowHints(hints.length > 0);

      const siteObj = createSiteObj(text);

      // If no version, try to extract site tag from URL
      if (isNaN(siteObj.ver)) {
        if (siteObj.tag.startsWith("http://") || siteObj.tag.startsWith("https://")) {
          try {
            const url = new URL(siteObj.tag);
            const hostParts = url.hostname.split(".");
            let startIdx = 0;
            let endIdx = hostParts.length;

            if (hostParts[0] === "www") {
              startIdx = 1;
            }
            if (startIdx < endIdx) {
              endIdx = endIdx - 1;
            }

            if (startIdx < endIdx) {
              const extracted = hostParts.slice(startIdx, endIdx).join(".").toLowerCase();
              siteObj.tag = extracted;
              showStatus(t("generator.siteTag.extractedFromUrl"), STATUS_COLORS.success);
            }
          } catch {
            // Invalid URL, ignore
          }
        }
      }

      const normalizedText = toString(siteObj);
      if (normalizedText.trim() !== text) {
        showStatus(t("generator.siteTag.hasSpaces"), STATUS_COLORS.warning);
      }
      setSiteTag(normalizedText);
      
      // Re-filter with normalized text
      const normalizedHints = filterHints(normalizedText);
      setFilteredHints(normalizedHints);
      setShowHints(normalizedHints.length > 0);
    },
    [showStatus, t, filterHints],
  );

  const handleMasterKeyChange = useCallback(
    (text: string) => {
      setMasterKey(text);
      // Clear password to require manual generation
      setHashWord("");
      scheduleMasterKeyClear();
      if (text.trim() !== text) {
        showStatus(t("generator.masterKey.hasSpaces"), STATUS_COLORS.warning);
      }
    },
    [showStatus, scheduleMasterKeyClear, t],
  );

  const handleBump = useCallback(() => {
    const siteObj = createSiteObj(siteTag);
    siteObj.ver = isNaN(siteObj.ver) ? 1 : siteObj.ver + 1;
    const bumpedTag = toString(siteObj);
    setSiteTag(bumpedTag);

    if (masterKey.length > 0) {
      generateHash();
    }
  }, [siteTag, masterKey, generateHash]);

  // Handle hint selection from dropdown
   const handleHintSelect = useCallback(
     (keepObj: KeepObj) => {
       console.log('handleHintSelect called with:', keepObj);
       // Clear any pending blur timeout to prevent hints from hiding before selection
       if (blurTimeoutRef.current) {
         clearTimeout(blurTimeoutRef.current);
         blurTimeoutRef.current = null;
       }

       const tagStr = toString(keepObj);
       console.log('tagStr:', tagStr);
       setSiteTag(tagStr);

       // Apply saved settings
       let overrideSettings = undefined;
       if (keepObj.settings) {
         console.log('keepObj.settings:', keepObj.settings);
         const newDigits = keepObj.settings.digits ?? digits;
         const newPunctuation = keepObj.settings.punctuation ?? punctuation;
         const newMixedCase = keepObj.settings.mixedCase ?? mixedCase;
         const newNoSpecial = keepObj.settings.special !== null && keepObj.settings.special !== undefined
           ? !keepObj.settings.special
           : noSpecial;
         const newDigitsOnly = keepObj.settings.digitsOnly ?? digitsOnly;
         const newPasswordLength = keepObj.settings.length ?? passwordLength;

         setDigits(newDigits);
         setPunctuation(newPunctuation);
         setMixedCase(newMixedCase);
         setNoSpecial(newNoSpecial);
         setDigitsOnly(newDigitsOnly);
         setPasswordLength(newPasswordLength);

         overrideSettings = {
           digits: newDigits,
           punctuation: newPunctuation,
           mixedCase: newMixedCase,
           noSpecial: newNoSpecial,
           digitsOnly: newDigitsOnly,
           passwordLength: newPasswordLength,
         };
       }

       setShowHints(false);

       if (masterKey.length > 0) {
         console.log('calling generateHash with overrideSettings:', overrideSettings, 'and siteTag:', tagStr);
         generateHash(overrideSettings, tagStr);
       }
     },
     [masterKey, digits, punctuation, mixedCase, noSpecial, digitsOnly, passwordLength, generateHash],
   );

  const handleSaveSettings = useCallback((): void => {
    saveSetting("digits", digits);
    saveSetting("punctuation", punctuation);
    saveSetting("mixedCase", mixedCase);
    saveSetting("noSpecial", noSpecial);
    saveSetting("digitsOnly", digitsOnly);
    saveSetting("passwordLength", passwordLength);

    // Update original settings after save
    setOriginalSettings({
      digits,
      punctuation,
      mixedCase,
      noSpecial,
      digitsOnly,
      passwordLength,
    });

    if (onSaveSettings) {
      onSaveSettings();
    }
    showStatus(t("generator.buttons.settingsSaved"), STATUS_COLORS.success);
  }, [digits, punctuation, mixedCase, noSpecial, digitsOnly, passwordLength, onSaveSettings, showStatus, t]);

  const hasChanges = originalSettings ? (
    originalSettings.digits !== digits ||
    originalSettings.punctuation !== punctuation ||
    originalSettings.mixedCase !== mixedCase ||
    originalSettings.noSpecial !== noSpecial ||
    originalSettings.digitsOnly !== digitsOnly ||
    originalSettings.passwordLength !== passwordLength
  ) : false;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} scrollEnabled={!showHints}>
        {/* Card 1: Generation */}
        <Card style={styles.generationCard}>
          {/* Site tag input with version bump */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t("generator.siteTag.label")}</Text>
            <View style={styles.inputWithButtonContainer}>
              <View style={styles.inputWithButton}>
                <TextInput
                  style={styles.textInput}
                  placeholder={t("generator.siteTag.placeholder")}
                  placeholderTextColor="#999"
                  value={siteTag}
                  onChangeText={handleSiteTagChange}
                  onFocus={() => {
                    const hints = filterHints(siteTag);
                    setShowHints(hints.length > 0);
                  }}
                  onBlur={() => {
                    // Delay hiding to allow hint selection
                    blurTimeoutRef.current = setTimeout(() => {
                      setShowHints(false);
                      blurTimeoutRef.current = null;
                    }, 200);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectTextOnFocus
                  accessibilityLabel={t("generator.siteTag.label")}
                  accessibilityRole="none"
                  accessibilityHint="Enter site tag for password generation"
                  testID="site-tag-input"
                />
                <TouchableOpacity
                  style={styles.bumpButton}
                  onPress={handleBump}
                  disabled={!siteTag}
                  accessibilityLabel={`${t("generator.buttons.bump")} version`}
                  accessibilityRole="button"
                  accessibilityHint="Increase site tag version number"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <View style={styles.bumpButtonInner}>
                    <Text style={styles.bumpButtonText}>+1</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Hints dropdown - positioned absolutely within container */}
              {showHints && filteredHints.length > 0 && (
                <View style={styles.hintsDropdownWrapper}>
                  <SiteHintsDropdown
                    hints={filteredHints}
                    onSelect={handleHintSelect}
                    currentSiteTag={siteTag}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Master key input with visibility toggle */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t("generator.masterKey.label")}</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={styles.textInput}
                placeholder={t("generator.masterKey.placeholder")}
                placeholderTextColor="#999"
                value={masterKey}
                onChangeText={handleMasterKeyChange}
                autoCapitalize="none"
                autoCorrect={false}
                selectTextOnFocus
                secureTextEntry={!unmaskMasterKey}
                onSubmitEditing={handleGeneratePress}
                accessibilityLabel={t("generator.masterKey.label")}
                accessibilityRole="none"
                accessibilityHint="Enter your secret master phrase"
                testID="master-key-input"
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setUnmaskMasterKey(!unmaskMasterKey)}
                accessibilityLabel={unmaskMasterKey ? t("generator.masterKey.unmask") : t("generator.masterKey.unmask")}
                accessibilityRole="button"
                accessibilityHint={unmaskMasterKey ? "Hide master key" : "Show master key"}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={styles.toggleButtonInner}>
                  <Text style={styles.toggleButtonText}>{unmaskMasterKey ? "👁️" : "🔒"}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Password output or Generate button */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t("generator.password.label")}</Text>
            {hashWord ? (
              <TextInput
                style={[styles.textInput, styles.passwordOutput]}
                value={hashWord}
                readOnly={true}
                selectTextOnFocus
                accessibilityLabel={t("generator.password.label")}
                accessibilityRole="text"
                accessibilityHint="Generated password, already copied to clipboard"
                testID="password-output"
              />
            ) : (
              <Button
                title="generator.buttons.generate"
                onPress={handleGeneratePress}
                disabled={!siteTag.trim() || !masterKey.trim()}
                style={styles.generateButtonFull}
                testID="generate-button"
              />
            )}
          </View>
        </Card>

        {/* Card 2: Settings (Requirements and Restrictions side by side) */}
        <Card style={styles.settingsCard}>
          <View style={styles.settingsRow}>
            {/* Requirements column */}
            <View style={styles.settingsColumn}>
              <Text style={styles.cardSectionTitle}>{t("generator.requirements.title")}</Text>
              <CompactSettingRow
                label="generator.requirements.digits"
                symbol={t("generator.requirements.digitsSymbol")}
                value={digits}
                onValueChange={setDigits}
                hideLabel={true}
              />
              <CompactSettingRow
                label="generator.requirements.punctuation"
                symbol={t("generator.requirements.punctuationSymbol")}
                value={punctuation}
                onValueChange={setPunctuation}
                disabled={noSpecial || digitsOnly}
                hideLabel={true}
              />
              <CompactSettingRow
                label="generator.requirements.mixedCase"
                symbol={t("generator.requirements.mixedCaseSymbol")}
                value={mixedCase}
                onValueChange={setMixedCase}
                disabled={digitsOnly}
                hideLabel={true}
              />
            </View>

            {/* Restrictions column */}
            <View style={styles.settingsColumn}>
              <Text style={styles.cardSectionTitle}>{t("generator.restrictions.title")}</Text>
              <CompactSettingRow
                label="generator.restrictions.noSpecial"
                symbol={t("generator.restrictions.noSpecialSymbol")}
                value={noSpecial}
                onValueChange={setNoSpecial}
                hideLabel={true}
              />
              <CompactSettingRow
                label="generator.restrictions.digitsOnly"
                symbol={t("generator.restrictions.digitsOnlySymbol")}
                value={digitsOnly}
                onValueChange={setDigitsOnly}
                hideLabel={true}
              />
              <LengthSliderRow value={passwordLength} onChange={setPasswordLength} />
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Status message */}
      <View style={styles.statusBar}>
        <StatusMessage text={statusMsg.text} color={statusMsg.color} />
      </View>

      {/* Save settings button at bottom */}
      <View style={styles.bottomBar}>
        <Button
          title="generator.buttons.saveSettings"
          onPress={handleSaveSettings}
          disabled={!hasChanges}
          style={styles.saveButton}
          textStyle={styles.saveButtonTextStyle}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    color: "#333",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
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
    zIndex: 9999,
    elevation: 10,
  },
hintsDropdownWrapper: {
  position: "absolute",
  top: 48,
  left: 0,
  right: 50,
  zIndex: 10000,
  elevation: 20,
},
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    height: 48,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    backgroundColor: "#fff",
    color: "#333",
  },
  passwordOutput: {
    backgroundColor: "#f9f9f9",
    color: "#333",
    fontWeight: "600",
  },
  bumpButton: {
    position: "absolute",
    right: 0,
    height: 48,
    minWidth: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  bumpButtonInner: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  bumpButtonText: {
    color: "#fff",
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
  generateButton: {
    flex: 1,
    height: 48,
  },
  generateButtonFull: {
    height: 48,
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  hintsList: {
    paddingVertical: 4,
  },
  hintItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  hintItemText: {
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#333",
  },
  statusBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bottomBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 12,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  saveButtonTextStyle: {
    color: "#fff",
    fontSize: 16,
  },
});

export default GeneratorScreen;
