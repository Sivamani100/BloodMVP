import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { getSupabaseAdmin } from '../src/server/supabase-admin';
import { getEnv } from '../src/server/env';
import { encrypt } from '../src/server/security/crypto';
import { REQUIRED_CONSENTS } from '../src/lib/donor-rules';

const DEFAULT_TEST_DONORS = [
  { name: 'Ramesh Kumar', phone: '+919900000001', group: 'O+', lat: 17.0010, lng: 81.8035, gender: 'male', dob: '1996-03-12', weight: 68 },
  { name: 'Suresh Varma', phone: '+919900000002', group: 'A+', lat: 17.0045, lng: 81.7990, gender: 'male', dob: '1998-07-24', weight: 72 },
  { name: 'Priya Reddy', phone: '+919900000003', group: 'B+', lat: 16.9950, lng: 81.8100, gender: 'female', dob: '2001-11-05', weight: 55 },
  { name: 'Lakshmi Rao', phone: '+919900000004', group: 'AB+', lat: 17.0120, lng: 81.7890, gender: 'female', dob: '1999-09-18', weight: 58 },
  { name: 'Anand Murthy', phone: '+919900000005', group: 'O-', lat: 16.9880, lng: 81.8200, gender: 'male', dob: '1994-01-30', weight: 76 },
];

async function seedDevDonors() {
  const env = getEnv();
  const rawDonors = env.DEV_TEST_DONORS;

  let donorsList: any[] = DEFAULT_TEST_DONORS;
  if (rawDonors) {
    try {
      donorsList = JSON.parse(rawDonors);
    } catch (err) {
      console.error('Failed to parse DEV_TEST_DONORS JSON, using defaults:', err);
    }
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
      languages: ['en', 'te'],
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

