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
  const token_hash = url.searchParams.get('token_hash') // на всякий случай
  const type = (url.searchParams.get('type') || 'email') as
    | 'email' | 'signup' | 'recovery' | 'invite' | 'magiclink'
  const next = url.searchParams.get('next') || '/profile'

  try {
    const supabase = createRouteHandlerClient({ cookies })

    if (code) {
      // Стандартный обмен кода на сессию
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    } else if (token_hash) {
      // Некоторые почтовые клиенты/настройки присылают token_hash
      const { error } = await supabase.auth.verifyOtp({ type, token_hash })
      if (error) throw error
    } else {
      // Нет ни code, ни token_hash — отправляем на логин
      return NextResponse.redirect(new URL('/login?error=missing_code', url.origin))
    }

    // всё ок → в профиль
    return NextResponse.redirect(new URL(next, url.origin))
  } catch (err) {
    console.error('auth/callback error:', err)
    // никогда не валим 500 наружу, просто уводим на логин с ошибкой
    return NextResponse.redirect(new URL('/login?error=auth', url.origin))
  }
}
