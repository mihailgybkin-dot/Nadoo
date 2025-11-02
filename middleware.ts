// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

/**
 * Перехватываем только корень "/" и старый "/callback".
 * Если в URL есть ?code=... или ?token_hash=..., перекидываем на /auth/callback.
 * В любой непонятной ситуации просто пропускаем запрос дальше.
 */
export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl
    const isRootOrCallback = url.pathname === '/' || url.pathname === '/callback'
    const hasCode = url.searchParams.has('code')
    const hasTokenHash = url.searchParams.has('token_hash')

    if (isRootOrCallback && (hasCode || hasTokenHash)) {
      url.pathname = '/auth/callback'
      return NextResponse.redirect(url)
    }
  } catch {
    // Никогда не ломаем сайт из-за middleware
  }
  return NextResponse.next()
}

/** Обрабатываем ТОЛЬКО эти пути — чтобы исключить любые побочные эффекты. */
export const config = {
  matcher: ['/', '/callback'],
}
