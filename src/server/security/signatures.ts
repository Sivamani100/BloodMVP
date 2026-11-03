import crypto from 'crypto';
import twilio from 'twilio';
import { Webhook } from 'standardwebhooks';
import { getEnv } from '@/server/env';

export function verifyWhatsAppSignature(rawBody: string, signatureHeader?: string | null): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  const expectedSig = signatureHeader.slice(7);
  const appSecret = getEnv().WHATSAPP_APP_SECRET;
  if (!appSecret) return false;

  const hmac = crypto.createHmac('sha256', appSecret);
  const calculatedSig = hmac.update(rawBody, 'utf8').digest('hex');

  const expectedBuf = Buffer.from(expectedSig, 'hex');
  const calculatedBuf = Buffer.from(calculatedSig, 'hex');

  if (expectedBuf.length !== calculatedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, calculatedBuf);
}

export function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signatureHeader?: string | null
): boolean {
  if (!signatureHeader) return false;
  const authToken = getEnv().TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  return twilio.validateRequest(authToken, signatureHeader, url, params);
}

export function verifySupabaseHookSignature(
  rawBody: string,
  headers: Record<string, string>
): boolean {
  const secret = getEnv().SEND_SMS_HOOK_SECRET;
  if (!secret) return false;

  const normalizedSecret = secret.startsWith('v1,') ? secret.slice(3) : secret;

  try {
    const wh = new Webhook(normalizedSecret);
    wh.verify(rawBody, headers);
    return true;
  } catch (err) {
    console.error('Supabase SMS hook signature verification failed:', err);
    return false;
  }
}

export function generateRequestAccessToken(requestId: string): string {
  const secret = getEnv().DATA_ENCRYPTION_KEY || 'blood_access_secret_2026';
  return crypto.createHmac('sha256', secret).update(requestId).digest('hex').slice(0, 16);
}

export function verifyRequestAccessToken(requestId: string, token?: string | null): boolean {
  if (!token) return false;
  const expected = generateRequestAccessToken(requestId);
  return token === expected;
}


