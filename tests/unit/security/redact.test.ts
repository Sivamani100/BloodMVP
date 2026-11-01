import { describe, it, expect } from 'vitest';
import { redactPhone, redactString, redactObject } from '@/server/security/redact';

describe('SEC-9 Redact Utility', () => {
  it('redacts phone numbers showing only the last 4 digits', () => {
    expect(redactPhone('+919876543210')).toBe('+91******3210');
  });

  it('redacts OTPs, bearer tokens, and phone numbers in strings', () => {
    const raw = 'Calling +919876543210 with Bearer secret123 and code 482197';
    const redacted = redactString(raw);

    expect(redacted).not.toContain('+919876543210');
    expect(redacted).toContain('+91******3210');
    expect(redacted).not.toContain('secret123');
    expect(redacted).toContain('Bearer [REDACTED]');
    expect(redacted).not.toContain('482197');
    expect(redacted).toContain('[OTP_REDACTED]');
  });

  it('recursively redacts sensitive keys in JSON payloads', () => {
    const payload = {
      phone: '+919876543210',
      otp: '123456',
      user: {
        token: 'token_abc',
        name: 'Suresh',
      },
    };

    const redacted = redactObject(payload);
    expect(redacted.phone).toBe('+91******3210');
    expect(redacted.otp).toBe('[REDACTED]');
    expect(redacted.user.token).toBe('[REDACTED]');
    expect(redacted.user.name).toBe('Suresh');
  });
});
