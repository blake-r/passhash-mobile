#!/usr/bin/env bash
# Runs the Maestro e2e suite on an Android emulator (or connected device).
#
# Usage:
#   scripts/test-e2e.sh [--release] [--build] [--flow <file>] [--update-maestro]
#
#   --release        run only the smoke flow against the release APK
#   --build          force rebuild + reinstall of the debug app before testing
#   --flow <file>    run a single flow instead of the whole suite
#   --update-maestro re-download the Maestro CLI
#
# Environment discovery (first match wins):
#   JAVA_HOME         $JAVA_HOME -> ~/Projects/sdks/jdk-*/Contents/Home -> /usr/libexec/java_home
#   Android SDK       $ANDROID_SDK_ROOT/$ANDROID_HOME -> ~/Projects/tools/android-sdk -> ~/Library/Android/sdk
#   Maestro CLI       maestro/bin/maestro (installed by scripts/install-maestro.sh)

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

APP_ID="ru.co_dev.passhash"
AVD_NAME="phone_x86_64"
MODE="debug"
FORCE_BUILD=0
SINGLE_FLOW=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --release) MODE="release"; shift ;;
    --build) FORCE_BUILD=1; shift ;;
    --flow) SINGLE_FLOW="$2"; shift 2 ;;
    --update-maestro) scripts/install-maestro.sh --force; shift ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

# --- Java -------------------------------------------------------------------
if [[ -z "${JAVA_HOME:-}" || ! -x "${JAVA_HOME:-}/bin/java" ]]; then
  for candidate in "$HOME"/Projects/sdks/jdk-*/Contents/Home; do
    [[ -x "$candidate/bin/java" ]] && JAVA_HOME="$candidate"
  done
fi
if [[ -z "${JAVA_HOME:-}" || ! -x "${JAVA_HOME:-}/bin/java" ]]; then
  JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null || true)"
fi
if [[ -z "${JAVA_HOME:-}" ]]; then
  echo "Error: no JDK found. Install Temurin 17 into ~/Projects/sdks/ or set JAVA_HOME." >&2
  exit 1
fi
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"
echo "JAVA_HOME: $JAVA_HOME"

# --- Android SDK --------------------------------------------------------------
SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
if [[ -z "$SDK" || ! -d "$SDK/platform-tools" ]]; then
  for candidate in "$HOME/Projects/sdks/android-sdk" "$HOME/Library/Android/sdk"; do
    [[ -d "$candidate/platform-tools" ]] && SDK="$candidate"
  done
fi
if [[ -z "$SDK" || ! -d "$SDK/platform-tools" ]]; then
  echo "Error: Android SDK not found. Set ANDROID_SDK_ROOT or install the SDK" >&2
  echo "       (expected at ~/Projects/tools/android-sdk or ~/Library/Android/sdk)." >&2
  exit 1
fi
export ANDROID_SDK_ROOT="$SDK"
ADB="$SDK/platform-tools/adb"
EMULATOR="$SDK/emulator/emulator"
echo "Android SDK: $SDK"

# --- Maestro CLI ----------------------------------------------------------------
MAESTRO="$PROJECT_ROOT/maestro/bin/maestro"
if [[ ! -x "$MAESTRO" ]]; then
  scripts/install-maestro.sh
fi

# --- Build (no device needed) ------------------------------------------------------
APK=""
if [[ "$MODE" == "release" ]]; then
  if [[ -f .env ]]; then
    set -a; source .env; set +a
  fi
  # Signing via environment (see plugins/withReleaseSigning.js)
  export KEYSTORE_STORE_PASSWORD="${KEYSTORE_STORE_PASSWORD:-${ANDROID_KEYSTORE_PASSWORD:-}}"
  export KEYSTORE_KEY_PASSWORD="${KEYSTORE_KEY_PASSWORD:-$KEYSTORE_STORE_PASSWORD}"
  export KEYSTORE_PATH KEYSTORE_ALIAS
  echo "Prebuilding native project and assembling release APK..."
  npx expo prebuild --platform android
  # Signing env must reach the JVM: a reused Gradle daemon keeps its original
  # environment, so restart it before building with signing credentials.
  (cd android && ./gradlew --stop >/dev/null 2>&1; ./gradlew app:assembleRelease -x lint -x test)
  APK="android/app/build/outputs/apk/release/app-release.apk"
else
  APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
  if [[ "$FORCE_BUILD" == "1" || ! -d android || ! -f "$APK_PATH" ]]; then
    echo "Prebuilding native project and assembling debug APK..."
    npx expo prebuild --platform android
    (cd android && ./gradlew app:assembleDebug -x lint -x test --configure-on-demand --build-cache)
  fi
  APK="$APK_PATH"
fi

# --- Device (boot the emulator only after the build) --------------------------------
if [[ -z "$("$ADB" devices | awk 'NR>1 && $2=="device" {print $1}')" ]]; then
  if [[ ! -x "$EMULATOR" ]]; then
    echo "Error: no device connected and emulator binary not found at $EMULATOR" >&2
    exit 1
  fi
  echo "No device online, booting emulator $AVD_NAME..."
  "$EMULATOR" -avd "$AVD_NAME" -no-snapshot-save >/dev/null 2>&1 &
  "$ADB" wait-for-device
  until [[ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]; do
    sleep 2
  done
  echo "Emulator booted."
fi
"$ADB" devices

# Quiet down emulator first-run intrusions that steal taps/input during flows
"$ADB" shell settings put secure stylus_handwriting_enabled 0 2>/dev/null || true

echo "Installing $APK..."
if [[ "$MODE" == "release" ]]; then
  # Release (upload key) and debug signatures differ — replace the package
  "$ADB" uninstall "$APP_ID" >/dev/null 2>&1 || true
fi
"$ADB" install -r "$APK"

# --- Metro (debug builds load the JS bundle from the dev server) -----------------
METRO_PID=""
if [[ "$MODE" == "debug" ]]; then
  if ! curl -sf "http://localhost:8081/status" >/dev/null 2>&1; then
    echo "Starting Metro dev server..."
    EXPO_PUBLIC_DISABLE_LOGBOX=1 npx expo start --port 8081 >/tmp/passhash-metro.log 2>&1 &
    METRO_PID=$!
    trap '[[ -n "$METRO_PID" ]] && kill "$METRO_PID" 2>/dev/null || true' EXIT
    until curl -sf "http://localhost:8081/status" >/dev/null 2>&1; do
      sleep 1
    done
  fi
  echo "Metro is up."
fi

# --- Flows ------------------------------------------------------------------------
run_migration_flow() {
  echo "Preparing Qt migration fixture..."
  "$ADB" shell "pm clear $APP_ID"
  "$ADB" shell "run-as $APP_ID mkdir -p 'files/.config/Oleg Blednov'"
  "$ADB" push maestro/fixtures/qt-settings.conf /data/local/tmp/qt-settings.conf >/dev/null
  "$ADB" shell "run-as $APP_ID cp /data/local/tmp/qt-settings.conf 'files/.config/Oleg Blednov/Password Hasher.conf'"
  "$ADB" shell rm /data/local/tmp/qt-settings.conf
  "$MAESTRO" test maestro/flows/04-qt-migration.yaml
}

if [[ -n "$SINGLE_FLOW" ]]; then
  if [[ "$SINGLE_FLOW" == *04-qt-migration* ]]; then
    run_migration_flow
  else
    "$MAESTRO" test "$SINGLE_FLOW"
  fi
elif [[ "$MODE" == "release" ]]; then
  "$MAESTRO" test --include-tags smoke maestro/flows/05-release-smoke.yaml
else
  run_migration_flow
  "$MAESTRO" test --include-tags core maestro/flows/
fi

echo "E2E suite finished."
