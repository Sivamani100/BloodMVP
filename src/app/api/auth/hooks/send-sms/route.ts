import { NextRequest, NextResponse } from 'next/server';
import { verifySupabaseHookSignature } from '@/server/security/signatures';
import { sendWhatsAppTemplate, sendWhatsAppText } from '@/server/providers/whatsapp';
import { sendSms } from '@/server/providers/sms';
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
  console.log(`[Send-SMS Hook] [TEST-LOG] OTP Code: ${otp} for phone: ${phone}`);

  const otpMessage = `Your RaktKhoj / BloodMVP login verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

  // 2. Dual Dispatch: Cellular SMS via Twilio + WhatsApp Message
  // A. Twilio SMS: Reaches mobile phone directly via carrier cellular SMS
  const smsPromise = sendSms({
    toE164: phone,
    body: otpMessage,
    bypassAllowlist: true, // Login OTP is explicitly user-requested
  });

  // B. WhatsApp: Try rich text first (if within 24h user window), fallback to template
  const waPromise = (async () => {
    try {
      const textRes = await sendWhatsAppText({
        toE164: phone,
        text: `🩸 *RaktKhoj Verification Code*\n\nYour 6-digit login code is: *${otp}*\n\nValid for 10 minutes. Do not share this code with anyone.`,
      });
      if (textRes.ok) return textRes;

      const lang = body?.user?.user_metadata?.locale || 'en';
      return await sendWhatsAppTemplate({
        toE164: phone,
        templateName: 'blood_login_code',
        langCode: lang,
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: otp }],
          },
        ],
      });
    } catch (waErr: any) {
      console.warn('[Send-SMS Hook] WhatsApp attempt error:', waErr.message);
      return { ok: false, errorCode: waErr.message, retryable: false };
    }
  })();

  const [smsResult, waResult] = await Promise.all([smsPromise, waPromise]);

  console.log(
    `[Send-SMS Hook] Delivery status for ${redactPhone(phone)} -> SMS: ${smsResult.ok ? 'SUCCESS' : smsResult.errorCode}, WhatsApp: ${waResult.ok ? 'SUCCESS' : waResult.errorCode}`
  );

  return NextResponse.json({});
}
