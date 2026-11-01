import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getSupabaseAdmin } from '../src/server/supabase-admin';

async function listDonors() {
  const sb = getSupabaseAdmin();
  const { data: donors, error } = await sb
    .from('donors')
    .select(`
      id,
      full_name,
      blood_group,
      state,
      gender,
      dob,
      weight_kg,
      reliability_score,
      created_at,
      donor_private (
        phone_e164,
        email
      ),
      donor_location (
        city,
        area,
        max_travel_km
      )
    `);

  if (error) {
    console.error('Error fetching donors:', error);
    return;
  }

  console.log(`\n=== Total Donors Registered: ${donors?.length || 0} ===\n`);
  for (const d of donors || []) {
    const priv: any = Array.isArray(d.donor_private) ? d.donor_private[0] : d.donor_private;
    const loc: any = Array.isArray(d.donor_location) ? d.donor_location[0] : d.donor_location;
    console.log(`• Name:        ${d.full_name}`);
    console.log(`  Phone:       ${priv?.phone_e164 || 'N/A'}`);
    console.log(`  Blood Group: ${d.blood_group}`);
    console.log(`  Status:      ${d.state}`);
    console.log(`  Location:    ${loc?.area || 'Rajahmundry'}, ${loc?.city || 'East Godavari'} (Travel: up to ${loc?.max_travel_km || 10} km)`);
    console.log(`  Details:     ${d.gender}, Age: ${new Date().getFullYear() - new Date(d.dob).getFullYear()} yrs, Weight: ${d.weight_kg}kg`);
    console.log('--------------------------------------------------');
  }
}

listDonors().catch(console.error);
