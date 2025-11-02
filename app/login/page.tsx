'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const sendLink = async () => {
    setErr(null); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErr(error.message);
    else setMsg('Письмо отправлено. Проверьте почту.');
  };

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 16 }}>
      <h1>Войти</h1>
      <div style={{ display:'flex', gap:8 }}>
        <input
          placeholder="you@example.com"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{ flex:1, padding:8 }}
        />
        <button onClick={sendLink}>Получить ссылку для входа</button>
      </div>
      {msg && <p style={{ color:'green', marginTop:12 }}>{msg}</p>}
      {err && <p style={{ color:'crimson', marginTop:12 }}>{err}</p>}
    </main>
  );
}
