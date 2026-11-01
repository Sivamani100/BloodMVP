import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  const { data: phone, error } = await supabase.rpc('reveal_donor_phone', {
    p_contact_id: id,
  });

  if (error || !phone) {
    const isRateLimited = error?.message?.includes('too many');
    return NextResponse.json(
      { error: isRateLimited ? 'rate_limited' : 'not_allowed', message: error?.message },
      { status: isRateLimited ? 429 : 403 }
    );
  }

  return NextResponse.json({ phone });
}

