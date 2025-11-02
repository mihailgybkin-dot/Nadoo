// app/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Важно: это Server Component, он просто рендерит клиентскую оболочку
import PageClient from './page.client';

export default function Page() {
  return <PageClient />;
}
