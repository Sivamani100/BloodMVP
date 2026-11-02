import twilio from 'twilio';
import { getEnv } from '@/server/env';
import { canContact } from '@/server/security/allowlist';
import { redactPhone } from '@/server/security/redact';

export interface SmsSendResult {
  ok: boolean;
  messageId?: string;
  errorCode?: string;
  skipped?: boolean;
}

export async function sendSms(args: {
  toE164: string;
  body: string;
  bypassAllowlist?: boolean;
}): Promise<SmsSendResult> {
  const { toE164, body, bypassAllowlist } = args;

  if (!bypassAllowlist && !canContact(toE164)) {
    console.log(`[SMS] Skipped send to non-allowlisted number: ${redactPhone(toE164)}`);
    return { ok: false, skipped: true, errorCode: 'ALLOWLIST_SKIPPED' };
  }

  const env = getEnv();
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    console.warn('[SMS] Twilio credentials missing. Mocking SMS send.');
    return { ok: true, messageId: `mock_sms_${Date.now()}` };
  }

  try {
    const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    const msg = await client.messages.create({
      to: toE164,
      from: env.TWILIO_FROM_NUMBER,
      body,
    });

    return { ok: true, messageId: msg.sid };
  } catch (err: any) {
    console.error(`[SMS] Failed to send SMS via Twilio to ${redactPhone(toE164)}:`, err.message);
    return {
      ok: false,
      errorCode: err.message || 'TWILIO_SMS_FAILED',
    };
  }
}
