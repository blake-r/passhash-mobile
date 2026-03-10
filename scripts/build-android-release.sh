#!/bin/bash
# Build Android release AAB (Android App Bundle) with multi-ABI and 16k alignment for Google Play

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables from .env file
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
    echo "Loaded environment from .env"
fi

# Configuration
JAVA_HOME="${JAVA_HOME:-$HOME/projects/tools/jdk-17.0.13+11/Contents/Home}"
ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/projects/tools/android-sdk}"
KEYSTORE_PATH="${KEYSTORE_PATH:-$HOME/projects/QtProjects/android_release.keystore}"
KEYSTORE_ALIAS="${KEYSTORE_ALIAS:-oleg blednov}"

# Set up environment
export JAVA_HOME
export ANDROID_SDK_ROOT
export PATH="$JAVA_HOME/bin:$PATH"

# Get password from environment (same password for keystore and key alias)
KEYSTORE_PASSWORD="${ANDROID_KEYSTORE_PASSWORD:-}"
KEYSTORE_KEY_PASSWORD="${ANDROID_KEYSTORE_KEY_PASSWORD:-$KEYSTORE_PASSWORD}"

echo "=== Building Android Release AAB (multi-ABI, 16k aligned) ==="
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
echo "KEYSTORE_PATH: $KEYSTORE_PATH"
echo "KEYSTORE_ALIAS: $KEYSTORE_ALIAS"

# Verify Java
if [ ! -d "$JAVA_HOME" ]; then
    echo "Error: Java not found at $JAVA_HOME"
    exit 1
fi

# Check if keystore exists
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "Error: Keystore not found at $KEYSTORE_PATH"
    exit 1
fi

# Generate native Android project
echo "Generating native Android project..."
npx expo prebuild --platform android

# Update version in build.gradle
echo "Updating version in build.gradle..."
VERSION_CODE=$(bash "$SCRIPT_DIR/compute-version.sh" | grep "VERSION_CODE:" | awk '{print $2}')
VERSION_NAME=$(bash "$SCRIPT_DIR/compute-version.sh" | grep "VERSION_NAME:" | awk '{print $2}')
echo "VERSION_CODE=$VERSION_CODE, VERSION_NAME=$VERSION_NAME"

BUILD_GRADLE="$PROJECT_ROOT/android/app/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
  sed -i.bak -E "s/versionCode[[:space:]]+[0-9]+/versionCode ${VERSION_CODE}/" "$BUILD_GRADLE"
  sed -i.bak -E "s/versionName[[:space:]]+\"[^\"]+\"/versionName \"${VERSION_NAME}\"/" "$BUILD_GRADLE"
  rm -f "${BUILD_GRADLE}.bak"
  echo "✓ Updated build.gradle"
else
  echo "✗ build.gradle not found"
  exit 1
fi

# Build release AAB with multi-ABI and signing
echo "Building release AAB..."
cd android
./gradlew bundleRelease \
    -PreactNativeArchitectures=armeabi-v7a,arm64-v8a \
    -Pandroid.useAndroidX=true \
    -Pkeystore.path="$KEYSTORE_PATH" \
    -Pkeystore.alias="$KEYSTORE_ALIAS" \
    -Pkeystore.storePassword="$KEYSTORE_PASSWORD" \
    -Pkeystore.keyPassword="${KEYSTORE_KEY_PASSWORD:-$KEYSTORE_PASSWORD}"

cd ..

# Find AAB
AAB_PATH=$(find android -name "app-release.aab" -type f 2>/dev/null | head -n 1)

echo "=== Build complete ==="
if [ -n "$AAB_PATH" ]; then
    echo "AAB: $AAB_PATH"
    # Verify bundle with bundletool if available
    if command -v bundletool &> /dev/null; then
        if bundletool validate --bundle="$AAB_PATH" 2>/dev/null; then
            echo "✓ AAB is valid"
        else
            echo "Note: AAB validation failed or bundletool not configured"
        fi
    fi
else
    echo "AAB not found in expected location"
fi
