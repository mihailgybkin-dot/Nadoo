// lib/supabaseClient.ts
// Клиентский ШИМ для совместимости со старыми импортами.
// Здесь НЕТ серверных импортов (никаких next/headers).
'use client';

import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

// Совместимость со старыми вызовами:
export function createSupabaseBrowser() {
  return supabase;
}

// Экспорт по умолчанию — чтобы работали импорты вида
//   import supabaseClient from '@/lib/supabaseClient'
export default function supabaseClient() {
  return supabase;
}
