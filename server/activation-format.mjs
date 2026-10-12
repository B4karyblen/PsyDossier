/**
 * Activation key format, shared by the server (verification) and scripts/licence.mjs (signing).
 *
 * A key is an Ed25519 signature, made with the publisher's private key, over
 * (licence reference, machine code, expiry). The app only holds the public key: it can check
 * a key but never produce one.
 *
 *   key bytes = [version=1][expiry day, uint16 BE, 0 = permanent][signature, 64 bytes]
 *   shown as base32 (RFC 4648, no padding) in groups of 6, e.g. AEAAA2-…
 */
import crypto from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const KEY_VERSION = 1;
const KEY_BYTES = 3 + 64;
const KEY_CHARS = Math.ceil((KEY_BYTES * 8) / 5);
const EPOCH = Date.UTC(2020, 0, 1);
const DAY_MS = 86_400_000;

/** @param {Uint8Array} bytes */
export function base32Encode(bytes) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = ((value << 8) | b) & 0xffff;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

/** @param {string} text  @returns {Uint8Array | null} */
export function base32Decode(text) {
  let bits = 0;
  let value = 0;
  const out = [];
  for (const c of text) {
    const i = ALPHABET.indexOf(c);
    if (i < 0) return null;
    value = ((value << 5) | i) & 0xffff;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Uint8Array.from(out);
}

const group = (s, n) => s.match(new RegExp(`.{1,${n}}`, 'g')).join('-');

/** Days since 2020-01-01 (UTC). */
export const dayNumber = (ms) => Math.floor((ms - EPOCH) / DAY_MS);
/** @param {number} day */
export const dayToISO = (day) => new Date(EPOCH + day * DAY_MS).toISOString().slice(0, 10);

/** Machine code shown to the client: 16 base32 characters derived from the OS machine id. */
export function machineCodeFromRaw(raw) {
  const digest = crypto.createHash('sha256').update(`psydossier-machine:${raw}`).digest();
  return group(base32Encode(digest.subarray(0, 10)), 4);
}

/** "abcd efgh-ijkl mnop" → "ABCD-EFGH-IJKL-MNOP", or null if it is not a machine code. */
export function normalizeMachineCode(text) {
  const clean = String(text).toUpperCase().replace(/[^A-Z2-7]/g, '');
  return clean.length === 16 ? group(clean, 4) : null;
}

/** The exact bytes that are signed. */
export function signedMessage(ref, machineCode, expiryDay) {
  return Buffer.from(`psydossier-activation:${KEY_VERSION}:${ref}:${machineCode}:${expiryDay}`, 'utf8');
}

/** @param {number} expiryDay  @param {Uint8Array} signature */
export function formatKey(expiryDay, signature) {
  const bytes = new Uint8Array(KEY_BYTES);
  bytes[0] = KEY_VERSION;
  bytes[1] = (expiryDay >>> 8) & 255;
  bytes[2] = expiryDay & 255;
  bytes.set(signature, 3);
  return group(base32Encode(bytes), 6);
}

/** @returns {{ expiryDay: number, signature: Uint8Array } | null} */
export function parseKey(text) {
  const clean = String(text).toUpperCase().replace(/[^A-Z2-7]/g, '');
  if (clean.length !== KEY_CHARS) return null;
  const bytes = base32Decode(clean);
  if (!bytes || bytes.length < KEY_BYTES || bytes[0] !== KEY_VERSION) return null;
  return { expiryDay: (bytes[1] << 8) | bytes[2], signature: bytes.subarray(3, KEY_BYTES) };
}
