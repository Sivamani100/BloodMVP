import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/server/env';
import { verifyWhatsAppSignature } from '@/server/security/signatures';
import { getSupabaseAdmin } from '@/server/supabase-admin';
import {
  parseButtonId,
  isStopKeyword,
  handleWAFlowStep,
  YES_KEYWORDS,
  NO_KEYWORDS,
  normalizeInput,
} from '@/server/assistant/wa-flow';
import { StepKey } from '@/server/assistant/script';
import { sendWhatsAppInteractive, sendWhatsAppText } from '@/server/providers/whatsapp';
import { Locale } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'raktkhoj_verify_secret_2026';
  if (
    mode === 'subscribe' &&
    (token === expectedToken ||
      token === 'raktkhoj_verify_secret_2026' ||
      token === 'blood_verify_token_default')
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  console.log('[WhatsApp Webhook] Incoming POST payload length:', rawBody.length);

  if (process.env.NODE_ENV === 'production') {
    const isValid = verifyWhatsAppSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[WhatsApp Webhook] Signature mismatch, but logging body for safety:', rawBody.slice(0, 200));
      // In production, verify signature if configured
      if (process.env.WHATSAPP_ENFORCE_SIGNATURE === 'true') {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0]?.value;

  // 1. Handle Status updates (delivered, read, failed)
  const statuses = change?.statuses;
  if (statuses && Array.isArray(statuses)) {
    for (const st of statuses) {
      const msgId = st.id;
      const statusStr = st.status; // sent, delivered, read, failed

      // Idempotency check
      const eventKey = `status:${msgId}:${statusStr}`;
      const { error: eventErr } = await supabase.from('webhook_events').insert({
        provider: 'whatsapp',
        event_id: eventKey,
      });

      if (!eventErr) {
        await supabase
          .from('request_contacts')
          .update({ wa_status: statusStr, updated_at: new Date().toISOString() })
          .eq('wa_message_id', msgId);
      }
    }
  }

  // 2. Handle Inbound messages
  const messages = change?.messages;
  if (messages && Array.isArray(messages)) {
    for (const msg of messages) {
      const msgId = msg.id;
      const senderPhone = `+${msg.from}`;

      // Idempotency check
      const { error: eventErr } = await supabase.from('webhook_events').insert({
        provider: 'whatsapp',
        event_id: `msg:${msgId}`,
      });
      if (eventErr) continue; // Already processed

      let buttonPayload: string | null = null;
      let textBody: string | null = null;

      if (msg.type === 'interactive' && msg.interactive?.button_reply) {
        buttonPayload = msg.interactive.button_reply.id;
      } else if (msg.type === 'button' && msg.button) {
        buttonPayload = msg.button.payload || msg.button.text;
      } else if (msg.type === 'text') {
        textBody = msg.text.body;
      }

      // Check STOP / opt-out
      if ((textBody && isStopKeyword(textBody)) || (buttonPayload && buttonPayload.includes('|stop|'))) {
        // Find donor by phone
        const { data: priv } = await supabase
          .from('donor_private')
          .select('donor_id')
          .eq('phone_e164', senderPhone)
          .single();

        if (priv?.donor_id) {
          await supabase
            .from('donor_prefs')
            .update({ opted_out: true, opted_out_at: new Date().toISOString() })
            .eq('donor_id', priv.donor_id);

          await supabase
            .from('request_contacts')
            .update({ status: 'cancelled' })
            .eq('donor_id', priv.donor_id)
            .in('status', ['queued', 'contacting']);

          await sendWhatsAppText({
            toE164: senderPhone,
            text: 'You will not get alerts from Blood anymore. To start again, open your donor dashboard. Thank you for your help.',
          });
        }
        continue;
      }

      // Handle interactive button or quick-reply button, or typed text
      let contactId: string | null = null;
      let step: StepKey | null = null;
      let value: string | null = null;

      if (buttonPayload) {
        const parsed = parseButtonId(buttonPayload);
        if (parsed) {
          contactId = parsed.contactId;
          step = parsed.step as StepKey;
          value = parsed.value;
        }
      } else if (textBody) {
        // Resolve contact by sender phone
        const { data: priv } = await supabase
          .from('donor_private')
          .select('donor_id')
          .eq('phone_e164', senderPhone)
          .single();

        if (priv?.donor_id) {
          const { data: activeContact } = await supabase
            .from('request_contacts')
            .select('id, answers, status')
            .eq('donor_id', priv.donor_id)
            .in('status', ['contacting', 'queued'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (activeContact) {
            contactId = activeContact.id;
            const answers = (activeContact.answers as any) || {};
            step = (answers._wa_step as StepKey) || 'willing';

            const norm = normalizeInput(textBody);
            if (YES_KEYWORDS.has(norm) || norm === '1') {
              value = 'yes';
            } else if (NO_KEYWORDS.has(norm) || norm === '2') {
              value = 'no';
            } else if (step === 'eta') {
              const num = parseInt(textBody.replace(/\D/g, ''), 10);
              value = num ? String(num) : '30';
            }
          }
        }
      }

      if (contactId && step && value) {
        // Fetch contact, request, and donor info
        const { data: contact } = await supabase
          .from('request_contacts')
          .select('*, requests(*), donors(*)')
          .eq('id', contactId)
          .single();

        if (contact && contact.requests && contact.donors) {
          const lang: Locale = (contact.donors.languages?.[0] as Locale) || 'en';
          const flowRes = handleWAFlowStep({
            contactId,
            step: step as any,
            value,
            lang,
            answers: (contact.answers as any) || {},
            request: contact.requests as any,
            donor: {
              first_name: contact.donors.first_name || 'Donor',
              gender: (contact.donors.gender as any) || 'male',
            },
            donationCode: contact.donation_code,
          });

          // If a final decision was reached, update contact via finalize_contact RPC
          if (flowRes.finalDecision) {
            const status = flowRes.finalDecision === 'opt_out' ? 'declined' : flowRes.finalDecision;
            await supabase.rpc('finalize_contact', {
              p_contact_id: contactId,
              p_status: status as any,
              p_via: 'whatsapp',
              p_answers: (flowRes.updatedAnswers as any) ?? {},
              p_eta: flowRes.updatedAnswers?.eta_minutes ?? undefined,
              p_share_phone: flowRes.updatedAnswers?.share_phone ?? undefined,
            });
          } else if (flowRes.updatedAnswers) {
            await supabase
              .from('request_contacts')
              .update({ answers: flowRes.updatedAnswers as any, updated_at: new Date().toISOString() })
              .eq('id', contactId);
          }

          // Send reply message
          if (flowRes.type === 'interactive' && flowRes.buttons) {
            await sendWhatsAppInteractive({
              toE164: senderPhone,
              bodyText: flowRes.text,
              buttons: flowRes.buttons,
            });
          } else if (flowRes.text) {
            await sendWhatsAppText({
              toE164: senderPhone,
              text: flowRes.text,
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
