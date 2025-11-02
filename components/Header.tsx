import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-black/10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/40">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-2xl bg-black text-white grid place-items-center font-bold">N</div>
          <span className="text-lg font-semibold tracking-tight">Nadoo</span>
        </Link>

        <nav className="flex items-center gap-10 text-sm">
          <Link className="nav-link" href="/">Главная</Link>
          <Link className="nav-link" href="/post-item">Сдать в аренду</Link>
          <Link className="nav-link" href="/post-task">Разместить задание</Link>
          <Link className="btn-primary" href="/login?next=/profile">Войти</Link>
        </nav>
      </div>

      <style jsx global>{`
        .nav-link{opacity:.8}
        .nav-link:hover{opacity:1}
      `}</style>
    </header>
  );
}
