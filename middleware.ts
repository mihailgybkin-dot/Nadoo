// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  // эта строка подтянет/продлит сессию супабейса на сервере
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}

// исключаем служебные пути
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|fonts).*)'],
}
