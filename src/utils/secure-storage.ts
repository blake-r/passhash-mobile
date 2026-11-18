// secure-storage.ts - Encrypted envelope for keeper data at rest.
//
// Envelope format (stored as a plain string in AsyncStorage):
//   "v1:<iv>:<tag>:<content>"  - AES-256-GCM, all parts base64
//   anything else              - legacy plaintext, read as-is and migrated on next save
//
// The random device key lives in the platform secure storage (Android Keystore /
// iOS Keychain) via expo-secure-store. On web (Playwright e2e) there is no secure
// storage, so the envelope is transparently disabled and data stays plaintext.

import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AesGcmCrypto from "react-native-aes-gcm-crypto";

const ENVELOPE_PREFIX = "v1:";
const KEY_ALIAS = "keeper-encryption-key";

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triplet = (a << 16) | (b << 8) | c;
    result += BASE64_ALPHABET[(triplet >> 18) & 63];
    result += BASE64_ALPHABET[(triplet >> 12) & 63];
    result += i + 1 < bytes.length ? BASE64_ALPHABET[(triplet >> 6) & 63] : "=";
    result += i + 2 < bytes.length ? BASE64_ALPHABET[triplet & 63] : "=";
  }
  return result;
}

export function isEncryptionAvailable(): boolean {
  return Platform.OS !== "web";
}

export function isEncryptedEnvelope(value: string): boolean {
  return value.startsWith(ENVELOPE_PREFIX);
}

async function getOrCreateKeyBase64(): Promise<string> {
  const existing = await SecureStore.getItemAsync(KEY_ALIAS);
  if (existing) {
    return existing;
  }
  const key = bytesToBase64(await Crypto.getRandomBytesAsync(32));
  await SecureStore.setItemAsync(KEY_ALIAS, key, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}

export async function encryptKeeperData(plainText: string): Promise<string> {
  if (!isEncryptionAvailable() || plainText.length === 0) {
    return plainText;
  }
  const key = await getOrCreateKeyBase64();
  const { iv, tag, content } = await AesGcmCrypto.encrypt(plainText, false, key);
  return `${ENVELOPE_PREFIX}${iv}:${tag}:${content}`;
}

/**
 * Decrypts an envelope; legacy plaintext passes through unchanged so callers
 * can treat the migration as transparent (re-save to upgrade the format).
 */
export async function decryptKeeperData(stored: string): Promise<string> {
  if (!isEncryptedEnvelope(stored)) {
    return stored;
  }
  const parts = stored.split(":");
  if (parts.length !== 4) {
    throw new Error("Malformed encrypted keeper envelope");
  }
  const [, iv, tag, content] = parts;
  const key = await getOrCreateKeyBase64();
  return AesGcmCrypto.decrypt(content, key, iv, tag, false);
}
