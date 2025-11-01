'use client'
import Link from 'next/link'

export default function Header() {
  return (
    <div className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-nadoo.svg" alt="Nadoo" width={112} height={28} />
        </Link>
        <nav className="hidden gap-4 sm:flex">
          <Link href="/" className="text-sm hover:underline">Главная</Link>
          <Link href="/my" className="text-sm hover:underline">Мои аренды</Link>
          <Link href="/tasks" className="text-sm hover:underline">Мои задания</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/post-item" className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">Сдать в аренду</Link>
          <Link href="/login" className="rounded border px-3 py-1.5 text-sm">Войти</Link>
        </div>
      </div>
    </div>
  )
}
