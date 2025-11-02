// components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="glass-header">
      <div className="container header-row">
        <Link href="/" className="brand">
          <div className="brand-badge">N</div>
          <span className="brand-title">Nadoo</span>
        </Link>

        <nav className="nav">
          <Link className="nav-link" href="/">Главная</Link>
          <Link className="nav-link" href="/post-item">Сдать в аренду</Link>
          <Link className="nav-link" href="/post-task">Разместить задание</Link>
          <Link className="btn-primary" href="/login?next=/profile">Войти</Link>
        </nav>
      </div>
    </header>
  );
}
