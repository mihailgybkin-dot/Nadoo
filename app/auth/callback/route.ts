// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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
    console.error('auth/callback error:', err)
    return NextResponse.redirect(new URL('/login?error=auth', url.origin))
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
