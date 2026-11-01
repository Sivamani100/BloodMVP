import { NextRequest, NextResponse } from 'next/server';

let lastCallTimestamp = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  // Rate limit: 1 request per second
  const now = Date.now();
  if (now - lastCallTimestamp < 1000) {
    await new Promise((r) => setTimeout(r, 1000 - (now - lastCallTimestamp)));
  }
  lastCallTimestamp = Date.now();

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=in&q=${encodeURIComponent(
    query
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'BloodApp-EmergencyFinder/1.0 (blood donor emergency pilot)',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding service error' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Geocoding fetch error:', err);
    return NextResponse.json({ error: 'Failed to contact geocoding service' }, { status: 500 });
  }
}

