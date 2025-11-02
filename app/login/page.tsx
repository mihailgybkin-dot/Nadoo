// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const supabase = createSupabaseBrowser();

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) setMsg(error.message);
    else setMsg('Ссылка отправлена. Проверьте почту.');
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '12px 0' }}>Войти</h1>
      <form onSubmit={sendLink}>
        <input
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6, minWidth: 280 }}
        />
        <button
          type="submit"
          style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
        >
          Получить ссылку для входа
        </button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
