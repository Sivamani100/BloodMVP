import { describe, it, expect, beforeEach } from 'vitest';
import { canContact, isValidIndianMobile, normalizePhone } from '@/server/security/allowlist';

describe('SEC Allowlist and Phone Validation', () => {
  it('validates standard Indian mobile numbers', () => {
    expect(isValidIndianMobile('+919876543210')).toBe(true);
    expect(isValidIndianMobile('+916234567890')).toBe(true);
    expect(isValidIndianMobile('+917012345678')).toBe(true);

    expect(isValidIndianMobile('+915555555555')).toBe(false); // starts with 5
    expect(isValidIndianMobile('+14155552671')).toBe(false); // US number
    expect(isValidIndianMobile('+9198765')).toBe(false); // too short
  });

  it('normalizes 10-digit mobile numbers with +91 prefix', () => {
    expect(normalizePhone('9876543210')).toBe('+919876543210');
    expect(normalizePhone('+919876543210')).toBe('+919876543210');
    expect(normalizePhone('919876543210')).toBe('+919876543210');
  });

  it('blocks numbers starting with +910 or in forbidden list', () => {
    expect(canContact('+910000000000')).toBe(false);
    expect(canContact('+911234567890')).toBe(false);
  });
});

