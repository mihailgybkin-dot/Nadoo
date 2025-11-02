// app/page.tsx
import NextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Рендерим главную строго на клиенте, чтобы исключить SSR-ошибки
const HomeClient = NextDynamic(() => import('./_home/HomeClient'), {
  ssr: false,
  loading: () => (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Nadoo</h1>
      <div>Загрузка…</div>
    </main>
  ),
});

export default function Page() {
  return <HomeClient />;
}
