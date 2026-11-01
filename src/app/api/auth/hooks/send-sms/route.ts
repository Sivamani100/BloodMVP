import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseHookSignature } from '@/server/security/signatures';
import { sendWhatsAppTemplate } from '@/server/providers/whatsapp';
import { canContact } from '@/server/security/allowlist';
import { redactPhone } from '@/server/security/redact';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Verify Standard Webhooks signature
  const headersObj: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headersObj[key.toLowerCase()] = value;
  });

  const isValid = verifySupabaseHookSignature(rawBody, headersObj);
  if (!isValid && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized signature' }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const phone = body?.user?.phone;
  const otp = body?.sms?.otp;

  if (!phone || !otp) {
    return NextResponse.json({ error: 'Missing phone or OTP' }, { status: 400 });
  }

  console.log(`[Send-SMS Hook] OTP requested for phone: ${redactPhone(phone)}`);

  // 2. Allowlist check in non-production
  if (!canContact(phone)) {
    console.log(`[Send-SMS Hook] Skipped send to non-allowlisted number: ${redactPhone(phone)}`);
    return NextResponse.json({});
  }

  // 3. Send WhatsApp Authentication template
  const lang = body?.user?.user_metadata?.locale || 'en';
  const result = await sendWhatsAppTemplate({
    toE164: phone,
    templateName: 'blood_login_code',
    langCode: lang,
    components: [
      {
        type: 'body',
        parameters: [{ type: 'text', text: otp }],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: otp }],
      },
    ],
  });

  if (!result.ok && !result.messageId?.startsWith('allowlist_skipped')) {
    console.error('[Send-SMS Hook] Failed to send OTP on WhatsApp:', result.errorCode);
    return NextResponse.json({ error: 'Failed to deliver OTP' }, { status: 500 });
  }

  return NextResponse.json({});
}

