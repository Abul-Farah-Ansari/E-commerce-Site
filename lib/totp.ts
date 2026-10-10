
import "server-only";

import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const encryptionKeyHex = process.env.TOTP_ENCRYPTION_KEY;

function getEncryptionKey(): Buffer {
  if (!encryptionKeyHex || !/^[a-fA-F0-9]{64}$/.test(encryptionKeyHex)) {
    throw new Error(
      "TOTP_ENCRYPTION_KEY must be a 64-character hexadecimal key."
    );
  }

  return Buffer.from(encryptionKeyHex, "hex");
}

export function encryptTotpSecret(secret: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptTotpSecret(payload: string): string {
  const parts = payload.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted TOTP secret.");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  if (
    !/^[a-fA-F0-9]{24}$/.test(ivHex) ||
    !/^[a-fA-F0-9]{32}$/.test(authTagHex) ||
    !/^[a-fA-F0-9]+$/.test(encryptedHex) ||
    encryptedHex.length % 2 !== 0
  ) {
    throw new Error("Invalid encrypted TOTP secret format.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

export function verifyTotpCode(
  secret: string,
  code: string
): boolean {
  if (!/^\d{6}$/.test(code)) {
    return false;
  }

  const totp = new OTPAuth.TOTP({
    issuer: "House of Orive",
    label: "Admin",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  const delta = totp.validate({
    token: code,
    window: 1,
  });

  return delta !== null;
}

export async function generateTotpQrCode(
  secret: string,
  email: string
): Promise<string> {
  const totp = new OTPAuth.TOTP({
    issuer: "House of Orive",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return QRCode.toDataURL(totp.toString());
}
