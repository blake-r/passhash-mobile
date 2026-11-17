// keeper.ts - Keeper data utilities (pure functions, no module state)
// Based on QtQuick utils-keeper.js from the original project
// This module maintains compatibility with the QtQuick storage format

import { SiteObj, createSiteObj, toString } from "./site-tag";

export interface KeepObj extends SiteObj {
  path: string[];
  settings: KeeperSettings;
}

export interface KeeperSettings {
  digits: boolean | null;
  punctuation: boolean | null;
  mixedCase: boolean | null;
  special: boolean | null;
  digitsOnly: boolean | null;
  length: number | null;
  [key: string]: boolean | number | null;
}

const SETTING_CODES = new Map<string, keyof KeeperSettings>([
  ["D", "digits"],
  ["P", "punctuation"],
  ["M", "mixedCase"],
  ["S", "special"],
  ["O", "digitsOnly"],
]);

function createKeepObj(siteTag: string, settings: KeeperSettings): KeepObj {
  const keepObj = createSiteObj(siteTag) as KeepObj;
  keepObj.path = keepObj.tag.split(".");
  keepObj.settings = settings;
  return keepObj;
}

export function parseKeeperText(keeperTxt: string): Map<string, KeepObj> {
  const data = new Map<string, KeepObj>();
  keeperTxt.split("\n").forEach(function (line) {
    line = line.trim();
    if (!line.length) {
      return;
    }
    const keepObj = parseKeeperRecord(line);
    data.set(keepObj.tag, keepObj);
  });
  return data;
}

export function upsertSiteTag(
  data: Map<string, KeepObj>,
  siteTag: string,
  settings: KeeperSettings,
): Map<string, KeepObj> {
  const next = new Map(data);
  const keepObj = createKeepObj(siteTag, settings);
  next.set(keepObj.tag, keepObj);
  return next;
}

function parseKeeperRecord(record: string): KeepObj {
  // Example: "google=DpMso8"
  const array = record.split("=");
  const settingsString = array.length > 1 ? array.pop()! : "";
  const settings = parseKeeperSettings(settingsString);
  return createKeepObj(array.join(" "), settings);
}

export function parseKeeperSettings(str: string): KeeperSettings {
  const result: KeeperSettings = {
    digits: null,
    punctuation: null,
    mixedCase: null,
    special: null,
    digitsOnly: null,
    length: null,
  };
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    const charUpper = char.toUpperCase();
    const key = SETTING_CODES.get(charUpper);
    if (key === undefined) {
      if (char >= "0" && char <= "9") {
        length = length * 10 + parseInt(char);
      } else {
        console.warn('Symbol "' + char + '" is not a setting code');
      }
    } else {
      result[key] = (char === charUpper) as boolean | null;
    }
  }
  length -= length % 2; // Hash word length should be aligned to 2
  result.length = length > 0 ? length : null;
  return result;
}

export function serializeKeeperData(data: Map<string, KeepObj>): string {
  const result: string[] = [];
  data.forEach(function (keepObj) {
    const siteTag = toString(keepObj);
    const settingsString = makeSettingsText(keepObj.settings);
    const record = [siteTag, settingsString].join("=");
    result.push(record);
  });
  result.sort();
  return result.join("\n");
}

function makeSettingsText(settings: KeeperSettings): string {
  const result: string[] = [];
  SETTING_CODES.forEach(function (key, char) {
    const value = ifnull(settings[key as keyof KeeperSettings], null);
    if (value !== null) {
      result.push(value ? char : char.toLowerCase());
    }
  });
  if (typeof settings.length === "number") {
    result.push(settings.length.toString());
  }
  return result.join("");
}

/**
 * Validates that a text looks like keeper data: every non-empty line is
 * "<site tag>=<setting codes>" where codes are D/P/M/S/O letters and digits.
 */
export function isValidKeeperText(keeperTxt: string): boolean {
  const lines = keeperTxt
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.length > 0 && lines.every((line) => /^[^=]+=[dDpPmMsSoO0-9]*$/.test(line));
}

export function ifnull<T>(value: T | null | undefined, defval: T): T {
  if (value === null || value === undefined) {
    return defval;
  }
  return value;
}
