// utils-hinter.ts - Site tag hint utilities
// Based on QtQuick utils-hinter.js from the original project

import { getData, KeepObj } from "./keeper";
import { SiteObj } from "./site-tag";

function findHints(siteObj: SiteObj): KeepObj[] {
  const result: KeepObj[] = [];
  const fullTag: string = siteObj.tag;
  const parts: string[] = fullTag.split(".");

  // Show full match first
  findHintsForString(fullTag, result, compareExact);

  // Show part matches second
  parts.forEach(function (part: string): void {
    findHintsForString(part, result, compareExact);
  });

  // Show partial part matches at the end
  parts.forEach(function (part: string): void {
    findHintsForString(part, result, comparePartial);
  });

  return result;
}

function findHintsForString(
  str: string,
  inoutHints: KeepObj[],
  compFunc: (part: string, str: string) => boolean,
): void {
  if (!str.length) {
    return;
  }
  const DATA: KeepObj[] = Array.from(getData().values());
  DATA.forEach(function (keepObj: KeepObj): void {
    if (inoutHints.includes(keepObj)) {
      // Don't add a duplicate
      return;
    }
    for (const j in keepObj.path) {
      const part: string = keepObj.path[j];
      if (compFunc(part, str)) {
        inoutHints.push(keepObj);
        break;
      }
    }
  });
}

function compareExact(part: string, str: string): boolean {
  return part === str;
}

function comparePartial(part: string, str: string): boolean {
  return part.startsWith(str);
}

export { findHints };
