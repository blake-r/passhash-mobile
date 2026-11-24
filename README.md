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
- **Auto-clear Master Key**: Master key is automatically cleared after 30 seconds of inactivity and immediately when the app is backgrounded
- **Encrypted Keeper Storage**: Keeper data (site tags and their settings) is stored encrypted with AES-256-GCM; the device key lives in the platform secure storage (Android Keystore)
- **Clipboard Hygiene**: The clipboard is automatically cleared 30 seconds after a password or keeper data is copied
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

On first launch, legacy plaintext keeper data is migrated transparently into the encrypted storage format (a versioned envelope: the first byte distinguishes legacy JSON/text from AES-GCM v1 ciphertext).

## Project Structure

```
passhash-mobile/
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
│   │   ├── status-colors.ts        # Shared status message colors
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

Local signed AAB build (requires `.env` with `ANDROID_KEYSTORE_PASSWORD`, see
`scripts/build-android-release.sh`):

```bash
npm run android:release
```

### Google Play upload

The `release-android` GitHub Actions workflow (manual `workflow_dispatch` trigger)
builds the signed AAB, validates it with bundletool and uploads it via fastlane as a
**draft** release on the production track. Publishing is done manually in Play Console.

Release notes come from `fastlane/metadata/android/<locale>/changelogs/default.txt`
(locales: en-US, ru-RU, de-DE) — edit them before triggering the workflow; the workflow
copies them to `<versionCode>.txt` for the build being uploaded. Google Play accepts at
most 500 characters per locale, so keep each file under that limit.

Required GitHub secrets:

| Secret                            | Content                                                           |
| --------------------------------- | ----------------------------------------------------------------- |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | JSON key of a Google Play service account with release permission |
| `KEYSTORE_BASE64`                 | `base64 -i upload.keystore` of the registered upload keystore     |
| `KEYSTORE_ALIAS`                  | key alias inside the keystore                                     |
| `ANDROID_KEYSTORE_PASSWORD`       | keystore/key password                                             |

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

1. Run `npm test` — the golden-vector tests verify password generation for known combinations against the upstream algorithm
2. Build and test the application on a device

## Testing & Quality

```bash
npm run typecheck   # TypeScript strict check
npm run lint        # ESLint
npm run format:check # Prettier
npm test            # Unit tests (jest), including golden vectors for the algorithm
npm run test:e2e    # Maestro e2e on Android emulator/device (happy path, vectors, relaunch, Qt migration)
npm run test:e2e:release # smoke flow against the release APK
```

## License

The application's own code is released under the MIT License (see `LICENSE`).

The password hashing algorithm is based on the original Password Hasher extension by Steve Cooper:

- MPL 1.1 / GPL 2.0 / LGPL 2.1

The SHA1 implementation:

- BSD License (Paul Johnston)

The public suffix list (if used):

- MPL 2.0

## Links

[iOS](https://apps.apple.com/us/app/password-hasher/id1565669128) | [Android](https://play.google.com/store/apps/details?id=ru.co_dev.passhash)
