import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { donationConfirmSchema } from '@/lib/schemas';
import { sendWhatsAppTemplate } from '@/server/providers/whatsapp';
import { getSupabaseAdmin } from '@/server/supabase-admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }

  const json = await req.json();
  const parsed = donationConfirmSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  // Rate limit check: 5 attempts per hour
  const adminClient = getSupabaseAdmin();
  const { data: rlOk } = await adminClient.rpc('rl_hit', {
    p_key: `confirm_donation:${id}`,
    p_window_seconds: 3600,
    p_max: 5,
  });

  if (!rlOk) {
    return NextResponse.json({ error: 'code_locked' }, { status: 429 });
  }

  const { data: ok, error } = await supabase.rpc('confirm_donation', {
    p_contact_id: id,
    p_code: parsed.data.code,
    p_by: 'requester',
  });

  if (error || !ok) {
    return NextResponse.json({ error: 'code_wrong' }, { status: 400 });
  }

  // Send thank you template to donor
  try {
    const { data: contact } = await adminClient
      .from('request_contacts')
      .select('donor_id')
      .eq('id', id)
      .single();

    if (contact?.donor_id) {
      const [donorRes, privRes] = await Promise.all([
        adminClient.from('donors').select('first_name, next_eligible_date, languages').eq('id', contact.donor_id).single(),
        adminClient.from('donor_private').select('phone_e164').eq('donor_id', contact.donor_id).single(),
      ]);

      if (donorRes.data && privRes.data?.phone_e164) {
        const lang = donorRes.data.languages?.[0] || 'en';
        await sendWhatsAppTemplate({
          toE164: privRes.data.phone_e164,
          templateName: 'blood_donation_thanks',
          langCode: lang,
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: donorRes.data.first_name || 'Donor' },
                { type: 'text', text: donorRes.data.next_eligible_date || '3 months' },
              ],
            },
          ],
        });
      }
    }
  } catch (err) {
    console.error('Failed to send thank you WhatsApp message:', err);
  }

  return NextResponse.json({ success: true });
}
