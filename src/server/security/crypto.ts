import crypto from 'crypto';
import { getEnv } from '@/server/env';

function getKey(customKey?: string): Buffer {
  const base64Key = customKey || getEnv().DATA_ENCRYPTION_KEY;
  const key = Buffer.from(base64Key, 'base64');
  if (key.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must be exactly 32 bytes (256 bits) when decoded');
  }
  return key;
}

export function encrypt(plaintext: string, customKey?: string): string {
  const key = getKey(customKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decrypt(encryptedText: string, customKey?: string): string {
  const parts = encryptedText.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') {
    throw new Error('Invalid encrypted payload format');
  }

  const [, ivB64, tagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, 'base64url');
  const tag = Buffer.from(tagB64, 'base64url');
  const ciphertext = Buffer.from(ciphertextB64, 'base64url');
  const key = getKey(customKey);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

