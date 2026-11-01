import { getSupabaseAdmin } from '@/server/supabase-admin';
import { RINGS_KM, CONTACT_MULTIPLIER, MAX_CONTACTS_PER_REQUEST, UrgencyLevel } from '@/lib/constants';
import { getWaveMinutes } from './rings';
import { dispatchContacts, DispatchContactItem } from './dispatch';

export async function processRequest(
  requestRow: any,
  settings: Record<string, any>,
  now = () => new Date()
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const currentDate = now();

  // a. Refresh r from DB
  const { data: r, error: rErr } = await supabase
    .from('requests')
    .select('*')
    .eq('id', requestRow.id)
    .single();

  if (rErr || !r || r.status !== 'searching') {
    return;
  }

  // b. Check expiry
  if (r.needed_by && currentDate > new Date(new Date(r.needed_by).getTime() + 6 * 3600 * 1000)) {
    await supabase
      .from('requests')
      .update({ status: 'expired', closed_at: currentDate.toISOString(), close_reason: 'needed_by_passed' })
      .eq('id', r.id);
    await supabase
      .from('request_contacts')
      .update({ status: 'cancelled' })
      .eq('request_id', r.id)
      .in('status', ['queued', 'contacting']);
    return;
  }

  // c. Units needed
  const needed = r.units_needed - r.accepted_count;
  if (needed <= 0) {
    return;
  }

  // d. Pending contacts check
  const { data: pendingContacts } = await supabase
    .from('request_contacts')
    .select('id, status')
    .eq('request_id', r.id)
    .in('status', ['queued', 'contacting']);

  const pending = pendingContacts || [];
  if (r.wave_expires_at && new Date(r.wave_expires_at) > currentDate && pending.length > 0) {
    // Wave is still running
    const nextTick = new Date(Math.min(new Date(r.wave_expires_at).getTime(), currentDate.getTime() + 30000));
    await supabase.from('requests').update({ next_tick_at: nextTick.toISOString() }).eq('id', r.id);
    return;
  }

  // Wave is over: mark remaining contacting as no_answer
  if (pending.length > 0) {
    await supabase
      .from('request_contacts')
      .update({ status: 'no_answer', updated_at: currentDate.toISOString() })
      .eq('request_id', r.id)
      .eq('status', 'contacting');
  }

  // e. Check max contacts
  const maxContacts = settings.max_contacts_per_request?.value || MAX_CONTACTS_PER_REQUEST;
  const contactsSoFar = r.contacts_count || 0;
  if (contactsSoFar >= maxContacts) {
    await markExhausted(r.id, supabase, currentDate);
    return;
  }

  // f. Ring index
  let ringIdx = 0;
  if (r.current_ring_km && Number(r.current_ring_km) > 0) {
    const curIdx = (RINGS_KM as readonly number[]).indexOf(Number(r.current_ring_km));
    ringIdx = curIdx >= 0 ? curIdx + 1 : 0;
  }

  // g. Loop through rings
  while (ringIdx < RINGS_KM.length) {
    const ring = RINGS_KM[ringIdx];

    // Gate check
    if (ring > (r.approved_up_to_km || 50)) {
      await supabase
        .from('requests')
        .update({
          status: 'waiting_requester',
          pending_gate_km: ring,
          next_tick_at: new Date(currentDate.getTime() + 300000).toISOString(),
        })
        .eq('id', r.id);
      return;
    }

    const limit = Math.min(needed * CONTACT_MULTIPLIER, maxContacts - contactsSoFar);
    if (limit <= 0) {
      await markExhausted(r.id, supabase, currentDate);
      return;
    }

    // Call find_candidate_donors RPC
    const { data: candidates, error: cErr } = await supabase.rpc('find_candidate_donors', {
      p_request_id: r.id,
      p_ring_km: ring,
      p_limit: limit,
    });

    if (cErr || !candidates || candidates.length === 0) {
      ringIdx++;
      continue; // empty ring skipped instantly!
    }

    // Insert contacts
    const waveNo = (r.wave_no || 0) + 1;
    const toInsert = candidates.map((cand: any) => ({
      request_id: r.id,
      donor_id: cand.donor_id,
      ring_km: ring,
      wave_no: waveNo,
      distance_km: cand.distance_km,
      status: 'queued' as const,
    }));

    const { data: insertedContacts, error: insErr } = await supabase
      .from('request_contacts')
      .insert(toInsert)
      .select('id, request_id, donor_id, distance_km');

    if (insErr || !insertedContacts) {
      console.error('Error inserting contacts:', insErr);
      return;
    }

    // Fetch phone numbers and names for dispatch
    const donorIds = insertedContacts.map((c) => c.donor_id);
    const [donorsRes, privRes] = await Promise.all([
      supabase.from('donors').select('id, first_name, languages').in('id', donorIds),
      supabase.from('donor_private').select('donor_id, phone_e164').in('donor_id', donorIds),
    ]);

    const donorMap = new Map((donorsRes.data || []).map((d) => [d.id, d]));
    const privMap = new Map((privRes.data || []).map((p) => [p.donor_id, p.phone_e164]));

    const dispatchItems: DispatchContactItem[] = insertedContacts.map((c) => {
      const d = donorMap.get(c.donor_id);
      return {
        id: c.id,
        request_id: c.request_id,
        donor_id: c.donor_id,
        phone_e164: privMap.get(c.donor_id) || '',
        donor_first_name: d?.first_name || 'Donor',
        donor_languages: d?.languages || ['en'],
        patient_first_name: r.patient_first_name,
        blood_group: r.blood_group,
        units_needed: r.units_needed,
        hospital_name: r.hospital_name,
        hospital_area: r.hospital_area,
        urgency: r.urgency,
      };
    });

    // Update request with wave expiry and ring
    const waveMins = getWaveMinutes(r.urgency as UrgencyLevel, settings.wave_minutes);
    const waveExpiresAt = new Date(currentDate.getTime() + waveMins * 60 * 1000);

    await supabase
      .from('requests')
      .update({
        current_ring_km: ring,
        wave_no: waveNo,
        wave_expires_at: waveExpiresAt.toISOString(),
        next_tick_at: waveExpiresAt.toISOString(),
      })
      .eq('id', r.id);

    // Dispatch contacts
    await dispatchContacts(dispatchItems, r, settings);
    return;
  }

  // h. No rings left
  await markExhausted(r.id, supabase, currentDate);
}

async function markExhausted(requestId: string, supabase: any, now: Date) {
  await supabase
    .from('requests')
    .update({
      exhausted_at: now.toISOString(),
      next_tick_at: new Date(now.getTime() + 3600 * 1000).toISOString(),
    })
    .eq('id', requestId);

  await supabase.from('audit_logs').insert({
    action: 'request_exhausted',
    target_type: 'request',
    target_id: requestId,
  });
}
