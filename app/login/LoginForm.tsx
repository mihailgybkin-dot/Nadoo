// app/login/LoginForm.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function LoginForm() {
  const sp = useSearchParams();
  const next = sp.get('next') || '/profile';

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });

    setLoading(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="card" style={{ maxWidth: 520 }}>
        <p>Мы отправили письмо на <b>{email}</b>.</p>
        <p>Перейдите по ссылке в письме, и мы перенаправим вас в <code>{next}</code>.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ maxWidth: 520 }}>
      <label htmlFor="email" className="label">Ваш e-mail</label>
      <input
        id="email"
        type="email"
        required
        className="input"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {err && <div className="error">{err}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Отправляем…' : 'Получить ссылку для входа'}
      </button>
      <p className="muted" style={{ marginTop: 10 }}>
        После входа вы попадёте на <code>{next}</code>
      </p>
    </form>
  );
}
