import { getSupabaseAdmin } from '@/server/supabase-admin';
import { processRequest } from './wave';

export interface TickSummary {
  processed: number;
  errors: number;
  skipped?: string;
}

export async function tick(now = () => new Date()): Promise<TickSummary> {
  const supabase = getSupabaseAdmin();

  // 1. Load app settings
  const { data: settingsRows } = await supabase.from('app_settings').select('*');
  const settings: Record<string, any> = {};
  for (const row of settingsRows || []) {
    settings[row.key] = row.value;
  }

  // Check kill switch
  if (settings.kill_switch?.enabled) {
    return { processed: 0, errors: 0, skipped: 'kill_switch' };
  }

  // Update last tick timestamp
  await supabase
    .from('app_settings')
    .upsert({ key: 'last_tick', value: { at: now().toISOString() } });

  // 2. Claim requests for tick (lease prevents double processing)
  const { data: claimed, error: claimErr } = await supabase.rpc('claim_requests_for_tick', {
    p_limit: 5,
    p_lease_seconds: 20,
  });

  if (claimErr || !claimed || claimed.length === 0) {
    return { processed: 0, errors: 0 };
  }

  let processed = 0;
  let errors = 0;

  // 3. Process each sequentially
  for (const request of claimed) {
    try {
      await processRequest(request, settings, now);
      processed++;
    } catch (err) {
      console.error(`Error processing request ${request.id}:`, err);
      errors++;
      // Set next tick 30s in future on error
      await supabase
        .from('requests')
        .update({ next_tick_at: new Date(now().getTime() + 30000).toISOString() })
        .eq('id', request.id);
    }
  }

  return { processed, errors };
}
