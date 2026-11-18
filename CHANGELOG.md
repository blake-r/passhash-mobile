# Changelog

## 2026-11-18

- Security: keeper data is now stored encrypted (AES-256-GCM envelope, device key in Android Keystore); legacy plaintext migrates transparently
- Security: master key and generated password are cleared immediately when the app is backgrounded (previously only after a 30s inactivity timer)
- Security: clipboard is auto-cleared 30 seconds after copying a password or exporting keeper data; keeper import validates clipboard content
- Quality: unit tests (jest) with pinned golden vectors for the hash algorithm, CI on GitHub Actions (typecheck/lint/prettier/jest), lefthook pre-commit hooks
- E2E: replaced Playwright (web) with Maestro on Android — happy path, reference-vector generation checks, persistence across relaunch, Qt settings migration with a synthetic fixture, release smoke; run locally via `npm run test:e2e` (CLI lives in git-ignored `maestro/bin`, installed by `scripts/install-maestro.sh`)
- Refactor: settings and keeper data moved to a zustand store; GeneratorScreen split (styles, hints logic extracted); unused components removed
- Fix: accessibility label of the master key visibility toggle; language flash at startup; package.json hygiene (npm/typescript/@types moved to dev)
- Build: monotonic Android versionCode (no %100 collisions); signing passwords no longer passed as visible -P gradle flags

## 2026-03-24

- Migrated from QtQuick (C++/QML) to React Native (TypeScript/Expo)
- Full algorithm compatibility preserved (PawHash, QtQuick, Firefox Password Hasher)
- Settings and Keeper data format unchanged for seamless migration
