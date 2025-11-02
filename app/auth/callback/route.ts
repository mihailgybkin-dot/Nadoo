// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// принудительно Node.js рантайм и отсутствие кеша
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/profile'

  try {
    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    }
  } catch (err) {
    // на проде лучше смотреть логи Vercel → “Functions”
    console.error('auth/callback error:', err)
    // даже при ошибке уводим на логин, чтобы не было 500
    const redirect = new URL('/login?error=auth', url.origin)
    return NextResponse.redirect(redirect)
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
