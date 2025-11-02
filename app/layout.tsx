// app/layout.tsx
export const metadata = { title: 'Nadoo' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderBottom: '1px solid #eee'
        }}>
          <div style={{ fontWeight: 700 }}>Nadoo</div>
          <nav style={{ display: 'flex', gap: 14 }}>
            <a href="/">Главная</a>
            <a href="/post-item">Сдать в аренду</a>
            <a href="/post-task">Разместить задание</a>
            <a href="/login">Войти</a>
          </nav>
        </header>
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
