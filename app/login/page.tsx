// app/login/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendLink = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setLoading(false);
    if (!error) setSent(true);
    else alert(error.message);
  };

  return (
    <section className="container pb-20 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Войти</h1>
      <div className="flex max-w-md gap-2">
        <input
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn-brand whitespace-nowrap" onClick={sendLink} disabled={loading}>
          {loading ? 'Отправляю…' : 'Получить ссылку'}
        </button>
      </div>
      {sent && <p className="mt-3 text-sm text-green-600">Ссылка отправлена на почту.</p>}
    </section>
  );
}
