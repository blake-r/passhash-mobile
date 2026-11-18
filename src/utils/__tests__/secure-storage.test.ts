import AesGcmCrypto from "react-native-aes-gcm-crypto";

import { encryptKeeperData, decryptKeeperData, isEncryptedEnvelope } from "../secure-storage";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
}));

jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn(async () => new Uint8Array(32).fill(7)),
}));

jest.mock("react-native-aes-gcm-crypto", () => ({
  __esModule: true,
  default: {
    encrypt: jest.fn(async (plainText: string) => ({
      iv: "aXY=",
      tag: "dGFn",
      content: Buffer.from(plainText, "utf8").toString("base64"),
    })),
    decrypt: jest.fn(async (content: string) => Buffer.from(content, "base64").toString("utf8")),
  },
}));

describe("secure-storage envelope", () => {
  it("encrypts into a versioned v1 envelope", async () => {
    const envelope = await encryptKeeperData("google=D8");
    expect(envelope.startsWith("v1:")).toBe(true);
    expect(envelope).not.toContain("google");
    expect(isEncryptedEnvelope(envelope)).toBe(true);
    expect(AesGcmCrypto.encrypt).toHaveBeenCalledWith("google=D8", false, expect.any(String));
  });

  it("round-trips through encrypt + decrypt", async () => {
    const original = "google=DpMSo8\nbank:2=dO16";
    const envelope = await encryptKeeperData(original);
    await expect(decryptKeeperData(envelope)).resolves.toBe(original);
  });

  it("passes legacy plaintext through decrypt unchanged", async () => {
    await expect(decryptKeeperData("google=D8")).resolves.toBe("google=D8");
  });

  it("rejects a malformed envelope", async () => {
    await expect(decryptKeeperData("v1:onlytwo")).rejects.toThrow("Malformed");
  });

  it("does not treat legacy data as an envelope", () => {
    expect(isEncryptedEnvelope("google=D8")).toBe(false);
  });
});
