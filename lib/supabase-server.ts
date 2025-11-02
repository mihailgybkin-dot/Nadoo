// lib/supabase-server.ts
// Серверный клиент Supabase, совместимый с типами Next 16 (cookies() sync/Promise).

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

function getCookieStore(): any {
  // Приводим к any и вызываем как функцию — покрывает обе сигнатуры.
  try {
    return (cookies as unknown as () => any)();
  } catch {
    // на всякий случай, если среда уже вернула объект
    return cookies as unknown as any;
  }
}

export function createSupabaseServer() {
  const cookieAdapter = {
    get(name: string) {
      const store = getCookieStore();
      return store?.get?.(name)?.value as string | undefined;
    },
    set(name: string, value: string, options: CookieOptions) {
      const store = getCookieStore();
      store?.set?.({ name, value, ...options });
    },
    remove(name: string, options: CookieOptions) {
      const store = getCookieStore();
      store?.set?.({ name, value: '', ...options, maxAge: 0 });
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter }
  );
}
