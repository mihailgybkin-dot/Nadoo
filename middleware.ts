// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

/**
 * Безопасный перехватчик ссылок из почты:
 * - если пришли на "/" (или старый "/callback") с ?code=... / ?token_hash=...
 *   — отправляем на /auth/callback, НО сами никогда не падаем.
 */
export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl // NextURL от Next.js (без new URL)
    const pathname = url.pathname
    const hasCode = url.searchParams.has('code')
    const hasTokenHash = url.searchParams.has('token_hash')

    // Перенаправляем только с корня или со старого "/callback"
    if ((pathname === '/' || pathname === '/callback') && (hasCode || hasTokenHash)) {
      url.pathname = '/auth/callback'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch {
    // Никогда не ломаем сайт из-за middleware
    return NextResponse.next()
  }
}

/**
 * Matcher: обрабатываем ВСЁ, кроме статических ресурсов —
 * чтобы редирект с /?code=... сработал, но статика и служебные файлы не трогались.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets|images|fonts).*)',
  ],
}
