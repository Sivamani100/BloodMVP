import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { verifyWhatsAppSignature } from '@/server/security/signatures';

describe('Webhook Signatures', () => {
  const secret = 'test-secret-12345678901234567890';

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://mock.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'mock-anon-key');
    vi.stubEnv('WHATSAPP_APP_SECRET', secret);
  });

  it('validates authentic WhatsApp webhook signatures', () => {
    const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
    const hmac = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
    const header = `sha256=${hmac}`;

    expect(verifyWhatsAppSignature(body, header)).toBe(true);
  });

  it('rejects tampered or mismatched WhatsApp payloads', () => {
    const body = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
    const header = 'sha256=abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';

    expect(verifyWhatsAppSignature(body, header)).toBe(false);
  });

  it('rejects headers missing the sha256= prefix', () => {
    const body = 'sample-body';
    expect(verifyWhatsAppSignature(body, 'invalid_sig')).toBe(false);
    expect(verifyWhatsAppSignature(body, undefined)).toBe(false);
    expect(verifyWhatsAppSignature(body, null)).toBe(false);
  });
});
