export function redactPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  const last4 = digits.slice(-4);
  return `+91******${last4}`;
}

export function redactString(str: string): string {
  if (!str) return str;
  return str
    .replace(/\+91[6-9]\d{9}/g, (p) => redactPhone(p))
    .replace(/Bearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [REDACTED]')
    .replace(/whsec_[A-Za-z0-9_\-]+/gi, 'whsec_[REDACTED]')
    .replace(/\b\d{6}\b/g, '[OTP_REDACTED]');
}

export function redactObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return redactString(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('otp') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('token') ||
      lowerKey.includes('password') ||
      lowerKey.includes('answers_enc')
    ) {
      result[key] = '[REDACTED]';
    } else if (lowerKey.includes('phone') && typeof val === 'string') {
      result[key] = redactPhone(val);
    } else {
      result[key] = redactObject(val);
    }
  }

  return result as T;
}
