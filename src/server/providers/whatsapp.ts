import { getEnv } from '@/server/env';
import { canContact } from '@/server/security/allowlist';
import { redactPhone } from '@/server/security/redact';

export interface WhatsAppSendResult {
  ok: boolean;
  messageId?: string;
  errorCode?: string;
  retryable: boolean;
  skipped?: boolean;
}

async function postToWhatsApp(payload: Record<string, unknown>): Promise<WhatsAppSendResult> {
  const env = getEnv();
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn('[WhatsApp] Credentials missing. Mocking send.');
    return { ok: true, messageId: `mock_wa_${Date.now()}`, retryable: false };
  }

  const url = `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${phoneId}/messages`;

  let attempt = 0;
  const delays = [500, 1500];

  while (attempt <= 2) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data?.messages?.[0]?.id) {
        return { ok: true, messageId: data.messages[0].id, retryable: false };
      }

      const status = res.status;
      const isRetryable = status === 429 || (status >= 500 && status < 600);

      if (isRetryable && attempt < 2) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
        attempt++;
        continue;
      }

      return {
        ok: false,
        errorCode: data?.error?.message || `HTTP_${status}`,
        retryable: isRetryable,
      };
    } catch (err: any) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
        attempt++;
        continue;
      }
      return { ok: false, errorCode: err.message || 'NETWORK_ERROR', retryable: true };
    }
  }

  return { ok: false, errorCode: 'MAX_RETRIES_EXCEEDED', retryable: false };
}

export async function sendWhatsAppTemplate(args: {
  toE164: string;
  templateName: string;
  langCode: string;
  components?: Array<Record<string, unknown>>;
}): Promise<WhatsAppSendResult> {
  if (!canContact(args.toE164)) {
    console.log(`[WhatsApp] Skipped send to non-allowlisted number: ${redactPhone(args.toE164)}`);
    return { ok: false, skipped: true, messageId: `allowlist_skipped_${Date.now()}`, retryable: false };
  }

  const to = args.toE164.replace(/\D/g, '');
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: args.templateName,
      language: { code: args.langCode },
      components: args.components || [],
    },
  };

  const res = await postToWhatsApp(payload);
  if (!res.ok && args.templateName !== 'hello_world') {
    console.warn(`[WhatsApp] Template '${args.templateName}' failed (${res.errorCode}), falling back to 'hello_world'`);
    const fallbackPayload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: 'hello_world',
        language: { code: 'en_US' },
      },
    };
    const fallbackRes = await postToWhatsApp(fallbackPayload);
    if (fallbackRes.ok) {
      return fallbackRes;
    }
  }
  return res;
}

export async function sendWhatsAppInteractive(args: {
  toE164: string;
  bodyText: string;
  buttons: Array<{ id: string; title: string }>;
}): Promise<WhatsAppSendResult> {
  if (!canContact(args.toE164)) {
    console.log(`[WhatsApp] Skipped interactive to non-allowlisted: ${redactPhone(args.toE164)}`);
    return { ok: false, skipped: true, messageId: `allowlist_skipped_${Date.now()}`, retryable: false };
  }

  const to = args.toE164.replace(/\D/g, '');
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: args.bodyText },
      action: {
        buttons: args.buttons.slice(0, 3).map((b) => ({
          type: 'reply',
          reply: { id: b.id.slice(0, 256), title: b.title.slice(0, 20) },
        })),
      },
    },
  };

  return postToWhatsApp(payload);
}

export async function sendWhatsAppText(args: {
  toE164: string;
  text: string;
}): Promise<WhatsAppSendResult> {
  if (!canContact(args.toE164)) {
    console.log(`[WhatsApp] Skipped text to non-allowlisted: ${redactPhone(args.toE164)}`);
    return { ok: false, skipped: true, messageId: `allowlist_skipped_${Date.now()}`, retryable: false };
  }

  const to = args.toE164.replace(/\D/g, '');
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: args.text },
  };

  return postToWhatsApp(payload);
}

