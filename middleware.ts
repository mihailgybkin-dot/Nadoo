// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const url = new URL(req.url)
  const { pathname, searchParams, origin } = url

  // 1) Supabase иногда кидает на "/" с ?code=...
  if (pathname === '/' && searchParams.has('code')) {
    return NextResponse.redirect(new URL(`/auth/callback?${searchParams.toString()}`, origin))
  }

  // 2) Старые/левые ссылки вида "/callback?code=..." → на /auth/callback
  if (pathname === '/callback' && searchParams.has('code')) {
    return NextResponse.redirect(new URL(`/auth/callback?${searchParams.toString()}`, origin))
  }

  return NextResponse.next()
}

// перехватываем только корень и возможный старый /callback
export const config = { matcher: ['/', '/callback'] }
