package ru.co_dev.passhash

import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.*
import java.io.File

/**
 * Native module for migrating settings from Qt QSettings to React Native AsyncStorage.
 *
 * Qt QSettings on Android storage locations (Qt 5.15, QtQuick2):
 *
 * QSettings formats and paths:
 * 1. INI format (Qt.labs.settings or QSettings::IniFormat):
 *    - /data/user/0/<PACKAGE>/files/.config/<ORG_NAME>/<APP_NAME>.conf
 *    - /data/user/0/<PACKAGE>/files/<ORG_NAME>.ini
 *    - /data/user/0/<PACKAGE>/files/settings/<ORG_NAME>/<APP_NAME>.ini
 *    - /data/data/<PACKAGE>/files/.config/<ORG_NAME>/<APP_NAME>.conf
 *    - /data/data/<PACKAGE>/files/<ORG_NAME>.ini
 *    - /data/data/<PACKAGE>/files/settings/<ORG_NAME>/<APP_NAME>.ini
 *
 * 2. NativePreferences (QSettings::NativeFormat / SharedPreferences):
 *    - /data/user/0/<PACKAGE>/shared_prefs/<ORG_NAME>/<APP_NAME>.xml
 *    - /data/user/0/<PACKAGE>/shared_prefs/<APP_NAME>.xml
 *    - /data/data/<PACKAGE>/shared_prefs/<ORG_NAME>/<APP_NAME>.xml
 *    - /data/data/<PACKAGE>/shared_prefs/<APP_NAME>.xml
 *
 * Note: /data/user/0/<PACKAGE> is typically a symlink to /data/data/<PACKAGE>
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

        // Qt INI file path
        private const val QT_CONFIG_PATH = "files/.config/$QT_ORGANIZATION/$QT_APPLICATION.conf"

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
            val qtConfigFile = getQtConfigFile()
            promise.resolve(qtConfigFile != null && qtConfigFile.exists())
        } catch (e: Exception) {
            android.util.Log.e("QtMigration", "Error checking Qt settings", e)
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
            android.util.Log.d("QtMigration", "=== STARTING QT SETTINGS MIGRATION ===")

            val qtConfigFile = getQtConfigFile()
            if (qtConfigFile == null || !qtConfigFile.exists()) {
                android.util.Log.w("QtMigration", "Qt config file not found at: $QT_CONFIG_PATH")
                promise.resolve(null)
                return
            }

            android.util.Log.d("QtMigration", "Found Qt config file: ${qtConfigFile.absolutePath}")

            // Parse INI file
            val iniData = parseQtIniFile(qtConfigFile)
            if (iniData.isEmpty()) {
                android.util.Log.w("QtMigration", "Qt config file is empty or invalid")
                promise.resolve(null)
                return
            }

            val migratedSettings = Arguments.createMap()
            var migrationCount = 0

            // Migrate Requirements section
            android.util.Log.d("QtMigration", "Migrating Requirements section...")
            iniData["Requirements"]?.let { section ->
                section["digits"]?.let { value ->
                    migratedSettings.putBoolean(RN_KEY_DIGITS, value.toBoolean())
                    migrationCount++
                    android.util.Log.d("QtMigration", "  Requirements.digits = $value")
                }
                section["mixedCase"]?.let { value ->
                    migratedSettings.putBoolean(RN_KEY_MIXED_CASE, value.toBoolean())
                    migrationCount++
                    android.util.Log.d("QtMigration", "  Requirements.mixedCase = $value")
                }
                section["punctuation"]?.let { value ->
                    migratedSettings.putBoolean(RN_KEY_PUNCTUATION, value.toBoolean())
                    migrationCount++
                    android.util.Log.d("QtMigration", "  Requirements.punctuation = $value")
                }
            }

            // Migrate Restrictions section
            android.util.Log.d("QtMigration", "Migrating Restrictions section...")
            iniData["Restrictions"]?.let { section ->
                section["digitsOnly"]?.let { value ->
                    migratedSettings.putBoolean(RN_KEY_DIGITS_ONLY, value.toBoolean())
                    migrationCount++
                    android.util.Log.d("QtMigration", "  Restrictions.digitsOnly = $value")
                }
                section["noSpecial"]?.let { value ->
                    migratedSettings.putBoolean(RN_KEY_NO_SPECIAL, value.toBoolean())
                    migrationCount++
                    android.util.Log.d("QtMigration", "  Restrictions.noSpecial = $value")
                }
                section["passwordLength"]?.let { value ->
                    migratedSettings.putInt(RN_KEY_PASSWORD_LENGTH, value.toInt())
                    migrationCount++
                    android.util.Log.d("QtMigration", "  Restrictions.passwordLength = $value")
                }
            }

            // Migrate Keeper section
            android.util.Log.d("QtMigration", "Migrating Keeper section...")
            iniData["Keeper"]?.let { section ->
                section["data"]?.let { keeperData ->
                    val parsedKeeperData = parseKeeperData(keeperData)
                    migratedSettings.putString(RN_KEY_KEEPER_DATA, parsedKeeperData)
                    migrationCount++
                    android.util.Log.d("QtMigration", "  Keeper.data migrated (${parsedKeeperData.lines().size} entries)")
                    if (parsedKeeperData.isNotEmpty()) {
                        android.util.Log.d("QtMigration", "  Keeper.data preview: ${parsedKeeperData.take(100)}")
                    }
                }
            }

            android.util.Log.d("QtMigration", "=== MIGRATION COMPLETE: $migrationCount settings migrated ===")
            promise.resolve(migratedSettings)
        } catch (e: Exception) {
            android.util.Log.e("QtMigration", "Migration failed with exception", e)
            promise.reject("MIGRATION_ERROR", "Failed to migrate Qt settings: ${e.message}", e)
        }
    }

    /**
     * Get Qt config file from the standard location.
     */
    private fun getQtConfigFile(): File? {
        val configFile = File(context.filesDir, ".config/$QT_ORGANIZATION/$QT_APPLICATION.conf")
        android.util.Log.d("QtMigration", "Checking Qt config file: ${configFile.absolutePath}")
        android.util.Log.d("QtMigration", "  Exists: ${configFile.exists()}")
        android.util.Log.d("QtMigration", "  Can read: ${configFile.canRead()}")
        if (configFile.exists()) {
            android.util.Log.d("QtMigration", "  Size: ${configFile.length()} bytes")
        }
        return configFile
    }

    /**
     * Parse Qt INI file and return as a map of sections to key-value pairs.
     * Qt INI format:
     * [SectionName]
     * key=value
     */
    private fun parseQtIniFile(iniFile: File): Map<String, Map<String, String>> {
        val result = mutableMapOf<String, MutableMap<String, String>>()
        var currentSection = ""

        try {
            val lines = iniFile.readLines()
            android.util.Log.d("QtMigration", "Parsing INI file with ${lines.size} lines")

            for (line in lines) {
                val trimmed = line.trim()

                // Skip empty lines and comments
                if (trimmed.isEmpty() || trimmed.startsWith("#") || trimmed.startsWith(";")) {
                    continue
                }

                // Section header
                if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                    currentSection = trimmed.substring(1, trimmed.length - 1)
                    if (!result.containsKey(currentSection)) {
                        result[currentSection] = mutableMapOf()
                    }
                    android.util.Log.d("QtMigration", "  Found section: [$currentSection]")
                    continue
                }

                // Key=value pair
                if (trimmed.contains("=")) {
                    val parts = trimmed.split("=", limit = 2)
                    if (parts.size == 2) {
                        val key = parts[0].trim()
                        var value = parts[1].trim()

                        // Remove surrounding quotes if present
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length - 1)
                        }

                        if (currentSection.isNotEmpty()) {
                            result[currentSection]!![key] = value
                            android.util.Log.d("QtMigration", "    $key = $value")
                        }
                    }
                }
            }

            android.util.Log.d("QtMigration", "INI parsing complete: ${result.size} sections found")
        } catch (e: Exception) {
            android.util.Log.e("QtMigration", "Failed to parse INI file: ${e.message}", e)
        }

        return result
    }

    /**
     * Parse Keeper data from Qt format to React Native format.
     *
     * Qt format (escaped string with \n separators and \xNN hex escapes):
     * "0=DpMSo8\\n192.168.31.123=DpMSo8\\n\\x43a\\x43e\\x448\\x435\\x43b\\x435\\x43a=DpMSo8\\n..."
     *
     * React Native format (plain text with UTF-8, one entry per line):
     * "0=DpMSo8\n192.168.31.123=DpMSo8\nкошелек=DpMSo8\n..."
     */
    private fun parseKeeperData(qtData: String): String {
        android.util.Log.d("QtMigration", "Parsing Keeper data, length: ${qtData.length} chars")

        // Step 1: Replace escaped newlines with actual newlines
        var unescapedData = qtData.replace("\\n", "\n")

        // Step 2: Decode hex escape sequences (\xNN -> character)
        unescapedData = decodeHexEscapes(unescapedData)

        // Filter out empty lines and return
        val lines = unescapedData.split("\n").filter { it.isNotBlank() }
        android.util.Log.d("QtMigration", "Keeper data has ${lines.size} non-empty entries")

        return lines.joinToString("\n")
    }

    /**
     * Decode hex escape sequences in string.
     * Qt uses \xNNNN format where NNNN is 2-4 hex digits representing Unicode codepoint.
     * Example: \x43a -> U+043A (Cyrillic 'к'), \x41 -> 'A'
     */
    private fun decodeHexEscapes(input: String): String {
        val result = StringBuilder()
        var i = 0

        while (i < input.length) {
            // Check for \xNNNN pattern (2-4 hex digits)
            if (i + 3 < input.length &&
                input[i] == '\\' &&
                input[i + 1] == 'x' &&
                isHexDigit(input[i + 2]) &&
                isHexDigit(input[i + 3])
            ) {
                // Collect 2-4 hex digits
                var hexEnd = i + 4
                // Check for 3rd hex digit
                if (hexEnd < input.length && isHexDigit(input[hexEnd])) {
                    hexEnd++
                    // Check for 4th hex digit
                    if (hexEnd < input.length && isHexDigit(input[hexEnd])) {
                        hexEnd++
                    }
                }
                
                val hexValue = input.substring(i + 2, hexEnd)
                try {
                    val charCode = hexValue.toInt(16)
                    result.append(charCode.toChar())
                    i = hexEnd
                } catch (e: NumberFormatException) {
                    // If parsing fails, keep original
                    result.append(input[i])
                    i++
                }
            } else {
                result.append(input[i])
                i++
            }
        }

        return result.toString()
    }

    /**
     * Check if character is a hex digit (0-9, a-f, A-F).
     */
    private fun isHexDigit(c: Char): Boolean {
        return c in '0'..'9' || c in 'a'..'f' || c in 'A'..'F'
    }

    /**
     * Clear Qt config file after successful migration (optional).
     * This renames the file to .backup to preserve data.
     */
    @ReactMethod
    fun clearQtSettings(promise: Promise) {
        try {
            val qtConfigFile = getQtConfigFile()
            if (qtConfigFile != null && qtConfigFile.exists()) {
                val backupFile = File(qtConfigFile.parentFile, "${qtConfigFile.name}.backup")
                if (qtConfigFile.renameTo(backupFile)) {
                    android.util.Log.d("QtMigration", "Qt config file backed up to: ${backupFile.absolutePath}")
                    promise.resolve(true)
                } else {
                    android.util.Log.w("QtMigration", "Failed to backup Qt config file")
                    promise.resolve(false)
                }
            } else {
                android.util.Log.d("QtMigration", "Qt config file not found, nothing to clear")
                promise.resolve(true)
            }
        } catch (e: Exception) {
            android.util.Log.e("QtMigration", "Error clearing Qt settings", e)
            promise.reject("CLEAR_ERROR", "Failed to clear Qt settings", e)
        }
    }
}
