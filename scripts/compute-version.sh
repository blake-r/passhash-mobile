#!/bin/bash
# Compute application version based on date and git commit count
# Mirrors Qt project versioning scheme (passhash-mobile.pro):
#
# Android:
#   VERSION_NAME = date +%Y.%m.%d
#   VERSION_CODE = date +%y%m%d + git_commit_count (2 digits)
#
# iOS:
#   VERSION = date +%Y.%m.%d + git_commit_count (2 digits)
#
# Usage: ./scripts/compute-version.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Compute version components (same as Qt project)
VERSION_NAME=$(date +%Y.%m.%d)
COMMIT_COUNT=$(git -C "$PROJECT_ROOT" log --oneline 2>/dev/null | wc -l | tr -d ' ')
COMMIT_COUNT=$((COMMIT_COUNT % 100))
VERSION_IOS="${VERSION_NAME}${COMMIT_COUNT}"

COMMIT_COUNT_PADDED=$(printf "%02d" "$COMMIT_COUNT")
VERSION_CODE=$(date +%y%m%d)${COMMIT_COUNT_PADDED}

# Output version info (parsed by withVersion.js plugin)
echo "VERSION_NAME: $VERSION_NAME"
echo "VERSION_CODE: $VERSION_CODE"
echo "VERSION_IOS: $VERSION_IOS"
