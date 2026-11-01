import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { getSupabaseAdmin } from '../src/server/supabase-admin';
import { normalizePhone } from '../src/server/security/allowlist';

async function makeAdmin(phoneArg: string) {
  if (!phoneArg) {
    console.error('Usage: npx tsx scripts/make-admin.ts <phone_e164>');
    process.exit(1);
  }

  const phone = normalizePhone(phoneArg);
  const supabase = getSupabaseAdmin();

  // Find user by phone in auth.users
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error || !users?.users) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }

  const user = users.users.find((u) => u.phone === phone);
  if (!user) {
    console.error(`User with phone ${phone} not found in auth.users.`);
    console.log('Ensure the user has logged in at least once so their account exists.');
    process.exit(1);
  }

  const { error: insErr } = await supabase.from('admin_users').upsert({
    user_id: user.id,
    role: 'admin',
  });

  if (insErr) {
    console.error('Failed to promote user to admin:', insErr);
    process.exit(1);
  }

  console.log(`Success! User ${phone} (${user.id}) is now an admin.`);
}

const targetPhone = process.argv[2];
makeAdmin(targetPhone).catch(console.error);

