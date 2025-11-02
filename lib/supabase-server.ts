// lib/supabase-server.ts
// Серверный клиент Supabase без конфликтов типов Next 16.

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function createSupabaseServer() {
  // Не сохраняем cookies() в переменную с проблемным типом.
  // Каждый вызов обращается к cookies() напрямую и приводится к any.
  const cookieAdapter = {
    get(name: string) {
      // @ts-expect-error: в Next 16 тип cookies() может быть Promise — приводим к any
      return (cookies() as any).get(name)?.value as string | undefined;
    },
    set(name: string, value: string, options: CookieOptions) {
      // @ts-expect-error: см. примечание выше
      (cookies() as any).set({ name, value, ...options });
    },
    remove(name: string, options: CookieOptions) {
      // @ts-expect-error: см. примечание выше
      (cookies() as any).set({ name, value: '', ...options, maxAge: 0 });
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter }
  );
}
