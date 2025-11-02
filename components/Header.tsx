'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const p = usePathname()
  const active = p === href
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm ${active ? 'text-black' : 'text-neutral-600 hover:text-black'}`}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">N</div>
          <span className="text-base font-semibold">Nadoo</span>
        </Link>

        <nav className="flex items-center">
          <NavLink href="/">Главная</NavLink>
          <NavLink href="/my-rents">Мои аренды</NavLink>
          <NavLink href="/my-tasks">Мои задания</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/post-item"
            className="rounded bg-neutral-100 px-3 py-2 text-sm hover:bg-neutral-200"
          >
            Сдать в аренду
          </Link>
          <Link
            href="/post-task"
            className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            Разместить задание
          </Link>
          <Link
            href="/login"
            className="rounded px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Войти
          </Link>
        </div>
      </div>
    </header>
  )
}
