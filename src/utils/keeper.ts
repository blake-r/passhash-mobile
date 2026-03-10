// utils-keeper.ts - Keeper data utilities
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

const DATA = new Map<string, KeepObj>();

const SETTING_CODES = new Map<string, keyof KeeperSettings>([
  ["D", "digits"],
  ["P", "punctuation"],
  ["M", "mixedCase"],
  ["S", "special"],
  ["O", "digitsOnly"],
]);

let changeDataCallback: ((data: string) => void) | null = null;

function createKeepObj(siteTag: string, settings: KeeperSettings): KeepObj {
  const keepObj = createSiteObj(siteTag) as KeepObj;
  keepObj.path = keepObj.tag.split(".");
  keepObj.settings = settings;
  return keepObj;
}

export function setChangeDataCallback(callback: (data: string) => void): void {
  changeDataCallback = callback;
}

export function updateKeeperData(keeperTxt: string): void {
  DATA.clear();
  keeperTxt.split("\n").forEach(function (line) {
    line = line.trim();
    if (!line.length) {
      return;
    }
    const keepObj = parseKeeperRecord(line);
    DATA.set(keepObj.tag, keepObj);
  });
}

export function storeSiteTag(siteTag: string, settings: KeeperSettings): string {
  const keepObj = createKeepObj(siteTag, settings);
  DATA.set(keepObj.tag, keepObj);
  const keeperText = makeKeeperText();
  if (changeDataCallback) {
    changeDataCallback(keeperText);
  }
  return keeperText;
}

function parseKeeperRecord(record: string): KeepObj {
  // Example: "google DpMso8"
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

function makeKeeperText(): string {
  const result: string[] = [];
  DATA.forEach(function (keepObj) {
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

export function ifnull<T>(value: T | null | undefined, defval: T): T {
  if (value === null || value === undefined) {
    return defval;
  }
  return value;
}

export function getAllData(): Map<string, KeepObj> {
  return new Map(DATA);
}

export function getData(): Map<string, KeepObj> {
  return DATA;
}
