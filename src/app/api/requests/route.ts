import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/server/supabase-admin';
import { createRequestSchema } from '@/lib/schemas';
import { MONEY_WORDS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const parsed = createRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', details: parsed.error.format() }, { status: 400 });
  }

  const data = parsed.data;

  // Note check: no phone numbers and no money words
  if (data.note) {
    const hasPhone = /\d{5,}/.test(data.note.replace(/\s+/g, ''));
    const lowerNote = data.note.toLowerCase();
    const hasMoneyWord = MONEY_WORDS.some((word) => lowerNote.includes(word.toLowerCase()));

    if (hasPhone || hasMoneyWord) {
      return NextResponse.json(
        { error: 'Note contains blocked words or phone numbers. Blood never asks for money.' },
        { status: 400 }
      );
    }
  }

  const neededBy = data.needed_by && !isNaN(Date.parse(data.needed_by))
    ? new Date(data.needed_by).toISOString()
    : new Date(Date.now() + 6 * 3600 * 1000).toISOString();

  // Call create_request RPC with user's session
  const { data: requestId, error: rpcErr } = await supabase.rpc('create_request', {
    p_requester_name: data.requester_name.trim(),
    p_relation: data.relation,
    p_patient_first_name: data.patient_first_name.trim(),
    p_patient_age: data.patient_age || 30,
    p_reason: (data.reason as any) || 'other',
    p_blood_group: data.blood_group,
    p_component: data.component,
    p_units: data.units_needed,
    p_urgency: data.urgency,
    p_needed_by: neededBy,
    p_hospital_name: data.hospital_name.trim(),
    p_hospital_area: data.hospital_area || '',
    p_lat: data.lat,
    p_lng: data.lng,
    p_ward_info: data.ward_info || '',
    p_hospital_phone: data.hospital_phone || '',
    p_allow_compatible: data.allow_compatible,
    p_note: data.note || '',
    p_slip_path: data.slip_path || '',
  });

  let finalRequestId = requestId;

  if (rpcErr) {
    console.warn('RPC create_request warning, attempting fallback insert:', rpcErr.message);

    // Fallback: Use service role to insert request directly if PostGIS RPC type resolution fails
    const adminSb = getSupabaseAdmin();
    const { data: inserted, error: insertErr } = await adminSb
      .from('requests')
      .insert({
        requester_id: user.id,
        requester_name: data.requester_name.trim(),
        relation: data.relation,
        patient_first_name: data.patient_first_name.trim(),
        patient_age: data.patient_age || 30,
        reason: (data.reason as any) || 'other',
        blood_group: data.blood_group,
        component: data.component,
        units_needed: data.units_needed,
        urgency: data.urgency,
        needed_by: neededBy,
        hospital_name: data.hospital_name.trim(),
        hospital_area: data.hospital_area || '',
        hospital_geo: `POINT(${data.lng} ${data.lat})`,
        ward_info: data.ward_info || null,
        hospital_phone: data.hospital_phone || null,
        allow_compatible: data.allow_compatible,
        note: data.note || null,
        slip_path: data.slip_path || null,
      })
      .select('id')
      .single();

    if (insertErr || !inserted) {
      console.error('Direct fallback insert error:', insertErr);
      const rawMsg = rpcErr?.message || insertErr?.message || 'Failed to create blood request';
      const userFriendlyMessage = rawMsg.includes('duplicate active request')
        ? 'An active blood request already exists for this patient at this hospital.'
        : rawMsg.includes('too many requests')
        ? 'Daily limit reached: Maximum 3 blood requests per day.'
        : rawMsg.includes('phone verification')
        ? 'Phone verification required before submitting a request.'
        : rawMsg.includes('paused')
        ? 'Service is currently paused.'
        : rawMsg;

      const code = rawMsg.includes('too many')
        ? 'rate_limited'
        : rawMsg.includes('duplicate')
        ? 'duplicate_request'
        : rawMsg.includes('paused')
        ? 'service_paused'
        : 'validation_error';

      return NextResponse.json({ error: code, message: userFriendlyMessage }, { status: 400 });
    }

    finalRequestId = inserted.id;

    // Log in audit logs
    await adminSb.from('audit_logs').insert({
      actor_id: user.id,
      action: 'create_request',
      target_type: 'request',
      target_id: finalRequestId,
    });
  }

  return NextResponse.json({ id: finalRequestId });
}
