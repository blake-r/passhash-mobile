#!/bin/bash

# Script to update algorithm files from GitHub
# Reads version from scripts/algorithm-version.txt

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VERSION_FILE="$SCRIPT_DIR/algorithm-version.txt"

# Read version from file
if [ ! -f "$VERSION_FILE" ]; then
    echo "Error: Version file not found: $VERSION_FILE"
    exit 1
fi

VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')

if [ -z "$VERSION" ]; then
    echo "Error: Version file is empty"
    exit 1
fi

echo "Updating algorithms from GitHub (version: $VERSION)..."

# Download algorithm files
GITHUB_BASE="https://raw.githubusercontent.com/blake-r/pawhash/$VERSION"
FILES=("sha1.js" "passhash.js")

for FILE in "${FILES[@]}"; do
    echo "Downloading $FILE..."
    curl -L "$GITHUB_BASE/$FILE" -o "$PROJECT_ROOT/src/algorithms/$FILE"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to download $FILE"
        exit 1
    fi
done

# Apply patches for ES module imports
echo "Applying patches for ES module imports..."
cd "$PROJECT_ROOT/src/algorithms"
patch -p1 < "$SCRIPT_DIR/patches/sha1.patch"
patch -p1 < "$SCRIPT_DIR/patches/passhash.patch"

echo "Algorithm files updated from GitHub ($VERSION)"
