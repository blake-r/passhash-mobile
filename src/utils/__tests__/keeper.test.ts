import {
  parseKeeperText,
  serializeKeeperData,
  upsertSiteTag,
  parseKeeperSettings,
  isValidKeeperText,
  KeeperSettings,
} from "../keeper";

describe("parseKeeperSettings", () => {
  it("parses uppercase codes as true and lowercase as false", () => {
    expect(parseKeeperSettings("DpMso")).toEqual({
      digits: true,
      punctuation: false,
      mixedCase: true,
      special: false,
      digitsOnly: false,
      length: null,
    });
  });

  it("parses the trailing length and aligns it to an even number", () => {
    expect(parseKeeperSettings("D8").length).toBe(8);
    expect(parseKeeperSettings("D9").length).toBe(8);
    expect(parseKeeperSettings("D16").length).toBe(16);
  });

  it("returns nulls for an empty string", () => {
    expect(parseKeeperSettings("")).toEqual({
      digits: null,
      punctuation: null,
      mixedCase: null,
      special: null,
      digitsOnly: null,
      length: null,
    });
  });
});

describe("isValidKeeperText", () => {
  it("accepts valid keeper text", () => {
    expect(isValidKeeperText("google=DPM8")).toBe(true);
    expect(isValidKeeperText("google=DPM8\nbank:2=dO16")).toBe(true);
    expect(isValidKeeperText("google=")).toBe(true);
  });

  it("rejects empty and whitespace-only input", () => {
    expect(isValidKeeperText("")).toBe(false);
    expect(isValidKeeperText("   \n  ")).toBe(false);
  });

  it("rejects arbitrary text", () => {
    expect(isValidKeeperText("hello world")).toBe(false);
    expect(isValidKeeperText('{"json": true}')).toBe(false);
    expect(isValidKeeperText("google=D8\nnot a record")).toBe(false);
  });
});

describe("parseKeeperText", () => {
  it("loads records in the legacy text format", () => {
    const data = parseKeeperText("google=DPM8\nbank:2=dO16");
    expect(data.size).toBe(2);
    expect(data.get("google")?.settings).toMatchObject({
      digits: true,
      punctuation: true,
      mixedCase: true,
      length: 8,
    });
    expect(data.get("bank")?.settings).toMatchObject({ digits: false, digitsOnly: true, length: 16 });
  });

  it("ignores empty lines", () => {
    expect(parseKeeperText("google=D8\n\n   \nbank=P").size).toBe(2);
  });
});

describe("upsertSiteTag + serializeKeeperData", () => {
  const settings: KeeperSettings = {
    digits: true,
    punctuation: false,
    mixedCase: true,
    special: true,
    digitsOnly: false,
    length: 8,
  };

  it("serializes a stored site tag back to the legacy text format", () => {
    const data = upsertSiteTag(new Map(), "google", settings);
    expect(serializeKeeperData(data)).toBe("google=DpMSo8");
  });

  it("does not mutate the input map", () => {
    const original = parseKeeperText("bank=D8");
    upsertSiteTag(original, "google", settings);
    expect(original.size).toBe(1);
  });

  it("round-trips through serialize + parse", () => {
    let data = upsertSiteTag(new Map(), "bank", {
      digits: false,
      punctuation: true,
      mixedCase: null,
      special: null,
      digitsOnly: true,
      length: 12,
    });
    data = upsertSiteTag(data, "google", { ...settings, digits: true });
    data = upsertSiteTag(data, "mail", settings);

    const parsed = parseKeeperText(serializeKeeperData(data));
    expect(parsed.size).toBe(3);
    expect(parsed.get("google")?.settings.digits).toBe(true);
    expect(parsed.get("bank")?.settings.length).toBe(12);
    expect(parsed.get("mail")?.settings.digitsOnly).toBe(false);
  });

  it("sorts records alphabetically in the serialized output", () => {
    let data = upsertSiteTag(new Map(), "zebra", settings);
    data = upsertSiteTag(data, "alpha", settings);
    expect(
      serializeKeeperData(data)
        .split("\n")
        .map((line) => line.split("=")[0]),
    ).toEqual(["alpha", "zebra"]);
  });
});
