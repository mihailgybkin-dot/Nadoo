// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/profile' // куда перекидывать после логина

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    // обменяем code из письма на сессию и запишем в куку
    await supabase.auth.exchangeCodeForSession(code)
  }

  // даже если code отсутствует (или уже использован) — уходим на профиль
  return NextResponse.redirect(new URL(next, url.origin))
}
