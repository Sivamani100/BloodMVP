import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/server/supabase-admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '17.0005');
  const lng = parseFloat(searchParams.get('lng') || '81.8040');
  const bloodGroup = searchParams.get('group') || 'O+';
  const component = searchParams.get('component') || 'whole_blood';

  const supabase = getSupabaseAdmin();

  // Query banks ordered by distance with ST_Distance
  const { data: banks, error } = await (supabase.rpc as any)('get_nearby_banks', {
    p_lat: lat,
    p_lng: lng,
    p_group: bloodGroup,
    p_component: component,
    p_limit: 10,
  });

  if (!error && banks) {
    const formatted = banks.map((b: any) => {
      let freshness = 'unknown';
      let minutesAgo: number | null = null;
      if (b.stock_updated_at) {
        minutesAgo = Math.floor((Date.now() - new Date(b.stock_updated_at).getTime()) / 60000);
        if (minutesAgo < 120) {
          freshness = 'green';
        } else if (minutesAgo < 720) {
          freshness = 'yellow';
        } else {
          freshness = 'white';
        }
      }

      let trustLabel = 'ok';
      if (b.trust_score >= 80) trustLabel = 'reliable';
      else if (b.trust_score < 40) trustLabel = 'low';

      return {
        ...b,
        trust_label: trustLabel,
        freshness,
        minutes_ago: minutesAgo,
      };
    });

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  }

  // Fallback query if RPC fails: fetch banks and stock
  const { data: rawBanks } = await supabase
    .from('blood_banks')
    .select('id, name, address, city, phones, bank_type, is_24x7, hours, trust_score')
    .eq('active', true)
    .limit(10);

  const bankIds = (rawBanks || []).map((b) => b.id);
  const { data: stocks } = await supabase
    .from('bank_stock')
    .select('*')
    .in('bank_id', bankIds)
    .eq('blood_group', bloodGroup as any)
    .eq('component', component as any);

  const stockMap = new Map((stocks || []).map((s) => [s.bank_id, s]));

  const formatted = (rawBanks || []).map((b) => {
    const stock = stockMap.get(b.id);
    let freshness = 'unknown';
    let minutesAgo: number | null = null;

    if (stock?.updated_at) {
      minutesAgo = Math.floor((Date.now() - new Date(stock.updated_at).getTime()) / 60000);
      if (minutesAgo < 120) {
        freshness = 'green';
      } else if (minutesAgo < 720) {
        freshness = 'yellow';
      } else {
        freshness = 'white';
      }
    }

    let trustLabel = 'ok';
    if (b.trust_score >= 80) trustLabel = 'reliable';
    else if (b.trust_score < 40) trustLabel = 'low';

    return {
      id: b.id,
      name: b.name,
      address: b.address,
      city: b.city,
      phones: b.phones,
      bank_type: b.bank_type,
      is_24x7: b.is_24x7,
      hours: b.hours,
      trust_score: b.trust_score,
      trust_label: trustLabel,
      distance_km: 1.5,
      units: stock?.units ?? null,
      freshness,
      minutes_ago: minutesAgo,
    };
  });

  return NextResponse.json(formatted, {
    headers: {
      'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
    },
  });
}
