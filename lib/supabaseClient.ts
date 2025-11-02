// lib/supabaseClient.ts
// КЛИЕНТСКИЙ ШИМ для обратной совместимости.
// Важно: никаких импортов next/headers и server-клиентов здесь быть не должно.

'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: true, autoRefreshToken: true },
    }
  );
}

// Экспорт по умолчанию — чтобы продолжали работать старые импорты:
//   import supabaseClient from '@/lib/supabaseClient'
export default function supabaseClient() {
  return createSupabaseBrowser();
}

// ВАЖНО: НЕ экспортируем и не импортируем здесь server-версии.
// Для серверных роутов используем напрямую '@/lib/supabase-server'.
