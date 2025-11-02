// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth', req.url));
  }

  const supabase = createSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth', req.url));
  }

  return NextResponse.redirect(new URL('/profile', req.url));
}
