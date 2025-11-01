'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Главная' },
  { href: '/my-rents', label: 'Мои аренды' },
  { href: '/my-tasks', label: 'Мои задания' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Логотип слева */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#2F6BF2] shadow-inner" />
          <span className="text-lg font-bold tracking-tight">Nadoo</span>
        </Link>

        {/* Навигация */}
        <nav className="hidden items-center gap-6 sm:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition ${
                  active ? 'text-[#2F6BF2] font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Действия справа */}
        <div className="flex items-center gap-2">
          <Link
            href="/post-item"
            className="rounded-xl border border-[#2F6BF2]/20 bg-white px-3 py-2 text-sm font-medium text-[#2F6BF2] shadow-sm hover:border-[#2F6BF2]/40"
          >
            Сдать в аренду
          </Link>
          <Link
            href="/post-task"
            className="rounded-xl bg-[#2F6BF2] px-3 py-2 text-sm font-medium text-white shadow hover:opacity-90"
          >
            Разместить задание
          </Link>
        </div>
      </div>
    </header>
  );
}
