#!/usr/bin/env bash
# Generates the synthetic Qt QSettings INI fixture used by the Qt migration
# e2e flow. The output is committed as qt-settings.conf next to this script.
#
# Format follows Qt QSettings IniFormat on Android:
#   files/.config/<ORG>/<APP>.conf with [Section] key=value pairs,
#   newline escaped as literal \n, non-ASCII as \xNN hex sequences.

set -euo pipefail

OUT="$(dirname "$0")/qt-settings.conf"

cat > "$OUT" <<'EOF'
[Requirements]
digits=true
mixedCase=true
punctuation=true

[Restrictions]
digitsOnly=false
noSpecial=false
passwordLength=10

[Keeper]
data=example.com=DpMSo8\ngithub.com=Xy9Qw2\n\x43a\x43e\x448\x435\x43b\x435\x43a=Zz1Yy2
EOF

echo "Fixture written to $OUT"
