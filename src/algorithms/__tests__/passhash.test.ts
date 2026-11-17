// Golden-vector tests for the password hash algorithm.
// Vectors are pinned against the upstream PawHash algorithm; they must not change
// unless the upstream algorithm itself changes (see scripts/update-algorithms.sh).

import { PassHashCommon } from "../passhash";

interface GoldenCase {
  siteTag: string;
  masterKey: string;
  size: number;
  requireDigit: boolean;
  requirePunctuation: boolean;
  requireMixedCase: boolean;
  restrictSpecial: boolean;
  restrictDigits: boolean;
  expected: string;
}

const GOLDEN_CASES: GoldenCase[] = [
  {
    siteTag: "google",
    masterKey: "masterkey",
    size: 8,
    requireDigit: true,
    requirePunctuation: true,
    requireMixedCase: true,
    restrictSpecial: false,
    restrictDigits: false,
    expected: "BnP1/mXc",
  },
  {
    siteTag: "google",
    masterKey: "masterkey",
    size: 16,
    requireDigit: true,
    requirePunctuation: true,
    requireMixedCase: true,
    restrictSpecial: false,
    restrictDigits: false,
    expected: "BnPRUmXcrN4+JN7u",
  },
  {
    siteTag: "example.com",
    masterKey: "correct horse battery staple",
    size: 12,
    requireDigit: true,
    requirePunctuation: true,
    requireMixedCase: true,
    restrictSpecial: false,
    restrictDigits: false,
    expected: "Ci8#nUrqzvvB",
  },
  {
    siteTag: "github",
    masterKey: "p@ssw0rd!",
    size: 10,
    requireDigit: true,
    requirePunctuation: false,
    requireMixedCase: true,
    restrictSpecial: true,
    restrictDigits: false,
    expected: "R5BNms9GPg",
  },
  {
    siteTag: "bank:2",
    masterKey: "masterkey",
    size: 14,
    requireDigit: false,
    requirePunctuation: false,
    requireMixedCase: false,
    restrictSpecial: false,
    restrictDigits: true,
    expected: "81340924249651",
  },
  {
    siteTag: "site",
    masterKey: "key",
    size: 4,
    requireDigit: true,
    requirePunctuation: true,
    requireMixedCase: true,
    restrictSpecial: false,
    restrictDigits: false,
    expected: ")Jd3",
  },
  {
    siteTag: "site",
    masterKey: "key",
    size: 26,
    requireDigit: true,
    requirePunctuation: true,
    requireMixedCase: true,
    restrictSpecial: false,
    restrictDigits: false,
    expected: "LXRLAHJhmWnx+5Hj6/1bZegQvb",
  },
  {
    siteTag: "xn--80a",
    masterKey: "юникод",
    size: 8,
    requireDigit: true,
    requirePunctuation: true,
    requireMixedCase: true,
    restrictSpecial: false,
    restrictDigits: false,
    expected: '"44T1xKY',
  },
];

describe("PassHashCommon.generateHashWord golden vectors", () => {
  it.each(GOLDEN_CASES)(
    "$siteTag / $masterKey (size $size) => $expected",
    ({
      siteTag,
      masterKey,
      size,
      requireDigit,
      requirePunctuation,
      requireMixedCase,
      restrictSpecial,
      restrictDigits,
      expected,
    }) => {
      expect(
        PassHashCommon.generateHashWord(
          siteTag,
          masterKey,
          size,
          requireDigit,
          requirePunctuation,
          requireMixedCase,
          restrictSpecial,
          restrictDigits,
        ),
      ).toBe(expected);
    },
  );
});

describe("PassHashCommon.generateHashWord invariants", () => {
  it("is deterministic", () => {
    const first = PassHashCommon.generateHashWord("google", "key", 8, true, true, true, false, false);
    const second = PassHashCommon.generateHashWord("google", "key", 8, true, true, true, false, false);
    expect(first).toBe(second);
  });

  it("produces output of the requested size", () => {
    for (const size of [4, 8, 12, 16, 26]) {
      expect(PassHashCommon.generateHashWord("google", "key", size, true, true, true, false, false)).toHaveLength(size);
    }
  });

  it("produces digits only when restrictDigits is set", () => {
    const result = PassHashCommon.generateHashWord("google", "key", 12, true, true, true, false, true);
    expect(result).toMatch(/^\d+$/);
  });

  it("contains no punctuation when restrictSpecial is set", () => {
    const result = PassHashCommon.generateHashWord("google", "key", 12, true, true, true, true, false);
    expect(result).toMatch(/^[A-Za-z0-9]+$/);
  });
});
