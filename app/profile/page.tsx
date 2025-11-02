// app/profile/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  // если не авторизован — отправим на логин
  if (!user) redirect('/login?next=/profile')

  // тянем профиль, если есть
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="container" style={{maxWidth: 960, margin: '40px auto'}}>
      <h1>Личный кабинет</h1>

      <div style={{marginTop: 16}}>
        <b>E-mail:</b> {user.email}
      </div>

      <div style={{marginTop: 8}}>
        <b>Имя:</b> {profile?.full_name ?? '—'}
      </div>

      <div style={{marginTop: 24}}>
        <a className="btn" href="/my-rents">Мои аренды</a>{' '}
        <a className="btn" href="/my-tasks">Мои задания</a>{' '}
        <form action="/logout" method="post" style={{display:'inline'}}>
          <button className="btn" type="submit">Выйти</button>
        </form>
      </div>
    </div>
  )
}
