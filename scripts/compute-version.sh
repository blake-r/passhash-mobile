#!/bin/bash
# Compute application version based on date and git commit count
# Mirrors Qt project versioning scheme (passhash-mobile.pro):
#
# Android:
#   VERSION_NAME = date +%Y.%m.%d
#   VERSION_CODE = (date +%y%m%d) * 1000 + (git_commit_count % 1000)
#     - monotonic across days; up to 1000 distinct codes per day, no %100 collisions
#
# iOS:
#   VERSION = date +%Y.%m.%d + git_commit_count (3 digits, zero-padded)
#
# Usage: ./scripts/compute-version.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Compute version components
VERSION_NAME=$(date +%Y.%m.%d)
COMMIT_COUNT=$(git -C "$PROJECT_ROOT" log --oneline 2>/dev/null | wc -l | tr -d ' ')
COMMIT_SUFFIX=$((COMMIT_COUNT % 1000))
COMMIT_SUFFIX_PADDED=$(printf "%03d" "$COMMIT_SUFFIX")

VERSION_IOS="${VERSION_NAME}${COMMIT_SUFFIX_PADDED}"
VERSION_CODE=$(($(date +%y%m%d) * 1000 + COMMIT_SUFFIX))

# Output version info (parsed by withVersion.js plugin)
echo "VERSION_NAME: $VERSION_NAME"
echo "VERSION_CODE: $VERSION_CODE"
echo "VERSION_IOS: $VERSION_IOS"
