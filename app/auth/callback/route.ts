import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code') || searchParams.get('token_hash')
  const next = searchParams.get('next') || '/'

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', req.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  // ВНИМАНИЕ: у route-handlers нет доступа к кукам браузера для клиента,
  // поэтому такой вариант годится только если дальше фронт сам подтянет сессию через JS.
  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent(error.message), req.url))
  }

  return NextResponse.redirect(new URL(next, req.url))
}
