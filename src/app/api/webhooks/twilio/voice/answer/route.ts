import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/server/env';
import { getSupabaseAdmin } from '@/server/supabase-admin';
import { processIVRStep } from '@/server/assistant/ivr-flow';
import { Locale } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get('c');
  const lang = (searchParams.get('l') as Locale) || 'en';

  if (!contactId) {
    return new NextResponse('Missing contactId', { status: 400 });
  }

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
    lang,
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

  if (ivrRes.updatedAnswers) {
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
