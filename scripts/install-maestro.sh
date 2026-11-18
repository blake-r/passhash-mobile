#!/usr/bin/env bash
# Downloads and unpacks the Maestro CLI into maestro/ (bin/ + lib/).
# Both directories are git-ignored; flows and fixtures stay in the repo.
#
# Usage: scripts/install-maestro.sh [--force]
#   --force   re-download even if maestro/bin/maestro already exists

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAESTRO_DIR="$PROJECT_ROOT/maestro"
MAESTRO_BIN="$MAESTRO_DIR/bin/maestro"
DOWNLOAD_URL="https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip"

if [[ "${1:-}" == "--force" ]]; then
  rm -rf "$MAESTRO_DIR/bin" "$MAESTRO_DIR/lib"
fi

if [[ -x "$MAESTRO_BIN" ]]; then
  echo "Maestro already installed: $("$MAESTRO_BIN" --version 2>/dev/null || echo 'version unknown')"
  exit 0
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Downloading Maestro CLI..."
curl -fSL --retry 3 -o "$TMP_DIR/maestro.zip" "$DOWNLOAD_URL"

echo "Unpacking..."
unzip -q "$TMP_DIR/maestro.zip" -d "$TMP_DIR/extract"

mkdir -p "$MAESTRO_DIR"
rm -rf "$MAESTRO_DIR/bin" "$MAESTRO_DIR/lib"
cp -R "$TMP_DIR/extract/maestro/bin" "$MAESTRO_DIR/bin"
cp -R "$TMP_DIR/extract/maestro/lib" "$MAESTRO_DIR/lib"
chmod +x "$MAESTRO_BIN"

echo "Maestro installed to $MAESTRO_DIR"
"$MAESTRO_BIN" --version || echo "(version check needs JAVA_HOME — see scripts/test-e2e.sh)"
