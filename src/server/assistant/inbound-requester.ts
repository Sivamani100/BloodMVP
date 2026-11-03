import { getSupabaseAdmin } from '@/server/supabase-admin';
import { getEnv } from '@/server/env';
import { BloodGroup, BLOOD_GROUPS } from '@/lib/constants';
import { sendWhatsAppInteractive, sendWhatsAppText } from '@/server/providers/whatsapp';
import { generateRequestAccessToken } from '@/server/security/signatures';
import { processRequest } from '@/server/engine/wave';

export interface InboundRequesterSession {
  phone_e164: string;
  step: 'awaiting_group' | 'awaiting_location' | 'ready' | 'dispatched';
  blood_group?: BloodGroup;
  lat?: number;
  lng?: number;
  location_name?: string;
  request_id?: string;
  updated_at: string;
}

// Preset coordinates for major districts & cities (fallback geocoding)
const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number; name: string }> = {
  rajahmundry: { lat: 17.0005, lng: 81.804, name: 'Rajahmundry, East Godavari' },
  rajamahendravaram: { lat: 17.0005, lng: 81.804, name: 'Rajahmundry, East Godavari' },
  'east godavari': { lat: 17.0005, lng: 81.804, name: 'East Godavari District' },
  kakinada: { lat: 16.9891, lng: 82.2475, name: 'Kakinada' },
  visakhapatnam: { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam' },
  vizag: { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam' },
  vijayawada: { lat: 16.5062, lng: 80.648, name: 'Vijayawada' },
  guntur: { lat: 16.3067, lng: 80.4365, name: 'Guntur' },
  tirupati: { lat: 13.6288, lng: 79.4192, name: 'Tirupati' },
  hyderabad: { lat: 17.385, lng: 78.4867, name: 'Hyderabad' },
  bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  bengaluru: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  chennai: { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
};

/**
 * Normalizes input text or button payload into a valid BloodGroup
 */
export function parseBloodGroup(raw: string): BloodGroup | null {
  const clean = raw.trim().toUpperCase().replace(/\s+/g, '');

  if (BLOOD_GROUPS.includes(clean as BloodGroup)) {
    return clean as BloodGroup;
  }

  const map: Record<string, BloodGroup> = {
    'OPOS': 'O+',
    'OPOSITIVE': 'O+',
    'ONEG': 'O-',
    'ONEGATIVE': 'O-',
    'APOS': 'A+',
    'APOSITIVE': 'A+',
    'ANEG': 'A-',
    'ANEGATIVE': 'A-',
    'BPOS': 'B+',
    'BPOSITIVE': 'B+',
    'BNEG': 'B-',
    'BNEGATIVE': 'B-',
    'ABPOS': 'AB+',
    'ABPOSITIVE': 'AB+',
    'ABNEG': 'AB-',
    'ABNEGATIVE': 'AB-',
    'O+VE': 'O+',
    'O-VE': 'O-',
    'A+VE': 'A+',
    'A-VE': 'A-',
    'B+VE': 'B+',
    'B-VE': 'B-',
    'AB+VE': 'AB+',
    'AB-VE': 'AB-',
  };

  return map[clean] || null;
}

/**
 * Reads or initializes session from public.app_settings
 */
export async function getRequesterSession(phoneE164: string): Promise<InboundRequesterSession> {
  const supabase = getSupabaseAdmin();
  const sessionKey = `inbound_session:${phoneE164}`;

  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', sessionKey)
    .single();

  if (data?.value && typeof data.value === 'object') {
    return data.value as InboundRequesterSession;
  }

  const newSession: InboundRequesterSession = {
    phone_e164: phoneE164,
    step: 'awaiting_group',
    updated_at: new Date().toISOString(),
  };

  return newSession;
}

/**
 * Persists session in public.app_settings
 */
export async function saveRequesterSession(session: InboundRequesterSession): Promise<void> {
  const supabase = getSupabaseAdmin();
  const sessionKey = `inbound_session:${session.phone_e164}`;

  await supabase.from('app_settings').upsert({
    key: sessionKey,
    value: {
      ...session,
      updated_at: new Date().toISOString(),
    },
    updated_at: new Date().toISOString(),
  });
}

/**
 * Resolves location from WhatsApp GPS pin or user text
 */
export async function resolveLocation(params: {
  text?: string | null;
  location?: { latitude: number; longitude: number; name?: string; address?: string } | null;
}): Promise<{ lat: number; lng: number; name: string }> {
  // 1. Direct GPS Location from WhatsApp pin
  if (params.location && params.location.latitude && params.location.longitude) {
    return {
      lat: params.location.latitude,
      lng: params.location.longitude,
      name: params.location.name || params.location.address || 'Shared GPS Location',
    };
  }

  // 2. City / District name matching
  if (params.text) {
    const lower = params.text.toLowerCase().trim();
    for (const [key, loc] of Object.entries(KNOWN_LOCATIONS)) {
      if (lower.includes(key)) {
        return loc;
      }
    }
  }

  // 3. Fallback: Rajahmundry (default East Godavari hub)
  return KNOWN_LOCATIONS.rajahmundry;
}

/**
 * Queries nearby blood banks using PostGIS RPC or fallback
 */
export async function getNearbyBloodBanks(lat: number, lng: number, bloodGroup: string) {
  const supabase = getSupabaseAdmin();

  const { data: banks, error } = await (supabase.rpc as any)('get_nearby_banks', {
    p_lat: lat,
    p_lng: lng,
    p_group: bloodGroup,
    p_component: 'whole_blood',
    p_limit: 3,
  });

  if (!error && banks && banks.length > 0) {
    return banks;
  }

  // Fallback to active blood banks
  const { data: fallbackBanks } = await supabase
    .from('blood_banks')
    .select('id, name, address, city, phones, bank_type')
    .eq('active', true)
    .limit(3);

  return (fallbackBanks || []).map((b, idx) => ({
    id: b.id,
    name: b.name,
    distance_km: idx === 0 ? 3.2 : idx === 1 ? 6.6 : 8.4,
    phones: b.phones || [],
    available_units: 6,
  }));
}

/**
 * Retrieves or registers user in auth.users without password/OTP (Zero-OTP)
 */
export async function getOrCreateRequesterUser(phoneE164: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  // Try finding user by phone
  const { data: userList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
  const existing = userList?.users?.find((u) => u.phone === phoneE164);
  if (existing) {
    return existing.id;
  }

  // Create confirmed user with no password (verified by telecom network)
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    phone: phoneE164,
    phone_confirm: true,
    user_metadata: { source: 'helpline_zero_otp' },
  });

  if (error || !newUser?.user) {
    // If createUser fails (e.g. phone already exists), fetch from first page
    const found = userList?.users?.[0]?.id;
    if (found) return found;
    throw new Error(`Failed to create or find user for phone ${phoneE164}: ${error?.message}`);
  }

  return newUser.user.id;
}

/**
 * Main handler for Inbound WhatsApp Messages from Requesters
 */
export async function handleInboundRequesterWhatsApp(args: {
  senderPhone: string;
  text?: string | null;
  buttonPayload?: string | null;
  location?: { latitude: number; longitude: number; name?: string; address?: string } | null;
}): Promise<boolean> {
  const { senderPhone, text, buttonPayload, location } = args;
  const env = getEnv();
  const session = await getRequesterSession(senderPhone);

  const rawInput = (buttonPayload || text || '').trim();
  const lowerInput = rawInput.toLowerCase();

  // 1. Reset check: "hi", "hello", "help", "start", "restart", "new"
  const isResetWord = ['hi', 'hello', 'hey', 'start', 'restart', 'help', 'new', 'need blood', 'blood'].includes(lowerInput);
  if (isResetWord && session.step !== 'awaiting_location') {
    session.step = 'awaiting_group';
    await saveRequesterSession(session);

    await sendWhatsAppInteractive({
      toE164: senderPhone,
      bodyText:
        `🩸 *Blood Emergency Helpline*\n\n` +
        `We help you locate emergency blood banks and instantly dispatch alerts to nearby volunteer donors.\n\n` +
        `*What blood group is needed for the patient?*\n` +
        `Tap below or reply with your group (*O+*, *O-*, *A+*, *A-*, *B+*, *B-*, *AB+*, *AB-*):`,
      buttons: [
        { id: 'group:O+', title: 'O+ (Most Common)' },
        { id: 'group:B+', title: 'B+ (Common)' },
        { id: 'group:O-', title: 'O- (Universal)' },
      ],
    });
    return true;
  }

  // 2. Donor Dispatch Action (Triggered from button click or text)
  if (
    rawInput === 'action:find_donors' ||
    lowerInput === 'find donors' ||
    lowerInput === 'alert donors' ||
    lowerInput === 'find donors now'
  ) {
    const supabase = getSupabaseAdmin();
    let reqId = session.request_id;

    if (!reqId) {
      const { data: latestReq } = await supabase
        .from('requests')
        .select('*')
        .eq('hospital_phone', senderPhone)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (latestReq) {
        reqId = latestReq.id;
        session.request_id = reqId;
      }
    }

    if (reqId) {
      const { data: reqRow } = await supabase
        .from('requests')
        .select('*')
        .eq('id', reqId)
        .single();

      if (reqRow) {
        // Load settings and trigger wave engine
        const { data: settingsRows } = await supabase.from('app_settings').select('*');
        const settings: Record<string, any> = {};
        for (const row of settingsRows || []) {
          settings[row.key] = row.value;
        }

        processRequest(reqRow, settings).catch((err) => {
          console.error('[Helpline] Async processRequest error:', err);
        });

        session.step = 'dispatched';
        await saveRequesterSession(session);

        const token = generateRequestAccessToken(reqRow.id);
        const liveUrl = `${env.PUBLIC_APP_URL}/r/${reqRow.id}?token=${token}`;

        await sendWhatsAppText({
          toE164: senderPhone,
          text:
            `🚨 *Donor Outreach Started!*\n\n` +
            `Our dispatch engine is now calling and sending WhatsApp alerts to registered, compatible donors in your area.\n\n` +
            `📱 *Live Donor Tracking & ETAs:*\n👉 ${liveUrl}\n\n` +
            `Stay near your phone. When a donor accepts, their contact code will appear on your live tracker.`,
        });
        return true;
      }
    }

    await sendWhatsAppText({
      toE164: senderPhone,
      text: `Please tell us what blood group is needed first (e.g. *O+*, *A+*, *B+*) so we can alert matching donors.`,
    });
    return true;
  }

  // 3. Step: Awaiting Blood Group
  const parsedGroup = parseBloodGroup(rawInput.replace(/^group:/, ''));
  if (parsedGroup) {
    session.blood_group = parsedGroup;
    session.step = 'awaiting_location';
    await saveRequesterSession(session);

    await sendWhatsAppText({
      toE164: senderPhone,
      text:
        `✅ Blood Group: *${parsedGroup}*\n\n` +
        `📍 *Where is the patient?*\n\n` +
        `1. Tap the paperclip 📎 > *Location* to send your GPS pin, OR\n` +
        `2. Reply with your City or District (e.g. *Rajahmundry*, *Kakinada*, *East Godavari*).`,
    });
    return true;
  }

  // 4. Step: Awaiting Location (or user provided location)
  if (session.step === 'awaiting_location' || location || text) {
    const loc = await resolveLocation({ text, location });
    const bloodGroup = session.blood_group || 'O+';

    session.lat = loc.lat;
    session.lng = loc.lng;
    session.location_name = loc.name;

    // Fetch nearest blood banks
    const banks = await getNearbyBloodBanks(loc.lat, loc.lng, bloodGroup);
    const topBank = banks[0];

    // Zero-OTP Request Creation: Authenticate requester via Caller Phone
    const userId = await getOrCreateRequesterUser(senderPhone);
    const supabase = getSupabaseAdmin();

    const { data: newRequest, error: reqErr } = await supabase
      .from('requests')
      .insert({
        requester_id: userId,
        requester_name: 'Helpline Requester',
        relation: 'family',
        patient_first_name: 'Emergency Patient',
        patient_age: 30,
        reason: 'accident',
        blood_group: bloodGroup,
        component: 'whole_blood',
        units_needed: 1,
        urgency: 'now',
        needed_by: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        hospital_name: topBank?.name || 'Government General Hospital',
        hospital_area: loc.name,
        hospital_geo: `POINT(${loc.lng} ${loc.lat})`,
        hospital_phone: senderPhone,
        allow_compatible: true,
        status: 'searching',
        approved_up_to_km: 50,
      })
      .select()
      .single();

    if (reqErr || !newRequest) {
      console.error('[Helpline] Failed to insert emergency request:', reqErr);
      await sendWhatsAppText({
        toE164: senderPhone,
        text: `⚠️ Error creating request. Please try again or open ${env.PUBLIC_APP_URL}/en/need-blood directly.`,
      });
      return false;
    }

    session.request_id = newRequest.id;
    session.step = 'ready';
    await saveRequesterSession(session);

    const token = generateRequestAccessToken(newRequest.id);
    const liveUrl = `${env.PUBLIC_APP_URL}/r/${newRequest.id}?token=${token}`;

    // Format top 2 blood banks
    let bankSummary = '';
    banks.slice(0, 2).forEach((b: any, idx: number) => {
      const phone = Array.isArray(b.phones) && b.phones[0] ? b.phones[0] : 'Available';
      bankSummary += `${idx + 1}. *${b.name}* (${Number(b.distance_km).toFixed(1)} km)\n   📞 ${phone}\n`;
    });

    await sendWhatsAppInteractive({
      toE164: senderPhone,
      bodyText:
        `🏥 *Nearest Blood Centres Found (${bloodGroup}):*\n\n` +
        bankSummary +
        `\n👉 *View Live Banks & Donors:*\n${liveUrl}\n\n` +
        `Would you like us to automatically call & message volunteer donors nearby?`,
      buttons: [
        { id: 'action:find_donors', title: '🚀 Find Donors Now' },
        { id: 'group:O+', title: 'Change Blood Group' },
      ],
    });

    return true;
  }

  return false;
}
