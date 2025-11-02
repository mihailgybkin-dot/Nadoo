'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import AvatarUploader from '../../components/AvatarUploader'

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  language: string | null
  currency: string | null
  notify_email: boolean | null
  notify_push: boolean | null
}

const LANGS = ['Русский', 'English'] as const
const CURS  = ['RUB', 'USD', 'EUR'] as const

export default function ProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uid, setUid]       = useState<string | null>(null)
  const [email, setEmail]   = useState<string | null>(null)

  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (!user) {
        router.replace('/login?next=/profile')
        return
      }
      setUid(user.id)
      setEmail(user.email ?? null)

      // создаём профиль, если его ещё нет
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (error) console.error(error)

      if (!data) {
        const defaults = {
          id: user.id,
          full_name: user.user_metadata?.name ?? null,
          avatar_url: null,
          phone: null,
          language: 'Русский',
          currency: 'RUB',
          notify_email: true,
          notify_push: true,
        }
        const { error: upErr } = await supabase.from('profiles').insert(defaults)
        if (upErr) console.error(upErr)
        setProfile({ ...defaults, email: user.email ?? null })
      } else {
        setProfile({ ...data, email: user.email ?? null })
      }

      setLoading(false)
    })()
  }, [router])

  const updateField = async (patch: Partial<Profile>) => {
    if (!uid) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update(patch).eq('id', uid)
    if (error) {
      alert('Не получилось сохранить: ' + error.message)
    } else {
      setProfile((p) => (p ? { ...p, ...patch } : p))
    }
    setSaving(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading || !profile) {
    return (
      <section className="container py-10">
        <h1 className="text-2xl font-semibold mb-6">Личный кабинет</h1>
        <div className="rounded border p-6 text-sm text-neutral-600">Загружаем…</div>
      </section>
    )
  }

  return (
    <section className="container pb-16 pt-8">
      <div className="mx-auto w-full max-w-2xl">

        {/* Верхняя карточка */}
        <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-6 mb-6">
          <div className="flex items-center gap-4">
            <AvatarUploader
              uid={uid!}
              avatarUrl={profile.avatar_url || undefined}
              onUploaded={(url) => updateField({ avatar_url: url })}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <input
                  value={profile.full_name ?? ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  onBlur={() => updateField({ full_name: profile.full_name ?? '' })}
                  placeholder="Имя и Фамилия"
                  className="w-full bg-transparent text-lg font-semibold outline-none"
                />
              </div>
              <div className="text-sm text-neutral-600 truncate">{email || '—'}</div>
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <a href="/documents" className="group rounded-xl border p-4 text-center hover:bg-neutral-50">
              <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center">🗂</div>
              <div className="text-xs leading-tight">
                <div className="font-medium">Основной</div>
                <div className="text-neutral-500">документ</div>
              </div>
            </a>
            <a href="/notifications" className="group rounded-xl border p-4 text-center hover:bg-neutral-50">
              <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center">🔔</div>
              <div className="text-xs leading-tight">
                <div className="font-medium">Уведомления</div>
                <div className="text-neutral-500">&nbsp;</div>
              </div>
            </a>
            <a href="/support" className="group rounded-xl border p-4 text-center hover:bg-neutral-50">
              <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center">🛠</div>
              <div className="text-xs leading-tight">
                <div className="font-medium">Тех поддержка</div>
                <div className="text-neutral-500">&nbsp;</div>
              </div>
            </a>
          </div>
        </div>

        {/* Настройки */}
        <div className="rounded-2xl border">
          <div className="border-b p-4 font-semibold">Настройки</div>

          {/* Телефон */}
          <Row
            title="Номер телефона"
            caption={profile.phone || 'Добавить'}
            actionText="Изменить"
            onAction={async () => {
              const v = prompt('Введите номер телефона', profile.phone ?? '') ?? ''
              await updateField({ phone: v || null })
            }}
          />

          {/* Язык */}
          <Row
            title="Язык"
            caption={profile.language || 'Русский'}
            actionText="Выбрать"
            onAction={async () => {
              const v = prompt(`Язык (${LANGS.join(', ')})`, profile.language ?? 'Русский') ?? 'Русский'
              await updateField({ language: v })
            }}
          />

          {/* Валюта */}
          <Row
            title="Валюта"
            caption={profile.currency || 'RUB'}
            actionText="Выбрать"
            onAction={async () => {
              const v = prompt(`Валюта (${CURS.join(', ')})`, profile.currency ?? 'RUB') ?? 'RUB'
              await updateField({ currency: v })
            }}
          />

          {/* Способ оплаты (пока заглушка-ссылка) */}
          <Row
            title="Способ оплаты"
            caption="Добавить/изменить"
            href="/wallet"
            actionText="Открыть"
          />

          {/* Настройки уведомлений */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm">
              <div className="font-medium">Уведомления на email</div>
              <div className="text-neutral-500">Сообщения о заявках, ответах и статусах</div>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={!!profile.notify_email}
              onChange={(e) => updateField({ notify_email: e.target.checked })}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm">
              <div className="font-medium">Push-уведомления</div>
              <div className="text-neutral-500">На устройстве</div>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={!!profile.notify_push}
              onChange={(e) => updateField({ notify_push: e.target.checked })}
            />
          </div>

          {/* Выход */}
          <div className="border-t p-4">
            <button
              onClick={logout}
              className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:opacity-90"
              disabled={saving}
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>

        {saving && (
          <div className="mt-3 text-xs text-neutral-500">Сохраняем изменения…</div>
        )}
      </div>
    </section>
  )
}

function Row({
  title,
  caption,
  actionText,
  onAction,
  href,
}: {
  title: string
  caption?: string | null
  actionText?: string
  onAction?: () => void | Promise<void>
  href?: string
}) {
  const Right = () =>
    href ? (
      <a href={href} className="text-sm text-blue-600 hover:underline">{actionText ?? 'Открыть'}</a>
    ) : (
      <button className="text-sm text-blue-600 hover:underline" onClick={onAction}>
        {actionText ?? 'Изменить'}
      </button>
    )

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm">
        <div className="font-medium">{title}</div>
        {!!caption && <div className="text-neutral-500">{caption}</div>}
      </div>
      <Right />
    </div>
  )
}
