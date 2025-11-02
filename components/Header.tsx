// components/Header.tsx
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export default async function Header() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  return (
    <header className="container" style={{display:'flex', gap:16, alignItems:'center', height:64}}>
      <Link href="/">Nadoo</Link>
      <nav style={{display:'flex', gap:12}}>
        <Link href="/">Главная</Link>
        <Link href="/my-rentals">Мои аренды</Link>
        <Link href="/my-tasks">Мои задания</Link>
        <Link href="/post-item">Сдать в аренду</Link>
        <Link href="/post-task">Разместить задание</Link>
        {user ? (
          <Link href="/profile">Профиль</Link>
        ) : (
          <Link href="/login">Войти</Link>
        )}
      </nav>
    </header>
  )
}
