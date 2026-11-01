import { getSupabaseAdmin } from '../src/server/supabase-admin';
import { getEnv } from '../src/server/env';
import { encrypt } from '../src/server/security/crypto';
import { REQUIRED_CONSENTS } from '../src/lib/donor-rules';

async function seedDevDonors() {
  const env = getEnv();
  const rawDonors = env.DEV_TEST_DONORS;

  if (!rawDonors) {
    console.log('No DEV_TEST_DONORS found in environment. Example format:');
    console.log(
      JSON.stringify([
        {
          name: 'Siva',
          phone: '+919999900001',
          group: 'O+',
          lat: 17.0005,
          lng: 81.804,
          gender: 'male',
          dob: '2003-01-01',
          weight: 65,
        },
      ])
    );
    return;
  }

  let donorsList: any[] = [];
  try {
    donorsList = JSON.parse(rawDonors);
  } catch (err) {
    console.error('Failed to parse DEV_TEST_DONORS JSON:', err);
    return;
  }

  const supabase = getSupabaseAdmin();

  for (const donor of donorsList) {
    console.log(`Seeding donor: ${donor.name} (${donor.phone})...`);

    // 1. Create or get auth user
    let userId: string;
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const existing = usersData?.users?.find((u) => u.phone === donor.phone);

    if (existing) {
      userId = existing.id;
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        phone: donor.phone,
        phone_confirm: true,
      });
      if (createErr || !newUser.user) {
        console.error(`Error creating auth user for ${donor.phone}:`, createErr);
        continue;
      }
      userId = newUser.user.id;
    }

    // 2. Insert into donors
    await supabase.from('donors').upsert({
      id: userId,
      full_name: donor.name,
      dob: donor.dob || '2000-01-01',
      gender: donor.gender || 'male',
      weight_kg: donor.weight || 65,
      blood_group: donor.group || 'O+',
      group_confidence: 'bank_confirmed',
      state: 'active',
      health_ok: true,
      health_checked_at: new Date().toISOString(),
      trust_level: 2,
    });

    // 3. Insert donor_private
    await supabase.from('donor_private').upsert({
      donor_id: userId,
      phone_e164: donor.phone,
      email: `${donor.name.toLowerCase()}@test.blood.local`,
      email_verified: true,
    });

    // 4. Insert donor_location
    const pointWkt = `POINT(${donor.lng || 81.804} ${donor.lat || 17.0005})`;
    await supabase.from('donor_location').upsert({
      donor_id: userId,
      home_geo: pointWkt,
      city: 'Rajahmundry',
      pincode: '533101',
      max_travel_km: 50,
    });

    // 5. Insert donor_prefs
    await supabase.from('donor_prefs').upsert({
      donor_id: userId,
      allow_critical_in_quiet: true,
      max_requests_per_month: 10,
      opted_out: false,
    });

    // 6. Insert consents
    for (const cType of REQUIRED_CONSENTS) {
      await supabase.from('consents').insert({
        user_id: userId,
        type: cType,
        version: 'v1',
      });
    }

    // 7. Insert donor_health (encrypted)
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 6);
    await supabase.from('donor_health').upsert({
      donor_id: userId,
      answers_enc: encrypt(JSON.stringify({ fever_today: false, alcohol_24h: false })),
      blocking_reason: null,
      valid_until: validUntil.toISOString(),
    });

    console.log(`Donor ${donor.name} is ACTIVE.`);
  }

  console.log('Seeding finished.');
}

seedDevDonors().catch(console.error);
