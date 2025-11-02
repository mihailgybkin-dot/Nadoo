// app/page.client.tsx
'use client';

import NextDynamic from 'next/dynamic';

// Рендерим главную строго на клиенте
const HomeClient = NextDynamic(() => import('./_home/HomeClient'), {
  ssr: false,
  loading: () => (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Nadoo</h1>
      <div>Загрузка…</div>
    </main>
  ),
});

export default function PageClient() {
  return <HomeClient />;
}
