import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/server/supabase-admin';
import { processRequest } from '@/server/engine/wave';

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

  const adminClient = getSupabaseAdmin();

  // Verify ownership
  const { data: request, error: rErr } = await adminClient
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (rErr || !request) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (request.requester_id !== user.id) {
    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'not_allowed' }, { status: 403 });
    }
  }

  // Load app settings
  const { data: settingsRows } = await adminClient.from('app_settings').select('*');
  const settings: Record<string, any> = {};
  for (const row of settingsRows || []) {
    settings[row.key] = row.value;
  }

  // Trigger first wave asynchronously so HTTP response returns immediately without blocking UI
  processRequest(request, settings).catch((err) => {
    console.error('Async processRequest error:', err);
  });

  return NextResponse.json({ success: true, started: true });
}

