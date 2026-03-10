// Type declarations for passhash.js (original Chrome extension file)
// Do not modify this file - it describes the original JavaScript implementation

export interface PassHashCommonInterface {
  generateHashWord(
    siteTag: string,
    masterKey: string,
    hashWordSize: number,
    requireDigit: boolean,
    requirePunctuation: boolean,
    requireMixedCase: boolean,
    restrictSpecial: boolean,
    restrictDigits: boolean,
  ): string;
  injectSpecialCharacter(
    sInput: string,
    offset: number,
    reserved: number,
    seed: number,
    lenOut: number,
    cStart: number,
    cNum: number,
  ): string;
  removeSpecialCharacters(sInput: string, seed: number, lenOut: number): string;
  convertToDigits(sInput: string, seed: number, lenOut: number): string;
}

export declare const PassHashCommon: PassHashCommonInterface;
