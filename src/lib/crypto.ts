const SALT_STORAGE = 'wallet_salt';

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function getOrCreateSalt(): string {
  let salt = localStorage.getItem(SALT_STORAGE);
  if (!salt) {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    salt = bufferToHex(saltBytes.buffer);
    localStorage.setItem(SALT_STORAGE, salt);
  }
  return salt;
}

export async function encryptPrivateKey(privateKey: string, password: string): Promise<string> {
  const saltHex = getOrCreateSalt();
  const salt = hexToBuffer(saltHex);
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(privateKey)
  );
  const ivHex = bufferToHex(iv.buffer);
  const dataHex = bufferToHex(encrypted);
  return `${ivHex}:${dataHex}`;
}

export async function decryptPrivateKey(encryptedData: string, password: string): Promise<string> {
  const saltHex = getOrCreateSalt();
  const salt = hexToBuffer(saltHex);
  const [ivHex, dataHex] = encryptedData.split(':');
  const iv = hexToBuffer(ivHex);
  const data = hexToBuffer(dataHex);
  const key = await deriveKey(password, salt);
  const dec = new TextDecoder();
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return dec.decode(decrypted);
}

export function storeDecryptedKey(networkKey: string, privateKey: string): void {
  sessionStorage.setItem(`pk_${networkKey}`, privateKey);
}

export function getDecryptedKey(networkKey: string): string | null {
  return sessionStorage.getItem(`pk_${networkKey}`);
}

export function clearDecryptedKey(networkKey: string): void {
  sessionStorage.removeItem(`pk_${networkKey}`);
}

export function clearAllDecryptedKeys(): void {
  Object.keys(sessionStorage)
    .filter((k) => k.startsWith('pk_'))
    .forEach((k) => sessionStorage.removeItem(k));
}

export function isWalletUnlocked(networkKey: string): boolean {
  return sessionStorage.getItem(`pk_${networkKey}`) !== null;
}
