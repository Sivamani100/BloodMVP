import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/server/env';
import { tick } from '@/server/engine/tick';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = getEnv().CRON_SECRET;

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await tick();
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error('Engine tick failed:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

