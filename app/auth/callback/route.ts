import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseForRoute } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code') || '';
  const next = url.searchParams.get('next') || '/profile';

  // готовим ответ-редирект (на него будут записаны куки)
  const redirectUrl = new URL(next, url.origin);
  const res = NextResponse.redirect(redirectUrl);

  if (!code) return res; // без кода просто редиректим

  try {
    const supabase = createSupabaseForRoute(req, res);
    // обмен кода на сессию -> куки запишутся в 'res' через cookie-адаптер
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      redirectUrl.searchParams.set('error', 'auth');
      return NextResponse.redirect(redirectUrl);
    }
    return res;
  } catch {
    redirectUrl.searchParams.set('error', 'auth');
    return NextResponse.redirect(redirectUrl);
  }
}
