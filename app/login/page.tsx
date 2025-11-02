// app/login/page.tsx
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <main className="container" style={{ padding: '40px 16px' }}>
      <h1 style={{ marginBottom: 24 }}>Войти</h1>
      <Suspense fallback={<div className="card">Загрузка…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
