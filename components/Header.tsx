"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: "Главная" },
    { href: "/post-item", label: "Сдать в аренду" },
    { href: "/post-task", label: "Разместить задание" },
    { href: "/my-rents", label: "Мои аренды" },
    { href: "/my-tasks", label: "Мои задания" },
    { href: "/wallet", label: "Кошелёк" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-nadoo.svg" alt="Nadoo" width={28} height={28} />
          <span className="font-bold text-lg">Nadoo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="text-sm text-gray-700 hover:text-black"
            >
              {i.label}
            </Link>
          ))}
          <Link
            href="/auth"
            className="text-sm font-medium rounded-lg px-3 py-1.5 bg-black text-white hover:opacity-90"
          >
            Войти
          </Link>
        </nav>

        <button
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          ☰
        </button>
      </div>

      {/* Мобильное меню */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 flex flex-col gap-2">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="text-sm text-gray-800"
                onClick={() => setOpen(false)}
              >
                {i.label}
              </Link>
            ))}
            <Link
              href="/auth"
              className="text-sm font-medium rounded-lg px-3 py-2 bg-black text-white text-center"
              onClick={() => setOpen(false)}
            >
              Войти
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
