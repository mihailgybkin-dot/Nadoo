'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const origin = window.location.origin;
      const next = params.get('next') || '/profile';
      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo },
      });

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? 'Не удалось отправить ссылку');
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-3xl font-semibold mb-6 tracking-tight">Войти</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-base outline-none focus:ring-4 focus:ring-black/10"
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={sent}
        >
          {sent ? 'Ссылка отправлена' : 'Получить ссылку для входа'}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      <style jsx global>{`
        .btn-primary{
          display:inline-flex;align-items:center;justify-content:center;
          padding:12px 18px;border-radius:18px;border:1px solid rgba(0,0,0,.08);
          background:linear-gradient(180deg,#fff, #f5f5f7);
          box-shadow:0 1px 2px rgba(0,0,0,.06), inset 0 0 0 1px rgba(255,255,255,.6);
          font-weight:600; transition:.2s; letter-spacing:.2px;
        }
        .btn-primary:hover{ transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,0,0,.08), inset 0 0 0 1px rgba(255,255,255,.7);}
        .btn-primary:active{ transform:translateY(0); }
        @media (prefers-color-scheme: dark){
          .btn-primary{ background:linear-gradient(180deg,#1b1b1f,#111); color:#fff; border-color:#2a2a2f; }
        }
      `}</style>
    </main>
  );
}
