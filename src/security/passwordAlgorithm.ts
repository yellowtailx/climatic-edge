// src/security/passwordAlgorithm.ts

export interface PasswordHash {
  saltHex: string;
  rounds: number;
  hashHex: string;
}

export interface StoredUser {
  username: string;
  saltHex: string;
  rounds: number;
  hashHex: string;
}

export const DEFAULT_ROUNDS = 1000;
const PEPPER_KEY = 'climaticedge-hash-pepper';
export const STORAGE_KEY = 'climaticedge-users';
export const SESSION_KEY = 'climaticedge-session';

let cachedPepper: string | null = null;

export function getDefaultPepper(): string {
  if (cachedPepper) {
    return cachedPepper;
  }
  const envPepper =
    typeof process !== 'undefined' && process.env && process.env.REACT_APP_HASH_PEPPER;
  if (envPepper && envPepper.length > 0) {
    cachedPepper = envPepper;
    return envPepper;
  }
  let pepper = '';
  try {
    pepper = localStorage.getItem(PEPPER_KEY) ?? '';
  } catch {
    // access denied; fall through to generation
  }
  if (!pepper) {
    pepper = toHex(randomBytes(32));
    try {
      localStorage.setItem(PEPPER_KEY, pepper);
    } catch {
    }
  }
  cachedPepper = pepper;
  return pepper;
}

function toHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

const encoder = new TextEncoder();

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  if (typeof globalThis.crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    let seed = Date.now() ^ Math.floor(performance.now() * 1000000);
    for (let i = 0; i < length; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      bytes[i] = seed & 0xff;
    }
  }
  return bytes;
}

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

function sha256Bytes(message: Uint8Array): Uint8Array {
  const bitLenHi = Math.floor((message.length * 8) / 0x100000000);
  const bitLenLo = (message.length * 8) >>> 0;
  const newLen = (((message.length + 8) >> 6) + 1) << 6;
  const buf = new ArrayBuffer(newLen);
  const bytes = new Uint8Array(buf);
  bytes.set(message, 0);
  bytes[message.length] = 0x80;
  const view = new DataView(buf);
  view.setUint32(newLen - 8, bitLenHi, false);
  view.setUint32(newLen - 4, bitLenLo, false);

  const w = new Uint32Array(64);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let i = 0; i < newLen; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let j = 0; j < 64; j++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0; d = c; c = b; b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const oview = new DataView(out.buffer);
  oview.setUint32(0, h0, false); oview.setUint32(4, h1, false);
  oview.setUint32(8, h2, false); oview.setUint32(12, h3, false);
  oview.setUint32(16, h4, false); oview.setUint32(20, h5, false);
  oview.setUint32(24, h6, false); oview.setUint32(28, h7, false);
  return out;
}

// ---- ClimaticHash core ----------------------------------------------------

export function generateSalt(length = 16): Uint8Array {
  return randomBytes(length);
}

// Phase 1 - salt-driven scrambling: swap bytes in the message using salt bytes.
function scramble(input: Uint8Array, salt: Uint8Array): Uint8Array {
  const out = new Uint8Array(input);
  for (let i = 0; i < out.length; i++) {
    const swapIndex = salt[i % salt.length] % out.length;
    const tmp = out[i];
    out[i] = out[swapIndex];
    out[swapIndex] = tmp;
  }
  return out;
}

async function stretch(
  base: Uint8Array,
  salt: Uint8Array,
  pepper: string,
  rounds: number,
): Promise<Uint8Array> {
  let current = base;
  const pepperBytes = encoder.encode(pepper);
  for (let i = 0; i < rounds; i++) {
    const roundIndex = encoder.encode(String(i));
    const combined = new Uint8Array(
      current.length + salt.length + pepperBytes.length + roundIndex.length,
    );
    combined.set(current, 0);
    combined.set(salt, current.length);
    combined.set(pepperBytes, current.length + salt.length);
    combined.set(roundIndex, current.length + salt.length + pepperBytes.length);
    current = sha256Bytes(combined);
  }
  return current;
}

// Constant-time comparison - blocks timing attacks.
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function hashPassword(
  password: string,
  pepper: string = getDefaultPepper(),
  rounds: number = DEFAULT_ROUNDS,
  salt?: Uint8Array,
): Promise<PasswordHash> {
  const usedSalt = salt ?? generateSalt();
  const passwordBytes = encoder.encode(password);
  const scrambled = scramble(passwordBytes, usedSalt);
  const hash = await stretch(scrambled, usedSalt, pepper, rounds);
  return {
    saltHex: toHex(usedSalt),
    rounds,
    hashHex: toHex(hash),
  };
}

export async function verifyPassword(
  password: string,
  expected: PasswordHash,
  pepper: string = getDefaultPepper(),
): Promise<boolean> {
  const recomputed = await hashPassword(password, pepper, expected.rounds, fromHex(expected.saltHex));
  return constantTimeEqual(fromHex(expected.hashHex), fromHex(recomputed.hashHex));
}

// ---- localStorage helpers (demo "database") --------------------------------

export function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

export function findStoredUser(username: string): StoredUser | undefined {
  const users = getStoredUsers();
  return users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
  );
}

export function registerUser(
  username: string,
  password: string,
  rounds: number = DEFAULT_ROUNDS,
): StoredUser {
  const users = getStoredUsers();
  const hashed = hashPasswordSync(password, rounds);
  const user: StoredUser = {
    username: username.trim(),
    ...hashed,
  };
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return user;
}

export function hashPasswordSync(
  password: string,
  rounds: number = DEFAULT_ROUNDS,
  salt?: Uint8Array,
  pepper: string = getDefaultPepper(),
): PasswordHash {
  const usedSalt = salt ?? generateSalt();
  const passwordBytes = encoder.encode(password);
  const scrambled = scramble(passwordBytes, usedSalt);
  let current = scrambled;
  const pepperBytes = encoder.encode(pepper);
  for (let i = 0; i < rounds; i++) {
    const roundIndex = encoder.encode(String(i));
    const combined = new Uint8Array(
      current.length + usedSalt.length + pepperBytes.length + roundIndex.length,
    );
    combined.set(current, 0);
    combined.set(usedSalt, current.length);
    combined.set(pepperBytes, current.length + usedSalt.length);
    combined.set(roundIndex, current.length + usedSalt.length + pepperBytes.length);
    current = sha256Bytes(combined);
  }
  return {
    saltHex: toHex(usedSalt),
    rounds,
    hashHex: toHex(current),
  };
}
