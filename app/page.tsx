// app/page.tsx
import dynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ВАЖНО: главную рендерим только на клиенте, чтобы исключить любые SSR-краши
const HomeClient = dynamic(() => import('./_home/HomeClient'), {
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
