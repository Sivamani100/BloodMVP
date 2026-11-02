import { getEnv } from '@/server/env';

const FORBIDDEN_NUMBERS = new Set(['+910000000000', '+911234567890']);

export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleaned.startsWith('+') && cleaned.startsWith('91')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+') && cleaned.length === 10) {
    cleaned = '+91' + cleaned;
  }
  return cleaned;
}

export function isValidIndianMobile(phone: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(phone);
}

export function canContact(rawPhone: string): boolean {
  const phone = normalizePhone(rawPhone);

  if (!isValidIndianMobile(phone)) {
    return false;
  }

  if (FORBIDDEN_NUMBERS.has(phone) || phone.startsWith('+910')) {
    return false;
  }

  const env = getEnv();
  if (env.APP_ENV === 'production' || process.env.ALLOW_ALL_OUTBOUND === 'true') {
    return true;
  }

  const allowlist = env.OUTBOUND_ALLOWLIST.split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizePhone);

  return allowlist.includes(phone);
}

