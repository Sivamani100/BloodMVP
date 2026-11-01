import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/server/supabase-admin';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get('c');

  const formData = await req.formData().catch(() => null);
  const callSid = formData?.get('CallSid')?.toString();
  const rawStatus = formData?.get('CallStatus')?.toString()?.toLowerCase();

  if (!contactId || !rawStatus) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Idempotency check
  const eventKey = `twilio:${callSid || contactId}:${rawStatus}`;
  const { error: eventErr } = await supabase.from('webhook_events').insert({
    provider: 'twilio',
    event_id: eventKey,
  });
  if (eventErr) {
    return NextResponse.json({ ok: true }); // already processed
  }

  let mappedStatus = 'pending';
  switch (rawStatus) {
    case 'ringing':
      mappedStatus = 'ringing';
      break;
    case 'in-progress':
    case 'answered':
      mappedStatus = 'answered';
      break;
    case 'completed':
      mappedStatus = 'completed';
      break;
    case 'busy':
      mappedStatus = 'busy';
      break;
    case 'no-answer':
      mappedStatus = 'no_answer';
      break;
    case 'failed':
    case 'canceled':
      mappedStatus = 'failed';
      break;
    default:
      mappedStatus = 'dialing';
  }

  let nextStatus: any = undefined;
  if (['no_answer', 'busy', 'failed'].includes(mappedStatus)) {
    const { data: curContact } = await supabase
      .from('request_contacts')
      .select('status')
      .eq('id', contactId)
      .single();

    if (curContact && ['contacting', 'queued'].includes(curContact.status)) {
      nextStatus = 'no_answer';
    }
  }

  await supabase
    .from('request_contacts')
    .update({
      call_status: mappedStatus,
      updated_at: new Date().toISOString(),
      ...(nextStatus ? { status: nextStatus } : {}),
    })
    .eq('id', contactId);

  return NextResponse.json({ ok: true });
}

