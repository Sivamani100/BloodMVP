import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/server/env';
import { getSupabaseAdmin } from '@/server/supabase-admin';
import { processIVRStep } from '@/server/assistant/ivr-flow';
import { StepKey } from '@/server/assistant/script';
import { Locale } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get('c');
  const stepKey = searchParams.get('s') as StepKey | undefined;
  const lang = (searchParams.get('l') as Locale) || 'en';
  const attempt = parseInt(searchParams.get('try') || '1', 10);

  if (!contactId) {
    return new NextResponse('Missing contactId', { status: 400 });
  }

  const formData = await req.formData().catch(() => null);
  const digits = formData?.get('Digits')?.toString() || undefined;

  const supabase = getSupabaseAdmin();
  const { data: contact } = await supabase
    .from('request_contacts')
    .select('*, requests(*), donors(*)')
    .eq('id', contactId)
    .single();

  if (!contact || !contact.requests || !contact.donors) {
    return new NextResponse('Contact not found', { status: 404 });
  }

  const env = getEnv();
  const ivrRes = processIVRStep({
    contactId,
    stepKey,
    digits,
    lang,
    attempt,
    request: contact.requests as any,
    donor: {
      id: contact.donors.id,
      first_name: contact.donors.first_name || 'Donor',
      gender: (contact.donors.gender as any) || 'male',
      opted_out: false,
    },
    contact: {
      id: contact.id,
      status: contact.status,
      answers: (contact.answers as any) || {},
      donation_code: contact.donation_code,
    },
    publicAppUrl: env.PUBLIC_APP_URL,
  });

  // If a final decision was reached, call finalize_contact RPC
  if (ivrRes.finalDecision) {
    const status = ivrRes.finalDecision === 'wrong_number' ? 'declined' : ivrRes.finalDecision;
    await supabase.rpc('finalize_contact', {
      p_contact_id: contactId,
      p_status: status as any,
      p_via: 'call',
      p_answers: (ivrRes.updatedAnswers as any) ?? {},
      p_eta: ivrRes.updatedAnswers?.eta_minutes ?? undefined,
      p_share_phone: ivrRes.updatedAnswers?.share_phone ?? undefined,
    });
  } else if (ivrRes.updatedAnswers) {
    await supabase
      .from('request_contacts')
      .update({ answers: ivrRes.updatedAnswers as any, updated_at: new Date().toISOString() })
      .eq('id', contactId);
  }

  return new NextResponse(ivrRes.twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
