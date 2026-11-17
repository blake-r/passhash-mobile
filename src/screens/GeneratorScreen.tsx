// GeneratorScreen.tsx - Main password generator screen with Material Design
// Redesigned with three cards: Generation, Character Settings, Restrictions

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, TextInput, TouchableOpacity, AppState } from "react-native";

import { PassHashCommon } from "../algorithms/passhash";
import { Button, StatusMessage, Card, CompactSettingRow, LengthSliderRow, SiteHintsDropdown } from "../components";
import { useAppStore, GeneratorSettings } from "../state/app-store";
import { copyWithAutoClear } from "../utils/clipboard";
import { filterHints } from "../utils/hints";
import { createSiteObj, toString } from "../utils/site-tag";
import { STATUS_COLORS } from "../utils/status-colors";

import { styles } from "./GeneratorScreen.styles";

import type { KeepObj } from "../utils/keeper";

// Master key clear timeout (30 seconds, matching QtQuick)
const MASTER_KEY_CLEAR_TIMEOUT = 30000;

interface StatusMessage {
  text: string;
  color: string;
}

function GeneratorScreen(): React.JSX.Element {
  const { t } = useTranslation();

  const siteTagInputRef = useRef<TextInput | null>(null);

  const [siteTag, setSiteTag] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [hashWord, setHashWord] = useState("");
  const [unmaskMasterKey, setUnmaskMasterKey] = useState(false);

  // Hints dropdown state
  const [filteredHints, setFilteredHints] = useState<KeepObj[]>([]);
  const [showHints, setShowHints] = useState(false);

  const settings = useAppStore((state) => state.settings);
  const savedSettings = useAppStore((state) => state.savedSettings);
  const keeperData = useAppStore((state) => state.keeperData);
  const setSetting = useAppStore((state) => state.setSetting);
  const persistSettings = useAppStore((state) => state.persistSettings);
  const storeSiteTag = useAppStore((state) => state.storeSiteTag);

  const { digits, punctuation, mixedCase, noSpecial, digitsOnly, passwordLength } = settings;

  const [statusMsg, setStatusMsg] = useState<StatusMessage>({ text: "", color: "gray" });
  const masterKeyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatus = useCallback((text: string, color: string) => {
    setStatusMsg({ text, color });
  }, []);

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

  // Copy to clipboard when hash word changes (clipboard is auto-cleared after 30s)
  useEffect(() => {
    if (hashWord.length > 0) {
      copyWithAutoClear(hashWord);
      showStatus(t("generator.password.copied"), STATUS_COLORS.success);
    }
  }, [hashWord, showStatus, t]);

  // Clear secrets immediately when the app is backgrounded
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        clearMasterKeyTimer();
        setMasterKey("");
        setHashWord("");
      }
    });
    return (): void => subscription.remove();
  }, [clearMasterKeyTimer]);

  const generateHash = useCallback(
    (overrideSettings?: Partial<GeneratorSettings>, overrideSiteTag?: string) => {
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
    },
    [
      siteTag,
      masterKey,
      passwordLength,
      digits,
      punctuation,
      mixedCase,
      noSpecial,
      digitsOnly,
      showStatus,
      scheduleMasterKeyClear,
      storeSiteTag,
      t,
    ],
  );

  // Auto-regenerate password when settings change (if password is already generated)
  useEffect(() => {
    if (hashWord && siteTag.trim().length > 0 && masterKey.trim().length > 0) {
      generateHash();
    }
  }, [
    digits,
    punctuation,
    mixedCase,
    noSpecial,
    digitsOnly,
    passwordLength,
    hashWord,
    siteTag,
    masterKey,
    generateHash,
  ]);

  const updateHints = useCallback(
    (text: string) => {
      const hints = filterHints(text, keeperData);
      setFilteredHints(hints);
      setShowHints(hints.length > 0);
    },
    [keeperData],
  );

  const handleGeneratePress = useCallback(() => {
    generateHash();
  }, [generateHash]);

  const handleSiteTagChange = useCallback(
    (text: string) => {
      setSiteTag(text);
      // Clear password to require manual generation
      setHashWord("");

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
      updateHints(normalizedText);
    },
    [showStatus, t, updateHints],
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
      // Clear any pending blur timeout to prevent hints from hiding before selection
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }

      const tagStr = toString(keepObj);
      setSiteTag(tagStr);
      setShowHints(false);

      // Apply saved settings if available
      if (keepObj.settings) {
        const newDigits = keepObj.settings.digits ?? digits;
        const newPunctuation = keepObj.settings.punctuation ?? punctuation;
        const newMixedCase = keepObj.settings.mixedCase ?? mixedCase;
        const newNoSpecial =
          keepObj.settings.special !== null && keepObj.settings.special !== undefined
            ? !keepObj.settings.special
            : noSpecial;
        const newDigitsOnly = keepObj.settings.digitsOnly ?? digitsOnly;
        const newPasswordLength = keepObj.settings.length ?? passwordLength;

        setSetting("digits", newDigits);
        setSetting("punctuation", newPunctuation);
        setSetting("mixedCase", newMixedCase);
        setSetting("noSpecial", newNoSpecial);
        setSetting("digitsOnly", newDigitsOnly);
        setSetting("passwordLength", newPasswordLength);

        if (masterKey.length > 0) {
          generateHash(
            {
              digits: newDigits,
              punctuation: newPunctuation,
              mixedCase: newMixedCase,
              noSpecial: newNoSpecial,
              digitsOnly: newDigitsOnly,
              passwordLength: newPasswordLength,
            },
            tagStr,
          );
        }
      } else {
        if (masterKey.length > 0) {
          generateHash(undefined, tagStr);
        }
      }
    },
    [masterKey, generateHash, digits, punctuation, mixedCase, noSpecial, digitsOnly, passwordLength, setSetting],
  );

  const handleSaveSettings = useCallback((): void => {
    persistSettings();
    showStatus(t("generator.buttons.settingsSaved"), STATUS_COLORS.success);
  }, [persistSettings, showStatus, t]);

  const hasChanges =
    savedSettings.digits !== digits ||
    savedSettings.punctuation !== punctuation ||
    savedSettings.mixedCase !== mixedCase ||
    savedSettings.noSpecial !== noSpecial ||
    savedSettings.digitsOnly !== digitsOnly ||
    savedSettings.passwordLength !== passwordLength;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!showHints}
        pointerEvents={showHints ? "box-none" : "auto"}
        keyboardShouldPersistTaps="always"
      >
        {/* Card 1: Generation */}
        <Card style={styles.generationCard}>
          {/* Site tag input with version bump */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t("generator.siteTag.label")}</Text>
            <View style={styles.inputWithButtonContainer}>
              <View style={styles.inputWithButton}>
                <TextInput
                  ref={siteTagInputRef}
                  style={styles.textInput}
                  placeholder={t("generator.siteTag.placeholder")}
                  placeholderTextColor="#999"
                  value={siteTag}
                  onChangeText={handleSiteTagChange}
                  onFocus={() => {
                    const hints = filterHints(siteTag, keeperData);
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
                  <SiteHintsDropdown hints={filteredHints} onSelect={handleHintSelect} currentSiteTag={siteTag} />
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
                accessibilityLabel={unmaskMasterKey ? t("generator.masterKey.mask") : t("generator.masterKey.unmask")}
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
                onValueChange={(value) => setSetting("digits", value)}
                hideLabel={true}
              />
              <CompactSettingRow
                label="generator.requirements.punctuation"
                symbol={t("generator.requirements.punctuationSymbol")}
                value={punctuation}
                onValueChange={(value) => setSetting("punctuation", value)}
                disabled={noSpecial || digitsOnly}
                hideLabel={true}
              />
              <CompactSettingRow
                label="generator.requirements.mixedCase"
                symbol={t("generator.requirements.mixedCaseSymbol")}
                value={mixedCase}
                onValueChange={(value) => setSetting("mixedCase", value)}
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
                onValueChange={(value) => setSetting("noSpecial", value)}
                hideLabel={true}
              />
              <CompactSettingRow
                label="generator.restrictions.digitsOnly"
                symbol={t("generator.restrictions.digitsOnlySymbol")}
                value={digitsOnly}
                onValueChange={(value) => setSetting("digitsOnly", value)}
                hideLabel={true}
              />
              <LengthSliderRow value={passwordLength} onChange={(value) => setSetting("passwordLength", value)} />
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

export default GeneratorScreen;
