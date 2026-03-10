# Qt Migration Native Module

Native files for automatic migration of settings from the Qt version of the application.

## Structure

```
plugins/
└── native/
    └── android/
        └── ru/
            └── co_dev/
                └── passhash/
                    ├── QtSettingsMigrationModule.kt    # Native module
                    └── QtSettingsMigrationPackage.kt   # React Package
```

## How It Works

1. **Storage:** Kotlin files are stored in `plugins/native/android/` (tracked in git)
2. **Copying:** During build, the `withQtMigration.js` plugin copies files to the generated `android/` directory
3. **Registration:** The plugin automatically registers `QtSettingsMigrationPackage` in `MainApplication.kt`

## Usage

### Before Building the App

```bash
# Generate native projects (if not already created)
npx expo prebuild

# The plugin will automatically copy files during prebuild
```

### When Migration Files Change

```bash
# Rebuild native projects
npx expo prebuild --clean
```

## Verification

After `prebuild`, verify that files are copied:

```bash
ls android/app/src/main/java/ru/co_dev/passhash/
# Should contain:
# - QtSettingsMigrationModule.kt
# - QtSettingsMigrationPackage.kt
```

## Adding New Native Files

1. Add the `.kt` file to `plugins/native/android/ru/co_dev/passhash/`
2. Update `plugins/withQtMigration.js`:
   - Add the filename to the `filesToCopy` array
   - If needed, add registration logic to `modifyMainApplication()`

## Debugging

During build, you will see messages in the console:

```
✓ Copied Qt migration file: QtSettingsMigrationModule.kt
✓ Copied Qt migration file: QtSettingsMigrationPackage.kt
✓ Qt migration: 2 file(s) copied
✓ Added QtSettingsMigrationPackage import
✓ Registered QtSettingsMigrationPackage
```

## Notes

- The `/android` directory is ignored in `.gitignore` (auto-generated)
- The `plugins/native` directory is **not ignored** (migration source code)
- The plugin only works on Android (iOS not supported)
