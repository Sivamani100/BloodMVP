import twilio from 'twilio';
import { VoiceProvider } from './types';
import { getEnv } from '@/server/env';
import { canContact } from '@/server/security/allowlist';
import { redactPhone } from '@/server/security/redact';

export class TwilioVoiceProvider implements VoiceProvider {
  name = 'twilio' as const;

  async placeCall(args: {
    contactId: string;
    toE164: string;
    lang: 'en' | 'te' | 'hi';
  }): Promise<{ ok: boolean; callSid?: string; errorCode?: string; retryable: boolean }> {
    const { contactId, toE164, lang } = args;

    if (!canContact(toE164)) {
      console.log(`[Twilio Voice] Skipped call to non-allowlisted: ${redactPhone(toE164)}`);
      return { ok: true, callSid: `allowlist_skipped_call_${Date.now()}`, retryable: false };
    }

    const env = getEnv();
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
      console.warn('[Twilio Voice] Credentials missing. Mocking call.');
      return { ok: true, callSid: `mock_call_${Date.now()}`, retryable: false };
    }

    try {
      const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      const answerUrl = `${env.PUBLIC_APP_URL}/api/webhooks/twilio/voice/answer?c=${contactId}&l=${lang}`;
      const statusCallbackUrl = `${env.PUBLIC_APP_URL}/api/webhooks/twilio/voice/status?c=${contactId}`;

      const call = await client.calls.create({
        to: toE164,
        from: env.TWILIO_FROM_NUMBER,
        url: answerUrl,
        method: 'POST',
        statusCallback: statusCallbackUrl,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        timeout: 25,
      });

      return {
        ok: true,
        callSid: call.sid,
        retryable: false,
      };
    } catch (err: any) {
      console.error('[Twilio Voice] Failed to place call:', err);
      return {
        ok: false,
        errorCode: err.message || 'TWILIO_CALL_ERROR',
        retryable: true,
      };
    }
  }
}
