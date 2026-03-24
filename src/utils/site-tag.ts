// utils-site-tag.ts - Site tag utilities
// Based on QtQuick utils-site-tag.js from the original project

export interface SiteObj {
  tag: string;
  ver: number;
}

function toString(siteObj: SiteObj): string {
  if (isNaN(siteObj.ver)) {
    return siteObj.tag;
  }
  return [siteObj.tag, siteObj.ver].join(":");
}

function createSiteObj(siteTag: string): SiteObj {
  const array = siteTag.split(":");
  const lastIdx = array.length - 1;
  const version = lastIdx > 0 ? parseInt(array[lastIdx]) : NaN;
  if (!isNaN(version)) {
    array.pop();
  }
  const tag = array.join(":");
  return {
    tag,
    ver: version,
  };
}

export { toString, createSiteObj };
