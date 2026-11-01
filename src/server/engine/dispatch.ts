import { getSupabaseAdmin } from '@/server/supabase-admin';
import { sendWhatsAppTemplate, sendWhatsAppInteractive } from '@/server/providers/whatsapp';
import { getVoiceProvider } from '@/server/providers/voice';
import { decidePolicy } from './policy';
import { Locale } from '@/lib/constants';

export interface DispatchContactItem {
  id: string;
  request_id: string;
  donor_id: string;
  phone_e164: string;
  donor_first_name: string;
  donor_languages: string[];
  patient_first_name: string;
  blood_group: string;
  units_needed: number;
  hospital_name: string;
  hospital_area?: string | null;
  urgency: string;
}

export async function dispatchContacts(
  contacts: DispatchContactItem[],
  request: { id: string; urgency: string; blood_group: string; units_needed: number; hospital_name: string; hospital_area?: string | null },
  settings: { whatsapp_enabled?: boolean; voice_enabled?: boolean }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const voiceProvider = getVoiceProvider();

  // Process in batches of 10
  const batchSize = 10;
  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(async (c) => {
        const lang: Locale = (c.donor_languages?.[0] as Locale) || 'en';
        const policy = decidePolicy({ donor_languages: c.donor_languages }, request, settings);

        // Mark contacting
        await supabase
          .from('request_contacts')
          .update({ status: 'contacting', updated_at: new Date().toISOString() })
          .eq('id', c.id);

        let waPromise: Promise<any> = Promise.resolve({ ok: false, skipped: true });
        let voicePromise: Promise<any> = Promise.resolve({ ok: false, skipped: true });

        // 1. WhatsApp Interactive question send
        if (policy.sendWhatsApp) {
          const alertBody = `🚨 *URGENT BLOOD REQUEST*\n\n` +
            `Patient: *${c.patient_first_name}*\n` +
            `Blood Needed: *${c.blood_group}* (${c.units_needed} unit${c.units_needed > 1 ? 's' : ''})\n` +
            `Hospital: *${c.hospital_name}*${c.hospital_area ? `, ${c.hospital_area}` : ''}\n` +
            `Urgency: *${request.urgency === 'now' ? 'Emergency (within 2 hours)' : 'Urgent today'}*\n\n` +
            `Are you available and willing to donate blood now?`;

          waPromise = sendWhatsAppInteractive({
            toE164: c.phone_e164,
            bodyText: alertBody,
            buttons: [
              { id: `a|${c.id}|willing|yes`, title: '✅ Yes, I can' },
              { id: `a|${c.id}|willing|no`, title: '❌ No, unable' },
            ],
          }).then(async (interactiveRes) => {
            if (interactiveRes.ok) return interactiveRes;

            // If interactive fails (e.g. 24h window), try template with fallback
            console.warn('[WhatsApp] Interactive send failed, trying template...');
            return sendWhatsAppTemplate({
              toE164: c.phone_e164,
              templateName: 'blood_request_alert',
              langCode: lang,
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: c.patient_first_name },
                    { type: 'text', text: c.blood_group },
                    { type: 'text', text: String(c.units_needed) },
                    { type: 'text', text: c.hospital_name },
                    { type: 'text', text: c.hospital_area || '' },
                    { type: 'text', text: request.urgency === 'now' ? '2 hours' : '6 hours' },
                  ],
                },
                {
                  type: 'button',
                  sub_type: 'quick_reply',
                  index: '0',
                  parameters: [{ type: 'payload', payload: `a|${c.id}|willing|yes` }],
                },
                {
                  type: 'button',
                  sub_type: 'quick_reply',
                  index: '1',
                  parameters: [{ type: 'payload', payload: `a|${c.id}|willing|no` }],
                },
              ],
            });
          });
        }

        // 2. Twilio Voice Call place
        if (policy.placeVoiceCall) {
          voicePromise = voiceProvider.placeCall({
            contactId: c.id,
            toE164: c.phone_e164,
            lang,
          });
        }

        const [waRes, voiceRes] = await Promise.allSettled([waPromise, voicePromise]);

        const waData = waRes.status === 'fulfilled' ? waRes.value : { ok: false };
        const voiceData = voiceRes.status === 'fulfilled' ? voiceRes.value : { ok: false };

        const waStatus = waData.ok ? 'sent' : waData.skipped ? 'skipped' : 'failed';
        const callStatus = voiceData.ok ? 'dialing' : voiceData.skipped ? 'skipped' : 'failed';

        // Check if both failed or skipped
        const bothFailedOrSkipped =
          (waStatus === 'failed' || waStatus === 'skipped') &&
          (callStatus === 'failed' || callStatus === 'skipped');

        await supabase
          .from('request_contacts')
          .update({
            wa_status: waStatus,
            wa_message_id: waData.messageId || null,
            call_status: callStatus,
            call_sid: voiceData.callSid || null,
            status: bothFailedOrSkipped ? 'needs_human' : 'contacting',
            updated_at: new Date().toISOString(),
          })
          .eq('id', c.id);

        // Record message_events
        if (waData.ok && waData.messageId) {
          await supabase.from('message_events').insert({
            contact_id: c.id,
            direction: 'out',
            channel: 'whatsapp',
            provider_id: waData.messageId,
            kind: 'template_sent',
            payload: { template: 'blood_request_alert' },
          });
        }
        if (voiceData.ok && voiceData.callSid) {
          await supabase.from('message_events').insert({
            contact_id: c.id,
            direction: 'out',
            channel: 'voice',
            provider_id: voiceData.callSid,
            kind: 'call_placed',
            payload: { status: 'dialing' },
          });
        }
      })
    );
  }
}

