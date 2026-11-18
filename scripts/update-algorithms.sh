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

# Verify checksums of the downloaded (unpatched) files
CHECKSUM_FILE="$SCRIPT_DIR/algorithm-checksums.txt"
if [ -f "$CHECKSUM_FILE" ]; then
    echo "Verifying checksums..."
    cd "$PROJECT_ROOT/src/algorithms"
    if command -v shasum >/dev/null 2>&1; then
        shasum -a 256 -c "$CHECKSUM_FILE" || { echo "Error: checksum mismatch — refusing to apply patches"; exit 1; }
    else
        sha256sum -c "$CHECKSUM_FILE" || { echo "Error: checksum mismatch — refusing to apply patches"; exit 1; }
    fi
    cd "$PROJECT_ROOT"
else
    echo "Warning: no checksum file at $CHECKSUM_FILE — skipping integrity verification"
fi

# Apply patches for ES module imports
echo "Applying patches for ES module imports..."
cd "$PROJECT_ROOT/src/algorithms"
patch -p1 < "$SCRIPT_DIR/patches/sha1.patch"
patch -p1 < "$SCRIPT_DIR/patches/passhash.patch"

echo "Algorithm files updated from GitHub ($VERSION)"

# Verify behavior against the pinned golden vectors
if [ -d "$PROJECT_ROOT/node_modules" ]; then
    echo "Running golden-vector tests..."
    cd "$PROJECT_ROOT"
    npx jest src/algorithms --silent || { echo "Error: golden-vector tests failed after algorithm update"; exit 1; }
else
    echo "Warning: node_modules not installed — run 'npm test' to verify the golden vectors"
fi
