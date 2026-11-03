import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/server/env';
import { getSupabaseAdmin } from '@/server/supabase-admin';
import { BloodGroup } from '@/lib/constants';
import {
  getNearbyBloodBanks,
  getOrCreateRequesterUser,
} from '@/server/assistant/inbound-requester';
import { generateRequestAccessToken } from '@/server/security/signatures';
import { sendWhatsAppText } from '@/server/providers/whatsapp';
import { processRequest } from '@/server/engine/wave';

export async function POST(req: NextRequest) {
  const env = getEnv();
  const { searchParams } = new URL(req.url);
  const step = searchParams.get('s') || 'group';
  const requestId = searchParams.get('r');

  // Read Form data sent by Twilio
  const formData = await req.formData();
  const digits = (formData.get('Digits') as string) || '';
  const callerPhone = (formData.get('From') as string) || '+919849497911';

  // 1. Step: Group Selection
  if (step === 'group') {
    const digitMap: Record<string, BloodGroup> = {
      '1': 'O+',
      '2': 'O-',
      '3': 'A+',
      '4': 'B+',
      '5': 'AB+',
    };

    const selectedGroup: BloodGroup = digitMap[digits] || 'O+';
    const lat = 17.0005;
    const lng = 81.804;
    const locationName = 'Rajahmundry, East Godavari';

    // Fetch nearest blood banks
    const banks = await getNearbyBloodBanks(lat, lng, selectedGroup);
    const topBank = banks[0];

    // Zero-OTP Request Creation: Verified by Caller ID
    let newRequestId = '';
    let liveUrl = '';

    try {
      const userId = await getOrCreateRequesterUser(callerPhone);
      const supabase = getSupabaseAdmin();

      const { data: newRequest } = await supabase
        .from('requests')
        .insert({
          requester_id: userId,
          requester_name: 'Helpline Caller',
          relation: 'family',
          patient_first_name: 'Emergency Patient',
          patient_age: 30,
          reason: 'accident',
          blood_group: selectedGroup,
          component: 'whole_blood',
          units_needed: 1,
          urgency: 'now',
          needed_by: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
          hospital_name: topBank?.name || 'Government Teaching General Hospital',
          hospital_area: locationName,
          hospital_geo: `POINT(${lng} ${lat})`,
          hospital_phone: callerPhone,
          allow_compatible: true,
          status: 'searching',
          approved_up_to_km: 50,
        })
        .select()
        .single();

      if (newRequest) {
        newRequestId = newRequest.id;
        const token = generateRequestAccessToken(newRequest.id);
        liveUrl = `${env.PUBLIC_APP_URL}/r/${newRequest.id}?token=${token}`;

        // Immediately send text / WhatsApp message to caller with live URL
        await sendWhatsAppText({
          toE164: callerPhone,
          text:
            `🩸 *Blood Emergency Request Live*\n\n` +
            `Group: *${selectedGroup}*\n` +
            `Top Blood Bank: *${topBank?.name}* (${Number(topBank?.distance_km).toFixed(1)} km)\n\n` +
            `👉 *Tap to view blood banks & live donor tracker:*\n${liveUrl}\n\n` +
            `Reply *FIND DONORS* to start automated alerts to registered donors.`,
        });
      }
    } catch (err) {
      console.error('[Voice Helpline] Error creating request:', err);
    }

    const hospitalNameSpeech = (topBank?.name || 'Government General Hospital').replace(/[^a-zA-Z0-9\s]/g, '');

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">
    We have located ${hospitalNameSpeech} with ${selectedGroup} blood units available.
    We have just sent the direct link to your phone via message.
  </Say>
  <Gather numDigits="1" action="/api/webhooks/twilio/voice/inbound/step?s=dispatch&amp;r=${newRequestId}" method="POST" timeout="7">
    <Say voice="Polly.Aditi" language="en-IN">
      To start alerting nearby volunteer donors immediately, press 1.
      Otherwise, you can hang up and open the message on your phone.
    </Say>
  </Gather>
  <Say voice="Polly.Aditi" language="en-IN">
    Thank you for calling Blood Emergency. Please check your phone messages. Goodbye.
  </Say>
  <Hangup/>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // 2. Step: Donor Dispatch
  if (step === 'dispatch' && requestId) {
    if (digits === '1') {
      const supabase = getSupabaseAdmin();
      const { data: reqRow } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (reqRow) {
        const { data: settingsRows } = await supabase.from('app_settings').select('*');
        const settings: Record<string, any> = {};
        for (const row of settingsRows || []) {
          settings[row.key] = row.value;
        }

        processRequest(reqRow, settings).catch((err) => {
          console.error('[Voice Helpline] Async processRequest error:', err);
        });

        const token = generateRequestAccessToken(reqRow.id);
        const liveUrl = `${env.PUBLIC_APP_URL}/r/${reqRow.id}?token=${token}`;

        await sendWhatsAppText({
          toE164: callerPhone,
          text:
            `🚨 *Donor Outreach Started!*\n\n` +
            `Our automated system is now calling and messaging compatible volunteer donors in your area.\n\n` +
            `📱 *Live Tracker & Incoming Donors:*\n👉 ${liveUrl}`,
        });

        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">
    We are now alerting nearby volunteer donors. Please open the link we sent to your phone to track incoming donor responses. Goodbye.
  </Say>
  <Hangup/>
</Response>`;

        return new NextResponse(twiml, {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        });
      }
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">
    Thank you for calling Blood Emergency. Please check your phone for the hospital details. Goodbye.
  </Say>
  <Hangup/>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  return new NextResponse('<Response><Hangup/></Response>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
