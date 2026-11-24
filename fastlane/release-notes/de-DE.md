# Release notes (de-DE)

Neuester Abschnitt oben. `scripts/release-notes.js` übernimmt den ersten Abschnitt und
schreibt ihn nach `fastlane/metadata/android/de-DE/changelogs/`. Pro Abschnitt höchstens
500 Zeichen.

## 2026-11-24

Erste Version.

- Ein Master-Schlüssel, ein eigenes Passwort für jede Seite: gleiche Eingabe ergibt dasselbe Passwort, kompatibel mit PawHash und Firefox Password Hasher.
- Der Keeper speichert Seiten-Tags und Einstellungen verschlüsselt (AES-256-GCM, Schlüssel im Android Keystore).
- Der Master-Schlüssel wird im Hintergrund gelöscht; die Zwischenablage leert sich nach 30 Sekunden.
- Neues Design: neues App-Icon sowie dunkles und helles Theme.
- Englisch, Russisch und Deutsch.
