import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { encrypt, decrypt } from '@/server/security/crypto';

describe('SEC-1 Crypto Helper (AES-256-GCM)', () => {
  const testKey = crypto.randomBytes(32).toString('base64');
  const plaintext = JSON.stringify({ fever_today: false, alcohol_24h: false });

  it('performs round-trip encryption and decryption successfully', () => {
    const ciphertext = encrypt(plaintext, testKey);
    expect(ciphertext).toMatch(/^v1\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/);

    const decrypted = decrypt(ciphertext, testKey);
    expect(decrypted).toBe(plaintext);
  });

  it('generates unique IVs on consecutive encryptions of the same plaintext', () => {
    const cipher1 = encrypt(plaintext, testKey);
    const cipher2 = encrypt(plaintext, testKey);

    expect(cipher1).not.toBe(cipher2);
  });

  it('throws on tampered ciphertext', () => {
    const ciphertext = encrypt(plaintext, testKey);
    const parts = ciphertext.split('.');
    // Tamper with the ciphertext byte
    const tamperedPayload = parts[0] + '.' + parts[1] + '.' + parts[2] + '.' + parts[3].slice(0, -2) + 'AA';

    expect(() => decrypt(tamperedPayload, testKey)).toThrow();
  });

  it('throws when decrypted with the wrong key', () => {
    const wrongKey = crypto.randomBytes(32).toString('base64');
    const ciphertext = encrypt(plaintext, testKey);

    expect(() => decrypt(ciphertext, wrongKey)).toThrow();
  });
});

