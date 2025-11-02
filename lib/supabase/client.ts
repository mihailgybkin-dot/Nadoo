// lib/supabase/client.ts
// Нужен для импортов вида '@/lib/supabase/client'
'use client';

import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

// На всякий случай — тем, кто вызывает фабрику:
export function createSupabaseBrowser() {
  return supabase;
}

// Экспорт по умолчанию допустим, но не обязателен:
export default supabase;
