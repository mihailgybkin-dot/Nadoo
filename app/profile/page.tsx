// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

export default function ProfilePage() {
  const supabase = createSupabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '12px 0' }}>Профиль</h1>
      <p>Почта: {email ?? '—'}</p>
      <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
        <a href="/my-rents">Мои аренды</a>
        <a href="/my-tasks">Мои задания</a>
      </div>
    </div>
  );
}
