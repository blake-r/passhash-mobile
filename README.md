# Password Hasher - React Native

Every day we face the task of using passwords. Surely, the most convenient way for us is to use a single password for all resources. Unfortunately, such a strategy is too risky. The expert-recommended approach is to create an individual password for each resource. But how can you remember them all?

What if I told you that remembering just one phrase is enough to generate thousands of unique passwords?

When you need a password for a site, paste the site URL into the "Site tag" field, enter your secret phrase as the "Master key" (which remains private), and click the "Generate" button. The generated password will appear in the "Password" field and be copied to the clipboard. To recall the password later, simply repeat the process and you will get exactly the same password as before.

## How It Works

The most secure way to manage a password is to transform it into data that cannot be reversed to the original. This mechanism is known as hashing. This application generates a password for you using a strong, one-way hashing algorithm that produces a consistent result. For security, the app does not know your master key(s).

## Features

- **Deterministic Password Generation**: Generate the same password for the same site tag and master key combination
- **Site Tag Hints**: Quick access to previously used site tags with their settings
- **Keeper**: Export/import saved site settings for backup or transfer
- **Auto-clear Master Key**: Master key is automatically cleared after 30 seconds when app is backgrounded
- **Cross-platform**: Works on Android and iOS

## Algorithm Compatibility

The password generation algorithm is **100% compatible** with:

- PawHash Chrome extension
- QtQuick mobile application
- Original Firefox Password Hasher extension (wijjo.com/passhash)

This ensures that users can migrate between platforms without changing their passwords.

## Data Storage Compatibility

Settings are stored using the same format as the QtQuick application:

- **Requirements**: digits, punctuation, mixedCase
- **Restrictions**: noSpecial, digitsOnly, passwordLength
- **Keeper**: Site tag settings in the same text format

This ensures seamless migration - when users update from the QtQuick version to this React Native version, all their settings will be preserved.

## Project Structure

```
passhash-mobile/
├── App.tsx                         # Main application entry point
├── app.json                        # Expo configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── scripts/
│   ├── algorithm-version.txt       # Algorithm version (e.g., v0.6)
│   └── update-algorithms.sh        # Script to download algorithm files
├── src/
│   ├── algorithms/
│   │   ├── sha1.js                 # SHA1 implementation (from Chrome extension)
│   │   ├── sha1.d.ts               # TypeScript types for sha1.js
│   │   ├── passhash.js             # Password hash algorithm (from Chrome extension)
│   │   └── passhash.d.ts           # TypeScript types for passhash.js
│   ├── utils/
│   │   ├── site-tag.ts             # Site tag parsing utilities
│   │   ├── keeper.ts               # Keeper data management
│   │   ├── hinter.ts               # Site tag hint finder
│   │   └── storage.ts              # AsyncStorage wrapper
│   └── screens/
│       ├── GeneratorScreen.tsx     # Main password generator screen
│       └── KeeperScreen.tsx        # Keeper data management screen
└── README.md
```

## Development

### Prerequisites

- Node.js 18+ (managed via nvm)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Quick Start (Fish Shell)

This project includes an `.nvmrc` file for automatic Node version selection.

**Option 1: Use the wrapper script (recommended)**

The `./bin/npm` script automatically loads nvm and runs npm with the correct Node version:

```bash
./bin/npm install
./bin/npm start
```

**Option 2: Configure fish to auto-load nvm**

Add to `~/.config/fish/config.fish`:
```fish
# Auto-load nvm when entering directory with .nvmrc
function _nvm_auto_load --on-variable PWD
    if test -f .nvmrc
        set -x NVM_DIR "$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ]; and source "$NVM_DIR/nvm.sh" >/dev/null 2>&1
        nvm use >/dev/null 2>&1
    end
end
```

Then simply run:
```bash
npm install
npm start
```

### Installation

```bash
npm install
```

### Running the App

```bash
# Start development server
npx expo start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## Building for Production

### Android

```bash
# Build APK
npx expo export:build --platform android --type apk

# Or build AAB for Google Play
npx expo export:build --platform android --type app-bundle
```

### iOS

```bash
# Build for iOS App Store
npx expo export:build --platform ios
```

## Updating Algorithms

The algorithm files (`sha1.js`, `passhash.js`) are downloaded from the PawHash Chrome extension GitHub repository and do not require modifications.

### Update Structure

- **Version**: stored in `scripts/algorithm-version.txt` (e.g., `v0.6`)
- **Script**: `scripts/update-algorithms.sh` - downloads files from GitHub

### How to Update Version

To update to a new version of the extension:

1. Open `scripts/algorithm-version.txt`
2. Change the version number (e.g., from `v0.6` to `v0.7`)
3. Run `npm run update-algorithms`

The script will automatically download:

- `sha1.js` → `src/algorithms/sha1.js`
- `passhash.js` → `src/algorithms/passhash.js`

TypeScript declaration files (`.d.ts`) are already created and do not require updates since function signatures do not change.

After updating algorithms, it is recommended to:

1. Run tests (if available)
2. Verify password generation for known combinations
3. Build and test the application on a device

## License

The password hashing algorithm is based on the original Password Hasher extension by Steve Cooper:

- MPL 1.1 / GPL 2.0 / LGPL 2.1

The SHA1 implementation:

- BSD License (Paul Johnston)

The public suffix list (if used):

- MPL 2.0

## Links

[iOS](https://apps.apple.com/us/app/password-hasher/id1565669128) | [Android](https://play.google.com/store/apps/details?id=ru.co_dev.passhash)
