package ru.co_dev.passhash

import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.*
import java.io.File

/**
 * Native module for migrating settings from Qt QSettings to React Native AsyncStorage.
 *
 * Qt QSettings on Android storage:
 * - Qt.labs.settings uses INI files (QSettings INI format)
 * - Path: /data/data/<package>/files/settings/<OrganizationName>.ini
 * - Or: /data/data/<package>/shared_prefs/<Application Name>.xml (SharedPreferences backend)
 *
 * Organization: "Oleg Blednov"
 * Application: "Password Hasher"
 */
class QtSettingsMigrationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val context: Context = reactContext.applicationContext

    // Qt Settings keys (matching passhash-common.js)
    companion object {
        private const val QT_ORGANIZATION = "Oleg Blednov"
        private const val QT_APPLICATION = "Password Hasher"
        
        // Qt preference keys
        private const val KEY_SECURITY_LEVEL = "optSecurityLevel"
        private const val KEY_GUESS_SITE_TAG = "optGuessSiteTag"
        private const val KEY_REMEMBER_SITE_TAG = "optRememberSiteTag"
        private const val KEY_REMEMBER_MASTER_KEY = "optRememberMasterKey"
        private const val KEY_REVEAL_SITE_TAG = "optRevealSiteTag"
        private const val KEY_REVEAL_HASH_WORD = "optRevealHashWord"
        private const val KEY_SHOW_MARKER = "optShowMarker"
        private const val KEY_UNMASK_MARKER = "optUnmaskMarker"
        private const val KEY_GUESS_FULL_DOMAIN = "optGuessFullDomain"
        private const val KEY_DIGIT_DEFAULT = "optDigitDefault"
        private const val KEY_PUNCTUATION_DEFAULT = "optPunctuationDefault"
        private const val KEY_MIXED_CASE_DEFAULT = "optMixedCaseDefault"
        private const val KEY_HASH_WORD_SIZE_DEFAULT = "optHashWordSizeDefault"
        
        // React Native AsyncStorage keys (matching storage.ts)
        private const val RN_KEY_DIGITS = "Requirements.digits"
        private const val RN_KEY_PUNCTUATION = "Requirements.punctuation"
        private const val RN_KEY_MIXED_CASE = "Requirements.mixedCase"
        private const val RN_KEY_NO_SPECIAL = "Restrictions.noSpecial"
        private const val RN_KEY_DIGITS_ONLY = "Restrictions.digitsOnly"
        private const val RN_KEY_PASSWORD_LENGTH = "Restrictions.passwordLength"
        private const val RN_KEY_KEEPER_DATA = "Keeper.data"
    }

    override fun getName(): String = "QtSettingsMigration"

    /**
     * Check if Qt settings exist and can be migrated.
     */
    @ReactMethod
    fun hasQtSettings(promise: Promise) {
        try {
            val qtPrefs = getQtSharedPreferences()
            val hasSettings = qtPrefs != null && !qtPrefs.all.isNullOrEmpty()
            promise.resolve(hasSettings)
        } catch (e: Exception) {
            promise.reject("MIGRATION_ERROR", "Failed to check Qt settings", e)
        }
    }

    /**
     * Migrate settings from Qt to React Native AsyncStorage.
     * Returns a map of migrated key-value pairs.
     */
    @ReactMethod
    fun migrateQtSettings(promise: Promise) {
        try {
            val qtPrefs = getQtSharedPreferences()
            if (qtPrefs == null || qtPrefs.all.isNullOrEmpty()) {
                promise.resolve(null)
                return
            }

            val migratedSettings = Arguments.createMap()
            
            // Migrate boolean settings
            migrateBooleanSetting(qtPrefs, KEY_DIGIT_DEFAULT, RN_KEY_DIGITS, migratedSettings)
            migrateBooleanSetting(qtPrefs, KEY_PUNCTUATION_DEFAULT, RN_KEY_PUNCTUATION, migratedSettings)
            migrateBooleanSetting(qtPrefs, KEY_MIXED_CASE_DEFAULT, RN_KEY_MIXED_CASE, migratedSettings)
            
            // Migrate restrictions (note: Qt doesn't have these directly, use defaults)
            // noSpecial and digitsOnly are new in RN version
            if (!migratedSettings.hasKey(RN_KEY_NO_SPECIAL)) {
                migratedSettings.putBoolean(RN_KEY_NO_SPECIAL, false)
            }
            if (!migratedSettings.hasKey(RN_KEY_DIGITS_ONLY)) {
                migratedSettings.putBoolean(RN_KEY_DIGITS_ONLY, false)
            }
            
            // Migrate password length
            val hashWordSize = qtPrefs.getInt(KEY_HASH_WORD_SIZE_DEFAULT, 8)
            migratedSettings.putInt(RN_KEY_PASSWORD_LENGTH, hashWordSize)
            
            // Migrate keeper data from LoginManager/PasswordManager
            // Qt stores keeper entries with keys like "site-tag-<domain>", "master-key-<domain>", "options-<domain>"
            val keeperData = migrateKeeperData(qtPrefs)
            migratedSettings.putString(RN_KEY_KEEPER_DATA, keeperData)
            
            promise.resolve(migratedSettings)
        } catch (e: Exception) {
            promise.reject("MIGRATION_ERROR", "Failed to migrate Qt settings", e)
        }
    }

    /**
     * Get Qt SharedPreferences instance.
     * Qt QSettings on Android can use INI files or SharedPreferences.
     */
    private fun getQtSharedPreferences(): SharedPreferences? {
        val dataDir = context.applicationInfo.dataDir
        android.util.Log.d("QtMigration", "Data dir: $dataDir")

        // Method 1: Try Qt INI file (Qt.labs.settings default on Android)
        // Path: /data/data/<package>/files/settings/Oleg Blednov/Password Hasher.ini
        val settingsDir = File(context.filesDir, "settings/$QT_ORGANIZATION")
        android.util.Log.d("QtMigration", "Checking settings dir: ${settingsDir.absolutePath}, exists: ${settingsDir.exists()}")
        if (settingsDir.exists()) {
            val iniFile = File(settingsDir, "$QT_APPLICATION.ini")
            android.util.Log.d("QtMigration", "Checking INI file: ${iniFile.absolutePath}, exists: ${iniFile.exists()}")
            if (iniFile.exists()) {
                android.util.Log.d("QtMigration", "Found Qt INI settings")
                // Parse INI file and create temporary SharedPreferences
                return parseQtIniFile(iniFile)
            }
        }

        // Method 2: Try Qt application name with organization path (SharedPreferences)
        // Path: /data/data/<package>/shared_prefs/Oleg Blednov/Password Hasher.xml
        val orgDir = File(dataDir, "shared_prefs/$QT_ORGANIZATION")
        android.util.Log.d("QtMigration", "Checking org dir: ${orgDir.absolutePath}, exists: ${orgDir.exists()}")
        if (orgDir.exists()) {
            val prefsFile = File(orgDir, "$QT_APPLICATION.xml")
            android.util.Log.d("QtMigration", "Checking prefs file: ${prefsFile.absolutePath}, exists: ${prefsFile.exists()}")
            if (prefsFile.exists()) {
                android.util.Log.d("QtMigration", "Found Qt settings in org dir")
                return context.getSharedPreferences("$QT_ORGANIZATION/$QT_APPLICATION", Context.MODE_PRIVATE)
            }
        }

        // Method 3: Try Qt application name directly (fallback)
        // Path: /data/data/<package>/shared_prefs/Password Hasher.xml
        android.util.Log.d("QtMigration", "Trying direct SharedPreferences: $QT_APPLICATION")
        val directPrefs = context.getSharedPreferences(QT_APPLICATION, Context.MODE_PRIVATE)
        if (!directPrefs.all.isNullOrEmpty()) {
            android.util.Log.d("QtMigration", "Found Qt settings directly, count: ${directPrefs.all.size}")
            return directPrefs
        }

        // Method 4: Try all SharedPreferences files to find Qt settings
        android.util.Log.d("QtMigration", "Scanning all SharedPreferences files...")
        val sharedPrefsDir = File(dataDir, "shared_prefs")
        sharedPrefsDir.listFiles()?.forEach { file ->
            android.util.Log.d("QtMigration", "Found prefs file: ${file.name}")
            if (file.extension == "xml") {
                val prefsName = file.nameWithoutExtension
                val prefs = context.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
                // Check if this prefs contains Qt-specific keys
                if (prefs.contains(KEY_SECURITY_LEVEL) ||
                    prefs.contains(KEY_GUESS_SITE_TAG) ||
                    prefs.contains(KEY_DIGIT_DEFAULT)) {
                    android.util.Log.d("QtMigration", "Found Qt settings by key match in: $prefsName")
                    return prefs
                }

                // Also check for keeper data patterns
                prefs.all.keys.forEach { key ->
                    if (key.startsWith("site-tag-") ||
                        key.startsWith("master-key-") ||
                        key.startsWith("options-")) {
                        android.util.Log.d("QtMigration", "Found keeper data in: $prefsName, key: $key")
                        return prefs
                    }
                }
            }
        }

        android.util.Log.w("QtMigration", "Qt settings not found")
        return null
    }

    /**
     * Parse Qt INI file and return as SharedPreferences-like map.
     * Qt INI format:
     * [Category]
     * key=value
     */
    private fun parseQtIniFile(iniFile: File): SharedPreferences? {
        try {
            val lines = iniFile.readLines()
            val tempPrefs = context.getSharedPreferences("qt_migration_temp", Context.MODE_PRIVATE)
            val editor = tempPrefs.edit()

            var currentCategory = ""
            for (line in lines) {
                val trimmed = line.trim()
                if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                    currentCategory = trimmed.substring(1, trimmed.length - 1)
                } else if (trimmed.contains("=") && !trimmed.startsWith("#")) {
                    val parts = trimmed.split("=", limit = 2)
                    if (parts.size == 2) {
                        val key = "${currentCategory}.${parts[0].trim()}"
                        val value = parts[1].trim()
                        // Store as string for later parsing
                        editor.putString(key, value)
                    }
                }
            }
            editor.apply()
            android.util.Log.d("QtMigration", "Parsed INI file, keys: ${tempPrefs.all.size}")
            return tempPrefs
        } catch (e: Exception) {
            android.util.Log.e("QtMigration", "Failed to parse INI file: ${e.message}")
            return null
        }
    }

    /**
     * Migrate a boolean setting from Qt to React Native format.
     */
    private fun migrateBooleanSetting(
        qtPrefs: SharedPreferences,
        qtKey: String,
        rnKey: String,
        result: WritableMap
    ) {
        if (qtPrefs.contains(qtKey)) {
            val value = qtPrefs.getBoolean(qtKey, true)
            result.putBoolean(rnKey, value)
        }
    }

    /**
     * Migrate keeper data from Qt format to React Native format.
     * Qt stores keeper entries using LoginManager/PasswordManager with keys:
     * - site-tag-<domain>
     * - master-key-<domain>
     * - options-<domain>
     * 
     * React Native uses a text format: "<domain>=<settings>"
     */
    private fun migrateKeeperData(qtPrefs: SharedPreferences): String {
        val entries = mutableMapOf<String, MutableMap<String, Any?>>()
        
        // Collect all Qt keeper entries
        qtPrefs.all.forEach { (key, value) ->
            val domain = when {
                key.startsWith("site-tag-") -> key.removePrefix("site-tag-")
                key.startsWith("master-key-") -> key.removePrefix("master-key-")
                key.startsWith("options-") -> key.removePrefix("options-")
                else -> null
            }
            
            if (domain != null) {
                if (!entries.containsKey(domain)) {
                    entries[domain] = mutableMapOf()
                }
                
                when {
                    key.startsWith("site-tag-") -> entries[domain]!!["siteTag"] = value
                    key.startsWith("master-key-") -> entries[domain]!!["masterKey"] = value
                    key.startsWith("options-") -> entries[domain]!!["options"] = value
                }
            }
        }
        
        // Convert to React Native keeper text format
        // Format: "<domain>=<settings>" e.g., "google=DpM8"
        val result = StringBuilder()
        entries.entries.sortedBy { it.key }.forEach { (domain, data) ->
            val optionsStr = data["options"] as? String
            val settingsString = if (!optionsStr.isNullOrEmpty()) {
                parseQtOptionsToSettingsString(optionsStr)
            } else {
                ""
            }
            
            if (settingsString.isNotEmpty()) {
                result.appendLine("$domain=$settingsString")
            } else {
                result.appendLine(domain)
            }
        }
        
        return result.toString().trimEnd()
    }

    /**
     * Parse Qt options string to React Native settings string.
     * Qt may store options as a serialized format.
     */
    private fun parseQtOptionsToSettingsString(optionsStr: String): String {
        // Qt might store options in various formats
        // Try to parse common formats
        
        // If it's already in the expected format (e.g., "DpM8"), return as-is
        if (optionsStr.matches(Regex("[DdPpMmSsOo0-9]+"))) {
            return optionsStr
        }
        
        // Try to extract settings from JSON or other serialized format
        // This is a fallback - adjust based on actual Qt storage format
        return optionsStr
    }

    /**
     * Clear Qt settings after successful migration (optional).
     */
    @ReactMethod
    fun clearQtSettings(promise: Promise) {
        try {
            val qtPrefs = getQtSharedPreferences()
            if (qtPrefs != null) {
                qtPrefs.edit().clear().apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CLEAR_ERROR", "Failed to clear Qt settings", e)
        }
    }
}
