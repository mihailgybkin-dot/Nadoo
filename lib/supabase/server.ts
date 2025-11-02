// lib/supabase/server.ts
// Серверный клиент Supabase, совместимый с типами Next 16 (cookies() может быть sync/Promise).

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Универсально получаем cookie-store (работает и при sync, и при Promise типе)
function getCookieStore(): any {
  try {
    // В Next 16 cookies — это функция. Вызываем и получаем store.
    return (cookies as unknown as () => any)();
  } catch {
    // На всякий случай, если окружение уже вернуло объект
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
