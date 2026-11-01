import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/server/supabase-admin';
import { recomputeDonorState } from '@/server/engine/policy';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as any;
  const next = searchParams.get('next') || '/donor';

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  });

  if (error || !data.user) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=verification_failed', req.url));
  }

  const userId = data.user.id;
  const adminClient = getSupabaseAdmin();

  // Update donor_private.email_verified and email
  await adminClient
    .from('donor_private')
    .update({
      email: data.user.email,
      email_verified: true,
    })
    .eq('donor_id', userId);

  // Recompute donor status
  await recomputeDonorState(userId);

  return NextResponse.redirect(new URL(next, req.url));
}

