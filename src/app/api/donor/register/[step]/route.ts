import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/server/supabase-admin';
import {
  consentStepSchema,
  donorBasicSchema,
  donorBloodSchema,
  donorHealthSchema,
  donorLocationSchema,
  donorPrefsSchema,
  donorEmailSchema,
} from '@/lib/schemas';
import { evaluateHealthAnswers } from '@/lib/health-questions';
import { encrypt } from '@/server/security/crypto';
import { recomputeDonorState } from '@/server/engine/policy';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ step: string }> }
) {
  const { step } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }

  const json = await req.json();
  const adminClient = getSupabaseAdmin();

  try {
    switch (step) {
      case 'consent': {
        const data = consentStepSchema.parse(json);
        // Insert consents for user
        const toInsert = data.consents.map((type) => ({
          user_id: user.id,
          type,
          version: 'v1',
          channel: 'web',
        }));
        await supabase.from('consents').insert(toInsert);
        break;
      }

      case 'basic': {
        const data = donorBasicSchema.parse(json);
        await supabase.from('donors').upsert({
          id: user.id,
          full_name: data.full_name,
          dob: data.dob,
          gender: data.gender,
          weight_kg: data.weight_kg,
          languages: data.languages,
        });

        // Initialize donor_private with user's phone if missing
        if (user.phone) {
          await adminClient.from('donor_private').upsert({
            donor_id: user.id,
            phone_e164: user.phone,
          });
        }
        break;
      }

      case 'blood': {
        const data = donorBloodSchema.parse(json);
        await supabase.from('donors').update({
          blood_group: data.blood_group,
          group_confidence: data.group_confidence,
          last_donation_date: data.last_donation_date || null,
          also_platelets: data.also_platelets,
        }).eq('id', user.id);
        break;
      }

      case 'health': {
        const data = donorHealthSchema.parse(json);
        // Get donor gender
        const { data: d } = await supabase.from('donors').select('gender').eq('id', user.id).single();
        const gender = (d?.gender as any) || 'male';

        const evalRes = evaluateHealthAnswers(data.answers, gender);
        const encryptedAnswers = encrypt(JSON.stringify(data.answers));

        await adminClient.from('donor_health').upsert({
          donor_id: user.id,
          answers_enc: encryptedAnswers,
          blocking_reason: evalRes.blockingReason,
          answered_at: new Date().toISOString(),
          valid_until: evalRes.validUntil.toISOString(),
        });
        break;
      }

      case 'location': {
        const data = donorLocationSchema.parse(json);
        const pointWkt = `POINT(${data.lng} ${data.lat})`;

        await adminClient.from('donor_location').upsert({
          donor_id: user.id,
          home_geo: pointWkt,
          area: data.area,
          city: data.city,
          pincode: data.pincode,
          max_travel_km: data.max_travel_km,
          transport: data.transport,
        });
        break;
      }

      case 'prefs': {
        const data = donorPrefsSchema.parse(json);
        await supabase.from('donor_prefs').upsert({
          donor_id: user.id,
          quiet_start: data.quiet_start || null,
          quiet_end: data.quiet_end || null,
          allow_critical_in_quiet: data.allow_critical_in_quiet,
          max_requests_per_month: data.max_requests_per_month,
        });
        break;
      }

      case 'email': {
        const data = donorEmailSchema.parse(json);
        // Update auth user email, Supabase sends confirmation
        const { error: updErr } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (updErr) {
          return NextResponse.json({ error: updErr.message }, { status: 400 });
        }
        await adminClient.from('donor_private').update({ email: data.email }).eq('donor_id', user.id);
        break;
      }

      default:
        return NextResponse.json({ error: 'invalid_step' }, { status: 400 });
    }

    // Recompute state after each step
    const state = await recomputeDonorState(user.id);
    return NextResponse.json({ success: true, state });
  } catch (err: any) {
    console.error(`Error in donor registration step ${step}:`, err);
    return NextResponse.json(
      { error: err.name === 'ZodError' ? 'invalid_input' : err.message || 'unknown' },
      { status: 400 }
    );
  }
}
