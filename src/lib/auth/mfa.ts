import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual, webcrypto } from "node:crypto";
import { siteConfig } from "@/lib/config/site";

const MFA_ISSUER = siteConfig.brandName;
const MFA_DIGITS = 6;
const MFA_PERIOD_SECONDS = 30;
const MFA_WINDOW = 1;
const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_SEGMENT_LENGTH = 4;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function getMfaEncryptionKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return createHash("sha256").update(`${secret}:mfa-encryption`).digest();
}

function normalizeBase32(input: string) {
  return input.toUpperCase().replace(/[^A-Z2-7]/g, "");
}

export function generateTotpSecret(length = 20) {
  const bytes = randomBytes(length);
  let output = "";
  let value = 0;
  let bits = 0;

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function decodeBase32(secret: string) {
  const normalized = normalizeBase32(secret);
  let value = 0;
  let bits = 0;
  const bytes: number[] = [];

  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);

    if (index === -1) {
      continue;
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

async function generateTotpCode(secret: string, counter: number) {
  const keyBytes = decodeBase32(secret);
  const cryptoKey = await webcrypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, counter, false);

  const signature = new Uint8Array(await webcrypto.subtle.sign("HMAC", cryptoKey, buffer));
  const offset = signature[signature.length - 1] & 15;
  const binary =
    ((signature[offset] & 127) << 24) |
    ((signature[offset + 1] & 255) << 16) |
    ((signature[offset + 2] & 255) << 8) |
    (signature[offset + 3] & 255);

  return String(binary % 10 ** MFA_DIGITS).padStart(MFA_DIGITS, "0");
}

function normalizeToken(token: string) {
  return token.replace(/\s+/g, "").replace(/-/g, "");
}

export async function verifyTotpToken(secret: string, token: string) {
  const normalizedToken = normalizeToken(token);

  if (!/^\d{6}$/.test(normalizedToken)) {
    return false;
  }

  const nowCounter = Math.floor(Date.now() / 1000 / MFA_PERIOD_SECONDS);

  for (let offset = -MFA_WINDOW; offset <= MFA_WINDOW; offset += 1) {
    const candidate = await generateTotpCode(secret, nowCounter + offset);

    if (timingSafeEqual(Buffer.from(candidate), Buffer.from(normalizedToken))) {
      return true;
    }
  }

  return false;
}

export function buildTotpOtpAuthUrl(secret: string, email: string) {
  const issuer = encodeURIComponent(MFA_ISSUER);
  const label = encodeURIComponent(`${MFA_ISSUER}:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${MFA_DIGITS}&period=${MFA_PERIOD_SECONDS}`;
}

export function encryptMfaSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getMfaEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

export function decryptMfaSecret(payload: string) {
  const packed = Buffer.from(payload, "base64url");
  const iv = packed.subarray(0, 12);
  const tag = packed.subarray(12, 28);
  const ciphertext = packed.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getMfaEncryptionKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function generateRecoveryCodes() {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () =>
    randomBytes(RECOVERY_CODE_SEGMENT_LENGTH)
      .toString("hex")
      .slice(0, RECOVERY_CODE_SEGMENT_LENGTH * 2)
      .match(/.{1,4}/g)
      ?.join("-")
      .toUpperCase() ?? "0000-0000",
  );
}

export function normalizeRecoveryCode(code: string) {
  return code.trim().toUpperCase();
}
