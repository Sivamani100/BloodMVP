import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/server/supabase-admin';

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }

  const adminClient = getSupabaseAdmin();

  // auth.admin.deleteUser cascades to all user data tables in postgres!
  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}

