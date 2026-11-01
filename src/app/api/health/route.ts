import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/server/supabase-admin';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const startTime = Date.now();

  let dbOk = false;
  let lastTickAt: string | null = null;

  try {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'last_tick').single();
    dbOk = true;
    lastTickAt = (data?.value as any)?.at || null;
  } catch (err) {
    dbOk = false;
  }

  const duration = Date.now() - startTime;

  return NextResponse.json({
    ok: dbOk,
    db: dbOk ? 'healthy' : 'error',
    time: new Date().toISOString(),
    latency_ms: duration,
    last_tick_at: lastTickAt,
  });
}
