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

  let user = users.users.find((u) => u.phone === phone);
  if (!user) {
    console.log(`User ${phone} not found in auth.users. Creating pre-confirmed user...`);
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      phone,
      phone_confirm: true,
      user_metadata: { name: 'Siva Admin' },
    });
    if (createErr || !created.user) {
      console.error('Failed to create user:', createErr);
      process.exit(1);
    }
    user = created.user;
    console.log(`✓ Created pre-confirmed user: ${user.id}`);
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

