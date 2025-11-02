import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth', req.url));
  }

  const supabase = getSupabaseServer();

  try {
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL('/profile', req.url));
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth', req.url));
  }
}
