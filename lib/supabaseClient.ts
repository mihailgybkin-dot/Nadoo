// lib/supabaseClient.ts
// Совместимый слой: старые импорты продолжают работать.
// Внутри используем новую логику на @supabase/ssr.

import { createSupabaseBrowser } from './supabase-browser';
import { createSupabaseServer } from './supabase-server';

// Именованные экспорты — чтобы работали импорты вида:
//   import { createSupabaseServer } from '@/lib/supabaseClient'
export { createSupabaseBrowser, createSupabaseServer };

// Экспорт по умолчанию — чтобы работали импорты вида:
//   import supabaseClient from '@/lib/supabaseClient'
export default function supabaseClient() {
  if (typeof window === 'undefined') {
    return createSupabaseServer();
  }
  return createSupabaseBrowser();
}
