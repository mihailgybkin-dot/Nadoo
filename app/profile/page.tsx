// app/profile/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import ProfileClient from './profile-client'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login?next=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, phone, avatar_url, currency, language')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="container" style={{maxWidth: 900, margin: '24px auto'}}>
      <h1>Профиль</h1>
      <ProfileClient
        user={{
          id: session.user.id,
          email: session.user.email ?? ''
        }}
        initialProfile={{
          full_name: profile?.full_name ?? '',
          phone: profile?.phone ?? '',
          avatar_url: profile?.avatar_url ?? '',
          currency: profile?.currency ?? 'RUB',
          language: profile?.language ?? 'ru'
        }}
      />
    </div>
  )
}
