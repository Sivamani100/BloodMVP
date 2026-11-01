import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }

  const { days, resume } = await req.json();

  let pausedUntil: string | null = null;
  if (!resume && days) {
    const d = new Date();
    d.setDate(d.getDate() + Number(days));
    pausedUntil = d.toISOString();
  }

  const { error } = await supabase
    .from('donors')
    .update({ paused_until: pausedUntil, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, paused_until: pausedUntil });
}

