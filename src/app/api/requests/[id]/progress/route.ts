import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/server/supabase-admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }

  const adminSb = getSupabaseAdmin();

  // 1. Fetch Request
  const { data: request, error: reqErr } = await adminSb
    .from('requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (reqErr || !request) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // 2. Fetch Accepted Cards (from request_donor_cards)
  const { data: cards } = await adminSb
    .from('request_donor_cards')
    .select('*')
    .eq('request_id', requestId);

  // 3. Fetch All Dispatched Contacts for this request
  const { data: contacts } = await adminSb
    .from('request_contacts')
    .select('id, donor_id, distance_km, ring_km, wave_no, status, wa_status, call_status, updated_at, created_at')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });

  // 4. Enrich contacts with donor first_name and blood_group
  const donorIds = (contacts || []).map((c) => c.donor_id);
  const { data: donors } = await adminSb
    .from('donors')
    .select('id, first_name, full_name, blood_group')
    .in('id', donorIds.length > 0 ? donorIds : ['00000000-0000-0000-0000-000000000000']);

  const donorMap = new Map((donors || []).map((d) => [d.id, d]));

  const allContacts = (contacts || []).map((c) => {
    const d = donorMap.get(c.donor_id);
    return {
      contact_id: c.id,
      donor_id: c.donor_id,
      first_name: d?.first_name || d?.full_name || 'Donor',
      full_name: d?.full_name || 'Registered Donor',
      blood_group: d?.blood_group || request.blood_group,
      distance_km: c.distance_km,
      status: c.status, // queued, contacting, accepted, declined, not_eligible, no_answer
      wa_status: c.wa_status, // sent, delivered, read, failed
      call_status: c.call_status, // dialing, ringing, answered, completed, no_answer
      updated_at: c.updated_at,
    };
  });

  return NextResponse.json({
    request,
    donorCards: cards || [],
    allContacts,
  });
}

