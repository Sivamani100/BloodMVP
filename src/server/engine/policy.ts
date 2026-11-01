import { getSupabaseAdmin } from '@/server/supabase-admin';
import { checkActivation } from '@/lib/donor-rules';

export interface ChannelPolicy {
  sendWhatsApp: boolean;
  placeVoiceCall: boolean;
}

export function decidePolicy(
  contact: { donor_languages?: string[] },
  request: { urgency: string },
  settings: { whatsapp_enabled?: boolean; voice_enabled?: boolean }
): ChannelPolicy {
  const whatsapp = settings.whatsapp_enabled !== false;
  const voice =
    settings.voice_enabled !== false &&
    ['now', 'six_hours'].includes(request.urgency);

  return {
    sendWhatsApp: whatsapp,
    placeVoiceCall: voice,
  };
}

export async function recomputeDonorState(donorId: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  // Fetch all necessary donor tables for this donor
  const [donorRes, privateRes, consentsRes, healthRes, locationRes] = await Promise.all([
    supabase.from('donors').select('*').eq('id', donorId).single(),
    supabase.from('donor_private').select('*').eq('donor_id', donorId).single(),
    supabase.from('consents').select('type').eq('user_id', donorId).is('withdrawn_at', null),
    supabase.from('donor_health').select('*').eq('donor_id', donorId).single(),
    supabase.from('donor_location').select('home_geo').eq('donor_id', donorId).single(),
  ]);

  if (!donorRes.data) {
    return 'deleted';
  }

  const d = donorRes.data;
  const p = privateRes.data;
  const consents = (consentsRes.data || []).map((c) => c.type);
  const health = healthRes.data;
  const hasLocation = !!locationRes.data?.home_geo;

  const isHealthValid =
    !!health &&
    health.blocking_reason === null &&
    new Date(health.valid_until) > new Date();

  const checklist = checkActivation({
    dob: d.dob,
    weight_kg: Number(d.weight_kg),
    gender: d.gender as 'male' | 'female' | 'other',
    last_donation_date: d.last_donation_date,
    email_verified: p?.email_verified,
    phone_verified: !!p?.phone_e164,
    consents,
    health_ok: isHealthValid,
    blood_group: d.blood_group,
    has_location: hasLocation,
  });

  let newState = d.state;
  if (d.state !== 'suspended' && d.state !== 'deleted') {
    newState = checklist.isEligible ? 'active' : 'pending';
  }

  await supabase
    .from('donors')
    .update({
      state: newState,
      health_ok: isHealthValid,
      updated_at: new Date().toISOString(),
    })
    .eq('id', donorId);

  return newState;
}
