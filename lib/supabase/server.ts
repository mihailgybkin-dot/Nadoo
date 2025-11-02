import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Для server components (например, страница профиля).
 * Не создаём здесь NextResponse — просто работаем с cookies() от Next.
 */
export function createSupabaseServer() {
  // cookies() иногда «мигает» типом в Next 16 — используем защитные вызовы
  const cookieStore: any = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore?.get?.(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore?.set?.({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore?.set?.({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}

/**
 * Для route handler (/auth/callback) — здесь нужен ответ, чтобы проставить куки.
 * Возвращаем и клиент, и response — ты задаёшь redirect на этом же response.
 */
export function createSupabaseForRoute(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}
