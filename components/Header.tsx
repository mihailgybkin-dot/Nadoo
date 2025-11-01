// components/Header.tsx
'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* ЛОГОТИП: положи свой файл в /public/logo.svg.
             Если файла нет — рисуем мягкий маркер как фолбэк. */}
          <img
            src="/logo.svg"
            alt="Nadoo"
            className="h-6 w-6"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-lg font-semibold tracking-tight">Nadoo</span>
        </Link>

        <nav className="hidden gap-6 text-sm md:flex">
          <Link href="/" className="hover:opacity-70">Главная</Link>
          <Link href="/my-rentals" className="hover:opacity-70">Мои аренды</Link>
          <Link href="/my-tasks" className="hover:opacity-70">Мои задания</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/post-item" className="btn-outline">Сдать в аренду</Link>
          <Link href="/post-task" className="btn-brand">Разместить задание</Link>
          <Link href="/login" className="btn-outline">Войти</Link>
        </div>
      </div>
    </header>
  );
}
