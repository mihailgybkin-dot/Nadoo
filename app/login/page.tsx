'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [next, setNext] = useState('/')        // куда вернуть после входа
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // читаем ?next= из адресной строки без useSearchParams
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      setNext(sp.get('next') || '/')
    } catch {}
  }, [])

  const sendLink = async () => {
    setErr(null)
    setLoading(true)
    try {
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo, shouldCreateUser: true },
      })
      if (error) throw error
      setSent(true)
    } catch (e: any) {
      setErr(e?.message || 'Не удалось отправить ссылку')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container max-w-xl pb-16 pt-10">
      <h1 className="mb-6 text-2xl font-semibold">Войти</h1>

      <label className="mb-2 block text-sm font-medium">Ваш e-mail</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 w-full rounded border px-3 py-2"
        placeholder="you@example.com"
      />

      <button
        onClick={sendLink}
        disabled={!email || loading}
        className={`rounded px-4 py-2 text-white ${email && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
      >
        {loading ? 'Отправляем…' : 'Получить ссылку для входа'}
      </button>

      {sent && (
        <p className="mt-3 text-sm text-green-700">
          Письмо отправлено. Откройте ссылку на этом устройстве — мы автоматически войдём и вернём вас на нужную страницу.
        </p>
      )}
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </section>
  )
}
